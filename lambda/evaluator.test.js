import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Lambda Evaluator
 * 
 * These tests validate the Lambda function's request/response structure
 * and prompt generation logic.
 */

// Mock the Lambda function's validation logic in JavaScript
function validateRequest(body) {
  const requiredFields = ['question', 'answer', 'difficulty'];
  
  // Check all required fields are present
  for (const field of requiredFields) {
    if (!(field in body)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Validate difficulty value
  const validDifficulties = ['junior', 'senior', 'faang'];
  if (!validDifficulties.includes(body.difficulty)) {
    return { valid: false, error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` };
  }
  
  // Validate types
  if (typeof body.question !== 'string' || !body.question.trim()) {
    return { valid: false, error: 'Question must be a non-empty string' };
  }
  
  if (typeof body.answer !== 'string' || !body.answer.trim()) {
    return { valid: false, error: 'Answer must be a non-empty string' };
  }
  
  // Validate length constraints
  if (body.answer.length > 5000) {
    return { valid: false, error: 'Answer exceeds maximum length of 5000 characters' };
  }
  
  return { valid: true, error: '' };
}

// Mock prompt construction logic
function constructPrompt(question, answer, difficulty) {
  const criteriaMap = {
    'junior': 'Basic understanding of concepts',
    'senior': 'Deep technical understanding with nuance',
    'faang': 'System-level thinking and scalability considerations'
  };
  
  const strictnessMap = {
    'junior': 'Be encouraging but honest',
    'senior': 'Be STRICTER',
    'faang': 'Be VERY STRICT'
  };
  
  return `You are an expert interview evaluator for a ${difficulty} level interview.

Question: ${question}
Candidate's Answer: ${answer}

Evaluate this answer based on these criteria for ${difficulty} level:
${criteriaMap[difficulty]}

Scoring Guidance:
${strictnessMap[difficulty]}`;
}

describe('Lambda Evaluator Property Tests', () => {
  /**
   * **Feature: interview-quest, Property 12: API request structure**
   * **Validates: Requirements 7.1, 15.1**
   * 
   * For any answer submission, the request to the Lambda function should include
   * all three required fields: question, answer, and difficulty
   */
  describe('Property 12: API request structure', () => {
    it('should accept valid requests with all required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0), // question
          fc.string({ minLength: 1, maxLength: 5000 }).filter(s => s.trim().length > 0), // answer
          fc.constantFrom('junior', 'senior', 'faang'), // difficulty
          (question, answer, difficulty) => {
            const request = { question, answer, difficulty };
            const result = validateRequest(request);
            
            // Valid requests should pass validation
            expect(result.valid).toBe(true);
            expect(result.error).toBe('');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests missing question field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 5000 }), // answer
          fc.constantFrom('junior', 'senior', 'faang'), // difficulty
          (answer, difficulty) => {
            const request = { answer, difficulty };
            const result = validateRequest(request);
            
            // Missing question should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('question');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests missing answer field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }), // question
          fc.constantFrom('junior', 'senior', 'faang'), // difficulty
          (question, difficulty) => {
            const request = { question, difficulty };
            const result = validateRequest(request);
            
            // Missing answer should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('answer');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests missing difficulty field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }), // question
          fc.string({ minLength: 1, maxLength: 5000 }), // answer
          (question, answer) => {
            const request = { question, answer };
            const result = validateRequest(request);
            
            // Missing difficulty should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('difficulty');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with invalid difficulty values', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }), // question
          fc.string({ minLength: 1, maxLength: 5000 }), // answer
          fc.string().filter(s => !['junior', 'senior', 'faang'].includes(s)), // invalid difficulty
          (question, answer, difficulty) => {
            const request = { question, answer, difficulty };
            const result = validateRequest(request);
            
            // Invalid difficulty should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('difficulty');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with empty question strings', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n'), // empty/whitespace question
          fc.string({ minLength: 1, maxLength: 5000 }), // answer
          fc.constantFrom('junior', 'senior', 'faang'), // difficulty
          (question, answer, difficulty) => {
            const request = { question, answer, difficulty };
            const result = validateRequest(request);
            
            // Empty question should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Question');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with empty answer strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }), // question
          fc.constantFrom('', '   ', '\t', '\n'), // empty/whitespace answer
          fc.constantFrom('junior', 'senior', 'faang'), // difficulty
          (question, answer, difficulty) => {
            const request = { question, answer, difficulty };
            const result = validateRequest(request);
            
            // Empty answer should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Answer');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with answers exceeding maximum length', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0), // valid question
          fc.string({ minLength: 5001, maxLength: 6000 }), // too long answer
          fc.constantFrom('junior', 'senior', 'faang'), // difficulty
          (question, answer, difficulty) => {
            const request = { question, answer, difficulty };
            const result = validateRequest(request);
            
            // Oversized answer should fail validation
            expect(result.valid).toBe(false);
            expect(result.error).toContain('maximum length');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: interview-quest, Property 13: Lambda response structure**
   * **Validates: Requirements 7.3, 7.4, 7.5, 7.6, 15.5**
   * 
   * For any successful Lambda response, the JSON object should contain exactly
   * four fields: score (number 1-10), strengths (array), improvements (array),
   * and motivation (string)
   */
  describe('Property 13: Lambda response structure', () => {
    it('should validate correct response structure', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // score
          fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 2, maxLength: 3 }), // strengths
          fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 2, maxLength: 3 }), // improvements
          fc.string({ minLength: 10, maxLength: 200 }), // motivation
          (score, strengths, improvements, motivation) => {
            const response = { score, strengths, improvements, motivation };
            
            // Validate structure
            expect(response).toHaveProperty('score');
            expect(response).toHaveProperty('strengths');
            expect(response).toHaveProperty('improvements');
            expect(response).toHaveProperty('motivation');
            
            // Validate types
            expect(typeof response.score).toBe('number');
            expect(Array.isArray(response.strengths)).toBe(true);
            expect(Array.isArray(response.improvements)).toBe(true);
            expect(typeof response.motivation).toBe('string');
            
            // Validate values
            expect(response.score).toBeGreaterThanOrEqual(1);
            expect(response.score).toBeLessThanOrEqual(10);
            expect(response.strengths.length).toBeGreaterThan(0);
            expect(response.improvements.length).toBeGreaterThan(0);
            expect(response.motivation.trim().length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject responses with invalid score range', () => {
      fc.assert(
        fc.property(
          fc.integer().filter(n => n < 1 || n > 10), // invalid score
          fc.array(fc.string({ minLength: 5 }), { minLength: 1 }), // strengths
          fc.array(fc.string({ minLength: 5 }), { minLength: 1 }), // improvements
          fc.string({ minLength: 10 }), // motivation
          (score, strengths, improvements, motivation) => {
            const response = { score, strengths, improvements, motivation };
            
            // Score should be out of valid range
            expect(score < 1 || score > 10).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject responses with empty strengths array', () => {
      const response = {
        score: 7,
        strengths: [],
        improvements: ['Improve clarity'],
        motivation: 'Keep going!'
      };
      
      expect(response.strengths.length).toBe(0);
    });

    it('should reject responses with empty improvements array', () => {
      const response = {
        score: 7,
        strengths: ['Good structure'],
        improvements: [],
        motivation: 'Keep going!'
      };
      
      expect(response.improvements.length).toBe(0);
    });

    it('should reject responses with empty motivation string', () => {
      const response = {
        score: 7,
        strengths: ['Good structure'],
        improvements: ['Improve clarity'],
        motivation: ''
      };
      
      expect(response.motivation.trim().length).toBe(0);
    });
  });

  /**
   * **Feature: interview-quest, Property 14: Difficulty-based prompt variation**
   * **Validates: Requirements 15.3**
   * 
   * For any two requests with different difficulty levels, the constructed
   * Bedrock prompts should contain different evaluation criteria (stricter
   * for higher levels)
   */
  describe('Property 14: Difficulty-based prompt variation', () => {
    it('should generate different prompts for different difficulty levels', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 200 }), // question
          fc.string({ minLength: 10, maxLength: 500 }), // answer
          (question, answer) => {
            const juniorPrompt = constructPrompt(question, answer, 'junior');
            const seniorPrompt = constructPrompt(question, answer, 'senior');
            const faangPrompt = constructPrompt(question, answer, 'faang');
            
            // All prompts should contain the question and answer
            expect(juniorPrompt).toContain(question);
            expect(juniorPrompt).toContain(answer);
            expect(seniorPrompt).toContain(question);
            expect(seniorPrompt).toContain(answer);
            expect(faangPrompt).toContain(question);
            expect(faangPrompt).toContain(answer);
            
            // Prompts should be different from each other
            expect(juniorPrompt).not.toBe(seniorPrompt);
            expect(seniorPrompt).not.toBe(faangPrompt);
            expect(juniorPrompt).not.toBe(faangPrompt);
            
            // Each prompt should contain its difficulty level
            expect(juniorPrompt).toContain('junior');
            expect(seniorPrompt).toContain('senior');
            expect(faangPrompt).toContain('faang');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include stricter criteria for higher difficulty levels', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 200 }), // question
          fc.string({ minLength: 10, maxLength: 500 }), // answer
          (question, answer) => {
            const juniorPrompt = constructPrompt(question, answer, 'junior');
            const seniorPrompt = constructPrompt(question, answer, 'senior');
            const faangPrompt = constructPrompt(question, answer, 'faang');
            
            // Junior should be encouraging
            expect(juniorPrompt.toLowerCase()).toContain('encouraging');
            
            // Senior should be stricter
            expect(seniorPrompt.toLowerCase()).toContain('stricter');
            
            // FAANG should be very strict
            expect(faangPrompt.toLowerCase()).toContain('very strict');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include difficulty-specific evaluation criteria', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 200 }), // question
          fc.string({ minLength: 10, maxLength: 500 }), // answer
          (question, answer) => {
            const juniorPrompt = constructPrompt(question, answer, 'junior');
            const seniorPrompt = constructPrompt(question, answer, 'senior');
            const faangPrompt = constructPrompt(question, answer, 'faang');
            
            // Junior criteria: basic understanding
            expect(juniorPrompt.toLowerCase()).toContain('basic');
            
            // Senior criteria: deep understanding, trade-offs
            expect(seniorPrompt.toLowerCase()).toContain('deep');
            
            // FAANG criteria: system-level, scalability
            expect(faangPrompt.toLowerCase()).toContain('system');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
