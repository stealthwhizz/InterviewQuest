/**
 * Integration tests for UI Renderer
 * Verifies UI updates work correctly in realistic game scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderLives,
  renderXP,
  renderBossHealth,
  renderCombo,
  renderQuestion,
  renderBossInfo,
  renderFeedback,
  updateGameUI
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
  `;
}

describe('UI Renderer Integration Tests', () => {
  beforeEach(() => {
    setupDOM();
  });

  it('should render complete game state after good answer', () => {
    // Initial state
    const initialState = {
      lives: 3,
      xp: 100,
      bossHealth: 100,
      consecutiveGoodAnswers: 0,
      comboActive: false
    };
    
    updateGameUI(initialState);
    
    // Verify initial rendering
    expect(document.querySelectorAll('.heart.full').length).toBe(3);
    expect(document.getElementById('xp-text').textContent).toBe('100');
    expect(document.getElementById('boss-health-fill').style.width).toBe('100%');
    expect(document.getElementById('combo-count').textContent).toBe('0');
    expect(document.getElementById('combo-indicator').classList.contains('active')).toBe(false);
    
    // After good answer (score 8)
    const afterAnswerState = {
      lives: 3,
      xp: 175, // +75 XP
      bossHealth: 90, // -10 health
      consecutiveGoodAnswers: 1,
      comboActive: false
    };
    
    updateGameUI(afterAnswerState, initialState);
    
    // Verify updated rendering
    expect(document.querySelectorAll('.heart.full').length).toBe(3);
    expect(document.getElementById('xp-text').textContent).toBe('175');
    expect(document.getElementById('boss-health-fill').style.width).toBe('90%');
    expect(document.getElementById('combo-count').textContent).toBe('1');
    expect(document.querySelector('.boss-container').classList.contains('damaged')).toBe(true);
  });

  it('should show combo activation after 3 consecutive good answers', () => {
    // State with 2 consecutive good answers
    const beforeComboState = {
      lives: 3,
      xp: 250,
      bossHealth: 80,
      consecutiveGoodAnswers: 2,
      comboActive: false
    };
    
    updateGameUI(beforeComboState);
    expect(document.getElementById('combo-indicator').classList.contains('active')).toBe(false);
    
    // State after 3rd consecutive good answer - combo activates
    const comboActiveState = {
      lives: 3,
      xp: 325, // +75 XP
      bossHealth: 70,
      consecutiveGoodAnswers: 3,
      comboActive: true
    };
    
    updateGameUI(comboActiveState, beforeComboState);
    
    // Verify combo is active
    expect(document.getElementById('combo-count').textContent).toBe('3');
    expect(document.getElementById('combo-indicator').classList.contains('active')).toBe(true);
  });

  it('should show life lost animation when score is poor', () => {
    const beforeState = {
      lives: 3,
      xp: 100,
      bossHealth: 100,
      consecutiveGoodAnswers: 0,
      comboActive: false
    };
    
    const afterState = {
      lives: 2,
      xp: 100, // No XP for score < 4
      bossHealth: 100, // No damage for score < 6
      consecutiveGoodAnswers: 0,
      comboActive: false
    };
    
    updateGameUI(afterState, beforeState);
    
    // Verify life was lost
    expect(document.querySelectorAll('.heart.full').length).toBe(2);
    expect(document.querySelectorAll('.heart.empty').length).toBe(1);
    
    // Check for lost animation class
    const hearts = document.querySelectorAll('.heart');
    expect(hearts[2].classList.contains('lost')).toBe(true);
  });

  it('should show life gained animation when score is excellent', () => {
    const beforeState = {
      lives: 2,
      xp: 100,
      bossHealth: 90,
      consecutiveGoodAnswers: 0,
      comboActive: false
    };
    
    const afterState = {
      lives: 3,
      xp: 175, // +75 XP for score 9
      bossHealth: 80,
      consecutiveGoodAnswers: 1,
      comboActive: false
    };
    
    updateGameUI(afterState, beforeState);
    
    // Verify life was gained
    expect(document.querySelectorAll('.heart.full').length).toBe(3);
    
    // Check for gained animation class
    const hearts = document.querySelectorAll('.heart');
    expect(hearts[2].classList.contains('gained')).toBe(true);
  });

  it('should render complete feedback screen', () => {
    const feedback = {
      strengths: [
        'Clear communication',
        'Good structure',
        'Relevant examples'
      ],
      improvements: [
        'Add more technical depth',
        'Consider edge cases'
      ],
      motivation: 'Great progress! Keep practicing and you\'ll master this.'
    };
    
    renderFeedback(8, feedback, 75);
    
    // Verify score display
    expect(document.getElementById('score-display').textContent).toBe('8/10');
    
    // Verify XP earned
    expect(document.getElementById('xp-earned-amount').textContent).toBe('75');
    
    // Verify strengths
    const strengthsList = document.getElementById('strengths-list');
    expect(strengthsList.children.length).toBe(3);
    expect(strengthsList.children[0].textContent).toBe('Clear communication');
    expect(strengthsList.children[1].textContent).toBe('Good structure');
    expect(strengthsList.children[2].textContent).toBe('Relevant examples');
    
    // Verify improvements
    const improvementsList = document.getElementById('improvements-list');
    expect(improvementsList.children.length).toBe(2);
    expect(improvementsList.children[0].textContent).toBe('Add more technical depth');
    expect(improvementsList.children[1].textContent).toBe('Consider edge cases');
    
    // Verify motivation
    expect(document.getElementById('motivation-text').textContent).toBe(
      'Great progress! Keep practicing and you\'ll master this.'
    );
  });

  it('should render question and boss info together', () => {
    const question = {
      text: 'Tell me about a time you faced a difficult technical challenge.',
      type: 'behavioral',
      level: 'junior'
    };
    
    const bossInfo = {
      name: 'Junior Dev',
      level: 'junior',
      personality: 'Eager to learn'
    };
    
    renderQuestion(question);
    renderBossInfo(bossInfo);
    
    expect(document.getElementById('question-text').textContent).toBe(
      'Tell me about a time you faced a difficult technical challenge.'
    );
    expect(document.getElementById('boss-name').textContent).toBe('Junior Dev');
  });

  it('should handle XP progression through boss unlock thresholds', () => {
    // Before Senior Engineer unlock (< 500 XP)
    renderXP(450);
    expect(document.getElementById('xp-text').textContent).toBe('450');
    expect(document.getElementById('xp-fill').style.width).toBe('90%'); // 450/500
    
    // After Senior Engineer unlock (>= 500 XP)
    renderXP(750);
    expect(document.getElementById('xp-text').textContent).toBe('750');
    expect(document.getElementById('xp-fill').style.width).toBe('25%'); // (750-500)/(1500-500)
    
    // After FAANG Boss unlock (>= 1500 XP)
    renderXP(1750);
    expect(document.getElementById('xp-text').textContent).toBe('1750');
    expect(document.getElementById('xp-fill').style.width).toBe('50%'); // (1750-1500)/(2000-1500)
  });

  it('should handle boss defeat scenario', () => {
    const beforeDefeatState = {
      lives: 3,
      xp: 500,
      bossHealth: 10,
      consecutiveGoodAnswers: 5,
      comboActive: true
    };
    
    const afterDefeatState = {
      lives: 3,
      xp: 600,
      bossHealth: 0, // Boss defeated!
      consecutiveGoodAnswers: 6,
      comboActive: true
    };
    
    updateGameUI(afterDefeatState, beforeDefeatState);
    
    // Verify boss health is 0
    expect(document.getElementById('boss-health-fill').style.width).toBe('0%');
    expect(document.getElementById('boss-health-text').textContent).toBe('0%');
    
    // Verify damage animation
    expect(document.querySelector('.boss-container').classList.contains('damaged')).toBe(true);
  });

  it('should handle game over scenario', () => {
    const beforeGameOverState = {
      lives: 1,
      xp: 200,
      bossHealth: 50,
      consecutiveGoodAnswers: 0,
      comboActive: false
    };
    
    const gameOverState = {
      lives: 0, // Game over!
      xp: 200,
      bossHealth: 50,
      consecutiveGoodAnswers: 0,
      comboActive: false
    };
    
    updateGameUI(gameOverState, beforeGameOverState);
    
    // Verify all hearts are empty
    expect(document.querySelectorAll('.heart.empty').length).toBe(3);
    expect(document.querySelectorAll('.heart.full').length).toBe(0);
    
    // Verify lost animation on last heart
    const hearts = document.querySelectorAll('.heart');
    expect(hearts[0].classList.contains('lost')).toBe(true);
  });
});
