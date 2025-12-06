#!/usr/bin/env python3
"""
Test Bedrock API using Bearer Token
This uses direct HTTP requests instead of boto3
"""

import requests
import json

# Your bearer token
BEARER_TOKEN = "YOUR_BEARER_TOKEN_HERE"  # Replace with your actual token locally

# Bedrock API endpoint (adjust region if needed)
REGION = "ap-south-1"
MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"

# Bedrock Runtime API endpoint
BEDROCK_ENDPOINT = f"https://bedrock-runtime.{REGION}.amazonaws.com/model/{MODEL_ID}/invoke"

print("🧪 Testing Bedrock Bearer Token...\n")
print(f"Region: {REGION}")
print(f"Model: {MODEL_ID}")
print(f"Token: {BEARER_TOKEN[:20]}...\n")

# Prepare request
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 100,
    "messages": [
        {
            "role": "user",
            "content": "Say 'Hello from Bedrock!' and nothing else."
        }
    ]
}

print("📤 Sending request to Bedrock...\n")

try:
    response = requests.post(
        BEDROCK_ENDPOINT,
        headers=headers,
        json=body,
        timeout=30
    )
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"📥 Response:\n")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS! Bearer token works!\n")
        print(json.dumps(result, indent=2))
        
        if 'content' in result:
            print("\n💬 Claude's response:")
            print(result['content'][0]['text'])
            
        print("\n🎉 Your bearer token is valid!")
        print("\nNext step: Update Lambda to use HTTP requests with this token")
        
    else:
        print("❌ Request failed")
        print(f"Response: {response.text}\n")
        
        if response.status_code == 401:
            print("🔍 Issue: Unauthorized - Invalid bearer token")
        elif response.status_code == 403:
            print("🔍 Issue: Forbidden - Token doesn't have permission")
        elif response.status_code == 404:
            print("🔍 Issue: Endpoint not found - Check region or model ID")
        else:
            print(f"🔍 Issue: HTTP {response.status_code}")
            
except requests.exceptions.RequestException as e:
    print(f"❌ Connection error: {str(e)}\n")
    print("🔍 Possible issues:")
    print("   - Wrong endpoint URL")
    print("   - Network connectivity")
    print("   - Invalid region")
    
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")
