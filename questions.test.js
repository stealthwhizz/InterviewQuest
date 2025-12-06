import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import fs from 'fs';

// Load questions data
const questionsData = JSON.parse(fs.readFileSync('./questions.json', 'utf-8'));

/**
 * **Feature: interview-quest, Property 9: Question type diversity per level**
 * **Validates: Requirements 8.5**
 * 
 * For any boss level, the question set should include at least one question 
 * of each type (behavioral, technical, system design)
 */
describe('Property 9: Question type diversity per level', () => {
  test('each level should have all three question types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('junior', 'senior', 'faang'),
        (level) => {
          // Filter questions for this level
          const levelQuestions = questionsData.questions.filter(q => q.level === level);
          
          // Get unique question types for this level
          const questionTypes = new Set(levelQuestions.map(q => q.type));
          
          // Verify all three types are present
          const hasAllTypes = 
            questionTypes.has('behavioral') &&
            questionTypes.has('technical') &&
            questionTypes.has('system-design');
          
          return hasAllTypes;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('each level should have at least 10 questions', () => {
    const levels = ['junior', 'senior', 'faang'];
    
    levels.forEach(level => {
      const levelQuestions = questionsData.questions.filter(q => q.level === level);
      expect(levelQuestions.length).toBeGreaterThanOrEqual(10);
    });
  });
  
  test('total questions should be 30', () => {
    expect(questionsData.questions.length).toBe(30);
  });
});
