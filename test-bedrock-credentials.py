#!/usr/bin/env python3
"""
Test script to verify AWS Bedrock credentials work
Run with: python test-bedrock-credentials.py
"""

import boto3
import json
import os

print("🧪 Testing AWS Bedrock Credentials...\n")

# REPLACE THESE WITH YOUR ACTUAL CREDENTIALS
AWS_ACCESS_KEY_ID = "ABSKQmVkcm9ja0FQSUtleS1xbzdqLWF0LTI5MjM0MzgyNjAwNDpsaGRrKzdZYWI1MFVaazkzaHlwZ0FOc1E0NnJmaXBiMTAwVzFpajNuZWNqamUwR0VGUWRDR1o3SjRKcz0="
AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY_HERE"
AWS_REGION = "ap-south-1"  # Change if needed

print(f"Region: {AWS_REGION}")
print(f"Access Key: {AWS_ACCESS_KEY_ID[:10]}..." if AWS_ACCESS_KEY_ID != "YOUR_ACCESS_KEY_ID_HERE" else "Access Key: NOT SET")
print()

if AWS_ACCESS_KEY_ID == "YOUR_ACCESS_KEY_ID_HERE":
    print("❌ ERROR: Please edit this file and add your AWS credentials!")
    print("\nOpen test-bedrock-credentials.py and replace:")
    print('  AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID_HERE"')
    print('  AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY_HERE"')
    exit(1)

# Create Bedrock client with credentials
try:
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    print("✅ Bedrock client created successfully")
except Exception as e:
    print(f"❌ Failed to create Bedrock client: {str(e)}")
    exit(1)

# Test invoking Claude 3 Sonnet
print("\n📤 Sending test request to Claude 3 Sonnet...")

request_body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 100,
    "temperature": 0.7,
    "messages": [
        {
            "role": "user",
            "content": "Say 'Hello from Bedrock!' and nothing else."
        }
    ]
}

try:
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        body=json.dumps(request_body)
    )
    
    # Parse response
    response_body = json.loads(response['body'].read())
    
    print("✅ SUCCESS! Bedrock API is working!\n")
    print("📥 Response from Claude:")
    print("-" * 60)
    
    if 'content' in response_body and len(response_body['content']) > 0:
        message = response_body['content'][0]['text']
        print(message)
    else:
        print(json.dumps(response_body, indent=2))
    
    print("-" * 60)
    print("\n🎉 Your credentials are valid and Bedrock is accessible!")
    print("\nNext steps:")
    print("1. Add these credentials to your Lambda environment variables:")
    print(f"   - AWS_ACCESS_KEY_ID: {AWS_ACCESS_KEY_ID}")
    print(f"   - AWS_SECRET_ACCESS_KEY: {AWS_SECRET_ACCESS_KEY}")
    print(f"   - AWS_REGION: {AWS_REGION}")
    print("2. Redeploy your Lambda function with the updated code")
    print("3. Run: node test-api.js")
    
except Exception as e:
    error_message = str(e)
    print(f"❌ ERROR: {error_message}\n")
    
    # Provide specific troubleshooting
    if "InvalidSignatureException" in error_message or "security token" in error_message:
        print("🔍 Issue: Invalid credentials")
        print("   - Double-check your AWS_ACCESS_KEY_ID")
        print("   - Double-check your AWS_SECRET_ACCESS_KEY")
        print("   - Make sure there are no extra spaces")
        
    elif "AccessDeniedException" in error_message:
        if "INVALID_PAYMENT_INSTRUMENT" in error_message:
            print("🔍 Issue: AWS account billing problem")
            print("   - Add a valid payment method to your AWS account")
            print("   - Go to: AWS Console → Billing → Payment methods")
            print("   - Wait 10 minutes after adding payment method")
        else:
            print("🔍 Issue: Insufficient permissions")
            print("   - Your credentials need 'bedrock:InvokeModel' permission")
            print("   - Check IAM user/role permissions in AWS Console")
            
    elif "Could not connect" in error_message or "endpoint" in error_message:
        print("🔍 Issue: Wrong region or Bedrock not available")
        print(f"   - Current region: {AWS_REGION}")
        print("   - Try these regions: us-east-1, us-west-2, ap-south-1")
        print("   - Check Bedrock availability: https://aws.amazon.com/bedrock/")
        
    elif "ResourceNotFoundException" in error_message or "model" in error_message.lower():
        print("🔍 Issue: Model not found or not enabled")
        print("   - Go to: AWS Console → Bedrock → Model access")
        print("   - Enable 'Claude 3 Sonnet' model")
        print("   - Wait for approval (usually instant)")
        
    else:
        print("🔍 Unexpected error. Full details:")
        print(f"   {error_message}")
        
    exit(1)
