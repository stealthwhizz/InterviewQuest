# 🔧 Lambda Update Required - Token Limit Fix

## Problem Found

The Gemini API response was being cut off because `maxOutputTokens` was too low (1000 tokens). The JSON response was incomplete, causing parsing errors.

## Solution

I've updated `lambda/evaluator-gemini.py` with:
1. ✅ Increased `maxOutputTokens` from 1000 to 2048
2. ✅ Added check for truncated responses
3. ✅ Better error messages

## What You Need to Do

### Update Lambda Code (2 minutes)

1. **Go to AWS Lambda Console**:
   - https://console.aws.amazon.com/lambda/
   - Region: `ap-south-1`
   - Function: `interview-quest-evaluator`

2. **Replace the code AGAIN**:
   - Click "Code" tab
   - Select ALL text (Ctrl+A)
   - Delete it
   - Open `lambda/evaluator-gemini.py` (the updated version)
   - Copy ENTIRE file
   - Paste into Lambda
   - Click "Deploy"

3. **Test**:
   ```bash
   node test-api.js
   ```

## What Changed

**Before:**
```python
"maxOutputTokens": 1000,  # Too small!
```

**After:**
```python
"maxOutputTokens": 2048,  # Enough for complete JSON
```

## Expected Result

After updating, you should see:
```
✅ API is working!
📋 Evaluation Result:
   Score: 6/10
   Strengths: 3 items
   Improvements: 2 items
   Motivation: Present
```

## Why This Happened

Gemini 2.5 Flash includes "thinking tokens" in the response, which uses up the token budget. By increasing to 2048, we ensure the complete JSON response is generated.

## Quick Test

After updating Lambda, run:
```bash
node test-api.js
```

Should work now! 🎉
