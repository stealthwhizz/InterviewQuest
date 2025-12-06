/**
 * UI Renderer for InterviewQuest
 * Handles all UI rendering and updates with animations
 * Requirements: 3.5, 4.9, 5.5, 9.4, 9.5, 7.7
 */

/**
 * Render lives as heart icons with animations
 * Requirements: 3.5
 * @param {number} lives - Current number of lives (0-3)
 * @param {number} previousLives - Previous number of lives for animation
 */
export function renderLives(lives, previousLives = null) {
  const livesDisplay = document.getElementById('lives-display');
  if (!livesDisplay) return;
  
  // Clear existing hearts
  livesDisplay.innerHTML = '';
  
  // Render 3 hearts (max lives)
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.className = i < lives ? 'heart full' : 'heart empty';
    heart.textContent = '❤️';
    
    // Add animation class if this heart changed state
    if (previousLives !== null) {
      if (i === lives && lives < previousLives) {
        // This heart was just lost
        heart.classList.add('lost');
      } else if (i === lives - 1 && lives > previousLives) {
        // This heart was just gained
        heart.classList.add('gained');
      }
    }
    
    livesDisplay.appendChild(heart);
  }
}

/**
 * Render XP progress bar with visual updates
 * Requirements: 4.9
 * @param {number} xp - Current XP value
 */
export function renderXP(xp) {
  const xpText = document.getElementById('xp-text');
  const xpFill = document.getElementById('xp-fill');
  
  if (xpText) {
    xpText.textContent = xp;
  }
  
  if (xpFill) {
    // Calculate XP progress to next boss unlock
    let nextUnlockXP = 500;
    let currentThreshold = 0;
    
    if (xp >= 1500) {
      // Already unlocked all bosses, show progress to arbitrary milestone
      currentThreshold = 1500;
      nextUnlockXP = 2000;
    } else if (xp >= 500) {
      // Working towards FAANG Boss
      currentThreshold = 500;
      nextUnlockXP = 1500;
    } else {
      // Working towards Senior Engineer
      currentThreshold = 0;
      nextUnlockXP = 500;
    }
    
    // Calculate progress percentage within current tier
    const tierXP = xp - currentThreshold;
    const tierRange = nextUnlockXP - currentThreshold;
    const progress = (tierXP / tierRange) * 100;
    
    // Update XP bar width with smooth transition
    xpFill.style.width = Math.min(progress, 100) + '%';
  }
}

/**
 * Render boss health bar with smooth animations
 * Requirements: 9.4
 * @param {number} health - Current boss health (0-100)
 * @param {boolean} damaged - Whether boss was just damaged (for animation)
 */
export function renderBossHealth(health, damaged = false) {
  const healthFill = document.getElementById('boss-health-fill');
  const healthText = document.getElementById('boss-health-text');
  const bossContainer = document.querySelector('.boss-container');
  
  if (healthFill) {
    const healthPercentage = Math.max(0, Math.min(100, health));
    healthFill.style.width = healthPercentage + '%';
  }
  
  if (healthText) {
    const healthPercentage = Math.max(0, Math.min(100, health));
    healthText.textContent = Math.round(healthPercentage) + '%';
  }
  
  // Add damage animation if boss was just damaged
  if (damaged && bossContainer) {
    bossContainer.classList.add('damaged');
    // Remove animation class after animation completes
    setTimeout(() => {
      bossContainer.classList.remove('damaged');
    }, 400);
  }
}

/**
 * Render combo indicator with consecutive count display
 * Requirements: 5.5
 * @param {number} consecutiveCount - Number of consecutive good answers
 * @param {boolean} isActive - Whether combo mode is active
 */
export function renderCombo(consecutiveCount, isActive) {
  const comboIndicator = document.getElementById('combo-indicator');
  const comboCount = document.getElementById('combo-count');
  
  if (comboCount) {
    comboCount.textContent = consecutiveCount;
  }
  
  if (comboIndicator) {
    if (isActive) {
      // Add active class for fire animation
      if (!comboIndicator.classList.contains('active')) {
        comboIndicator.classList.add('active');
      }
    } else {
      // Remove active class
      comboIndicator.classList.remove('active');
    }
  }
}

/**
 * Render question text dynamically
 * Requirements: 9.5
 * @param {Object} question - Question object with text property
 */
export function renderQuestion(question) {
  const questionText = document.getElementById('question-text');
  
  if (questionText) {
    if (question && question.text) {
      questionText.textContent = question.text;
    } else {
      questionText.textContent = 'No more questions available.';
    }
  }
}

/**
 * Render boss name and information
 * Requirements: 9.5
 * @param {Object} bossInfo - Boss information object
 */
export function renderBossInfo(bossInfo) {
  const bossName = document.getElementById('boss-name');
  
  if (bossName && bossInfo) {
    bossName.textContent = bossInfo.name;
  }
}

/**
 * Render feedback screen with all components
 * Requirements: 7.7
 * @param {number} score - Score from 1-10
 * @param {Object} feedback - Feedback object with strengths, improvements, motivation
 * @param {number} xpEarned - XP earned for this answer
 */
