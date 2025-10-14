# OpenRouter Setup Guide

## 🚀 What is OpenRouter?

OpenRouter provides unified access to 100+ AI models through a single API:
- **Free models available** (Llama, Mistral, etc.)
- **Pay-as-you-go** for premium models
- **Better pricing** than direct API access
- **No quota limits** on free tier
- **OpenAI-compatible** API

## 🎯 Get Your Free API Key

### Step 1: Sign Up

1. Visit https://openrouter.ai/
2. Click "Sign In" (top right)
3. Sign up with Google, GitHub, or email
4. **No credit card required** for free models!

### Step 2: Get API Key

1. Go to https://openrouter.ai/keys
2. Click "Create Key"
3. Give it a name (e.g., "Product Recommender")
4. Copy the key (starts with `sk-or-v1-`)
5. Save it securely!

### Step 3: Configure in Your Project

**Windows PowerShell:**
```powershell
$env:OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

**Linux/Mac:**
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

**Or create .env file:**
```bash
# In backend/.env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

## 🆓 Free Models Available

Our system uses **free models by default**:

| Model | Provider | Cost | Speed |
|-------|----------|------|-------|
| `meta-llama/llama-3.1-8b-instruct:free` | Meta | FREE | Fast |
| `google/gemma-2-9b-it:free` | Google | FREE | Fast |
| `mistralai/mistral-7b-instruct:free` | Mistral | FREE | Fast |

**Default**: `meta-llama/llama-3.1-8b-instruct:free`

---

## 💰 Premium Models (Optional)

If you want higher quality, add credits and use premium models:

| Model | Cost/1M tokens | Quality |
|-------|----------------|---------|
| `openai/gpt-4o-mini` | $0.15 | Excellent |
| `openai/gpt-3.5-turbo` | $0.50 | Very Good |
| `anthropic/claude-3-haiku` | $0.25 | Excellent |
| `google/gemini-pro` | $0.50 | Very Good |

---

## 🔧 Usage

### Default (Free Model)

```python
from app.services.llm_service import LLMService

# Uses free Llama model automatically
llm_service = LLMService()

explanation = llm_service.generate_explanation(
    user_data=user_data,
    product=product,
    recommendation_factors=factors
)
```

### Custom Free Model

```python
# Use different free model
llm_service = LLMService(
    model="google/gemma-2-9b-it:free"
)
```

### Premium Model

```python
# Use GPT-4 (requires credits)
llm_service = LLMService(
    model="openai/gpt-4o-mini"
)
```

### Still Support OpenAI

```python
# Use OpenAI directly instead of OpenRouter
llm_service = LLMService(
    use_openrouter=False,
    api_key="sk-openai-key",
    model="gpt-3.5-turbo"
)
```

---

## 🧪 Testing

### Test with Free Model

```powershell
# Set API key
$env:OPENROUTER_API_KEY="sk-or-v1-your-key"

# Restart server
uvicorn app.main:app --reload

# Test (in another terminal)
curl.exe "http://localhost:8000/recommendations/1?limit=5&use_llm=true"
```

### Run Test Script

```bash
cd backend
python test_llm_service.py
```

---

## 🌟 Available Models

View all models at: https://openrouter.ai/models

### Popular Free Models

```python
# Meta Llama 3.1 (DEFAULT)
model="meta-llama/llama-3.1-8b-instruct:free"

# Google Gemma 2
model="google/gemma-2-9b-it:free"

# Mistral 7B
model="mistralai/mistral-7b-instruct:free"

# Microsoft Phi-3
model="microsoft/phi-3-mini-128k-instruct:free"
```

### Popular Premium Models

```python
# OpenAI GPT-4o Mini (best value)
model="openai/gpt-4o-mini"

# Anthropic Claude 3 Haiku (fast)
model="anthropic/claude-3-haiku"

# Google Gemini Flash (fast)
model="google/gemini-flash-1.5"

# Meta Llama 3.1 70B (powerful)
model="meta-llama/llama-3.1-70b-instruct"
```

---

## 💡 Pricing Comparison

