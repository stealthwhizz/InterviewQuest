import json
import urllib.request
import urllib.error
import os
from typing import Dict, Any

# Configuration
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
MODEL_NAME = "gemini-2.5-flash"  # Fast and free tier available

def validate_request(body: Dict[str, Any]) -> tuple[bool, str]:
    """Validate the incoming request body."""
    required_fields = ['question', 'answer', 'difficulty']
    
    for field in required_fields:
        if field not in body:
            return False, f"Missing required field: {field}"
    
    valid_difficulties = ['junior', 'senior', 'faang']
    if body['difficulty'] not in valid_difficulties:
        return False, f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
    
    if not isinstance(body['question'], str) or not body['question'].strip():
        return False, "Question must be a non-empty string"
    
    if not isinstance(body['answer'], str) or not body['answer'].strip():
        return False, "Answer must be a non-empty string"
    
    if len(body['answer']) > 5000:
        return False, "Answer exceeds maximum length of 5000 characters"
    
    return True, ""

def construct_prompt(question: str, answer: str, difficulty: str) -> str:
    """Construct the evaluation prompt with difficulty-based criteria."""
    criteria_map = {
        'junior': """- Basic understanding of concepts
- Clear and coherent communication
- Willingness to learn
- Fundamental problem-solving approach
- Basic technical knowledge""",
        'senior': """- Deep technical understanding with nuance
- Discussion of trade-offs and alternatives
- Real-world experience and practical examples
- Consideration of edge cases
- Architectural thinking
- Leadership and mentoring aspects""",
        'faang': """- System-level thinking and scalability considerations
- Comprehensive edge case analysis
- Performance and optimization awareness
- Distributed systems knowledge
- Production-readiness mindset
- Innovation and best practices
- Cross-functional impact consideration"""
    }
    
    strictness_map = {
        'junior': "Be encouraging but honest. A good answer shows basic understanding.",
        'senior': "Be STRICTER. Expect depth, trade-offs, and real-world experience. Good answers should demonstrate mastery.",
        'faang': "Be VERY STRICT. Expect exceptional depth, scalability thinking, and comprehensive analysis. Only truly outstanding answers should score 9-10."
    }
    
    prompt = f"""You are an expert interview evaluator for a {difficulty} level interview.

Question: {question}
Candidate's Answer: {answer}

Evaluate this answer based on these criteria for {difficulty} level:
{criteria_map[difficulty]}

Scoring Guidance:
{strictness_map[difficulty]}

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
{{"score": <number>, "strengths": ["point 1", "point 2"], "improvements": ["suggestion 1", "suggestion 2"], "motivation": "encouraging message"}}"""
    
    return prompt

def invoke_gemini_api(prompt: str) -> Dict[str, Any]:
    """Invoke Google Gemini API."""
    
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set")
    
    # Gemini API endpoint
    endpoint = f"https://generativelanguage.googleapis.com/v1/models/{MODEL_NAME}:generateContent?key={GOOGLE_API_KEY}"
    
    # Prepare request body
    request_body = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,  # Increased to ensure complete JSON response
        }
    }
    
    # Prepare HTTP request
    headers = {
        "Content-Type": "application/json"
    }
    
    request_data = json.dumps(request_body).encode('utf-8')
    req = urllib.request.Request(endpoint, data=request_data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            return response_data
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"Gemini API error ({e.code}): {error_body}")
    except urllib.error.URLError as e:
        raise Exception(f"Network error: {str(e)}")

