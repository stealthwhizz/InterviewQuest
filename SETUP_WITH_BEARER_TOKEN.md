# Setup Guide: Using Your Bearer Token

## Current Situation

✅ **Your bearer token is valid** - Test confirmed it authenticates successfully
❌ **Payment method required** - AWS needs a credit card to use Bedrock

## Quick Fix (2 Steps)

### Step 1: Add Payment Method to AWS

1. Go to: https://console.aws.amazon.com/billing/
2. Click "Payment methods" (left sidebar)
3. Click "Add payment method"
4. Enter credit card details
5. Save
6. **Wait 10 minutes** for AWS to process

### Step 2: Update Lambda to Use Bearer Token

I've created a new Lambda function that uses your bearer token directly.

**Option A: Replace Lambda Code (Easiest)**

1. Go to AWS Lambda Console
2. Open your function: `interview-quest-evaluator`
3. Click "Code" tab
4. Delete all code
5. Copy entire content from `lambda/evaluator-bearer-token.py`
6. Paste into editor
7. Click "Deploy"

**Option B: Upload as ZIP**

```bash
cd lambda
zip function.zip evaluator-bearer-token.py
# Upload via Lambda console
```

### Step 3: Add Bearer Token to Lambda

1. In Lambda Console, click "Configuration" tab
2. Click "Environment variables"
3. Click "Edit"
4. Add these variables:
   ```
   Key: BEDROCK_BEARER_TOKEN
   Value: ABSKQmVkcm9ja0FQSUtleS1xbzdqLWF0LTI5MjM0MzgyNjAwNDpsaGRrKzdZYWI1MFVaazkzaHlwZ0FOc1E0NnJmaXBiMTAwVzFpajNuZWNqamUwR0VGUWRDR1o3SjRKcz0=
   
   Key: AWS_REGION
   Value: ap-south-1
   ```
5. Click "Save"

### Step 4: Test

After waiting 10 minutes from adding payment method:

```bash
node test-api.js
```

Expected output:
```
✅ API is working!
📋 Evaluation Result:
   Score: 7/10
   Strengths: 2 items
   Improvements: 2 items
```

## What Changed

**Old Lambda** (`evaluator.py`):
- Uses boto3 library
- Requires AWS Access Keys or IAM role
- Standard AWS SDK approach

**New Lambda** (`evaluator-bearer-token.py`):
- Uses HTTP requests directly
- Works with your bearer token
- Simpler authentication

## Files Created

1. ✅ `lambda/evaluator-bearer-token.py` - New Lambda function
2. ✅ `test-bearer-token.py` - Test script for bearer token
3. ✅ `BEARER_TOKEN_SETUP.md` - Detailed explanation

## Testing Without AWS Fix

Want to test the game now without fixing AWS?

1. Open `index.html` in browser
2. Play the game
3. You'll see: "AI evaluation service is currently unavailable. Using basic scoring."
4. All features work (XP, lives, combos, achievements, bosses)
5. Only AI feedback quality is affected

## Cost Information

Don't worry about costs! Claude 3 Sonnet pricing:
- ~$0.01-0.02 per answer evaluation
- 100 questions = ~$1-2
- Very affordable for testing

## Troubleshooting

### Still getting payment error after 10 minutes?

1. Check AWS Billing Dashboard for alerts
2. Verify credit card was added successfully
3. Try a different credit card
4. Contact AWS Support if account has issues

### Bearer token not working?

1. Verify you copied the full token (no spaces)
2. Check Lambda environment variables are set correctly
3. Check Lambda logs in CloudWatch

### Lambda timeout?

1. Go to Lambda Configuration → General configuration
2. Set timeout to 30 seconds
3. Set memory to 512 MB

## Summary

**What you need to do**:
1. Add credit card to AWS account (Billing Dashboard)
2. Wait 10 minutes
3. Update Lambda code to `evaluator-bearer-token.py`
4. Add `BEDROCK_BEARER_TOKEN` environment variable
5. Test with `node test-api.js`

**Your bearer token is working** - you just need the payment method!