**With OpenRouter Free Tier:**
- Cost: $0 per month
- Usage: Unlimited with free models
- Quality: Good (Llama 3.1 8B)
- Perfect for testing and small projects

**With OpenRouter Premium:**
- Cost: ~$0.15-0.50 per 1M tokens
- Usage: Pay as you go
- Quality: Excellent (GPT-4, Claude, etc.)
- 50-70% cheaper than direct API

**With OpenAI Direct:**
- Cost: ~$0.50-3.00 per 1M tokens
- Usage: Pay as you go
- Quality: Excellent
- Most expensive option

---

## 🔑 Environment Variables

The service checks for API keys in this order:

1. `OPENROUTER_API_KEY` - OpenRouter key (preferred)
2. `OPENAI_API_KEY` - OpenAI key (fallback)

**Example .env file:**
```env
# OpenRouter (free tier available)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Or OpenAI (requires credits)
# OPENAI_API_KEY=sk-your-openai-key

# Optional: Specify model
# LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

---

## ⚙️ Configuration Options

### In Code

```python
from app.services.llm_service import LLMService

# Use OpenRouter with free model (DEFAULT)
llm = LLMService()

# Use specific free model
llm = LLMService(model="google/gemma-2-9b-it:free")

# Use premium model
llm = LLMService(model="openai/gpt-4o-mini")

# Use OpenAI instead
llm = LLMService(use_openrouter=False)

# Custom configuration
llm = LLMService(
    api_key="sk-or-v1-...",
    model="meta-llama/llama-3.1-8b-instruct:free",
    cache_ttl=7200,  # 2 hours
    max_requests_per_minute=30
)
```

---

## 🐛 Troubleshooting

### Issue: "No API key found"

**Solution:**
```powershell
# Set the API key
$env:OPENROUTER_API_KEY="sk-or-v1-your-key"

# Restart server
uvicorn app.main:app --reload
```

### Issue: "Model not found"

**Solution:**
Check available models at https://openrouter.ai/models

```python
# Use a valid model name
llm = LLMService(model="meta-llama/llama-3.1-8b-instruct:free")
```

### Issue: "Insufficient credits"

**Solution:**
- Use free models (default)
- Or add credits at https://openrouter.ai/credits

### Issue: Rate limit exceeded

**Solution:**
```python
# Reduce rate limit
llm = LLMService(max_requests_per_minute=10)
```

---

## 📊 Performance

### Free Models
- **Speed**: 1-2 seconds per explanation
- **Quality**: Good (7-8/10)
- **Cost**: $0
- **Recommended for**: Testing, small projects, demos

### Premium Models
- **Speed**: 0.5-1.5 seconds per explanation
- **Quality**: Excellent (9-10/10)
- **Cost**: $0.001-0.003 per explanation
- **Recommended for**: Production, high-quality needs

---

## 🎯 Best Practices

1. **Start with free models** for testing
2. **Use caching** to reduce API calls (built-in)
3. **Monitor usage** at https://openrouter.ai/activity
4. **Set rate limits** appropriate for your tier
5. **Upgrade to premium** only if needed

---

## 🔒 Security

- **Never commit API keys** to git
- **Use environment variables** or .env files
- **Rotate keys** periodically
- **Monitor usage** for unusual activity

---

## 📚 Resources

- **OpenRouter Dashboard**: https://openrouter.ai/
- **Model List**: https://openrouter.ai/models
- **API Docs**: https://openrouter.ai/docs
- **Pricing**: https://openrouter.ai/docs#models
- **Activity Log**: https://openrouter.ai/activity

---

## ✅ Quick Start Checklist

- [ ] Sign up at https://openrouter.ai/
- [ ] Get API key from https://openrouter.ai/keys
- [ ] Set `OPENROUTER_API_KEY` environment variable
- [ ] Restart server
- [ ] Test: `curl "http://localhost:8000/recommendations/1?use_llm=true"`
- [ ] Check it works!

**That's it!** You now have access to free AI explanations! 🎉

---

## 💬 Support

- OpenRouter Discord: https://discord.gg/openrouter
- Documentation: https://openrouter.ai/docs
- Email: help@openrouter.ai


