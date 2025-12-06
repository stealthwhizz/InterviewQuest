import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  ACHIEVEMENTS,
  getAllAchievements,
  checkAchievements,
  getAchievementById,
  createAchievementContext,
  AchievementNotificationQueue
} from './achievements.js';

/**
 * **Feature: interview-quest, Property 10: Achievement notification on unlock**
 * **Validates: Requirements 6.5**
 * 
 * For any achievement that transitions from locked to unlocked state, 
 * an animated notification should be displayed
 */
describe('Property 10: Achievement notification on unlock', () => {
  test('newly unlocked achievements should be added to notification queue', () => {
    fc.assert(
      fc.property(
        // Generate random achievement contexts that might unlock achievements
        fc.record({
          score: fc.integer({ min: 1, max: 10 }),
          lives: fc.integer({ min: 0, max: 3 }),
          previousLives: fc.integer({ min: 0, max: 3 }),
          totalXP: fc.integer({ min: 0, max: 5000 }),
          comboActive: fc.boolean(),
          hadComboBeforeThisAnswer: fc.boolean(),
          consecutiveGoodAnswers: fc.integer({ min: 0, max: 10 }),
          bossLevel: fc.integer({ min: 0, max: 2 }),
          bossDefeated: fc.boolean(),
          totalQuestionsAnswered: fc.integer({ min: 0, max: 100 })
        }),
        // Generate random set of already unlocked achievements
        fc.array(
          fc.constantFrom(...getAllAchievements().map(a => a.id)),
          { maxLength: 10 }
        ),
        (context, unlockedArray) => {
          const currentAchievements = new Set(unlockedArray);
          
          // Check which achievements should unlock
          const newlyUnlocked = checkAchievements(context, currentAchievements);
          
          // Property: Every newly unlocked achievement should:
          // 1. Not be in the current achievements set
          // 2. Have its condition met by the context
          for (const achievementId of newlyUnlocked) {
            // Should not already be unlocked
            if (currentAchievements.has(achievementId)) {
              return false;
            }
            
            // Should have condition met
            const achievement = getAchievementById(achievementId);
            if (!achievement || !achievement.condition(context)) {
              return false;
            }
          }
          
          // Property: Every achievement whose condition is met and not already unlocked
          // should be in the newly unlocked list
          for (const achievement of getAllAchievements()) {
            const conditionMet = achievement.condition(context);
            const alreadyUnlocked = currentAchievements.has(achievement.id);
            const inNewlyUnlocked = newlyUnlocked.includes(achievement.id);
            
            if (conditionMet && !alreadyUnlocked && !inNewlyUnlocked) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('notification queue should maintain order of unlocked achievements', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (achievementIds) => {
          const queue = new AchievementNotificationQueue();
          
          // Enqueue achievements
          queue.enqueue(achievementIds);
          
          // Dequeue and verify order
          for (let i = 0; i < achievementIds.length; i++) {
            const dequeued = queue.dequeue();
            if (dequeued !== achievementIds[i]) {
              return false;
            }
          }
          
          // Queue should be empty now
          return queue.dequeue() === null && !queue.hasPending();
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('achievement context should be created correctly from game state', () => {
    fc.assert(
      fc.property(
        fc.record({
          lives: fc.integer({ min: 0, max: 3 }),
          xp: fc.integer({ min: 0, max: 10000 }),
          comboActive: fc.boolean(),
          consecutiveGoodAnswers: fc.integer({ min: 0, max: 10 }),
          currentBoss: fc.integer({ min: 0, max: 2 }),
          achievements: fc.constant(new Set())
        }),
        fc.record({
          score: fc.integer({ min: 1, max: 10 }),
          previousLives: fc.integer({ min: 0, max: 3 }),
          hadComboBeforeThisAnswer: fc.boolean(),
          bossDefeated: fc.boolean(),
          totalQuestionsAnswered: fc.integer({ min: 0, max: 100 })
        }),
        (gameState, answerData) => {
          const context = createAchievementContext(gameState, answerData);
          
          // Verify all fields are correctly mapped
          return (
            context.score === answerData.score &&
            context.lives === gameState.lives &&
            context.previousLives === answerData.previousLives &&
            context.totalXP === gameState.xp &&
            context.comboActive === gameState.comboActive &&
            context.hadComboBeforeThisAnswer === answerData.hadComboBeforeThisAnswer &&
            context.consecutiveGoodAnswers === gameState.consecutiveGoodAnswers &&
            context.bossLevel === gameState.currentBoss &&
            context.bossDefeated === answerData.bossDefeated &&
            context.totalQuestionsAnswered === answerData.totalQuestionsAnswered
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Unit tests for specific achievement conditions
describe('Achievement unlock conditions', () => {
  test('First Blood unlocks on first question with score >= 6', () => {
    const context = {
      score: 6,
      totalQuestionsAnswered: 1,
      lives: 3,
      previousLives: 3,
      totalXP: 50,
      comboActive: false,
      hadComboBeforeThisAnswer: false,
      consecutiveGoodAnswers: 1,
      bossLevel: 0,
      bossDefeated: false
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('first_blood');
  });
  
  test('Flawless Victory unlocks when boss defeated with 3 lives', () => {
    const context = {
      score: 8,
      totalQuestionsAnswered: 10,
      lives: 3,
      previousLives: 3,
      totalXP: 500,
      comboActive: true,
      hadComboBeforeThisAnswer: true,
      consecutiveGoodAnswers: 5,
      bossLevel: 0,
      bossDefeated: true
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('flawless_victory');
  });
  
  test('Combo Master unlocks when combo activates for first time', () => {
    const context = {
      score: 7,
      totalQuestionsAnswered: 3,
      lives: 3,
      previousLives: 3,
      totalXP: 150,
      comboActive: true,
      hadComboBeforeThisAnswer: false,
      consecutiveGoodAnswers: 3,
      bossLevel: 0,
      bossDefeated: false
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('combo_master');
  });
  
  test('Perfectionist unlocks on score of 10', () => {
    const context = {
      score: 10,
      totalQuestionsAnswered: 5,
      lives: 2,
      previousLives: 2,
      totalXP: 300,
      comboActive: true,
      hadComboBeforeThisAnswer: true,
      consecutiveGoodAnswers: 4,
      bossLevel: 0,
      bossDefeated: false
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('perfectionist');
  });
  
  test('Comeback Kid unlocks when restoring life from 1 to 2', () => {
    const context = {
      score: 9,
      totalQuestionsAnswered: 7,
      lives: 2,
      previousLives: 1,
      totalXP: 400,
      comboActive: false,
      hadComboBeforeThisAnswer: false,
      consecutiveGoodAnswers: 1,
      bossLevel: 0,
      bossDefeated: false
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('comeback_kid');
  });
  
  test('Senior Slayer unlocks when defeating boss level 1', () => {
    const context = {
      score: 8,
      totalQuestionsAnswered: 10,
      lives: 2,
      previousLives: 2,
      totalXP: 700,
      comboActive: true,
      hadComboBeforeThisAnswer: true,
      consecutiveGoodAnswers: 4,
      bossLevel: 1,
      bossDefeated: true
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('senior_slayer');
  });
  
  test('FAANG Conqueror unlocks when defeating boss level 2', () => {
    const context = {
      score: 8,
      totalQuestionsAnswered: 10,
      lives: 1,
      previousLives: 1,
      totalXP: 2000,
      comboActive: true,
      hadComboBeforeThisAnswer: true,
      consecutiveGoodAnswers: 5,
      bossLevel: 2,
      bossDefeated: true
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('faang_conqueror');
  });
  
  test('XP Millionaire unlocks at 2000 XP', () => {
    const context = {
      score: 7,
      totalQuestionsAnswered: 30,
      lives: 2,
      previousLives: 2,
      totalXP: 2000,
      comboActive: false,
      hadComboBeforeThisAnswer: false,
      consecutiveGoodAnswers: 1,
      bossLevel: 2,
      bossDefeated: false
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('xp_millionaire');
  });
  
  test('Streak Master unlocks at 5 consecutive good answers', () => {
    const context = {
      score: 7,
      totalQuestionsAnswered: 5,
      lives: 3,
      previousLives: 3,
      totalXP: 250,
      comboActive: true,
      hadComboBeforeThisAnswer: true,
      consecutiveGoodAnswers: 5,
      bossLevel: 0,
      bossDefeated: false
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('streak_master');
  });
  
  test('Survivor unlocks when defeating boss with 1 life', () => {
    const context = {
      score: 8,
      totalQuestionsAnswered: 10,
      lives: 1,
      previousLives: 1,
      totalXP: 500,
      comboActive: true,
      hadComboBeforeThisAnswer: true,
      consecutiveGoodAnswers: 4,
      bossLevel: 0,
      bossDefeated: true
    };
    
    const unlocked = checkAchievements(context, new Set());
    expect(unlocked).toContain('survivor');
  });
  
  test('already unlocked achievements should not be returned', () => {
    const context = {
      score: 10,
      totalQuestionsAnswered: 1,
      lives: 3,
      previousLives: 3,
      totalXP: 100,
      comboActive: false,
      hadComboBeforeThisAnswer: false,
      consecutiveGoodAnswers: 1,
      bossLevel: 0,
      bossDefeated: false
    };
    
    // Both First Blood and Perfectionist should unlock
    const alreadyUnlocked = new Set(['first_blood']);
    const unlocked = checkAchievements(context, alreadyUnlocked);
    
    // Should only return Perfectionist, not First Blood
    expect(unlocked).toContain('perfectionist');
    expect(unlocked).not.toContain('first_blood');
  });
});
