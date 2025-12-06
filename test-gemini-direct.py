#!/usr/bin/env python3
"""
Test Gemini API directly with the same prompt as Lambda
"""

import urllib.request
import json

GOOGLE_API_KEY = "YOUR_API_KEY_HERE"  # Replace with your actual key locally
MODEL_NAME = "gemini-2.5-flash"

# Same prompt as Lambda uses
prompt = """You are an expert interview evaluator for a junior level interview.

Question: What is your greatest strength?
Candidate's Answer: My greatest strength is problem-solving. I enjoy breaking down complex challenges into manageable parts and finding creative solutions.

Evaluate this answer based on these criteria for junior level:
- Basic understanding of concepts
- Clear and coherent communication
- Willingness to learn
- Fundamental problem-solving approach
- Basic technical knowledge

Scoring Guidance:
Be encouraging but honest. A good answer shows basic understanding.

Score the answer from 1 to 10:
- 1-3: Poor answer with major gaps
- 4-5: Below average, missing key points
- 6-7: Good answer, meets expectations
- 8-9: Excellent answer, exceeds expectations
- 10: Outstanding, comprehensive answer

Provide your evaluation in the following format:
1. Score (number 1-10)
2. Strengths (2-3 specific positive points about the answer)
3. Improvements (2-3 actionable suggestions for improvement)
4. Motivation (one encouraging sentence to keep the candidate motivated)

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{"score": <number>, "strengths": ["point 1", "point 2"], "improvements": ["suggestion 1", "suggestion 2"], "motivation": "encouraging message"}"""

print("🧪 Testing Gemini with actual interview prompt...\n")

endpoint = f"https://generativelanguage.googleapis.com/v1/models/{MODEL_NAME}:generateContent?key={GOOGLE_API_KEY}"

request_body = {
    "contents": [{
        "parts": [{
            "text": prompt
        }]
    }],
    "generationConfig": {
        "temperature": 0.7,
        "maxOutputTokens": 1000,
    }
}

try:
    headers = {"Content-Type": "application/json"}
    request_data = json.dumps(request_body).encode('utf-8')
    req = urllib.request.Request(endpoint, data=request_data, headers=headers, method='POST')
    
    with urllib.request.urlopen(req, timeout=30) as response:
        response_data = json.loads(response.read().decode('utf-8'))
        
        print("✅ Gemini Response Received\n")
        print("=" * 60)
        print("Full Response Structure:")
        print(json.dumps(response_data, indent=2))
        print("=" * 60)
        
        if 'candidates' in response_data and len(response_data['candidates']) > 0:
            candidate = response_data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                text = candidate['content']['parts'][0]['text']
                print("\n📝 Generated Text:")
                print("-" * 60)
                print(text)
                print("-" * 60)
                
                # Try to parse as JSON
                print("\n🔍 Attempting to parse as JSON...")
                try:
                    # Clean up
                    cleaned = text.strip()
                    if cleaned.startswith('```json'):
                        cleaned = cleaned[7:]
                    if cleaned.startswith('```'):
                        cleaned = cleaned[3:]
                    if cleaned.endswith('```'):
                        cleaned = cleaned[:-3]
                    cleaned = cleaned.strip()
                    
                    evaluation = json.loads(cleaned)
                    print("✅ Successfully parsed!")
                    print(json.dumps(evaluation, indent=2))
                except json.JSONDecodeError as e:
                    print(f"❌ JSON parsing failed: {e}")
                    print(f"Cleaned text: {cleaned[:200]}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
