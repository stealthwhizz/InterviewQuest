# AWS Bedrock API Credentials Setup Guide

## What You Need

If you have AWS credentials for Bedrock, you likely have one of these:

1. **AWS Access Key ID** (looks like: `AKIAIOSFODNN7EXAMPLE`)
2. **AWS Secret Access Key** (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
3. **AWS Region** (e.g., `ap-south-1`, `us-east-1`)

## Where to Add Your Credentials

### Method 1: Lambda Environment Variables (Recommended)

1. **Go to AWS Lambda Console**
   - Navigate to: https://console.aws.amazon.com/lambda/
   - Select your region (top-right corner)
   - Click on your function: `interview-quest-evaluator`

2. **Add Environment Variables**
   - Click the "Configuration" tab
   - Click "Environment variables" in the left sidebar
   - Click "Edit"
   - Add these variables:
     - Key: `AWS_ACCESS_KEY_ID`, Value: `your-access-key-id`
     - Key: `AWS_SECRET_ACCESS_KEY`, Value: `your-secret-access-key`
     - Key: `AWS_REGION`, Value: `ap-south-1` (or your region)
   - Click "Save"

3. **Redeploy Your Lambda**
   - The Lambda function code has been updated to use these credentials
   - Upload the updated `evaluator.py` file to your Lambda function
   - Or copy-paste the entire code from `lambda/evaluator.py`

### Method 2: Test Locally First

Before deploying to Lambda, test if your credentials work:

1. **Create a test script** (`test-bedrock-credentials.py`):

```python
import boto3
import json
import os

# Add your credentials here
os.environ['AWS_ACCESS_KEY_ID'] = 'your-access-key-id'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'your-secret-access-key'
os.environ['AWS_REGION'] = 'ap-south-1'

# Test Bedrock connection
bedrock = boto3.client(
    'bedrock-runtime',
    region_name=os.environ['AWS_REGION'],
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
)

# Try to invoke Claude
try:
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100,
            "messages": [
                {
                    "role": "user",
                    "content": "Say hello in one word"
                }
            ]
        })
    )
    
    result = json.loads(response['body'].read())
    print("✅ SUCCESS! Bedrock is working!")
    print(f"Response: {result}")
    
except Exception as e:
    print(f"❌ ERROR: {str(e)}")
    print("\nPossible issues:")
    print("1. Invalid credentials")
    print("2. Wrong region")
    print("3. Bedrock access not enabled")
    print("4. Payment method issue")
```

2. **Run the test**:
```bash
python test-bedrock-credentials.py
```

If this works, your credentials are valid!

## Step-by-Step Deployment

### Step 1: Update Lambda Code

The Lambda function has been updated to support credentials. You need to upload it:

**Option A: Via AWS Console**
1. Go to Lambda Console → Your function
2. Click "Code" tab
3. Copy the entire content of `lambda/evaluator.py`
4. Paste it into the Lambda editor
5. Click "Deploy"

**Option B: Via ZIP Upload**
1. Create a ZIP file:
   ```bash
   cd lambda
   zip function.zip evaluator.py
   ```
2. Go to Lambda Console → Your function
3. Click "Upload from" → ".zip file"
4. Select `function.zip`
5. Click "Save"

### Step 2: Add Environment Variables

1. In Lambda Console, click "Configuration" tab
2. Click "Environment variables"
3. Click "Edit"
4. Add these three variables:
   - `AWS_ACCESS_KEY_ID`: Your access key
   - `AWS_SECRET_ACCESS_KEY`: Your secret key
   - `AWS_REGION`: `ap-south-1` (or your region)
5. Click "Save"

### Step 3: Test the API

Run your test script:
```bash
node test-api.js
```

You should see:
```
✅ API is working!
Score: 7/10
Strengths: 2 items
Improvements: 2 items
```

## Troubleshooting

### Error: "The security token included in the request is invalid"
- **Solution**: Your AWS credentials are incorrect or expired
- **Fix**: Double-check your Access Key ID and Secret Access Key

### Error: "Could not connect to the endpoint URL"
- **Solution**: Wrong region specified
- **Fix**: Make sure `AWS_REGION` matches where Bedrock is available
- **Available regions**: `us-east-1`, `us-west-2`, `ap-south-1`, `eu-west-1`

### Error: "Access Denied"
- **Solution**: Your credentials don't have Bedrock permissions
- **Fix**: The IAM user/role needs this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:foundation-model/anthropic.claude-3-sonnet-*"
    }
  ]
}
```

### Still Getting Payment Instrument Error?
- This means your AWS account itself has billing issues
- Even with valid credentials, AWS won't let you use Bedrock without a payment method
- **Fix**: Add a credit card to your AWS account (Billing Dashboard)

## Security Best Practices

⚠️ **IMPORTANT**: Never commit credentials to Git!

1. **Add to .gitignore**:
```
# AWS Credentials
.env
*.pem
*.key
aws-credentials.json
```

2. **Use AWS Secrets Manager** (Production):
   - Store credentials in AWS Secrets Manager
   - Update Lambda to fetch from Secrets Manager
   - More secure than environment variables

3. **Use IAM Roles** (Best Practice):
   - If your Lambda is in AWS, use IAM roles instead of credentials
   - No need to manage keys
   - Automatically rotated by AWS

## Quick Reference

| What You Have | Where to Add It | Variable Name |
|---------------|-----------------|---------------|
| Access Key ID | Lambda Environment Variables | `AWS_ACCESS_KEY_ID` |
| Secret Access Key | Lambda Environment Variables | `AWS_SECRET_ACCESS_KEY` |
| Region | Lambda Environment Variables | `AWS_REGION` |

## Next Steps

After adding credentials:

1. ✅ Update Lambda code (already done - `evaluator.py` is updated)
2. ✅ Add environment variables to Lambda
3. ✅ Test with `node test-api.js`
4. ✅ Open `index.html` and play the game!

If you still get errors, share the exact error message and I'll help debug further.
