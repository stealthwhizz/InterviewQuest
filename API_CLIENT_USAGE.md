# API Client Usage Guide

## Overview

The `APIClient` class provides a robust interface for communicating with the AWS Lambda backend for answer evaluation. It includes automatic retry logic, comprehensive error handling, and user-friendly error messages.

## Basic Usage

```javascript
import { APIClient } from './apiClient.js';

// Initialize the client with your Lambda endpoint
const apiClient = new APIClient('https://your-api-gateway-url.amazonaws.com/evaluate');

// Evaluate an answer
try {
    const result = await apiClient.evaluateAnswer(
        'What is React?',
        'React is a JavaScript library for building user interfaces',
        'junior'
    );
    
    console.log('Score:', result.score);
    console.log('Strengths:', result.strengths);
    console.log('Improvements:', result.improvements);
    console.log('Motivation:', result.motivation);
} catch (error) {
    const friendlyMessage = APIClient.getUserFriendlyError(error);
    console.error('Error:', friendlyMessage);
}
```

## Integration with UI

### With Loading Indicators

```javascript
const submitButton = document.getElementById('submit-answer-btn');
const answerInput = document.getElementById('answer-input');

submitButton.addEventListener('click', async () => {
    // Show loading state
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    try {
        const result = await apiClient.evaluateAnswer(
            currentQuestion.text,
            answerInput.value,
            currentDifficulty
        );
        
        // Display feedback
        displayFeedback(result);
    } catch (error) {
        // Show user-friendly error
        const message = APIClient.getUserFriendlyError(error);
        showErrorNotification(message);
    } finally {
        // Remove loading state
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
});
```

## Features

### Automatic Retry Logic

The client automatically retries failed requests up to 3 times with exponential backoff:
- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay

Client errors (4xx) and validation errors are not retried.

### Input Validation

The client validates inputs before sending requests:
- Question and answer must be non-empty strings
- Difficulty must be one of: 'junior', 'senior', 'faang'
- Whitespace is automatically trimmed

### Response Validation

The client validates all responses from the Lambda function:
- Score must be a number between 1 and 10
- Strengths must be a non-empty array
- Improvements must be a non-empty array
- Motivation must be a non-empty string

### Error Handling

The client provides user-friendly error messages for common scenarios:
- Network errors: "Unable to connect to the server. Please check your internet connection and try again."
- Timeout errors: "The request took too long. Please try again."
- Server errors (5xx): "The server is experiencing issues. Please try again in a moment."
- Client errors (4xx): Returns the specific error message from the server
- Validation errors: "Received an unexpected response from the server. Please try again."
- Retry exhaustion: "Unable to process your answer after multiple attempts. Please try again later."

## Configuration

### Custom Endpoint

```javascript
const apiClient = new APIClient('https://custom-endpoint.com/api');
```

### Custom Retry Settings

You can modify retry behavior by accessing the client properties:

```javascript
const apiClient = new APIClient(endpoint);
apiClient.maxRetries = 5;  // Increase max retries
apiClient.retryDelay = 2000;  // Increase initial delay to 2 seconds
```

## Error Handling Best Practices

Always use the `getUserFriendlyError` method to display errors to users:

```javascript
try {
    const result = await apiClient.evaluateAnswer(question, answer, difficulty);
    // Handle success
} catch (error) {
    // Get user-friendly message
    const message = APIClient.getUserFriendlyError(error);
    
    // Display to user
    showErrorNotification(message);
    
    // Log technical details for debugging
    console.error('Technical error:', error);
}
```

## Testing

The API client includes comprehensive unit tests. Run them with:

```bash
npm test -- apiClient.test.js
```

## API Response Format

The Lambda function returns responses in this format:

```json
{
    "score": 8,
    "strengths": [
        "Clear explanation of React's purpose",
        "Mentioned it's a library, not a framework"
    ],
    "improvements": [
        "Could mention component-based architecture",
        "Could discuss virtual DOM"
    ],
    "motivation": "Great start! Keep building on these fundamentals."
}
```
