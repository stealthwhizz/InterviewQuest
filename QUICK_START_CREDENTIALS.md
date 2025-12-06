# Quick Start: Adding Your Bedrock API Credentials

## What You Need
- AWS Access Key ID (starts with `AKIA...`)
- AWS Secret Access Key (long random string)
- AWS Region (e.g., `ap-south-1`)

## Step 1: Test Your Credentials Locally (Optional but Recommended)

1. **Edit the test script**:
   ```bash
   # Open test-bedrock-credentials.py in a text editor
   # Replace these lines with your actual credentials:
   AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID_HERE"
   AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY_HERE"
   AWS_REGION = "ap-south-1"
   ```

2. **Run the test**:
   ```bash
   python test-bedrock-credentials.py
   ```

3. **Expected output**:
   ```
   ✅ SUCCESS! Bedrock API is working!
   📥 Response from Claude:
   Hello from Bedrock!
   ```

If this works, proceed to Step 2. If not, the script will tell you what's wrong.

## Step 2: Add Credentials to Lambda

### Via AWS Console (Easiest)

1. **Go to Lambda**:
   - Open: https://console.aws.amazon.com/lambda/
   - Select region: `ap-south-1` (top-right)
   - Click your function: `interview-quest-evaluator`

2. **Update the code**:
   - Click "Code" tab
   - Delete all existing code
   - Copy the entire content from `lambda/evaluator.py`
   - Paste into the editor
   - Click "Deploy" button

3. **Add environment variables**:
   - Click "Configuration" tab
   - Click "Environment variables" (left sidebar)
   - Click "Edit" button
   - Click "Add environment variable" (3 times)
   - Add these:
     ```
     Key: AWS_ACCESS_KEY_ID
     Value: [paste your access key]
     
     Key: AWS_SECRET_ACCESS_KEY
     Value: [paste your secret key]
     
     Key: AWS_REGION
     Value: ap-south-1
     ```
   - Click "Save"

4. **Test it**:
   ```bash
   node test-api.js
   ```

## Step 3: Verify It Works

Run the API test:
```bash
node test-api.js
```

**Success looks like**:
```
✅ API is working!
📋 Evaluation Result:
   Score: 7/10
   Strengths: 2 items
   Improvements: 2 items
   Motivation: Present
```

**If you still get errors**, check:
- [ ] Credentials are correct (no typos, no extra spaces)
- [ ] Region matches where you have Bedrock access
- [ ] AWS account has a valid payment method
- [ ] Bedrock model access is enabled

## Common Issues

### "Invalid signature" or "security token"
→ Wrong credentials. Double-check your Access Key ID and Secret Key.

### "INVALID_PAYMENT_INSTRUMENT"
→ Add a credit card to your AWS account (Billing Dashboard).

### "AccessDeniedException" (not payment related)
→ Your IAM user needs `bedrock:InvokeModel` permission.

### "Could not connect to endpoint"
→ Wrong region. Try `us-east-1` or `us-west-2` instead.

## Files Updated

✅ `lambda/evaluator.py` - Now supports AWS credentials
✅ `test-bedrock-credentials.py` - Test script to verify credentials
✅ `AWS_CREDENTIALS_SETUP.md` - Detailed setup guide

## Security Warning

⚠️ **Never commit credentials to Git!**

The credentials should only be in:
- Lambda environment variables (production)
- Local test script (for testing only)
- AWS Secrets Manager (best practice)

## Need Help?

If you're still stuck, share:
1. The exact error message from `node test-api.js`
2. The output from `python test-bedrock-credentials.py`
3. Your AWS region

I'll help you debug!
