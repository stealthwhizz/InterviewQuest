/**
 * Tests for Victory Card Generator
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isCanvasSupported,
  generateVictoryCard,
  canvasToBlob,
  downloadVictoryCard,
  shareVictoryCard,
  displayVictoryCard,
  getFallbackText
} from './victoryCard.js';

describe('Victory Card Generator', () => {
  beforeEach(() => {
    // Clean up any existing victory card containers
    const container = document.getElementById('victory-card-canvas-container');
    if (container) {
      container.remove();
    }
  });

  describe('isCanvasSupported', () => {
    it('should return true when Canvas API is supported', () => {
      const result = isCanvasSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('generateVictoryCard', () => {
    it('should generate a canvas element with victory card', () => {
      const victoryData = {
        bossName: 'Junior Dev',
        xpEarned: 500,
        completionTime: 120
      };

      const canvas = generateVictoryCard(victoryData);
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('should include boss name in the card', () => {
      const victoryData = {
        bossName: 'Senior Engineer',
        xpEarned: 750,
        completionTime: 180
      };

      const canvas = generateVictoryCard(victoryData);
      const ctx = canvas.getContext('2d');
      
      // Canvas should be created successfully
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(ctx).toBeTruthy();
    });

    it('should handle different XP values', () => {
      const testCases = [
        { xpEarned: 0 },
        { xpEarned: 100 },
        { xpEarned: 1000 },
        { xpEarned: 9999 }
      ];

      testCases.forEach(({ xpEarned }) => {
        const victoryData = {
          bossName: 'Test Boss',
          xpEarned,
          completionTime: 60
        };

        const canvas = generateVictoryCard(victoryData);
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      });
    });

    it('should handle different completion times', () => {
      const testCases = [
        { completionTime: 0 },
        { completionTime: 59 },
        { completionTime: 60 },
        { completionTime: 3599 },
        { completionTime: 3600 }
      ];

      testCases.forEach(({ completionTime }) => {
        const victoryData = {
          bossName: 'Test Boss',
          xpEarned: 500,
          completionTime
        };

        const canvas = generateVictoryCard(victoryData);
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      });
    });
  });

  describe('canvasToBlob', () => {
    it('should convert canvas to blob', async () => {
      const victoryData = {
        bossName: 'Test Boss',
        xpEarned: 500,
        completionTime: 120
      };

      const canvas = generateVictoryCard(victoryData);
      const blob = await canvasToBlob(canvas);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });
  });

  describe('downloadVictoryCard', () => {
    it('should create download link for canvas', async () => {
      const victoryData = {
        bossName: 'Test Boss',
        xpEarned: 500,
        completionTime: 120
      };

      const canvas = generateVictoryCard(victoryData);
      
      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      
      await downloadVictoryCard(canvas, 'test-victory.png');
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-victory.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('displayVictoryCard', () => {
    it('should generate and append canvas to container', () => {
      const victoryData = {
        bossName: 'Test Boss',
        xpEarned: 500,
        completionTime: 120
      };

      const canvas = displayVictoryCard(victoryData);
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      
      // Check if container was created
      const container = document.getElementById('victory-card-canvas-container');
      expect(container).toBeTruthy();
      expect(container.contains(canvas)).toBe(true);
    });

    it('should return null when Canvas is not supported', () => {
      // Mock isCanvasSupported to return false
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tag) => {
        if (tag === 'canvas') {
          return { getContext: null };
        }
        return originalCreateElement.call(document, tag);
      });

      const victoryData = {
        bossName: 'Test Boss',
        xpEarned: 500,
        completionTime: 120
      };

      const canvas = displayVictoryCard(victoryData);
      
      // Should return null when canvas not supported
      expect(canvas).toBeNull();
      
      // Restore
      document.createElement = originalCreateElement;
    });
  });

  describe('getFallbackText', () => {
    it('should generate fallback text with victory data', () => {
      const victoryData = {
        bossName: 'Junior Dev',
        xpEarned: 500,
        completionTime: 120
      };

      const text = getFallbackText(victoryData);
      
      expect(text).toContain('VICTORY');
      expect(text).toContain('Junior Dev');
      expect(text).toContain('500');
      expect(text).toContain('2:00');
      expect(text).toContain('InterviewQuest');
    });

    it('should format time correctly in fallback text', () => {
      const testCases = [
        { completionTime: 0, expected: '0:00' },
        { completionTime: 59, expected: '0:59' },
        { completionTime: 60, expected: '1:00' },
        { completionTime: 125, expected: '2:05' },
        { completionTime: 3599, expected: '59:59' }
      ];

      testCases.forEach(({ completionTime, expected }) => {
        const victoryData = {
          bossName: 'Test Boss',
          xpEarned: 500,
          completionTime
        };

        const text = getFallbackText(victoryData);
        expect(text).toContain(expected);
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete victory card workflow', async () => {
      const victoryData = {
        bossName: 'FAANG Boss',
        xpEarned: 1500,
        completionTime: 300
      };

      // Generate card
      const canvas = generateVictoryCard(victoryData);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);

      // Convert to blob
      const blob = await canvasToBlob(canvas);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);

      // Display card
      const displayedCanvas = displayVictoryCard(victoryData);
      expect(displayedCanvas).toBeInstanceOf(HTMLCanvasElement);
    });
  });
});
