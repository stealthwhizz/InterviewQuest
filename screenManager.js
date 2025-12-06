/**
 * Screen Manager for InterviewQuest
 * Handles screen transitions and navigation flow
 * Requirements: 1.1, 1.2, 1.5, 2.5
 */

import { loadGameState, saveXP } from './storage.js';
import { getUnlockedBosses } from './gameLogic.js';
import { getAllAchievements } from './achievements.js';

/**
 * Boss definitions
 */
export const BOSSES = [
  {
    id: 0,
    name: 'Junior Dev',
    level: 'junior',
    personality: 'Eager to learn and grow',
    unlockXP: 0,
    healthPoints: 100,
    questionsPerSession: 10
  },
  {
    id: 1,
    name: 'Senior Engineer',
    level: 'senior',
    personality: 'Experienced and demanding',
    unlockXP: 500,
    healthPoints: 100,
    questionsPerSession: 10
  },
  {
    id: 2,
    name: 'FAANG Boss',
    level: 'faang',
    personality: 'Elite and unforgiving',
    unlockXP: 1500,
    healthPoints: 100,
    questionsPerSession: 10
  }
];

/**
 * Screen Manager Class
 */
export class ScreenManager {
  constructor() {
    this.screens = {
      menu: document.getElementById('menu-screen'),
      game: document.getElementById('game-screen'),
      feedback: document.getElementById('feedback-screen'),
      complete: document.getElementById('complete-screen'),
      gameover: document.getElementById('gameover-screen'),
      instructions: document.getElementById('instructions-screen'),
      achievements: document.getElementById('achievements-screen')
    };
    
    this.currentScreen = 'menu';
    this.gameState = null;
    this.onStartGameCallback = null;
    this.onRetryCallback = null;
  }
  
