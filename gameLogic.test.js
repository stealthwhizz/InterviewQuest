import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateBaseXP,
  updateCombo,
  calculateFinalXP,
  updateLives,
  getUnlockedBosses,
  updateBossHealth,
  isBossDefeated,
  isGameOver,
  createGameState,
  processAnswer
} from './gameLogic.js';

/**
 * **Feature: interview-quest, Property 2: XP calculation correctness**
 * **Validates: Requirements 4.1-4.8**
 * 
 * For any score value from 1-10, the base XP awarded should match the scoring table
 * (10→100, 9→75, 8→75, 7→50, 6→50, 5→25, 4→25, <4→0)
 */
describe('Property 2: XP calculation correctness', () => {
  test('base XP should match scoring table for all valid scores', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (score) => {
          const xp = calculateBaseXP(score);
          
          // Verify XP matches the requirements
          if (score === 10) return xp === 100;
          if (score === 9 || score === 8) return xp === 75;
          if (score === 7 || score === 6) return xp === 50;
          if (score === 5 || score === 4) return xp === 25;
          return xp === 0; // score < 4
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 3: Combo activation and XP multiplier**
 * **Validates: Requirements 5.1, 5.2**
 * 
 * For any sequence of scores, combo mode should activate after exactly 3 consecutive 
 * scores ≥6, and while active, all XP awards should be doubled
 */
describe('Property 3: Combo activation and XP multiplier', () => {
  test('combo should activate after 3 consecutive scores >= 6', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 20 }),
        (scores) => {
          let state = createGameState();
          
          for (let i = 0; i < scores.length; i++) {
            const score = scores[i];
            state = updateCombo(state, score);
            
            // Count consecutive good answers up to this point
            let consecutiveCount = 0;
            for (let j = i; j >= 0 && scores[j] >= 6; j--) {
              consecutiveCount++;
            }
            
            // Combo should be active if we have 3+ consecutive good answers
            const shouldBeActive = consecutiveCount >= 3;
            
            if (state.comboActive !== shouldBeActive) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('XP should be doubled when combo is active', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.boolean(),
        (score, comboActive) => {
          const baseXP = calculateBaseXP(score);
          const finalXP = calculateFinalXP(baseXP, comboActive);
          
          if (comboActive) {
            return finalXP === baseXP * 2;
          } else {
            return finalXP === baseXP;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 4: Combo deactivation on low score**
 * **Validates: Requirements 5.4**
 * 
 * For any active combo state, receiving a score below 6 should deactivate combo mode 
 * and reset the consecutive counter to 0
 */
describe('Property 4: Combo deactivation on low score', () => {
  test('combo should deactivate and reset counter on score < 6', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // Low score
        fc.integer({ min: 0, max: 10 }), // Previous consecutive count
        (lowScore, prevConsecutive) => {
          const state = {
            consecutiveGoodAnswers: prevConsecutive,
            comboActive: prevConsecutive >= 3
          };
          
          const newState = updateCombo(state, lowScore);
          
          // After a low score, combo should be inactive and counter reset
          return newState.comboActive === false && 
                 newState.consecutiveGoodAnswers === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 5: Lives decrease on poor performance**
 * **Validates: Requirements 3.2**
 * 
 * For any score below 4, the player's lives should decrease by exactly 1 
 * (unless already at 0)
 */
describe('Property 5: Lives decrease on poor performance', () => {
  test('lives should decrease by 1 on score < 4', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }), // Current lives
        fc.integer({ min: 1, max: 3 }), // Low score
        (currentLives, score) => {
          const newLives = updateLives(currentLives, score);
          
          // Lives should decrease by 1, but not go below 0
          const expected = Math.max(0, currentLives - 1);
          return newLives === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 6: Lives restoration with cap**
 * **Validates: Requirements 3.3**
 * 
 * For any score of 9 or 10, the player's lives should increase by 1, 
 * but never exceed the maximum of 3
 */
describe('Property 6: Lives restoration with cap', () => {
  test('lives should increase by 1 on score 9-10, capped at 3', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }), // Current lives
        fc.constantFrom(9, 10), // High score
        (currentLives, score) => {
          const newLives = updateLives(currentLives, score);
          
          // Lives should increase by 1, but cap at 3
          const expected = Math.min(3, currentLives + 1);
          return newLives === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 1: Boss unlock based on XP thresholds**
 * **Validates: Requirements 2.2, 2.3, 2.4**
 * 
 * For any XP value, the system should unlock exactly the bosses whose unlock 
 * requirements are met (Junior Dev always, Senior Engineer at 500+, FAANG Boss at 1500+)
 */
describe('Property 1: Boss unlock based on XP thresholds', () => {
  test('correct bosses should be unlocked based on XP thresholds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        (xp) => {
          const unlocked = getUnlockedBosses(xp);
          
          // Junior Dev (0) should always be unlocked
          if (!unlocked.includes(0)) return false;
          
          // Senior Engineer (1) should be unlocked at 500+ XP
          const shouldHaveSenior = xp >= 500;
          const hasSenior = unlocked.includes(1);
          if (shouldHaveSenior !== hasSenior) return false;
          
          // FAANG Boss (2) should be unlocked at 1500+ XP
          const shouldHaveFaang = xp >= 1500;
          const hasFaang = unlocked.includes(2);
          if (shouldHaveFaang !== hasFaang) return false;
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 8: Boss health decrease on good answers**
 * **Validates: Requirements 9.2, 9.3**
 * 
 * For any score of 6 or higher, the boss health should decrease proportionally, 
 * and when health reaches 0, the level should complete
 */
describe('Property 8: Boss health decrease on good answers', () => {
  test('boss health should decrease proportionally on score >= 6', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }), // Current health
        fc.integer({ min: 6, max: 10 }), // Good score
        fc.integer({ min: 5, max: 15 }), // Total questions
        (currentHealth, score, totalQuestions) => {
          const newHealth = updateBossHealth(currentHealth, score, totalQuestions);
          
          // Health should decrease by (100 / totalQuestions)
          const expectedDamage = 100 / totalQuestions;
          const expectedHealth = Math.max(0, currentHealth - expectedDamage);
          
          // Allow small floating point differences
          return Math.abs(newHealth - expectedHealth) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('boss health should not decrease on score < 6', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }), // Current health
        fc.integer({ min: 1, max: 5 }), // Low score
        (currentHealth, score) => {
          const newHealth = updateBossHealth(currentHealth, score);
          
          // Health should remain unchanged
          return newHealth === currentHealth;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('boss health should never go below 0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.integer({ min: 6, max: 10 }),
        (currentHealth, score) => {
          const newHealth = updateBossHealth(currentHealth, score);
          return newHealth >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('boss is defeated when health reaches 0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        (health) => {
          const defeated = isBossDefeated(health);
          return defeated === (health <= 0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: interview-quest, Property 7: Game over on zero lives**
 * **Validates: Requirements 3.4**
 * 
 * For any game state where lives reach 0, the session should immediately end 
 * and transition to the game over screen
 */
describe('Property 7: Game over on zero lives', () => {
  test('game should be over when lives reach 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        (lives) => {
          const gameOver = isGameOver(lives);
          return gameOver === (lives <= 0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
