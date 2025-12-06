/**
 * Tests for Screen Manager
 * Validates screen transitions and navigation flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenManager, BOSSES, getBossById, getBossByLevel } from './screenManager.js';

// Mock DOM elements
function createMockScreen(id) {
  return {
    id,
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  };
}

function setupMockDOM() {
  const screens = {
    'menu-screen': createMockScreen('menu-screen'),
    'game-screen': createMockScreen('game-screen'),
    'feedback-screen': createMockScreen('feedback-screen'),
    'complete-screen': createMockScreen('complete-screen'),
    'gameover-screen': createMockScreen('gameover-screen'),
    'instructions-screen': createMockScreen('instructions-screen'),
    'achievements-screen': createMockScreen('achievements-screen')
  };
  
  global.document = {
    getElementById: vi.fn((id) => screens[id] || null)
  };
  
  return screens;
}

describe('ScreenManager', () => {
  let screenManager;
  let mockScreens;
  
  beforeEach(() => {
    mockScreens = setupMockDOM();
    screenManager = new ScreenManager();
  });
  
  describe('showScreen', () => {
    it('should hide all screens and show the requested screen', () => {
      screenManager.showScreen('game');
      
      // All screens should have remove called
      Object.values(mockScreens).forEach(screen => {
        expect(screen.classList.remove).toHaveBeenCalledWith('active');
      });
      
      // Game screen should have add called
      expect(mockScreens['game-screen'].classList.add).toHaveBeenCalledWith('active');
    });
    
    it('should update currentScreen property', () => {
      screenManager.showScreen('feedback');
      expect(screenManager.getCurrentScreen()).toBe('feedback');
    });
    
    it('should handle invalid screen names gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      screenManager.showScreen('invalid-screen');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
  
  describe('navigation flow', () => {
    it('should transition from menu to game when starting', () => {
      const callback = vi.fn();
      screenManager.setOnStartGame(callback);
      
      screenManager.startGame(0);
      
      expect(callback).toHaveBeenCalledWith(0);
      expect(screenManager.getCurrentScreen()).toBe('game');
    });
    
    it('should transition from game to feedback', () => {
      screenManager.showFeedback();
      expect(screenManager.getCurrentScreen()).toBe('feedback');
    });
    
    it('should transition from feedback to game when continuing with lives', () => {
      const gameState = {
        lives: 2,
        bossHealth: 50
      };
      
      screenManager.continueFromFeedback(gameState);
      expect(screenManager.getCurrentScreen()).toBe('game');
    });
    
    it('should transition from feedback to gameover when lives reach 0', () => {
      const gameState = {
        lives: 0,
        bossHealth: 50
      };
      
      screenManager.continueFromFeedback(gameState);
      expect(screenManager.getCurrentScreen()).toBe('gameover');
    });
    
    it('should transition from feedback to complete when boss is defeated', () => {
      const gameState = {
        lives: 2,
        bossHealth: 0
      };
      
      screenManager.continueFromFeedback(gameState);
      expect(screenManager.getCurrentScreen()).toBe('complete');
    });
    
    it('should return to menu from any screen', () => {
      screenManager.showScreen('game');
      screenManager.returnToMenu();
      expect(screenManager.getCurrentScreen()).toBe('menu');
    });
    
    it('should handle retry correctly', () => {
      const callback = vi.fn();
      screenManager.setOnRetry(callback);
      screenManager.gameState = { currentBoss: 1 };
      
      screenManager.retry();
      
      expect(callback).toHaveBeenCalledWith(1);
      expect(screenManager.getCurrentScreen()).toBe('game');
    });
  });
  
  describe('boss definitions', () => {
    it('should have exactly 3 bosses', () => {
      expect(BOSSES).toHaveLength(3);
    });
    
    it('should have correct unlock XP thresholds', () => {
      expect(BOSSES[0].unlockXP).toBe(0);
      expect(BOSSES[1].unlockXP).toBe(500);
      expect(BOSSES[2].unlockXP).toBe(1500);
    });
    
    it('should have correct level names', () => {
      expect(BOSSES[0].level).toBe('junior');
      expect(BOSSES[1].level).toBe('senior');
      expect(BOSSES[2].level).toBe('faang');
    });
  });
  
  describe('boss helper functions', () => {
    it('should get boss by ID', () => {
      const boss = getBossById(1);
      expect(boss).toBeDefined();
      expect(boss.id).toBe(1);
      expect(boss.name).toBe('Senior Engineer');
    });
    
    it('should get boss by level', () => {
      const boss = getBossByLevel('faang');
      expect(boss).toBeDefined();
      expect(boss.id).toBe(2);
      expect(boss.name).toBe('FAANG Boss');
    });
    
    it('should return undefined for invalid boss ID', () => {
      const boss = getBossById(999);
      expect(boss).toBeUndefined();
    });
    
    it('should return undefined for invalid level', () => {
      const boss = getBossByLevel('invalid');
      expect(boss).toBeUndefined();
    });
  });
});
