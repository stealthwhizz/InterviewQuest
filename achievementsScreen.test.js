/**
 * Tests for Achievements Screen
 * Requirements: 6.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { ScreenManager } from './screenManager.js';
import { getAllAchievements } from './achievements.js';

describe('Achievements Screen', () => {
  let dom;
  let document;
  let screenManager;

  beforeEach(() => {
    // Create a minimal DOM structure for testing
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="menu-screen" class="screen active"></div>
          <div id="game-screen" class="screen"></div>
          <div id="feedback-screen" class="screen"></div>
          <div id="complete-screen" class="screen"></div>
          <div id="gameover-screen" class="screen"></div>
          <div id="instructions-screen" class="screen"></div>
          <div id="achievements-screen" class="screen">
            <div id="achievements-list"></div>
          </div>
          <button id="achievements-btn"></button>
          <button id="return-menu-achievements-btn"></button>
        </body>
      </html>
    `);

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    screenManager = new ScreenManager();
  });

  describe('Display all achievements', () => {
    it('should display all 10 achievements', () => {
      // Mock saved state with no unlocked achievements
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      // Show achievements screen
      screenManager.showScreen('achievements');

      // Get achievements list
      const achievementsList = document.getElementById('achievements-list');
      const achievementItems = achievementsList.querySelectorAll('.achievement-item');

      // Should have 10 achievements
      expect(achievementItems.length).toBe(10);
    });

    it('should display achievement icons', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const achievementsList = document.getElementById('achievements-list');
      const icons = achievementsList.querySelectorAll('.achievement-icon');

      // Should have icons for all achievements
      expect(icons.length).toBe(10);

      // Each icon should have content
      icons.forEach(icon => {
        expect(icon.textContent).toBeTruthy();
      });
    });

    it('should display achievement names and descriptions', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const achievementsList = document.getElementById('achievements-list');
      const names = achievementsList.querySelectorAll('.achievement-name');
      const descriptions = achievementsList.querySelectorAll('.achievement-description');

      // Should have names and descriptions for all achievements
      expect(names.length).toBe(10);
      expect(descriptions.length).toBe(10);

      // Each should have content
      names.forEach(name => {
        expect(name.textContent).toBeTruthy();
      });

      descriptions.forEach(desc => {
        expect(desc.textContent).toBeTruthy();
      });
    });
  });

  describe('Locked/Unlocked states', () => {
    it('should show all achievements as locked when none are unlocked', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const achievementsList = document.getElementById('achievements-list');
      const lockedItems = achievementsList.querySelectorAll('.achievement-item.locked');
      const unlockedItems = achievementsList.querySelectorAll('.achievement-item.unlocked');

      expect(lockedItems.length).toBe(10);
      expect(unlockedItems.length).toBe(0);
    });

    it('should show unlocked achievements correctly', () => {
      // Mock with some unlocked achievements
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify(['first_blood', 'combo_master']);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const achievementsList = document.getElementById('achievements-list');
      const lockedItems = achievementsList.querySelectorAll('.achievement-item.locked');
      const unlockedItems = achievementsList.querySelectorAll('.achievement-item.unlocked');

      expect(unlockedItems.length).toBe(2);
      expect(lockedItems.length).toBe(8);
    });

    it('should display "Unlocked" status for unlocked achievements', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify(['first_blood']);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const achievementsList = document.getElementById('achievements-list');
      const unlockedItem = achievementsList.querySelector('.achievement-item.unlocked');
      const statusElement = unlockedItem.querySelector('.achievement-status');

      expect(statusElement.textContent).toBe('Unlocked');
    });

    it('should display "Locked" status for locked achievements', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const achievementsList = document.getElementById('achievements-list');
      const lockedItem = achievementsList.querySelector('.achievement-item.locked');
      const statusElement = lockedItem.querySelector('.achievement-status');

      expect(statusElement.textContent).toBe('Locked');
    });
  });

  describe('Navigation', () => {
    it('should navigate to achievements screen from menu', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      // Start at menu
      expect(screenManager.getCurrentScreen()).toBe('menu');

      // Navigate to achievements
      screenManager.showScreen('achievements');

      expect(screenManager.getCurrentScreen()).toBe('achievements');
    });

    it('should return to menu from achievements screen', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify([]);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      // Navigate to achievements
      screenManager.showScreen('achievements');
      expect(screenManager.getCurrentScreen()).toBe('achievements');

      // Return to menu
      screenManager.returnToMenu();
      expect(screenManager.getCurrentScreen()).toBe('menu');
    });
  });

  describe('Achievement data integrity', () => {
    it('should display all achievement properties correctly', () => {
      global.localStorage.getItem.mockImplementation((key) => {
        if (key === 'interviewquest_achievements') {
          return JSON.stringify(['first_blood']);
        }
        if (key === 'interviewquest_xp') {
          return '0';
        }
        if (key === 'interviewquest_unlocked_bosses') {
          return JSON.stringify([0]);
        }
        return null;
      });

      screenManager.showScreen('achievements');

      const allAchievements = getAllAchievements();
      const achievementsList = document.getElementById('achievements-list');

      // Verify each achievement has all required properties displayed
      allAchievements.forEach(achievement => {
        const achievementElements = Array.from(achievementsList.querySelectorAll('.achievement-item'));
        const matchingElement = achievementElements.find(el => 
          el.querySelector('.achievement-name').textContent === achievement.name
        );

        expect(matchingElement).toBeTruthy();
        expect(matchingElement.querySelector('.achievement-icon').textContent).toBe(achievement.icon);
        expect(matchingElement.querySelector('.achievement-name').textContent).toBe(achievement.name);
        expect(matchingElement.querySelector('.achievement-description').textContent).toBe(achievement.description);
      });
    });
  });
});
