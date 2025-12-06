#!/usr/bin/env python3
"""
Decode the Bedrock Bearer Token to extract credentials
"""

import base64
import json

# Your bearer token
bearer_token = "ABSKQmVkcm9ja0FQSUtleS1xbzdqLWF0LTI5MjM0MzgyNjAwNDpsaGRrKzdZYWI1MFVaazkzaHlwZ0FOc1E0NnJmaXBiMTAwVzFpajNuZWNqamUwR0VGUWRDR1o3SjRKcz0="

print("🔍 Decoding Bearer Token...\n")

try:
    # Try to decode as base64
    decoded = base64.b64decode(bearer_token)
    decoded_str = decoded.decode('utf-8')
    
    print("✅ Decoded successfully!")
    print(f"\nDecoded content:\n{decoded_str}\n")
    
    # Check if it contains a colon (typical for key:secret format)
    if ':' in decoded_str:
        parts = decoded_str.split(':', 1)
        print("📋 Extracted credentials:")
        print(f"   Access Key ID: {parts[0]}")
        print(f"   Secret Key: {parts[1]}")
        
        # Save to a file for easy use
        with open('extracted-credentials.txt', 'w') as f:
            f.write(f"AWS_ACCESS_KEY_ID={parts[0]}\n")
            f.write(f"AWS_SECRET_ACCESS_KEY={parts[1]}\n")
            f.write(f"AWS_REGION=ap-south-1\n")
        
        print("\n✅ Credentials saved to: extracted-credentials.txt")
        print("\nNext steps:")
        print("1. Add these to Lambda environment variables")
        print("2. Or use them in test-bedrock-credentials.py")
    else:
        print("⚠️  Token doesn't contain standard AWS credentials format")
        print("   This might be a custom API token")
        
except Exception as e:
    print(f"❌ Error decoding: {str(e)}")
    print("\nThis token format is not standard base64 AWS credentials.")
    print("It might be:")
    print("1. A custom Bedrock API wrapper token")
    print("2. A third-party service token")
    print("3. An AWS Marketplace subscription token")
