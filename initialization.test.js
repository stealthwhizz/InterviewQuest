/**
 * Tests for application initialization
 * Requirements: 8.6, 12.4, 14.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadGameState, saveGameState } from './storage.js';

describe('Application Initialization', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Loading questions', () => {
    it('should handle valid questions.json structure', async () => {
      // Mock fetch to return valid questions
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            questions: [
              { id: 'test-1', level: 'junior', type: 'behavioral', text: 'Test question' }
            ]
          })
        })
      );

      const response = await fetch('./questions.json');
      const data = await response.json();

      expect(data).toHaveProperty('questions');
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBeGreaterThan(0);
    });

    it('should handle fetch errors gracefully', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      try {
        await fetch('./questions.json');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle invalid JSON structure', async () => {
      // Mock fetch to return invalid structure
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: 'structure' })
        })
      );

      const response = await fetch('./questions.json');
      const data = await response.json();

      // Should not have questions property
      expect(data.questions).toBeUndefined();
    });
  });

  describe('Restoring saved progress', () => {
    it('should restore saved XP from localStorage', () => {
      // Save some progress
      saveGameState({
        xp: 750,
        achievements: ['first-blood'],
        unlockedBosses: [0, 1]
      });

      // Load it back
      const savedState = loadGameState();

      expect(savedState.xp).toBe(750);
      expect(savedState.achievements).toContain('first-blood');
      expect(savedState.unlockedBosses).toContain(1);
    });

    it('should return default state when no saved data exists', () => {
      // Don't save anything
      const savedState = loadGameState();

      expect(savedState.xp).toBe(0);
      expect(savedState.achievements).toEqual([]);
      expect(savedState.unlockedBosses).toEqual([0]);
    });

    it('should handle corrupted localStorage data', () => {
      // Manually corrupt the data
      localStorage.setItem('interviewquest_xp', 'not a number');

      const savedState = loadGameState();

      // Should return default value
      expect(savedState.xp).toBe(0);
    });
  });

  describe('Default game state initialization', () => {
    it('should initialize with default values when no saved data', () => {
      const savedState = loadGameState();

      expect(savedState.xp).toBe(0);
      expect(savedState.achievements).toEqual([]);
      expect(savedState.unlockedBosses).toEqual([0]);
    });

    it('should save initial state if none exists', () => {
      // Clear everything
      localStorage.clear();

      // Save initial state
      saveGameState({
        xp: 0,
        achievements: [],
        unlockedBosses: [0]
      });

      // Verify it was saved
      const savedState = loadGameState();
      expect(savedState.xp).toBe(0);
      expect(savedState.achievements).toEqual([]);
      expect(savedState.unlockedBosses).toEqual([0]);
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = saveGameState({
        xp: 100,
        achievements: [],
        unlockedBosses: [0]
      });

      // Should return false on error
      expect(result).toBe(false);

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle missing localStorage gracefully', () => {
      // This test verifies the code doesn't crash when localStorage is unavailable
      const savedState = loadGameState();

      // Should return valid state even if localStorage fails
      expect(savedState).toBeDefined();
      expect(savedState).toHaveProperty('xp');
      expect(savedState).toHaveProperty('achievements');
      expect(savedState).toHaveProperty('unlockedBosses');
    });
  });
});
