"""
LLM Service for Recommendation Explanations

Generates personalized, natural language explanations for product recommendations
using OpenRouter API (supports OpenAI, Anthropic, Google, Meta, and more models)
with caching and rate limiting.
"""

import os
import time
import hashlib
import logging
from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
from openai import OpenAI, APIError, RateLimitError, APIConnectionError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenRouter configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Best cost-effective models (ranked by value)
# Updated with correct OpenRouter model names (verified)
RECOMMENDED_MODELS = {
    "free": "meta-llama/llama-3.1-8b-instruct:free",  # Free, good quality
    "cheap": "openai/gpt-4o-mini",  # $0.15/$0.60 per 1M tokens - BEST VALUE
    "quality": "openai/gpt-4o-mini-2024-07-18",  # $0.15/$0.60 per 1M tokens - Excellent
    "gemini": "google/gemini-flash-1.5-8b",  # $0.075/$0.30 per 1M tokens - Very cheap
    "balanced": "anthropic/claude-3-haiku"  # $0.25/$1.25 per 1M tokens
}

# Default model - Best balance of cost, quality, and quota
# Using GPT-4o-mini: cheap ($0.15/1M), excellent quality, high quotas
DEFAULT_MODEL = RECOMMENDED_MODELS["cheap"]  # GPT-4o-mini - cheap + excellent!


class ExplanationCache:
    """
    Simple in-memory cache for LLM explanations to avoid repeated API calls.
    """
    
    def __init__(self, ttl_seconds: int = 3600):
        """
        Initialize cache.
        
        Args:
            ttl_seconds: Time-to-live for cache entries in seconds (default: 1 hour)
        """
        self.cache: Dict[str, Tuple[str, datetime]] = {}
        self.ttl = timedelta(seconds=ttl_seconds)
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, user_id: int, product_id: int, factors: Dict) -> str:
        """
        Generate cache key from user, product, and factors.
        
        Args:
            user_id: User ID
            product_id: Product ID
            factors: Recommendation factors dictionary
            
        Returns:
            Unique cache key
        """
        # Create a stable string representation of factors
        factors_str = str(sorted(factors.items()))
        key_str = f"{user_id}:{product_id}:{factors_str}"
        
        # Hash to keep keys manageable
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, user_id: int, product_id: int, factors: Dict) -> Optional[str]:
        """
        Retrieve explanation from cache if available and not expired.
        
        Args:
            user_id: User ID
            product_id: Product ID
            factors: Recommendation factors
            
        Returns:
            Cached explanation or None
        """
        key = self._generate_key(user_id, product_id, factors)
        
        if key in self.cache:
            explanation, timestamp = self.cache[key]
            
            # Check if expired
            if datetime.now() - timestamp < self.ttl:
                self.hits += 1
                logger.debug(f"Cache hit for user={user_id}, product={product_id}")
                return explanation
            else:
                # Remove expired entry
                del self.cache[key]
                logger.debug(f"Cache expired for user={user_id}, product={product_id}")
        
        self.misses += 1
        return None
    
    def set(self, user_id: int, product_id: int, factors: Dict, explanation: str):
        """
        Store explanation in cache.
        
        Args:
            user_id: User ID
            product_id: Product ID
            factors: Recommendation factors
            explanation: Generated explanation
        """
        key = self._generate_key(user_id, product_id, factors)
        self.cache[key] = (explanation, datetime.now())
        logger.debug(f"Cache set for user={user_id}, product={product_id}")
    
    def clear(self):
        """Clear all cache entries."""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
        logger.info("Cache cleared")
    
    def get_stats(self) -> Dict:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "cache_size": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_percent": round(hit_rate, 2),
            "total_requests": total_requests
        }


