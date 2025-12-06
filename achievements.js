/**
 * Achievement System for InterviewQuest
 * Defines all achievements and provides checking logic
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

/**
 * Achievement definitions
 * Each achievement has:
 * - id: unique identifier
 * - name: display name
 * - description: what the player needs to do
 * - icon: emoji or icon representation
 * - condition: function that checks if achievement should unlock
 */
export const ACHIEVEMENTS = {
  FIRST_BLOOD: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Complete your first question with a score of 6 or higher',
    icon: '🎯',
    condition: (context) => {
      // Unlock on first score >= 6
      return context.score >= 6 && context.totalQuestionsAnswered === 1;
    }
  },
  
  FLAWLESS_VICTORY: {
    id: 'flawless_victory',
    name: 'Flawless Victory',
    description: 'Complete a boss level without losing any lives',
    icon: '👑',
    condition: (context) => {
      // Unlock when boss is defeated with all 3 lives remaining
      return context.bossDefeated && context.lives === 3;
    }
  },
  
  COMBO_MASTER: {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Activate combo mode for the first time',
    icon: '🔥',
    condition: (context) => {
      // Unlock when combo activates for the first time
      return context.comboActive && !context.hadComboBeforeThisAnswer;
    }
  },
  
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score a perfect 10 on any question',
    icon: '💯',
    condition: (context) => {
      return context.score === 10;
    }
  },
  
  COMEBACK_KID: {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Restore a life when you only had 1 life remaining',
    icon: '💪',
    condition: (context) => {
      // Unlock when restoring life from 1 to 2
      return context.previousLives === 1 && context.lives === 2;
    }
  },
  
  SENIOR_SLAYER: {
    id: 'senior_slayer',
    name: 'Senior Slayer',
    description: 'Defeat the Senior Engineer boss',
    icon: '⚔️',
    condition: (context) => {
      return context.bossDefeated && context.bossLevel === 1;
    }
  },
  
  FAANG_CONQUEROR: {
    id: 'faang_conqueror',
    name: 'FAANG Conqueror',
    description: 'Defeat the FAANG Boss',
    icon: '🏆',
    condition: (context) => {
      return context.bossDefeated && context.bossLevel === 2;
    }
  },
  
  XP_MILLIONAIRE: {
    id: 'xp_millionaire',
    name: 'XP Millionaire',
    description: 'Accumulate 2000 total XP',
    icon: '💰',
    condition: (context) => {
      return context.totalXP >= 2000;
    }
  },
  
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a combo for 5 consecutive good answers',
    icon: '⚡',
    condition: (context) => {
      return context.consecutiveGoodAnswers >= 5 && context.comboActive;
    }
  },
  
  SURVIVOR: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Complete a boss level with only 1 life remaining',
    icon: '🛡️',
    condition: (context) => {
      return context.bossDefeated && context.lives === 1;
    }
  }
};

/**
 * Get all achievement definitions as an array
 */
export function getAllAchievements() {
  return Object.values(ACHIEVEMENTS);
}

/**
 * Check which achievements should be unlocked based on current context
 * Returns array of newly unlocked achievement IDs
 * 
 * @param {Object} context - Current game context with all relevant data
 * @param {Set} currentAchievements - Set of already unlocked achievement IDs
 * @returns {Array} Array of newly unlocked achievement IDs
 */
export function checkAchievements(context, currentAchievements) {
  const newlyUnlocked = [];
  
  for (const achievement of getAllAchievements()) {
    // Skip if already unlocked
    if (currentAchievements.has(achievement.id)) {
      continue;
    }
    
    // Check if condition is met
    if (achievement.condition(context)) {
      newlyUnlocked.push(achievement.id);
    }
  }
  
  return newlyUnlocked;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id) {
  return getAllAchievements().find(a => a.id === id);
}

/**
 * Create achievement context from game state and current answer
 * This builds the context object needed for achievement checking
 */
export function createAchievementContext(gameState, answerData) {
  return {
    // Current answer data
    score: answerData.score,
    
    // Game state
    lives: gameState.lives,
    previousLives: answerData.previousLives,
    totalXP: gameState.xp,
    comboActive: gameState.comboActive,
    hadComboBeforeThisAnswer: answerData.hadComboBeforeThisAnswer,
    consecutiveGoodAnswers: gameState.consecutiveGoodAnswers,
    bossLevel: gameState.currentBoss,
    bossDefeated: answerData.bossDefeated,
    
    // Session tracking
    totalQuestionsAnswered: answerData.totalQuestionsAnswered
  };
}

/**
 * Notification queue for achievement unlocks
 * This allows UI to display notifications one at a time
 */
export class AchievementNotificationQueue {
  constructor() {
    this.queue = [];
    this.isShowing = false;
  }
  
  /**
   * Add achievement IDs to the notification queue
   */
  enqueue(achievementIds) {
    this.queue.push(...achievementIds);
  }
  
  /**
   * Get the next achievement to show
   * Returns null if queue is empty
   */
  dequeue() {
    if (this.queue.length === 0) {
      return null;
    }
    return this.queue.shift();
  }
  
  /**
   * Check if there are pending notifications
   */
  hasPending() {
    return this.queue.length > 0;
  }
  
  /**
   * Clear all pending notifications
   */
  clear() {
    this.queue = [];
  }
}

/**
 * Show achievement notification in UI
 * Requirements: 6.5
 * 
 * @param {string} achievementId - ID of the achievement to display
 */
export function showAchievementNotification(achievementId) {
  const achievement = getAchievementById(achievementId);
  
  if (!achievement) {
    console.error(`Achievement not found: ${achievementId}`);
    return;
  }
  
  // Get notification elements
  const notificationElement = document.getElementById('achievement-notification');
  const textElement = document.getElementById('achievement-text');
  
  if (!notificationElement || !textElement) {
    console.error('Achievement notification elements not found');
    return;
  }
  
  // Set notification text
  textElement.textContent = `${achievement.name}: ${achievement.description}`;
  
  // Show notification with animation
  notificationElement.classList.add('show');
  
  // Hide notification after 4 seconds
  setTimeout(() => {
    notificationElement.classList.remove('show');
  }, 4000);
}
