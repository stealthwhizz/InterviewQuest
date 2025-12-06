# Quick Start: Switch to Google Gemini (5 Minutes)

## Why Google Gemini?
✅ **No payment method required** - Works immediately  
✅ **Free tier** - 1500 requests per day  
✅ **Simple setup** - Just one API key  
✅ **Fast** - Quick responses  

## 3 Simple Steps

### 1️⃣ Get API Key (2 min)
```
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with AIzaSy...)
```

### 2️⃣ Update Lambda (2 min)
```
1. Go to: AWS Lambda Console
2. Open function: interview-quest-evaluator
3. Code tab → Delete all code
4. Copy content from: lambda/evaluator-gemini.py
5. Paste and click "Deploy"
6. Configuration tab → Environment variables → Edit
7. Add: GOOGLE_API_KEY = [your key]
8. Save
```

### 3️⃣ Test (1 min)
```bash
node test-api.js
```

Expected:
```
✅ API is working!
Score: 7/10
```

## Done! 🎉

Open `index.html` and play your game with real AI feedback!

## Where to Put the API Key?

**In Lambda Environment Variables:**
```
AWS Console → Lambda → Your Function → Configuration → Environment variables

Add this:
Key: GOOGLE_API_KEY
Value: AIzaSyD... (your actual key)
```

**NOT in the code!** Never hardcode it in `evaluator-gemini.py`

## Test Locally First (Optional)

Before updating Lambda, test your key works:

1. Edit `test-gemini-api.py`:
   ```python
   GOOGLE_API_KEY = "AIzaSyD..."  # Your key here
   ```

2. Run:
   ```bash
   python test-gemini-api.py
   ```

3. Should see: `✅ SUCCESS! Gemini API is working!`

## Files You Need

1. **`lambda/evaluator-gemini.py`** ← Upload this to Lambda
2. **`test-gemini-api.py`** ← Test your API key locally
3. **`GOOGLE_GEMINI_SETUP.md`** ← Detailed guide

## Comparison

| AWS Bedrock | Google Gemini |
|-------------|---------------|
| ❌ Requires payment method | ✅ No payment needed |
| ❌ Complex setup | ✅ Simple setup |
| ❌ $0.01-0.02 per request | ✅ Free (1500/day) |
| ✅ Claude 3 Sonnet | ✅ Gemini 1.5 Flash |

## Troubleshooting

**"API key not valid"**  
→ Get new key: https://makersuite.google.com/app/apikey

**"Quota exceeded"**  
→ Free tier: 15/min, 1500/day. Wait a minute.

**Lambda still failing?**  
→ Check CloudWatch logs  
→ Verify environment variable name: `GOOGLE_API_KEY`  
→ Make sure you clicked "Deploy" after pasting code

## Need Help?

Read the detailed guide: `GOOGLE_GEMINI_SETUP.md`

Or share the error message and I'll help debug!
