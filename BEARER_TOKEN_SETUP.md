# Using Bedrock Bearer Token

## What You Have

You have a Bedrock API Bearer Token:
```
ABSKQmVkcm9ja0FQSUtleS1xbzdqLWF0LTI5MjM0MzgyNjAwNDpsaGRrKzdZYWI1MFVaazkzaHlwZ0FOc1E0NnJmaXBiMTAwVzFpajNuZWNqamUwR0VGUWRDR1o3SjRKcz0=
```

## Current Status

✅ **Token is valid** - It successfully authenticates with Bedrock
❌ **Payment issue** - Your AWS account needs a valid payment method

The error you're getting:
```
Model access is denied due to INVALID_PAYMENT_INSTRUMENT
```

This means:
1. Your bearer token works correctly
2. Bedrock recognizes your request
3. But AWS won't let you use the model without a payment method

## How to Fix

### Option 1: Add Payment Method (Required for Production)

1. **Go to AWS Billing Dashboard**:
   - https://console.aws.amazon.com/billing/
   
2. **Add Payment Method**:
   - Click "Payment methods" in left sidebar
   - Click "Add payment method"
   - Enter credit card details
   - Click "Add payment method"

3. **Wait 10 minutes**:
   - AWS needs time to process the payment method
   - After 10 minutes, try again

4. **Test again**:
   ```bash
   python test-bearer-token.py
   ```

### Option 2: Use Mock Mode (For Testing Only)

Your game already has a fallback system! You can test all game mechanics without fixing AWS:

1. Open `index.html` in your browser
2. Start playing the game
3. When you answer questions, you'll see:
   ```
   Note: AI evaluation service is currently unavailable. 
   Using basic scoring.
   ```
4. All game features work (XP, lives, combos, achievements, boss battles)
5. Only the AI feedback quality is affected

## Using Bearer Token in Lambda (After Payment Fixed)

Once you fix the payment issue, you have two options:

### Method A: Keep Using API Gateway + Lambda (Current Setup)

Your current Lambda uses boto3, which doesn't directly support bearer tokens. You need to:

1. Extract AWS credentials from the bearer token
2. Add them as environment variables to Lambda

**OR**

### Method B: Use Bearer Token Directly (Simpler)

Modify Lambda to use HTTP requests instead of boto3:

1. **Update Lambda code** to use `requests` library
2. **Add bearer token** as environment variable
3. **Make HTTP requests** to Bedrock API

I can help you implement Method B if you want a simpler solution.

## Why This Happens

AWS Bedrock is a paid service. Even with valid credentials/tokens, AWS requires:

1. ✅ Valid authentication (you have this - your bearer token works!)
2. ❌ Valid payment method (you need to add this)
3. ✅ Model access enabled (you have this)
4. ✅ Proper permissions (you have this)

The **only** missing piece is #2 - the payment method.

## What to Do Now

**Immediate action**:
1. Add a credit card to your AWS account
2. Wait 10 minutes
3. Run: `python test-bearer-token.py`
4. If successful, run: `node test-api.js`

**For testing without fixing AWS**:
1. Open `index.html` in browser
2. Play the game with mock evaluation
3. Test all features except AI feedback

## Cost Estimate

Don't worry about costs! Bedrock pricing for Claude 3 Sonnet:
- Input: ~$0.003 per 1K tokens
- Output: ~$0.015 per 1K tokens

For your game:
- Each answer evaluation: ~$0.01-0.02
- 100 questions: ~$1-2
- Very affordable for testing!

AWS Free Tier doesn't include Bedrock, but costs are minimal for development.

## Need Help?

If you're stuck:
1. Share the output of `python test-bearer-token.py` after adding payment method
2. Check AWS Billing Dashboard for any alerts
3. Verify your AWS account is in good standing

The bearer token is working correctly - you just need to add a payment method!