class RateLimiter:
    """
    Simple rate limiter to prevent exceeding API rate limits.
    """
    
    def __init__(self, max_requests_per_minute: int = 50):
        """
        Initialize rate limiter.
        
        Args:
            max_requests_per_minute: Maximum API requests per minute
        """
        self.max_requests = max_requests_per_minute
        self.requests: List[datetime] = []
    
    def wait_if_needed(self):
        """
        Wait if rate limit would be exceeded.
        Removes old requests outside the time window.
        """
        now = datetime.now()
        one_minute_ago = now - timedelta(minutes=1)
        
        # Remove requests older than 1 minute
        self.requests = [req_time for req_time in self.requests if req_time > one_minute_ago]
        
        # Check if we need to wait
        if len(self.requests) >= self.max_requests:
            # Calculate wait time until oldest request expires
            oldest = self.requests[0]
            wait_time = 61 - (now - oldest).seconds
            
            if wait_time > 0:
                logger.warning(f"Rate limit reached. Waiting {wait_time}s...")
                time.sleep(wait_time)
                self.requests = []
        
        # Record this request
        self.requests.append(now)


class LLMService:
    """
    LLM Service for generating personalized recommendation explanations.
    
    Features:
    - OpenRouter API integration (supports 100+ models)
    - Free tier available with llama models
    - Caching to avoid repeated API calls
    - Rate limiting to prevent API throttling
    - Error handling with fallbacks
    - Performance tracking
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        cache_ttl: int = 3600,
        max_requests_per_minute: int = 50,
        use_openrouter: bool = True
    ):
        """
        Initialize LLM service.
        
        Args:
            api_key: OpenRouter/OpenAI API key (if None, reads from OPENROUTER_API_KEY or OPENAI_API_KEY)
            model: Model to use (default: meta-llama/llama-3.1-8b-instruct:free for OpenRouter,
                   gpt-3.5-turbo for OpenAI)
            cache_ttl: Cache time-to-live in seconds (default: 1 hour)
            max_requests_per_minute: Rate limit (default: 50)
            use_openrouter: Use OpenRouter API (default: True)
        """
        self.use_openrouter = use_openrouter
        
        # Get API key - try OpenRouter first, then OpenAI
        if api_key:
            self.api_key = api_key
        elif use_openrouter:
            self.api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        else:
            self.api_key = os.getenv("OPENAI_API_KEY")
        
        # Set default model based on provider
        if model:
            self.model = model
        elif use_openrouter:
            # Use cheap, high-quality Gemini Flash by default
            self.model = DEFAULT_MODEL
        else:
            # For direct OpenAI, use gpt-4o-mini (cheaper than gpt-3.5-turbo now!)
            self.model = "gpt-4o-mini"
        
        # Check if API key is actually set and not empty
        if not self.api_key or self.api_key.strip() == "":
            logger.warning("No API key found. LLM explanations will use fallback.")
            self.client = None
        else:
            try:
                if use_openrouter:
                    # Initialize OpenRouter client (OpenAI-compatible)
                    self.client = OpenAI(
                        api_key=self.api_key,
                        base_url=OPENROUTER_BASE_URL
                    )
                    logger.info(f"LLM Service initialized with OpenRouter model: {self.model}")
                else:
                    # Initialize OpenAI client
                    self.client = OpenAI(api_key=self.api_key)
                    logger.info(f"LLM Service initialized with OpenAI model: {self.model}")
            except Exception as e:
                logger.error(f"Failed to initialize LLM client: {e}")
                logger.warning("Will use fallback explanations instead.")
                self.client = None
        
        self.cache = ExplanationCache(ttl_seconds=cache_ttl)
        self.rate_limiter = RateLimiter(max_requests_per_minute=max_requests_per_minute)
        
        # Performance tracking
        self.metrics = {
            "total_requests": 0,
            "api_calls": 0,
            "cache_hits": 0,
            "errors": 0,
            "fallback_uses": 0,
            "total_api_time": 0.0
        }
    
    def generate_explanation(
        self,
        user_data: Dict,
        product: Dict,
        recommendation_factors: Dict
    ) -> str:
        """
        Generate personalized explanation for a product recommendation.
        
        Args:
            user_data: Dictionary containing:
                - user_id: int
                - username: str
                - preferred_categories: List[str]
                - interaction_summary: str
                - purchased_count: int (optional)
            product: Dictionary containing:
                - product_id: int
                - name: str
                - category: str
                - price: float
                - description: str (optional)
                - tags: List[str] (optional)
            recommendation_factors: Dictionary containing:
                - collaborative_score: float
                - content_based_score: float
                - category_boost: float (optional)
                - final_score: float
                
        Returns:
            Natural language explanation (2-3 sentences)
        """
        self.metrics["total_requests"] += 1
        
        user_id = user_data.get("user_id")
        product_id = product.get("product_id")
        
        # Check cache first
        cached_explanation = self.cache.get(user_id, product_id, recommendation_factors)
        if cached_explanation:
            self.metrics["cache_hits"] += 1
            logger.info(f"Returning cached explanation for user={user_id}, product={product_id}")
            return cached_explanation
        
        # Generate new explanation
        try:
            if self.client is None:
                # No API key - use fallback
                explanation = self._generate_fallback_explanation(
                    user_data, product, recommendation_factors
                )
                self.metrics["fallback_uses"] += 1
            else:
                # Call OpenAI API
                explanation = self._call_openai_api(
                    user_data, product, recommendation_factors
                )
                self.metrics["api_calls"] += 1
            
            # Cache the explanation
            self.cache.set(user_id, product_id, recommendation_factors, explanation)
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating explanation: {str(e)}", exc_info=True)
            self.metrics["errors"] += 1
            
            # Return fallback explanation
            self.metrics["fallback_uses"] += 1
            return self._generate_fallback_explanation(
                user_data, product, recommendation_factors
            )
    
    def _call_openai_api(
        self,
        user_data: Dict,
        product: Dict,
        recommendation_factors: Dict
    ) -> str:
        """
        Call OpenAI API to generate explanation.
        
        Args:
            user_data: User information
            product: Product information
            recommendation_factors: Recommendation scoring factors
            
        Returns:
            Generated explanation
        """
        # Apply rate limiting
        self.rate_limiter.wait_if_needed()
        
        # Create prompt
        prompt = self._create_prompt(user_data, product, recommendation_factors)
        
        logger.info(f"Calling OpenAI API with model={self.model}")
        start_time = time.time()
        
        try:
            # Prepare API call parameters
            api_params = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful shopping assistant who explains product recommendations in a friendly, concise way."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 150,
                "temperature": 0.7,
            }
            
            # Add OpenRouter-specific headers if using OpenRouter
            if self.use_openrouter:
                api_params["extra_headers"] = {
                    "HTTP-Referer": "https://github.com/product-recommender",
                    "X-Title": "Product Recommender System"
                }
            
            # Call API (OpenRouter or OpenAI)
            response = self.client.chat.completions.create(**api_params)
            
            explanation = response.choices[0].message.content.strip()
            
            # Track API time
            api_time = time.time() - start_time
            self.metrics["total_api_time"] += api_time
            
            logger.info(f"OpenAI API call completed in {api_time:.2f}s")
            
            return explanation
            
        except RateLimitError as e:
            logger.error(f"Rate limit exceeded: {str(e)}")
            time.sleep(10)  # Wait before retrying
            raise
            
        except APIConnectionError as e:
            logger.error(f"API connection error: {str(e)}")
            raise
            
        except APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def _create_prompt(
        self,
        user_data: Dict,
        product: Dict,
        recommendation_factors: Dict
    ) -> str:
        """
        Create prompt for LLM explanation generation.
        
        Args:
            user_data: User information
            product: Product information
            recommendation_factors: Recommendation factors
            
        Returns:
            Formatted prompt string
        """
        # Extract user information
        username = user_data.get("username", "this user")
        preferred_categories = user_data.get("preferred_categories", [])
        interaction_summary = user_data.get("interaction_summary", "various products")
        purchased_count = user_data.get("purchased_count", 0)
        
        # Format preferred categories
        if isinstance(preferred_categories, dict):
            categories_str = ", ".join(preferred_categories.keys())
        elif isinstance(preferred_categories, list):
            categories_str = ", ".join(preferred_categories)
        else:
            categories_str = "various categories"
        
        # Extract product information
        product_name = product.get("name", "this product")
        product_category = product.get("category", "")
        product_price = product.get("price", 0)
        product_tags = product.get("tags", [])
        
        # Format tags
        tags_str = ", ".join(product_tags) if product_tags else "various features"
        
        # Extract recommendation factors
        collab_score = recommendation_factors.get("collaborative_score", 0)
        content_score = recommendation_factors.get("content_based_score", 0)
        category_boost = recommendation_factors.get("category_boost", 1.0)
        final_score = recommendation_factors.get("final_score", 0)
        
        # Determine primary recommendation reason
        if category_boost > 1.0:
            reason = f"matches your interest in {product_category}"
        elif collab_score > content_score:
            reason = "users with similar preferences loved it"
        else:
            reason = f"similar to {interaction_summary}"
        
        # Create the prompt
        prompt = f"""You are a helpful shopping assistant. Explain why we recommend "{product_name}" to this user.

