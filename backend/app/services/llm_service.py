"""
LLM Service for Recommendation Explanations

This module provides a sophisticated natural language explanation service for
product recommendations using advanced language models through the OpenRouter API.

Key Features:
- Multi-model support: OpenAI, Anthropic, Google, Meta, and more models
- Intelligent caching: Reduces API calls and costs through smart caching
- Rate limiting: Prevents API throttling and manages quota usage
- Cost optimization: Uses cost-effective models with excellent quality
- Fallback mechanisms: Graceful degradation when API is unavailable
- Performance monitoring: Tracks API usage, costs, and response times

Supported Models:
- OpenAI GPT-4o-mini: Best value ($0.15/1M tokens, excellent quality)
- Google Gemini Flash: Very cheap ($0.075/1M tokens, good quality)
- Anthropic Claude: High quality ($0.25/1M tokens, excellent reasoning)
- Meta Llama: Free tier available, good quality

Architecture:
- OpenRouter API: Unified interface for multiple LLM providers
- Caching Layer: In-memory cache with TTL for cost optimization
- Rate Limiting: Prevents API throttling and manages quotas
- Error Handling: Graceful fallbacks and retry mechanisms
- Cost Tracking: Monitors API usage and costs

Author: Product Recommender Team
Version: 1.0.0
"""

import os
import time
import hashlib
import logging
from typing import Dict, Optional, List, Tuple, Any
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

# Best cost-effective models (ranked by value and quality)
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
        Create prompt for LLM explanation generation based on user behavior analysis.
        
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
        user_behavior = user_data.get("behavior_patterns", {})
        
        # Format preferred categories with weights
        if isinstance(preferred_categories, dict):
            categories_str = ", ".join([f"{cat} ({weight:.1f}x preference)" for cat, weight in preferred_categories.items()])
            top_category = max(preferred_categories.items(), key=lambda x: x[1])[0] if preferred_categories else ""
        elif isinstance(preferred_categories, list):
            categories_str = ", ".join(preferred_categories)
            top_category = preferred_categories[0] if preferred_categories else ""
        else:
            categories_str = "various categories"
            top_category = ""
        
        # Extract product information
        product_name = product.get("name", "this product")
        product_category = product.get("category", "")
        product_price = product.get("price", 0)
        product_tags = product.get("tags", [])
        product_description = product.get("description", "")
        
        # Format tags
        tags_str = ", ".join(product_tags) if product_tags else "various features"
        
        # Extract recommendation factors
        collab_score = recommendation_factors.get("collaborative_score", 0)
        content_score = recommendation_factors.get("content_based_score", 0)
        category_boost = recommendation_factors.get("category_boost", 1.0)
        final_score = recommendation_factors.get("final_score", 0)
        
        # Analyze user behavior patterns
        behavior_insights = []
        if purchased_count > 0:
            behavior_insights.append(f"has purchased {purchased_count} products")
        if top_category and product_category.lower() == top_category.lower():
            behavior_insights.append(f"shows strong preference for {product_category} products")
        if collab_score > 0.7:
            behavior_insights.append("has similar tastes to other users who loved this product")
        if content_score > 0.6:
            behavior_insights.append("enjoys products with similar features")
        
        behavior_summary = ", ".join(behavior_insights) if behavior_insights else "is exploring new products"
        
        # Create the enhanced prompt based on user behavior analysis
        prompt = f"""Explain why product "{product_name}" is recommended to this user based on their behavior.

USER BEHAVIOR ANALYSIS:
- User: {username}
- Behavior pattern: {behavior_summary}
- Recent interests: {categories_str}
- Interaction history: {interaction_summary}
- Purchase history: {purchased_count} products

PRODUCT DETAILS:
- Name: {product_name}
- Category: {product_category}
- Price: ${product_price:.2f}
- Description: {product_description}
- Key features: {tags_str}

RECOMMENDATION ALGORITHM SCORES:
- Collaborative filtering (similar users): {collab_score:.2f}
- Content-based matching: {content_score:.2f}
- Category preference boost: {category_boost:.1f}x
- Final recommendation score: {final_score:.2f}

TASK: Provide a personalized, conversational explanation (2-3 sentences) that:
1. Specifically mentions how this product connects to their demonstrated behavior patterns
2. Highlights why this recommendation makes sense based on their interests
3. Uses a friendly, helpful tone as if you're a personal shopping assistant

Focus on the behavioral connection - what about their past actions suggests they would like this product?"""
        
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
        username = user_data.get("username", "you")
        purchased_count = user_data.get("purchased_count", 0)
        preferred_categories = user_data.get("preferred_categories", {})
        
        collab_score = recommendation_factors.get("collaborative_score", 0)
        content_score = recommendation_factors.get("content_based_score", 0)
        category_boost = recommendation_factors.get("category_boost", 1.0)
        
        # Get top preferred category
        if isinstance(preferred_categories, dict) and preferred_categories:
            top_category = max(preferred_categories.items(), key=lambda x: x[1])[0]
        else:
            top_category = ""
        
        # Generate behavior-focused explanation
        if category_boost > 1.5 and top_category:
            explanation = f"Based on your strong preference for {top_category} products, we recommend '{product_name}'. "
            explanation += f"You've consistently shown interest in this category, and this product matches your demonstrated preferences."
        elif collab_score > 0.6:
            explanation = f"We recommend '{product_name}' because users with similar shopping patterns to yours have loved this product. "
            explanation += f"Your behavior suggests you'd enjoy {product_category} items like this one."
        elif content_score > 0.5:
            explanation = f"Based on your browsing history and product preferences, '{product_name}' aligns well with your interests. "
            explanation += f"The features and category match what you typically look for in products."
        elif purchased_count > 0:
            explanation = f"Since you've purchased {purchased_count} products before, we recommend '{product_name}' as it fits your shopping style. "
            explanation += f"This {product_category} product offers features you've shown interest in previously."
        else:
            explanation = f"We recommend '{product_name}' as a great introduction to {product_category} products. "
            explanation += f"Based on your browsing patterns, this aligns with your current interests and preferences."
        
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

