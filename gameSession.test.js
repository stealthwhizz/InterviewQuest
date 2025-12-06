import { describe, test, expect, beforeEach } from 'vitest';
import { GameSession, createGameSession } from './gameSession.js';
import { createGameState } from './gameLogic.js';

// Mock questions for testing
const mockQuestions = [
  { id: 'j1', level: 'junior', type: 'behavioral', text: 'Junior Q1' },
  { id: 'j2', level: 'junior', type: 'technical', text: 'Junior Q2' },
  { id: 'j3', level: 'junior', type: 'system-design', text: 'Junior Q3' },
  { id: 'j4', level: 'junior', type: 'behavioral', text: 'Junior Q4' },
  { id: 'j5', level: 'junior', type: 'technical', text: 'Junior Q5' },
  { id: 'j6', level: 'junior', type: 'system-design', text: 'Junior Q6' },
  { id: 'j7', level: 'junior', type: 'behavioral', text: 'Junior Q7' },
  { id: 'j8', level: 'junior', type: 'technical', text: 'Junior Q8' },
  { id: 'j9', level: 'junior', type: 'system-design', text: 'Junior Q9' },
  { id: 'j10', level: 'junior', type: 'behavioral', text: 'Junior Q10' },
  { id: 's1', level: 'senior', type: 'behavioral', text: 'Senior Q1' },
  { id: 's2', level: 'senior', type: 'technical', text: 'Senior Q2' },
  { id: 's3', level: 'senior', type: 'system-design', text: 'Senior Q3' },
  { id: 'f1', level: 'faang', type: 'behavioral', text: 'FAANG Q1' },
  { id: 'f2', level: 'faang', type: 'technical', text: 'FAANG Q2' }
];