User's recent interests: {categories_str}
User's past purchases: {purchased_count} products
User has shown interest in: {interaction_summary}

Product details:
- Name: {product_name}
- Category: {product_category}
- Price: ${product_price:.2f}
- Features: {tags_str}

Recommendation factors:
- Collaborative filtering score: {collab_score:.2f}
- Content similarity score: {content_score:.2f}
- Category preference match: {"Yes" if category_boost > 1.0 else "No"}
- Overall match score: {final_score:.2f}

Primary reason: {reason}

Provide a friendly, concise explanation (2-3 sentences) focusing on why this product matches their preferences. Be specific about the connection to their interests."""
        
        return prompt
    
    def _generate_fallback_explanation(
        self,
        user_data: Dict,
        product: Dict,
        recommendation_factors: Dict
    ) -> str:
        """
        Generate template-based explanation when API is unavailable.
        
        Args:
            user_data: User information
            product: Product information
            recommendation_factors: Recommendation factors
            
        Returns:
            Template-based explanation
        """
        product_name = product.get("name", "this product")
        product_category = product.get("category", "")
        
        collab_score = recommendation_factors.get("collaborative_score", 0)
        content_score = recommendation_factors.get("content_based_score", 0)
        category_boost = recommendation_factors.get("category_boost", 1.0)
        
        # Choose explanation based on dominant factor
        if category_boost > 1.0:
            explanation = f"We recommend '{product_name}' because you've shown strong interest in {product_category} products. "
            explanation += f"This matches your browsing preferences and is similar to items you've enjoyed before."
        elif collab_score > content_score:
            explanation = f"We think you'll love '{product_name}' because users with similar tastes to yours have highly rated this product. "
            explanation += f"It's popular among people who share your interests in {product_category}."
        else:
            explanation = f"Based on your interest in {product_category}, we recommend '{product_name}'. "
            explanation += f"This product has features similar to items you've shown interest in before."
        
        return explanation
    
    def get_metrics(self) -> Dict:
        """
        Get performance metrics for the LLM service.
        
        Returns:
            Dictionary containing performance metrics
        """
        avg_api_time = (
            self.metrics["total_api_time"] / self.metrics["api_calls"]
            if self.metrics["api_calls"] > 0
            else 0
        )
        
        cache_stats = self.cache.get_stats()
        
        return {
            "total_requests": self.metrics["total_requests"],
            "api_calls": self.metrics["api_calls"],
            "cache_hits": self.metrics["cache_hits"],
            "errors": self.metrics["errors"],
            "fallback_uses": self.metrics["fallback_uses"],
            "avg_api_time_seconds": round(avg_api_time, 3),
            "cache_stats": cache_stats
        }
    
    def reset_metrics(self):
        """Reset performance metrics."""
        self.metrics = {
            "total_requests": 0,
            "api_calls": 0,
            "cache_hits": 0,
            "errors": 0,
            "fallback_uses": 0,
            "total_api_time": 0.0
        }
        self.cache.hits = 0
        self.cache.misses = 0
        logger.info("Metrics reset")
    
    def clear_cache(self):
        """Clear explanation cache."""
        self.cache.clear()
        logger.info("Cache cleared")