export function renderFeedback(score, feedback, xpEarned) {
  // Display score
  const scoreDisplay = document.getElementById('score-display');
  if (scoreDisplay) {
    scoreDisplay.textContent = score + '/10';
  }
  
  // Display XP earned
  const xpEarnedAmount = document.getElementById('xp-earned-amount');
  if (xpEarnedAmount) {
    xpEarnedAmount.textContent = xpEarned;
  }
  
  // Display strengths
  const strengthsList = document.getElementById('strengths-list');
  if (strengthsList && feedback.strengths) {
    strengthsList.innerHTML = '';
    feedback.strengths.forEach(strength => {
      const li = document.createElement('li');
      li.textContent = strength;
      strengthsList.appendChild(li);
    });
  }
  
  // Display improvements
  const improvementsList = document.getElementById('improvements-list');
  if (improvementsList && feedback.improvements) {
    improvementsList.innerHTML = '';
    feedback.improvements.forEach(improvement => {
      const li = document.createElement('li');
      li.textContent = improvement;
      improvementsList.appendChild(li);
    });
  }
  
  // Display motivation
  const motivationText = document.getElementById('motivation-text');
  if (motivationText && feedback.motivation) {
    motivationText.textContent = feedback.motivation;
  }
}

/**
 * Update all UI elements reactively based on game state changes
 * This is the main function to call when game state updates
 * Requirements: 3.5, 4.9, 5.5, 9.4, 9.5
 * @param {Object} gameState - Current game state
 * @param {Object} previousState - Previous game state (for animations)
 */
export function updateGameUI(gameState, previousState = null) {
  // Determine if lives changed for animation
  const previousLives = previousState ? previousState.lives : null;
  renderLives(gameState.lives, previousLives);
  
  // Update XP display
  renderXP(gameState.xp);
  
  // Determine if boss was damaged
  const wasDamaged = previousState && previousState.bossHealth > gameState.bossHealth;
  renderBossHealth(gameState.bossHealth, wasDamaged);
  
  // Update combo indicator
  renderCombo(gameState.consecutiveGoodAnswers, gameState.comboActive);
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Render complete screen statistics
 * @param {Object} sessionStats - Session statistics object
 * @param {Object} bossInfo - Boss information
 */
export function renderCompleteScreen(sessionStats, bossInfo) {
  // Victory boss name
  const victoryBossName = document.getElementById('victory-boss-name');
  if (victoryBossName && bossInfo) {
    victoryBossName.textContent = bossInfo.name + ' Defeated!';
  }
  
  // Victory XP
  const victoryXP = document.getElementById('victory-xp');
  if (victoryXP && sessionStats) {
    victoryXP.textContent = sessionStats.xpEarnedThisSession || 0;
  }
  
  // Victory time
  const victoryTime = document.getElementById('victory-time');
  if (victoryTime && sessionStats) {
    victoryTime.textContent = formatTime(sessionStats.completionTime || 0);
  }
  
  // Total XP
  const completeTotalXP = document.getElementById('complete-total-xp');
  if (completeTotalXP && sessionStats) {
    completeTotalXP.textContent = sessionStats.currentXP || 0;
  }
  
  // Questions answered
  const completeQuestions = document.getElementById('complete-questions');
  if (completeQuestions && sessionStats) {
    completeQuestions.textContent = sessionStats.questionsAnswered || 0;
  }
  
  // Lives remaining
  const completeLives = document.getElementById('complete-lives');
  if (completeLives && sessionStats) {
    completeLives.textContent = sessionStats.currentLives || 0;
  }
}

/**
 * Render game over screen statistics
 * @param {Object} sessionStats - Session statistics object
 */
export function renderGameOverScreen(sessionStats) {
  // XP earned this session
  const gameoverXP = document.getElementById('gameover-xp');
  if (gameoverXP && sessionStats) {
    gameoverXP.textContent = sessionStats.xpEarnedThisSession || 0;
  }
  
  // Questions answered
  const gameoverQuestions = document.getElementById('gameover-questions');
  if (gameoverQuestions && sessionStats) {
    gameoverQuestions.textContent = sessionStats.questionsAnswered || 0;
  }
  
  // Best score (placeholder for now)
  const gameoverBestScore = document.getElementById('gameover-best-score');
  if (gameoverBestScore) {
    gameoverBestScore.textContent = '10'; // TODO: Track best score
  }
}

/**
 * Clear answer input field
 */
export function clearAnswerInput() {
  const answerInput = document.getElementById('answer-input');
  if (answerInput) {
    answerInput.value = '';
  }
}

/**
 * Set submit button loading state
 * @param {boolean} isLoading - Whether button should show loading state
 */
export function setSubmitButtonLoading(isLoading) {
  const submitBtn = document.getElementById('submit-answer-btn');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.classList.add('loading');
    } else {
      submitBtn.classList.remove('loading');
    }
  }
}
