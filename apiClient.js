/**
 * API Client for Lambda communication
 * Handles answer evaluation requests to AWS Lambda backend
 */

export class APIClient {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second initial delay
    }

    /**
     * Evaluate an answer using the Lambda backend
     * 
     * @param {string} question - The interview question
     * @param {string} answer - The candidate's answer
     * @param {string} difficulty - The difficulty level (junior, senior, faang)
     * @returns {Promise<Object>} Evaluation result with score, strengths, improvements, motivation
     * @throws {Error} If the request fails after all retries
     */
    async evaluateAnswer(question, answer, difficulty) {
        // Validate inputs
        if (!question || typeof question !== 'string' || !question.trim()) {
            throw new Error('Question must be a non-empty string');
        }
        
        if (!answer || typeof answer !== 'string' || !answer.trim()) {
            throw new Error('Answer must be a non-empty string');
        }
        
        const validDifficulties = ['junior', 'senior', 'faang'];
        if (!validDifficulties.includes(difficulty)) {
            throw new Error(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
        }

        // Construct request payload
        const payload = {
            question: question.trim(),
            answer: answer.trim(),
            difficulty: difficulty
        };

        // Attempt request with retry logic
        let lastError = null;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await this._makeRequest(payload);
                return response;
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors (4xx)
                if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                    throw error;
                }
                
                // Don't retry on validation errors
                if (error.isValidationError || error.message.includes('Invalid response')) {
                    throw error;
                }
                
                // If not the last attempt, wait before retrying
                if (attempt < this.maxRetries - 1) {
                    const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
                    await this._sleep(delay);
                }
            }
        }
        
        // All retries failed
        throw new Error(`Failed to evaluate answer after ${this.maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * Make the actual HTTP request to the Lambda endpoint
     * 
     * @private
     * @param {Object} payload - Request payload
     * @returns {Promise<Object>} Response data
     */
    async _makeRequest(payload) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Parse response body
            let responseData;
            try {
                responseData = await response.json();
            } catch (parseError) {
                const error = new Error('Invalid response format from server');
                error.isValidationError = true;
                throw error;
            }

            // Handle error responses
            if (!response.ok) {
                const error = new Error(responseData.error || `Server error: ${response.status}`);
                error.statusCode = response.status;
                error.responseData = responseData;
                throw error;
            }

            // Validate response structure
            this._validateResponse(responseData);

            return responseData;
        } catch (error) {
            // Network errors - check for TypeError from fetch
            if (error instanceof TypeError) {
                const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection.');
                networkError.isNetworkError = true;
                throw networkError;
            }
            
            // Re-throw other errors
            throw error;
        }
    }

    /**
     * Validate the response structure from Lambda
     * 
     * @private
     * @param {Object} response - Response data to validate
     * @throws {Error} If response structure is invalid
     */
    _validateResponse(response) {
        const requiredFields = ['score', 'strengths', 'improvements', 'motivation'];
        
        for (const field of requiredFields) {
            if (!(field in response)) {
                const error = new Error(`Invalid response: missing field '${field}'`);
                error.isValidationError = true;
                throw error;
            }
        }

        // Validate score
        if (typeof response.score !== 'number' || response.score < 1 || response.score > 10) {
            const error = new Error('Invalid response: score must be a number between 1 and 10');
            error.isValidationError = true;
            throw error;
        }

        // Validate strengths
        if (!Array.isArray(response.strengths) || response.strengths.length === 0) {
            const error = new Error('Invalid response: strengths must be a non-empty array');
            error.isValidationError = true;
            throw error;
        }

        // Validate improvements
        if (!Array.isArray(response.improvements) || response.improvements.length === 0) {
            const error = new Error('Invalid response: improvements must be a non-empty array');
            error.isValidationError = true;
            throw error;
        }

        // Validate motivation
        if (typeof response.motivation !== 'string' || !response.motivation.trim()) {
            const error = new Error('Invalid response: motivation must be a non-empty string');
            error.isValidationError = true;
            throw error;
        }
    }

    /**
     * Sleep for a specified duration
     * 
     * @private
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get a user-friendly error message for display
     * 
     * @param {Error} error - The error object
     * @returns {string} User-friendly error message
     */
    static getUserFriendlyError(error) {
        if (!error) {
            return 'An unknown error occurred';
        }

        // Network errors
        if (error.message.includes('Network error') || error.message.includes('fetch')) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }

        // Timeout errors
        if (error.message.includes('timeout')) {
            return 'The request took too long. Please try again.';
        }

        // Server errors (5xx)
        if (error.statusCode && error.statusCode >= 500) {
            return 'The server is experiencing issues. Please try again in a moment.';
        }

        // Client errors (4xx)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
            return error.message || 'Invalid request. Please check your answer and try again.';
        }

        // Validation errors
        if (error.message.includes('Invalid response')) {
            return 'Received an unexpected response from the server. Please try again.';
        }

        // Retry exhaustion
        if (error.message.includes('after') && error.message.includes('attempts')) {
            return 'Unable to process your answer after multiple attempts. Please try again later.';
        }

        // Check if it's a generic error message that should be made more friendly
        if (error.message && !error.message.includes('Invalid') && !error.message.includes('Network')) {
            return 'An error occurred while evaluating your answer. Please try again.';
        }

        // Default
        return error.message || 'An error occurred while evaluating your answer. Please try again.';
    }
}
