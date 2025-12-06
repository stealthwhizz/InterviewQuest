/**
 * Core game logic for InterviewQuest
 * Handles game state, XP calculation, combo system, lives management, and boss mechanics
 */

import { checkAchievements, createAchievementContext } from './achievements.js';

/**
 * Game state structure
 */
export function createGameState() {
  return {
    currentBoss: 0,           // 0: Junior Dev, 1: Senior Engineer, 2: FAANG Boss
    currentQuestionIndex: 0,
    lives: 3,
    xp: 0,
    consecutiveGoodAnswers: 0,
    comboActive: false,
    bossHealth: 100,
    achievements: new Set()
  };
}

/**
 * Calculate base XP for a given score (1-10)
 * Requirements: 4.1-4.8
 */
export function calculateBaseXP(score) {
  if (score === 10) return 100;
  if (score === 9 || score === 8) return 75;
  if (score === 7 || score === 6) return 50;
  if (score === 5 || score === 4) return 25;
  return 0; // score < 4
}

/**
 * Update combo state based on score
 * Returns updated state with combo information
 * Requirements: 5.1, 5.4
 */
export function updateCombo(state, score) {
  const newState = { ...state };
  
  if (score >= 6) {
    // Good answer - increment consecutive counter
    newState.consecutiveGoodAnswers = state.consecutiveGoodAnswers + 1;
    
    // Activate combo if we hit 3 consecutive good answers
    if (newState.consecutiveGoodAnswers >= 3) {
      newState.comboActive = true;
    }
  } else {
    // Low score - break combo
    newState.consecutiveGoodAnswers = 0;
    newState.comboActive = false;
  }
  
  return newState;
}

/**
 * Calculate final XP with combo multiplier applied
 * Requirements: 5.2
 */
export function calculateFinalXP(baseXP, comboActive) {
  return comboActive ? baseXP * 2 : baseXP;
}

/**
 * Update lives based on score
 * Requirements: 3.2, 3.3
 */
export function updateLives(currentLives, score) {
  let newLives = currentLives;
  
  // Decrease life on poor performance
  if (score < 4) {
    newLives = Math.max(0, currentLives - 1);
  }
  
  // Restore life on excellent performance (cap at 3)
  if (score >= 9) {
    newLives = Math.min(3, currentLives + 1);
  }
  
  return newLives;
}

/**
 * Get unlocked bosses based on XP
 * Returns array of unlocked boss indices [0, 1, 2]
 * Requirements: 2.2, 2.3, 2.4
 */
export function getUnlockedBosses(xp) {
  const unlocked = [0]; // Junior Dev always unlocked
  
  if (xp >= 500) {
    unlocked.push(1); // Senior Engineer
  }
  
  if (xp >= 1500) {
    unlocked.push(2); // FAANG Boss
  }
  
  return unlocked;
}

/**
 * Update boss health based on score
 * Boss health decreases proportionally for scores >= 6
 * Requirements: 9.2, 9.3
 */
export function updateBossHealth(currentHealth, score, totalQuestions = 10) {
  if (score < 6) {
    return currentHealth; // No damage on poor answers
  }
  
  // Each good answer deals damage proportional to total questions
  const damagePerQuestion = 100 / totalQuestions;
  const newHealth = currentHealth - damagePerQuestion;
  
  return Math.max(0, newHealth);
}

/**
 * Check if boss is defeated (health <= 0)
 * Requirements: 9.3
 */
export function isBossDefeated(bossHealth) {
  return bossHealth <= 0;
}

/**
 * Check if game is over (lives <= 0)
 * Requirements: 3.4
 */
export function isGameOver(lives) {
  return lives <= 0;
}

/**
 * Process a complete answer submission
 * Updates all game state based on the score
 * Returns updated state and newly unlocked achievements
 */
export function processAnswer(state, score, sessionData = {}) {
  const newState = { ...state };
  
  // Track previous state for achievement checking
  const previousLives = state.lives;
  const hadComboBeforeThisAnswer = state.comboActive;
  
  // Update combo
  const comboState = updateCombo(state, score);
  newState.consecutiveGoodAnswers = comboState.consecutiveGoodAnswers;
  newState.comboActive = comboState.comboActive;
  
  // Calculate and award XP
  const baseXP = calculateBaseXP(score);
  const finalXP = calculateFinalXP(baseXP, newState.comboActive);
  newState.xp = state.xp + finalXP;
  
  // Update lives
  newState.lives = updateLives(state.lives, score);
  
  // Update boss health
  newState.bossHealth = updateBossHealth(state.bossHealth, score);
  
  // Check for newly unlocked achievements
  const bossDefeated = isBossDefeated(newState.bossHealth);
  const achievementContext = createAchievementContext(newState, {
    score,
    previousLives,
    hadComboBeforeThisAnswer,
    bossDefeated,
    totalQuestionsAnswered: sessionData.totalQuestionsAnswered || 0
  });
  
  const newlyUnlocked = checkAchievements(achievementContext, state.achievements);
  
  // Add newly unlocked achievements to state
  if (newlyUnlocked.length > 0) {
    newState.achievements = new Set([...state.achievements, ...newlyUnlocked]);
  }
  
  return {
    state: newState,
    newlyUnlockedAchievements: newlyUnlocked
  };
}
