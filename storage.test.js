import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  saveXP,
  loadXP,
  saveAchievements,
  loadAchievements,
  saveUnlockedBosses,
  loadUnlockedBosses,
  saveGameState,
  loadGameState,
  clearAll
} from './storage.js';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace global localStorage with mock
global.localStorage = localStorageMock;

beforeEach(() => {
  localStorage.clear();
});

/**
 * **Feature: interview-quest, Property 11: localStorage persistence round-trip**
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
 * 
 * For any game state (XP, achievements, unlocked bosses), saving to localStorage 
 * and then loading should restore the exact same state
 */
describe('Property 11: localStorage persistence round-trip', () => {
  test('XP should round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        (xp) => {
          // Clear storage before test
          clearAll();
          
          // Save XP
          const saved = saveXP(xp);
          if (!saved) return false;
          
          // Load XP
          const loaded = loadXP();
          
          // Should match exactly
          return loaded === xp;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('achievements should round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 20 }),
        (achievements) => {
          // Clear storage before test
          clearAll();
          
          // Save achievements
          const saved = saveAchievements(achievements);
          if (!saved) return false;
          
          // Load achievements
          const loaded = loadAchievements();
          
          // Should match exactly (order and content)
          if (loaded.length !== achievements.length) return false;
          
          for (let i = 0; i < achievements.length; i++) {
            if (loaded[i] !== achievements[i]) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('achievements as Set should round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 20 }),
        (achievementsArray) => {
          // Clear storage before test
          clearAll();
          
          // Create Set from array
          const achievements = new Set(achievementsArray);
          
          // Save achievements (Set)
          const saved = saveAchievements(achievements);
          if (!saved) return false;
          
          // Load achievements (returns Array)
          const loaded = loadAchievements();
          
          // Convert loaded back to Set for comparison
          const loadedSet = new Set(loaded);
          
          // Should have same size and same elements
          if (loadedSet.size !== achievements.size) return false;
          
          for (const item of achievements) {
            if (!loadedSet.has(item)) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('unlocked bosses should round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 2 }), { minLength: 1, maxLength: 3 }),
        (unlockedBosses) => {
          // Clear storage before test
          clearAll();
          
          // Save unlocked bosses
          const saved = saveUnlockedBosses(unlockedBosses);
          if (!saved) return false;
          
          // Load unlocked bosses
          const loaded = loadUnlockedBosses();
          
          // Should match exactly (order and content)
          if (loaded.length !== unlockedBosses.length) return false;
          
          for (let i = 0; i < unlockedBosses.length; i++) {
            if (loaded[i] !== unlockedBosses[i]) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('complete game state should round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          xp: fc.integer({ min: 0, max: 10000 }),
          achievements: fc.array(fc.string(), { maxLength: 20 }),
          unlockedBosses: fc.array(fc.integer({ min: 0, max: 2 }), { minLength: 1, maxLength: 3 })
        }),
        (gameState) => {
          // Clear storage before test
          clearAll();
          
          // Save complete state
          const saved = saveGameState(gameState);
          if (!saved) return false;
          
          // Load complete state
          const loaded = loadGameState();
          
          // Verify XP
          if (loaded.xp !== gameState.xp) return false;
          
          // Verify achievements
          if (loaded.achievements.length !== gameState.achievements.length) return false;
          for (let i = 0; i < gameState.achievements.length; i++) {
            if (loaded.achievements[i] !== gameState.achievements[i]) return false;
          }
          
          // Verify unlocked bosses
          if (loaded.unlockedBosses.length !== gameState.unlockedBosses.length) return false;
          for (let i = 0; i < gameState.unlockedBosses.length; i++) {
            if (loaded.unlockedBosses[i] !== gameState.unlockedBosses[i]) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('loading missing data should return defaults', () => {
    // Clear all storage
    clearAll();
    
    // Load without saving anything
    const xp = loadXP();
    const achievements = loadAchievements();
    const unlockedBosses = loadUnlockedBosses();
    
    // Should return default values
    expect(xp).toBe(0);
    expect(achievements).toEqual([]);
    expect(unlockedBosses).toEqual([0]);
  });
  
  test('loading corrupted data should return defaults', () => {
    // Manually corrupt the data
    localStorage.setItem('interviewquest_xp', 'not a number');
    localStorage.setItem('interviewquest_achievements', '{invalid json}');
    localStorage.setItem('interviewquest_unlocked_bosses', 'not an array');
    
    // Load corrupted data
    const xp = loadXP();
    const achievements = loadAchievements();
    const unlockedBosses = loadUnlockedBosses();
    
    // Should return default values
    expect(xp).toBe(0);
    expect(achievements).toEqual([]);
    expect(unlockedBosses).toEqual([0]);
  });
});
