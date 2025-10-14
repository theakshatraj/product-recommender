# Environment Setup Guide

## 🚀 LLM API Configuration (OpenRouter Recommended!)

### Option 1: OpenRouter (Recommended - FREE!)

**Why OpenRouter?**
- ✅ **100% FREE** tier available
- ✅ **No credit card** required
- ✅ **No quotas** on free models
- ✅ **100+ models** to choose from
- ✅ **Better pricing** than OpenAI

#### Get OpenRouter API Key (FREE)

1. Visit https://openrouter.ai/keys
2. Sign in with Google, GitHub, or email
3. Click "Create Key"
4. Copy the key (starts with `sk-or-v1-`)
5. No credit card needed!

#### Configure OpenRouter Key

**Windows PowerShell:**
```powershell
$env:OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

**Linux/Mac:**
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

**Or create .env file** in `backend/` directory:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

### Option 2: OpenAI (Requires Credits)

**Why OpenAI?**
- Higher quality models (GPT-4)
- Direct from source
- **Requires credit card and costs money**

#### Get OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign up and add payment method
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

#### Configure OpenAI Key

**Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY="sk-your-key-here"
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-your-key-here"
```

**Note**: The system will automatically use OpenRouter if `OPENROUTER_API_KEY` is set, otherwise falls back to OpenAI.

---

### Verify Setup

Run the test script to verify your API key works:

```bash
cd backend
python test_llm_service.py
```

If configured correctly, you'll see AI-generated explanations!

## Example .env File

Create a file named `.env` in the `backend/` directory:

```env
# OpenRouter API (FREE - Recommended)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Or OpenAI API (Costs money)
# OPENAI_API_KEY=sk-your-openai-key-here

# Database Configuration
DATABASE_URL=sqlite:///./product_recommender.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# LLM Configuration (Optional)
# LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free
# LLM_CACHE_TTL=3600
# LLM_MAX_REQUESTS_PER_MINUTE=50

# Environment
ENVIRONMENT=development
```

## Without OpenAI API Key

The service works without an API key by using fallback explanations:

```python
# This will work without API key
llm_service = LLMService()

explanation = llm_service.generate_explanation(...)
# Returns template-based explanation
```

## 💰 Pricing Comparison

### OpenRouter FREE Tier
- Cost: **$0/month**
- Model: Llama 3.1 8B (free)
- Quality: Good (7-8/10)
- Quota: Unlimited
- Perfect for: Testing, demos, small projects

### OpenRouter Premium
- Cost: **$0.15-0.50** per 1M tokens
- Models: GPT-4o-mini, Claude, Gemini
- Quality: Excellent (9-10/10)
- 50-70% cheaper than OpenAI direct

### OpenAI Direct
- Cost: **$0.50-3.00** per 1M tokens  
- Models: GPT-3.5, GPT-4
- Quality: Excellent (9-10/10)
- Most expensive option

**Recommendation**: Start with **OpenRouter Free**, upgrade if needed

## Security Best Practices

1. **Never commit API keys to git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Rotate keys regularly**
   - Create new keys periodically
   - Delete old keys

3. **Set usage limits**
   - Configure OpenAI usage limits
   - Monitor usage regularly

4. **Use rate limiting**
   - Built-in rate limiter prevents overuse
   - Configure based on your tier

## Troubleshooting

### "No API key found"
- Check environment variable is set
- Verify `.env` file exists and has correct format
- Ensure `python-dotenv` is installed

### "Invalid API key"
- Verify key is correct (starts with `sk-`)
- Check key hasn't been revoked
- Try creating a new key

### "Rate limit exceeded"
- Lower `max_requests_per_minute`
- Increase cache TTL
- Upgrade OpenAI tier

## Testing Without API Key

```bash
# Unset API key to test fallback
unset OPENAI_API_KEY  # Linux/Mac
$env:OPENAI_API_KEY=""  # PowerShell

# Run tests - will use fallback
python test_llm_service.py
```