def parse_gemini_response(response_body: Dict[str, Any]) -> Dict[str, Any]:
    """Parse and validate the Gemini response."""
    try:
        # Extract text from Gemini response format
        if 'candidates' in response_body and len(response_body['candidates']) > 0:
            candidate = response_body['candidates'][0]
            
            # Check if response was truncated
            finish_reason = candidate.get('finishReason', '')
            if finish_reason == 'MAX_TOKENS':
                raise ValueError("Response was truncated due to token limit. Increase maxOutputTokens.")
            
            if 'content' in candidate and 'parts' in candidate['content']:
                content_text = candidate['content']['parts'][0]['text']
            else:
                raise ValueError("Unexpected response format from Gemini")
        else:
            raise ValueError("No candidates in Gemini response")
        
        # Clean up the response (remove markdown code blocks if present)
        content_text = content_text.strip()
        if content_text.startswith('```json'):
            content_text = content_text[7:]
        if content_text.startswith('```'):
            content_text = content_text[3:]
        if content_text.endswith('```'):
            content_text = content_text[:-3]
        content_text = content_text.strip()
        
        # Parse the JSON
        evaluation = json.loads(content_text)
        
        # Validate structure
        required_fields = ['score', 'strengths', 'improvements', 'motivation']
        for field in required_fields:
            if field not in evaluation:
                raise ValueError(f"Missing required field in evaluation: {field}")
        
        # Validate types and values
        if not isinstance(evaluation['score'], (int, float)) or not (1 <= evaluation['score'] <= 10):
            raise ValueError("Score must be a number between 1 and 10")
        
        if not isinstance(evaluation['strengths'], list) or len(evaluation['strengths']) < 1:
            raise ValueError("Strengths must be a non-empty array")
        
        if not isinstance(evaluation['improvements'], list) or len(evaluation['improvements']) < 1:
            raise ValueError("Improvements must be a non-empty array")
        
        if not isinstance(evaluation['motivation'], str) or not evaluation['motivation'].strip():
            raise ValueError("Motivation must be a non-empty string")
        
        # Ensure score is an integer
        evaluation['score'] = int(evaluation['score'])
        
        return evaluation
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in response: {str(e)}\nResponse text: {content_text[:200]}")
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected response structure: {str(e)}")

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create a standardized API Gateway response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        'body': json.dumps(body)
    }

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda handler function for interview answer evaluation using Google Gemini."""
    
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Handle OPTIONS request for CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {'message': 'CORS preflight successful'})
        
        # Parse request body
        body = None
        
        try:
            if 'body' in event:
                if isinstance(event['body'], str):
                    print(f"Parsing body string: {event['body'][:200]}...")
                    body = json.loads(event['body'])
                else:
                    body = event['body']
            else:
                body = event
            
            print(f"Parsed body: {json.dumps(body)}")
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return create_response(400, {
                'error': f'Invalid JSON in request body: {str(e)}',
                'details': 'The request body must be valid JSON'
            })
        
        if body is None:
            return create_response(400, {
                'error': 'Missing request body',
                'details': 'Request must include a JSON body with question, answer, and difficulty'
            })
        
        # Validate request
        is_valid, error_message = validate_request(body)
        if not is_valid:
            print(f"Validation error: {error_message}")
            return create_response(400, {
                'error': error_message,
                'received_fields': list(body.keys()) if isinstance(body, dict) else 'body is not a dict'
            })
        
        # Extract parameters
        question = body['question'].strip()
        answer = body['answer'].strip()
        difficulty = body['difficulty'].lower()
        
        print(f"Processing evaluation - Difficulty: {difficulty}, Question length: {len(question)}, Answer length: {len(answer)}")
        
        # Construct prompt
        prompt = construct_prompt(question, answer, difficulty)
        print(f"Constructed prompt (first 200 chars): {prompt[:200]}...")
        
        # Call Gemini API
        print(f"Calling Google Gemini API...")
        
        try:
            response_body = invoke_gemini_api(prompt)
            print("Gemini response received")
            print(f"Response: {json.dumps(response_body)[:500]}...")
            
        except Exception as gemini_error:
            print(f"Gemini invocation error: {str(gemini_error)}")
            return create_response(500, {
                'error': 'Failed to invoke AI model',
                'details': str(gemini_error)
            })
        
        # Parse response
        try:
            evaluation = parse_gemini_response(response_body)
            print(f"Parsed evaluation: {json.dumps(evaluation)}")
            
        except Exception as parse_error:
            print(f"Response parsing error: {str(parse_error)}")
            return create_response(500, {
                'error': 'Failed to parse AI response',
                'details': str(parse_error)
            })
        
        # Return successful response
        print(f"Returning successful evaluation with score: {evaluation['score']}")
        return create_response(200, evaluation)
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return create_response(400, {
            'error': str(e),
            'type': 'ValidationError'
        })
    
    except KeyError as e:
        print(f"KeyError: {str(e)}")
        return create_response(400, {
            'error': f'Missing required field: {str(e)}',
            'type': 'KeyError'
        })
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        return create_response(500, {
            'error': 'Internal server error',
            'details': str(e),
            'type': type(e).__name__
        })