  /**
   * Show a specific screen and hide all others
   * Requirements: 1.1, 1.5
   */
  showScreen(screenName) {
    // Hide all screens
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show requested screen
    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
      this.currentScreen = screenName;
      
      // Perform screen-specific initialization
      this.onScreenShown(screenName);
    } else {
      console.error(`Screen "${screenName}" not found`);
    }
  }
  
  /**
   * Get current screen name
   */
  getCurrentScreen() {
    return this.currentScreen;
  }
  
  /**
   * Handle screen-specific initialization when shown
   */
  onScreenShown(screenName) {
    switch (screenName) {
      case 'menu':
        this.initializeMenuScreen();
        break;
      case 'achievements':
        this.initializeAchievementsScreen();
        break;
    }
  }
  
  /**
   * Initialize menu screen with boss selection
   * Requirements: 1.1, 1.2, 2.5
   */
  initializeMenuScreen() {
    // Load current XP from storage
    const savedState = loadGameState();
    const currentXP = savedState.xp;
    
    // Get unlocked bosses based on XP
    const unlockedBosses = getUnlockedBosses(currentXP);
    
    // Update XP display if element exists
    const xpDisplay = document.getElementById('menu-xp-display');
    if (xpDisplay) {
      xpDisplay.textContent = currentXP;
    }
    
    // Show boss selection
    this.renderBossSelection(unlockedBosses, currentXP);
  }
  
  /**
   * Render boss selection UI
   * Requirements: 2.5
   */
  renderBossSelection(unlockedBosses, currentXP) {
    const bossSelectionDiv = document.getElementById('boss-selection');
    const bossListDiv = document.getElementById('boss-list');
    
    if (!bossSelectionDiv || !bossListDiv) {
      return;
    }
    
    // Show boss selection section
    bossSelectionDiv.style.display = 'block';
    
    // Clear existing boss options
    bossListDiv.innerHTML = '';
    
    // Render each boss
    BOSSES.forEach(boss => {
      const isUnlocked = unlockedBosses.includes(boss.id);
      
      const bossOption = document.createElement('div');
      bossOption.className = `boss-option ${isUnlocked ? '' : 'locked'}`;
      
      if (isUnlocked) {
        bossOption.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 1.2rem; font-weight: bold;">${boss.name}</div>
              <div style="font-size: 0.9rem; color: #8b92a8; margin-top: 4px;">${boss.personality}</div>
            </div>
            <div style="font-size: 1.5rem;">⚔️</div>
          </div>
        `;
        
        // Add click handler for unlocked bosses
        bossOption.addEventListener('click', () => {
          this.startGame(boss.id);
        });
      } else {
        bossOption.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 1.2rem; font-weight: bold;">${boss.name} 🔒</div>
              <div style="font-size: 0.9rem; color: #8b92a8; margin-top: 4px;">
                Requires ${boss.unlockXP} XP (Current: ${currentXP})
              </div>
            </div>
            <div style="font-size: 1.5rem; opacity: 0.3;">⚔️</div>
          </div>
        `;
      }
      
      bossListDiv.appendChild(bossOption);
    });
  }
  
  /**
   * Initialize achievements screen
   * Requirements: 6.7
   */
  initializeAchievementsScreen() {
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) {
      return;
    }
    
    // Load unlocked achievements from storage
    const savedState = loadGameState();
    const unlockedAchievements = new Set(savedState.achievements);
    
    // Clear existing content
    achievementsList.innerHTML = '';
    
    // Render all achievements
    const allAchievements = getAllAchievements();
    allAchievements.forEach(achievement => {
      const isUnlocked = unlockedAchievements.has(achievement.id);
      
      const achievementItem = document.createElement('div');
      achievementItem.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      
      achievementItem.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-details">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
        <div class="achievement-status">${isUnlocked ? 'Unlocked' : 'Locked'}</div>
      `;
      
      achievementsList.appendChild(achievementItem);
    });
  }
  
  /**
   * Start a game with the selected boss
   * Requirements: 1.2
   */
  startGame(bossId) {
    if (this.onStartGameCallback) {
      this.onStartGameCallback(bossId);
    }
    this.showScreen('game');
  }
  
  /**
   * Navigate from game to feedback screen
   * Requirements: 1.5
   */
  showFeedback() {
    this.showScreen('feedback');
  }
  
  /**
   * Navigate from feedback to next screen based on game state
   * Requirements: 1.5
   */
  continueFromFeedback(gameState) {
    // Check if game is over (no lives)
    if (gameState.lives <= 0) {
      this.showGameOver(gameState);
      return;
    }
    
    // Check if boss is defeated
    if (gameState.bossHealth <= 0) {
      this.showComplete(gameState);
      return;
    }
    
    // Continue to next question
    this.showScreen('game');
  }
  
  /**
   * Show complete screen (victory)
   * Requirements: 1.5
   */
  showComplete(gameState) {
    this.gameState = gameState;
    this.showScreen('complete');
  }
  
  /**
   * Show game over screen
   * Requirements: 1.5
   */
  showGameOver(gameState) {
    this.gameState = gameState;
    this.showScreen('gameover');
  }
  
  /**
   * Return to menu from any screen
   * Requirements: 1.5
   */
  returnToMenu() {
    this.showScreen('menu');
  }
  
  /**
   * Retry the current boss level
   * Requirements: 1.5
   */
  retry() {
    if (this.onRetryCallback && this.gameState) {
      this.onRetryCallback(this.gameState.currentBoss);
    }
    this.showScreen('game');
  }
  
  /**
   * Set callback for when game starts
   */
  setOnStartGame(callback) {
    this.onStartGameCallback = callback;
  }
  
  /**
   * Set callback for when retry is clicked
   */
  setOnRetry(callback) {
    this.onRetryCallback = callback;
  }
  
  /**
   * Initialize all navigation event listeners
   */
  initializeNavigation() {
    // Menu navigation
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => {
        // Show boss selection instead of starting immediately
        const bossSelection = document.getElementById('boss-selection');
        if (bossSelection) {
          bossSelection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => {
        this.showScreen('achievements');
      });
    }
    
    const instructionsBtn = document.getElementById('instructions-btn');
    if (instructionsBtn) {
      instructionsBtn.addEventListener('click', () => {
        this.showScreen('instructions');
      });
    }
    
    // Return to menu buttons
    const returnMenuButtons = [
      'return-menu-complete-btn',
      'return-menu-gameover-btn',
      'return-menu-instructions-btn',
      'return-menu-achievements-btn'
    ];
    
    returnMenuButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          this.returnToMenu();
        });
      }
    });
    
    // Retry button
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.retry();
      });
    }
  }
}

/**
 * Get boss by ID
 */
export function getBossById(bossId) {
  return BOSSES.find(boss => boss.id === bossId);
}

/**
 * Get boss by level name
 */
export function getBossByLevel(level) {
  return BOSSES.find(boss => boss.level === level);
}