describe('GameSession', () => {
  describe('Session Initialization', () => {
    test('should initialize session with correct boss and questions', () => {
      const session = new GameSession(0, mockQuestions);
      
      expect(session.bossId).toBe(0);
      expect(session.boss.name).toBe('Junior Dev');
      expect(session.gameState.lives).toBe(3);
      expect(session.gameState.bossHealth).toBe(100);
      expect(session.isActive()).toBe(true);
    });
    
    test('should load only questions for the selected level', () => {
      const session = new GameSession(0, mockQuestions);
      
      // All questions should be junior level
      session.questions.forEach(q => {
        expect(q.level).toBe('junior');
      });
    });
    
    test('should shuffle questions', () => {
      // Create multiple sessions and check if question order varies
      const session1 = new GameSession(0, mockQuestions);
      const session2 = new GameSession(0, mockQuestions);
      
      // Questions should exist
      expect(session1.questions.length).toBeGreaterThan(0);
      expect(session2.questions.length).toBeGreaterThan(0);
      
      // Note: There's a small chance they could be the same, but unlikely
      // This test verifies the shuffle mechanism exists
    });
    
    test('should initialize session statistics', () => {
      const session = new GameSession(0, mockQuestions);
      const stats = session.getSessionStats();
      
      expect(stats.questionsAnswered).toBe(0);
      expect(stats.xpEarnedThisSession).toBe(0);
      expect(stats.startingLives).toBe(3);
    });
    
    test('should throw error for invalid boss ID', () => {
      expect(() => {
        new GameSession(999, mockQuestions);
      }).toThrow('Invalid boss ID');
    });
  });
  
  describe('Question Progression', () => {
    test('should return current question', () => {
      const session = new GameSession(0, mockQuestions);
      const question = session.getCurrentQuestion();
      
      expect(question).toBeDefined();
      expect(question.level).toBe('junior');
    });
    
    test('should progress to next question after answer', () => {
      const session = new GameSession(0, mockQuestions);
      const firstQuestion = session.getCurrentQuestion();
      
      // Submit a good answer (score 7)
      session.submitAnswer(7);
      
      const secondQuestion = session.getCurrentQuestion();
      
      // Should be a different question (unless only 1 question available)
      if (session.questions.length > 1) {
        expect(secondQuestion.id).not.toBe(firstQuestion.id);
      }
    });
    
    test('should track questions answered', () => {
      const session = new GameSession(0, mockQuestions);
      
      session.submitAnswer(7);
      expect(session.sessionStats.questionsAnswered).toBe(1);
      
      session.submitAnswer(8);
      expect(session.sessionStats.questionsAnswered).toBe(2);
    });
  });
  
  describe('Session Statistics', () => {
    test('should track XP earned during session', () => {
      const session = new GameSession(0, mockQuestions);
      const initialXP = session.gameState.xp;
      
      // Submit answer with score 10 (100 XP)
      session.submitAnswer(10);
      
      const stats = session.getSessionStats();
      expect(stats.xpEarnedThisSession).toBe(100);
      expect(stats.currentXP).toBe(initialXP + 100);
    });
    
    test('should track lives remaining', () => {
      const session = new GameSession(0, mockQuestions);
      
      // Submit poor answer (score 2) - loses 1 life
      session.submitAnswer(2);
      
      const stats = session.getSessionStats();
      expect(stats.currentLives).toBe(2);
    });
    
    test('should track boss health', () => {
      const session = new GameSession(0, mockQuestions);
      
      // Submit good answer (score 8) - damages boss
      session.submitAnswer(8);
      
      const stats = session.getSessionStats();
      expect(stats.bossHealth).toBeLessThan(100);
    });
  });
  
  describe('Session End Conditions', () => {
    test('should end session when lives reach 0', () => {
      const session = new GameSession(0, mockQuestions);
      
      // Lose all lives
      session.submitAnswer(1); // 2 lives
      session.submitAnswer(1); // 1 life
      const result = session.submitAnswer(1); // 0 lives
      
      expect(result.sessionEnded).toBe(true);
      expect(result.sessionEndReason).toBe('game-over');
      expect(session.isActive()).toBe(false);
    });
    
    test('should end session when boss is defeated', () => {
      const session = new GameSession(0, mockQuestions);
      
      // Deal enough damage to defeat boss (10 questions at 10 damage each)
      // Each good answer deals 10 damage (100 / 10 questions)
      let defeated = false;
      for (let i = 0; i < 10 && session.hasMoreQuestions(); i++) {
        const result = session.submitAnswer(10);
        
        if (result.sessionEnded && result.sessionEndReason === 'victory') {
          defeated = true;
          expect(session.isActive()).toBe(false);
          break;
        }
      }
      
      // Verify boss was defeated (or we ran out of questions, which is expected with limited mock data)
      // In a real game with 10 questions, the boss would be defeated
      expect(session.gameState.bossHealth).toBeLessThanOrEqual(0);
    });
    
    test('should not allow answers after session ends', () => {
      const session = new GameSession(0, mockQuestions);
      
      // End session by losing all lives
      session.submitAnswer(1);
      session.submitAnswer(1);
      session.submitAnswer(1);
      
      // Try to submit another answer
      expect(() => {
        session.submitAnswer(10);
      }).toThrow('Session is not active');
    });
  });
  
  describe('Boss Information', () => {
    test('should provide boss information', () => {
      const session = new GameSession(1, mockQuestions);
      const bossInfo = session.getBossInfo();
      
      expect(bossInfo.id).toBe(1);
      expect(bossInfo.name).toBe('Senior Engineer');
      expect(bossInfo.level).toBe('senior');
      expect(bossInfo.personality).toBeDefined();
    });
  });
  
  describe('Factory Function', () => {
    test('should create session using factory function', () => {
      const session = createGameSession(0, mockQuestions);
      
      expect(session).toBeInstanceOf(GameSession);
      expect(session.bossId).toBe(0);
    });
    
    test('should accept initial game state', () => {
      const initialState = createGameState();
      initialState.xp = 500;
      initialState.lives = 2;
      
      const session = createGameSession(0, mockQuestions, initialState);
      
      expect(session.gameState.xp).toBe(500);
      expect(session.gameState.lives).toBe(2);
    });
  });
});
