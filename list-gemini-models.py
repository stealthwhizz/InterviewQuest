#!/usr/bin/env python3
import urllib.request
import json

GOOGLE_API_KEY = "AIzaSyCd1gs8cjr_zXJM9-vSTwYqbZeMKJDaqCI"

print("🔍 Listing available Gemini models...\n")

endpoint = f"https://generativelanguage.googleapis.com/v1/models?key={GOOGLE_API_KEY}"

try:
    req = urllib.request.Request(endpoint, method='GET')
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        print("Available models:\n")
        if 'models' in data:
            for model in data['models']:
                name = model.get('name', 'Unknown')
                display_name = model.get('displayName', 'Unknown')
                supported_methods = model.get('supportedGenerationMethods', [])
                
                print(f"✓ {name}")
                print(f"  Display Name: {display_name}")
                print(f"  Methods: {', '.join(supported_methods)}")
                print()
        else:
            print(json.dumps(data, indent=2))
            
except Exception as e:
    print(f"Error: {e}")
