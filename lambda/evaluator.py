import json
import boto3
import os
from typing import Dict, Any, List

# Initialize Bedrock client
# Use ap-south-1 (Mumbai) as default since that's where the API Gateway is deployed
# Support both IAM role (Lambda default) and explicit credentials (if provided)
aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
aws_region = os.environ.get('AWS_REGION', 'ap-south-1')

if aws_access_key and aws_secret_key:
    # Use explicit credentials if provided
    bedrock_runtime = boto3.client(
        'bedrock-runtime',
        region_name=aws_region,
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )
else:
    # Use IAM role (default for Lambda)
    bedrock_runtime = boto3.client('bedrock-runtime', region_name=aws_region)

# Model ID for Claude 3 Sonnet
MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"

def validate_request(body: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate the incoming request body.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ['question', 'answer', 'difficulty']
    
    # Check all required fields are present
    for field in required_fields:
        if field not in body:
            return False, f"Missing required field: {field}"
    
    # Validate difficulty value
    valid_difficulties = ['junior', 'senior', 'faang']
    if body['difficulty'] not in valid_difficulties:
        return False, f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
    
    # Validate types
    if not isinstance(body['question'], str) or not body['question'].strip():
        return False, "Question must be a non-empty string"
    
    if not isinstance(body['answer'], str) or not body['answer'].strip():
        return False, "Answer must be a non-empty string"
    
    # Validate length constraints
    if len(body['answer']) > 5000:
        return False, "Answer exceeds maximum length of 5000 characters"
    
    return True, ""

def construct_prompt(question: str, answer: str, difficulty: str) -> str:
    """
    Construct the Bedrock prompt with difficulty-based evaluation criteria.
    
    Args:
        question: The interview question
        answer: The candidate's answer
        difficulty: The difficulty level (junior, senior, faang)
    
    Returns:
        str: The formatted prompt for Bedrock
    """
    # Difficulty-specific evaluation criteria
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
    
    # Strictness guidance
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

Return ONLY valid JSON in this exact format:
{{"score": <number>, "strengths": ["point 1", "point 2"], "improvements": ["suggestion 1", "suggestion 2"], "motivation": "encouraging message"}}"""
    
    return prompt

def parse_bedrock_response(response_body: str) -> Dict[str, Any]:
    """
    Parse and validate the Bedrock response.
    
    Args:
        response_body: The raw response from Bedrock
    
    Returns:
        dict: Parsed and validated response
    
    Raises:
        ValueError: If response is invalid
    """
    try:
        # Parse the response
        response_data = json.loads(response_body)
        
        # Extract content from Claude response format
        if 'content' in response_data and isinstance(response_data['content'], list):
            # Claude 3 format
            content_text = response_data['content'][0]['text']
        else:
            raise ValueError("Unexpected response format from Bedrock")
        
        # Parse the JSON from the content
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
        raise ValueError(f"Invalid JSON in response: {str(e)}")
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected response structure: {str(e)}")

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a standardized API Gateway response with CORS headers.
    
    Args:
        status_code: HTTP status code
        body: Response body dictionary
    
    Returns:
        dict: API Gateway response object
    """
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
    """
    AWS Lambda handler function for interview answer evaluation.
    
    Args:
        event: Lambda event object
        context: Lambda context object
    
    Returns:
        dict: API Gateway response object
    """
    # Log the incoming event for debugging
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Handle OPTIONS request for CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {'message': 'CORS preflight successful'})
        
        # Parse request body with robust error handling
        body = None
        
        try:
            if 'body' in event:
                # API Gateway sends body as a string
                if isinstance(event['body'], str):
                    print(f"Parsing body string: {event['body'][:200]}...")  # Log first 200 chars
                    body = json.loads(event['body'])
                else:
                    # Body is already a dict (direct Lambda invocation)
                    body = event['body']
            else:
                # Direct invocation without API Gateway
                body = event
            
            print(f"Parsed body: {json.dumps(body)}")
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            print(f"Raw body: {event.get('body', 'No body in event')}")
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
        
        # Call Bedrock
        bedrock_request = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": 0.7,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        print(f"Calling Bedrock with model: {MODEL_ID}")
        
        try:
            response = bedrock_runtime.invoke_model(
                modelId=MODEL_ID,
                body=json.dumps(bedrock_request)
            )
            
            print("Bedrock response received")
            
        except Exception as bedrock_error:
            print(f"Bedrock invocation error: {str(bedrock_error)}")
            return create_response(500, {
                'error': 'Failed to invoke AI model',
                'details': str(bedrock_error)
            })
        
        # Parse response
        try:
            response_body = json.loads(response['body'].read())
            print(f"Bedrock response body: {json.dumps(response_body)[:500]}...")
            
            evaluation = parse_bedrock_response(json.dumps(response_body))
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
        # Validation or parsing errors
        print(f"ValueError: {str(e)}")
        return create_response(400, {
            'error': str(e),
            'type': 'ValidationError'
        })
    
    except KeyError as e:
        # Missing required field
        print(f"KeyError: {str(e)}")
        return create_response(400, {
            'error': f'Missing required field: {str(e)}',
            'type': 'KeyError'
        })
    
    except Exception as e:
        # Unexpected errors
        print(f"Unexpected error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        return create_response(500, {
            'error': 'Internal server error',
            'details': str(e),
            'type': type(e).__name__
        })
