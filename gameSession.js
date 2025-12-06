/**
 * Game Session Manager for InterviewQuest
 * Handles game session initialization, question progression, and session statistics
 * Requirements: 1.3, 3.1, 3.4, 8.7, 9.1, 9.3
 */

import { createGameState, processAnswer, isGameOver, isBossDefeated } from './gameLogic.js';
import { getBossById } from './screenManager.js';

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Requirements: 8.7
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Game Session Class
 * Manages a single game session for a specific boss level
 */
export class GameSession {
  constructor(bossId, allQuestions, initialGameState = null) {
    this.bossId = bossId;
    this.boss = getBossById(bossId);
    
    if (!this.boss) {
      throw new Error(`Invalid boss ID: ${bossId}`);
    }
    
    // Initialize or restore game state
    if (initialGameState) {
      this.gameState = { ...initialGameState };
    } else {
      this.gameState = createGameState();
      this.gameState.currentBoss = bossId;
      this.gameState.lives = 3; // Requirements: 3.1
      this.gameState.bossHealth = this.boss.healthPoints;
    }
    
    // Load and shuffle questions for this boss level
    this.questions = this.loadQuestionsForLevel(allQuestions, this.boss.level);
    
    // Session statistics
    this.sessionStats = {
      questionsAnswered: 0,
      xpEarnedThisSession: 0,
      startingLives: this.gameState.lives,
      startingXP: this.gameState.xp,
      startTime: Date.now()
    };
    
    this.currentQuestionIndex = 0;
    this.isSessionActive = true;
  }
  
  /**
   * Load and shuffle questions for the selected difficulty level
   * Requirements: 8.7
   */
  loadQuestionsForLevel(allQuestions, level) {
    // Filter questions by level
    const levelQuestions = allQuestions.filter(q => q.level === level);
    
    // Shuffle questions
    const shuffled = shuffleArray(levelQuestions);
    
    // Return up to questionsPerSession questions
    return shuffled.slice(0, this.boss.questionsPerSession);
  }
  
  /**
   * Get the current question
   * Requirements: 1.3
   */
  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }
  
  /**
   * Check if there are more questions available
   */
  hasMoreQuestions() {
    return this.currentQuestionIndex < this.questions.length;
  }
  
  /**
   * Process an answer and update game state
   * Returns result object with updated state and session status
   * Requirements: 1.3, 3.4, 9.3
   */
  submitAnswer(score) {
    if (!this.isSessionActive) {
      throw new Error('Session is not active');
    }
    
    // Track XP before processing
    const xpBefore = this.gameState.xp;
    
    // Process the answer and update game state
    const result = processAnswer(this.gameState, score, {
      totalQuestionsAnswered: this.sessionStats.questionsAnswered + 1
    });
    
    this.gameState = result.state;
    
    // Update session statistics
    this.sessionStats.questionsAnswered++;
    this.sessionStats.xpEarnedThisSession += (this.gameState.xp - xpBefore);
    
    // Check session end conditions
    const sessionEnded = this.checkSessionEndConditions();
    
    // Move to next question if session continues
    if (!sessionEnded && this.hasMoreQuestions()) {
      this.currentQuestionIndex++;
    }
    
    return {
      gameState: this.gameState,
      newlyUnlockedAchievements: result.newlyUnlockedAchievements,
      sessionStats: this.getSessionStats(),
      sessionEnded: sessionEnded,
      sessionEndReason: this.getSessionEndReason()
    };
  }
  
  /**
   * Check if session should end based on game conditions
   * Requirements: 3.4, 9.3
   */
  checkSessionEndConditions() {
    // Game over: lives depleted
    if (isGameOver(this.gameState.lives)) {
      this.isSessionActive = false;
      return true;
    }
    
    // Victory: boss defeated
    if (isBossDefeated(this.gameState.bossHealth)) {
      this.isSessionActive = false;
      return true;
    }
    
    // All questions answered (fallback condition)
    if (!this.hasMoreQuestions()) {
      this.isSessionActive = false;
      return true;
    }
    
    return false;
  }
  
  /**
   * Get the reason why the session ended
   * Requirements: 3.4, 9.3
   */
  getSessionEndReason() {
    if (!this.isSessionActive) {
      if (isGameOver(this.gameState.lives)) {
        return 'game-over'; // Lives depleted
      }
      if (isBossDefeated(this.gameState.bossHealth)) {
        return 'victory'; // Boss defeated
      }
      if (!this.hasMoreQuestions()) {
        return 'questions-exhausted'; // All questions answered
      }
    }
    return null;
  }
  
  /**
   * Get current session statistics
   */
  getSessionStats() {
    return {
      ...this.sessionStats,
      currentLives: this.gameState.lives,
      currentXP: this.gameState.xp,
      bossHealth: this.gameState.bossHealth,
      questionsRemaining: this.questions.length - this.currentQuestionIndex,
      totalQuestions: this.questions.length,
      completionTime: this.getCompletionTime()
    };
  }
  
  /**
   * Get completion time in seconds
   * Requirements: 11.2
   */
  getCompletionTime() {
    const elapsedMs = Date.now() - this.sessionStats.startTime;
    return Math.floor(elapsedMs / 1000);
  }
  
  /**
   * Get the current game state
   */
  getGameState() {
    return this.gameState;
  }
  
  /**
   * Check if session is still active
   */
  isActive() {
    return this.isSessionActive;
  }
  
  /**
   * Get boss information
   */
  getBossInfo() {
    return {
      id: this.boss.id,
      name: this.boss.name,
      level: this.boss.level,
      personality: this.boss.personality
    };
  }
}

/**
 * Create a new game session
 * Requirements: 1.3, 3.1
 */
export function createGameSession(bossId, allQuestions, initialGameState = null) {
  return new GameSession(bossId, allQuestions, initialGameState);
}
