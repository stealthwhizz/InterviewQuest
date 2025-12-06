#!/usr/bin/env python3
"""
Test script to verify Google Gemini API works
Run with: python test-gemini-api.py
"""

import urllib.request
import urllib.error
import json

print("🧪 Testing Google Gemini API...\n")

# Your Google API Key - DO NOT COMMIT THIS FILE WITH REAL KEY
GOOGLE_API_KEY = "YOUR_API_KEY_HERE"  # Replace with your actual key locally

print(f"API Key: {GOOGLE_API_KEY[:10]}...\n")

# Gemini API endpoint
MODEL_NAME = "gemini-2.5-flash"
endpoint = f"https://generativelanguage.googleapis.com/v1/models/{MODEL_NAME}:generateContent?key={GOOGLE_API_KEY}"

# Test request
request_body = {
    "contents": [{
        "parts": [{
            "text": "Say 'Hello from Gemini!' and nothing else."
        }]
    }]
}

print("📤 Sending test request to Gemini...\n")

try:
    # Prepare request
    headers = {"Content-Type": "application/json"}
    request_data = json.dumps(request_body).encode('utf-8')
    req = urllib.request.Request(endpoint, data=request_data, headers=headers, method='POST')
    
    # Send request
    with urllib.request.urlopen(req, timeout=30) as response:
        response_data = json.loads(response.read().decode('utf-8'))
        
        print("✅ SUCCESS! Gemini API is working!\n")
        print("📥 Response from Gemini:")
        print("-" * 60)
        
        if 'candidates' in response_data and len(response_data['candidates']) > 0:
            text = response_data['candidates'][0]['content']['parts'][0]['text']
            print(text)
        else:
            print(json.dumps(response_data, indent=2))
        
        print("-" * 60)
        print("\n🎉 Your Google API key is valid!")
        print("\nNext steps:")
        print("1. Add this API key to your Lambda environment variables:")
        print(f"   GOOGLE_API_KEY: {GOOGLE_API_KEY}")
        print("2. Upload lambda/evaluator-gemini.py to Lambda")
        print("3. Run: node test-api.js")
        
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"❌ HTTP Error {e.code}\n")
    print(f"Response: {error_body}\n")
    
    if e.code == 400:
        print("🔍 Issue: Bad request")
        print("   - Check if API key is correct")
        print("   - Verify request format")
    elif e.code == 403:
        print("🔍 Issue: API key invalid or doesn't have permission")
        print("   - Double-check your API key")
        print("   - Make sure Gemini API is enabled")
        print("   - Get a new key from: https://makersuite.google.com/app/apikey")
    elif e.code == 429:
        print("🔍 Issue: Rate limit exceeded")
        print("   - Wait a few minutes and try again")
        print("   - Check your quota at: https://console.cloud.google.com/")
    else:
        print(f"🔍 Unexpected HTTP error: {e.code}")
        
except urllib.error.URLError as e:
    print(f"❌ Connection error: {str(e)}\n")
    print("🔍 Possible issues:")
    print("   - No internet connection")
    print("   - Firewall blocking request")
    print("   - DNS issues")
    
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")
    import traceback
    print(traceback.format_exc())
