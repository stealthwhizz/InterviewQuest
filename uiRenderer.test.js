/**
 * Tests for UI Renderer
 * Requirements: 3.5, 4.9, 5.5, 9.4, 9.5, 7.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderLives,
  renderXP,
  renderBossHealth,
  renderCombo,
  renderQuestion,
  renderBossInfo,
  renderFeedback,
  updateGameUI,
  renderCompleteScreen,
  renderGameOverScreen,
  clearAnswerInput,
  setSubmitButtonLoading
} from './uiRenderer.js';

// Mock DOM elements
function setupDOM() {
  document.body.innerHTML = `
    <div id="lives-display"></div>
    <div id="xp-text"></div>
    <div id="xp-fill" style="width: 0%"></div>
    <div id="boss-health-fill" style="width: 100%"></div>
    <div id="boss-health-text"></div>
    <div class="boss-container"></div>
    <div id="combo-indicator"></div>
    <div id="combo-count"></div>
    <div id="question-text"></div>
    <div id="boss-name"></div>
    <div id="score-display"></div>
    <div id="xp-earned-amount"></div>
    <ul id="strengths-list"></ul>
    <ul id="improvements-list"></ul>
    <div id="motivation-text"></div>
    <div id="victory-boss-name"></div>
    <div id="victory-xp"></div>
    <div id="victory-time"></div>
    <div id="complete-total-xp"></div>
    <div id="complete-questions"></div>
    <div id="complete-lives"></div>
    <div id="gameover-xp"></div>
    <div id="gameover-questions"></div>
    <div id="gameover-best-score"></div>
    <textarea id="answer-input"></textarea>
    <button id="submit-answer-btn"></button>
  `;
}

describe('UI Renderer', () => {
  beforeEach(() => {
    setupDOM();
  });

  describe('renderLives', () => {
    it('should render 3 hearts with correct full/empty states', () => {
      renderLives(2);
      
      const hearts = document.querySelectorAll('.heart');
      expect(hearts.length).toBe(3);
      expect(hearts[0].classList.contains('full')).toBe(true);
      expect(hearts[1].classList.contains('full')).toBe(true);
      expect(hearts[2].classList.contains('empty')).toBe(true);
    });

    it('should render all empty hearts when lives is 0', () => {
      renderLives(0);
      
      const hearts = document.querySelectorAll('.heart');
      expect(hearts.length).toBe(3);
      hearts.forEach(heart => {
        expect(heart.classList.contains('empty')).toBe(true);
      });
    });

    it('should render all full hearts when lives is 3', () => {
      renderLives(3);
      
      const hearts = document.querySelectorAll('.heart');
      expect(hearts.length).toBe(3);
      hearts.forEach(heart => {
        expect(heart.classList.contains('full')).toBe(true);
      });
    });

    it('should add lost animation class when life is lost', () => {
      renderLives(2, 3);
      
      const hearts = document.querySelectorAll('.heart');
      expect(hearts[2].classList.contains('lost')).toBe(true);
    });

    it('should add gained animation class when life is gained', () => {
      renderLives(3, 2);
      
      const hearts = document.querySelectorAll('.heart');
      expect(hearts[2].classList.contains('gained')).toBe(true);
    });
  });

  describe('renderXP', () => {
    it('should update XP text display', () => {
      renderXP(250);
      
      const xpText = document.getElementById('xp-text');
      expect(xpText.textContent).toBe('250');
    });

    it('should calculate progress to next unlock correctly for tier 1', () => {
      renderXP(250); // 50% to 500
      
      const xpFill = document.getElementById('xp-fill');
      expect(xpFill.style.width).toBe('50%');
    });

    it('should calculate progress to next unlock correctly for tier 2', () => {
      renderXP(1000); // 50% from 500 to 1500
      
      const xpFill = document.getElementById('xp-fill');
      expect(xpFill.style.width).toBe('50%');
    });

    it('should cap progress at 100%', () => {
      renderXP(2000); // Beyond all unlocks
      
      const xpFill = document.getElementById('xp-fill');
      expect(xpFill.style.width).toBe('100%');
    });
  });

  describe('renderBossHealth', () => {
    it('should update boss health bar width', () => {
      renderBossHealth(75);
      
      const healthFill = document.getElementById('boss-health-fill');
      expect(healthFill.style.width).toBe('75%');
    });

    it('should update boss health text', () => {
      renderBossHealth(75);
      
      const healthText = document.getElementById('boss-health-text');
      expect(healthText.textContent).toBe('75%');
    });

    it('should handle 0 health', () => {
      renderBossHealth(0);
      
      const healthFill = document.getElementById('boss-health-fill');
      const healthText = document.getElementById('boss-health-text');
      expect(healthFill.style.width).toBe('0%');
      expect(healthText.textContent).toBe('0%');
    });

    it('should handle 100 health', () => {
      renderBossHealth(100);
      
      const healthFill = document.getElementById('boss-health-fill');
      const healthText = document.getElementById('boss-health-text');
      expect(healthFill.style.width).toBe('100%');
      expect(healthText.textContent).toBe('100%');
    });

    it('should add damaged animation class when damaged flag is true', () => {
      renderBossHealth(75, true);
      
      const bossContainer = document.querySelector('.boss-container');
      expect(bossContainer.classList.contains('damaged')).toBe(true);
    });
  });

  describe('renderCombo', () => {
    it('should update combo count display', () => {
      renderCombo(2, false);
      
      const comboCount = document.getElementById('combo-count');
      expect(comboCount.textContent).toBe('2');
    });

    it('should add active class when combo is active', () => {
      renderCombo(3, true);
      
      const comboIndicator = document.getElementById('combo-indicator');
      expect(comboIndicator.classList.contains('active')).toBe(true);
    });

    it('should remove active class when combo is not active', () => {
      const comboIndicator = document.getElementById('combo-indicator');
      comboIndicator.classList.add('active');
      
      renderCombo(2, false);
      
      expect(comboIndicator.classList.contains('active')).toBe(false);
    });
  });

  describe('renderQuestion', () => {
    it('should render question text', () => {
      const question = { text: 'What is your greatest strength?' };
      renderQuestion(question);
      
      const questionText = document.getElementById('question-text');
      expect(questionText.textContent).toBe('What is your greatest strength?');
    });

    it('should handle null question', () => {
      renderQuestion(null);
      
      const questionText = document.getElementById('question-text');
      expect(questionText.textContent).toBe('No more questions available.');
    });

    it('should handle question without text', () => {
      renderQuestion({});
      
      const questionText = document.getElementById('question-text');
      expect(questionText.textContent).toBe('No more questions available.');
    });
  });

  describe('renderBossInfo', () => {
    it('should render boss name', () => {
      const bossInfo = { name: 'Junior Dev' };
      renderBossInfo(bossInfo);
      
      const bossName = document.getElementById('boss-name');
      expect(bossName.textContent).toBe('Junior Dev');
    });
  });

  describe('renderFeedback', () => {
    it('should render all feedback components', () => {
      const feedback = {
        strengths: ['Good structure', 'Clear communication'],
        improvements: ['Add more details', 'Consider edge cases'],
        motivation: 'Keep up the great work!'
      };
      
      renderFeedback(8, feedback, 75);
      
      // Check score
      const scoreDisplay = document.getElementById('score-display');
      expect(scoreDisplay.textContent).toBe('8/10');
      
      // Check XP earned
      const xpEarned = document.getElementById('xp-earned-amount');
      expect(xpEarned.textContent).toBe('75');
      
      // Check strengths
      const strengthsList = document.getElementById('strengths-list');
      expect(strengthsList.children.length).toBe(2);
      expect(strengthsList.children[0].textContent).toBe('Good structure');
      
      // Check improvements
      const improvementsList = document.getElementById('improvements-list');
      expect(improvementsList.children.length).toBe(2);
      expect(improvementsList.children[0].textContent).toBe('Add more details');
      
      // Check motivation
      const motivationText = document.getElementById('motivation-text');
      expect(motivationText.textContent).toBe('Keep up the great work!');
    });
  });

  describe('updateGameUI', () => {
    it('should update all game UI elements', () => {
      const gameState = {
        lives: 2,
        xp: 250,
        bossHealth: 75,
        consecutiveGoodAnswers: 2,
        comboActive: false
      };
      
      updateGameUI(gameState);
      
      // Verify lives rendered
      const hearts = document.querySelectorAll('.heart');
      expect(hearts.length).toBe(3);
      
      // Verify XP rendered
      const xpText = document.getElementById('xp-text');
      expect(xpText.textContent).toBe('250');
      
      // Verify boss health rendered
      const healthFill = document.getElementById('boss-health-fill');
      expect(healthFill.style.width).toBe('75%');
      
      // Verify combo rendered
      const comboCount = document.getElementById('combo-count');
      expect(comboCount.textContent).toBe('2');
    });

    it('should detect boss damage when previous state provided', () => {
      const previousState = { bossHealth: 100 };
      const gameState = {
        lives: 3,
        xp: 100,
        bossHealth: 90,
        consecutiveGoodAnswers: 1,
        comboActive: false
      };
      
      updateGameUI(gameState, previousState);
      
      const bossContainer = document.querySelector('.boss-container');
      expect(bossContainer.classList.contains('damaged')).toBe(true);
    });
  });

  describe('renderCompleteScreen', () => {
    it('should render complete screen statistics', () => {
      const sessionStats = {
        xpEarnedThisSession: 500,
        currentXP: 1000,
        questionsAnswered: 10,
        currentLives: 2
      };
      const bossInfo = { name: 'Junior Dev' };
      
      renderCompleteScreen(sessionStats, bossInfo);
      
      expect(document.getElementById('victory-boss-name').textContent).toBe('Junior Dev Defeated!');
      expect(document.getElementById('victory-xp').textContent).toBe('500');
      expect(document.getElementById('complete-total-xp').textContent).toBe('1000');
      expect(document.getElementById('complete-questions').textContent).toBe('10');
      expect(document.getElementById('complete-lives').textContent).toBe('2');
    });
  });

  describe('renderGameOverScreen', () => {
    it('should render game over screen statistics', () => {
      const sessionStats = {
        xpEarnedThisSession: 200,
        questionsAnswered: 5
      };
      
      renderGameOverScreen(sessionStats);
      
      expect(document.getElementById('gameover-xp').textContent).toBe('200');
      expect(document.getElementById('gameover-questions').textContent).toBe('5');
    });
  });

  describe('clearAnswerInput', () => {
    it('should clear answer input field', () => {
      const answerInput = document.getElementById('answer-input');
      answerInput.value = 'Some answer text';
      
      clearAnswerInput();
      
      expect(answerInput.value).toBe('');
    });
  });

  describe('setSubmitButtonLoading', () => {
    it('should set button to loading state', () => {
      const submitBtn = document.getElementById('submit-answer-btn');
      
      setSubmitButtonLoading(true);
      
      expect(submitBtn.disabled).toBe(true);
      expect(submitBtn.classList.contains('loading')).toBe(true);
    });

    it('should remove loading state', () => {
      const submitBtn = document.getElementById('submit-answer-btn');
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      
      setSubmitButtonLoading(false);
      
      expect(submitBtn.disabled).toBe(false);
      expect(submitBtn.classList.contains('loading')).toBe(false);
    });
  });
});
