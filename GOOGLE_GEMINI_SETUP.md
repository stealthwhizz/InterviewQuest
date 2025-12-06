# Google Gemini API Setup Guide

## Step 1: Get Your Google API Key (2 minutes)

1. **Go to Google AI Studio**:
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Create API Key**:
   - Click "Create API Key" button
   - Select "Create API key in new project" (or use existing project)
   - Copy the API key (looks like: `AIzaSyD...`)

3. **Save it somewhere safe** (you'll need it in the next steps)

## Step 2: Test Your API Key Locally (Optional but Recommended)

1. **Edit the test script**:
   - Open `test-gemini-api.py` in a text editor
   - Find this line:
     ```python
     GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY_HERE"
     ```
   - Replace with your actual API key:
     ```python
     GOOGLE_API_KEY = "AIzaSyD..."
     ```

2. **Run the test**:
   ```bash
   python test-gemini-api.py
   ```

3. **Expected output**:
   ```
   ✅ SUCCESS! Gemini API is working!
   📥 Response from Gemini:
   Hello from Gemini!
   ```

If this works, proceed to Step 3!

## Step 3: Update Your Lambda Function

### Option A: Via AWS Console (Easiest)

1. **Go to AWS Lambda Console**:
   - Visit: https://console.aws.amazon.com/lambda/
   - Select region: `ap-south-1` (top-right corner)
   - Click your function: `interview-quest-evaluator`

2. **Replace the code**:
   - Click "Code" tab
   - Delete ALL existing code in the editor
   - Open `lambda/evaluator-gemini.py` on your computer
   - Copy the ENTIRE file content
   - Paste into the Lambda editor
   - Click "Deploy" button (orange button at top)

3. **Add the API key as environment variable**:
   - Click "Configuration" tab
   - Click "Environment variables" in the left sidebar
   - Click "Edit" button
   - Click "Add environment variable"
   - Enter:
     ```
     Key: GOOGLE_API_KEY
     Value: [paste your API key here]
     ```
   - Click "Save"

### Option B: Via ZIP Upload

1. **Create ZIP file**:
   ```bash
   cd lambda
   zip function.zip evaluator-gemini.py
   ```

2. **Upload to Lambda**:
   - Go to Lambda Console → Your function
   - Click "Upload from" → ".zip file"
   - Select `function.zip`
   - Click "Save"

3. **Add environment variable** (same as Option A step 3)

## Step 4: Test the API

Run your test script:
```bash
node test-api.js
```

**Expected output**:
```
✅ API is working!
📋 Evaluation Result:
   Score: 7/10
   Strengths: 2 items
   Improvements: 2 items
   Motivation: Present
```

## Step 5: Play the Game!

1. Open `index.html` in your browser
2. Click "Start Game"
3. Answer a question
4. You should now get real AI feedback from Google Gemini!

## Where to Put the API Key - Summary

| Location | Where Exactly | Format |
|----------|---------------|--------|
| **Lambda (Production)** | Configuration → Environment variables | `GOOGLE_API_KEY = AIzaSyD...` |
| **Test Script (Local)** | Edit `test-gemini-api.py` line 13 | `GOOGLE_API_KEY = "AIzaSyD..."` |
| **NOT in code** | ❌ Never hardcode in Lambda function | Security risk! |
| **NOT in Git** | ❌ Never commit to repository | Keep it secret! |

## Benefits of Google Gemini

✅ **Free tier**: 15 requests per minute, 1500 per day
✅ **No payment method required**: Works immediately
✅ **Fast**: Gemini 1.5 Flash is very quick
✅ **Simple**: Just one API key, no complex AWS setup
✅ **Good quality**: Comparable to Claude for this use case

## Troubleshooting

### "API key not valid"
- Double-check you copied the full key
- Make sure there are no extra spaces
- Get a new key from: https://makersuite.google.com/app/apikey

### "Quota exceeded"
- Free tier: 15 requests/minute, 1500/day
- Wait a minute and try again
- Or upgrade to paid tier (very cheap)

### Lambda timeout
- Go to Lambda → Configuration → General configuration
- Set timeout to 30 seconds
- Set memory to 512 MB

### Still getting errors?
- Check Lambda logs in CloudWatch
- Make sure environment variable name is exactly: `GOOGLE_API_KEY`
- Verify the Lambda code was updated (check the Deploy timestamp)

## Cost Comparison

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| **Google Gemini** | 15 req/min, 1500/day | $0.00015 per request |
| **AWS Bedrock** | None | $0.01-0.02 per request |

Google Gemini is **100x cheaper** and has a generous free tier!

## Security Note

⚠️ **Keep your API key secret!**

- Don't commit it to Git
- Don't share it publicly
- Don't hardcode it in your code
- Only store it in Lambda environment variables

If you accidentally expose it:
1. Go to: https://makersuite.google.com/app/apikey
2. Delete the old key
3. Create a new one
4. Update Lambda environment variable

## Next Steps

After everything works:
1. ✅ Test the game thoroughly
2. ✅ Deploy to production (S3, GitHub Pages, etc.)
3. ✅ Share your game!

Your game is now powered by Google Gemini AI! 🎉
