/**
 * Vitest setup file for mocking browser APIs
 */

// Mock Canvas API for jsdom environment
class MockCanvasGradient {
  constructor() {
    this.colorStops = [];
  }
  
  addColorStop(offset, color) {
    this.colorStops.push({ offset, color });
  }
}

class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 1;
    this.font = '';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
  }

  fillRect() {}
  strokeRect() {}
  clearRect() {}
  fillText() {}
  strokeText() {}
  measureText(text) {
    return { width: text.length * 10 };
  }
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  arcTo() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  fill() {}
  stroke() {}
  save() {}
  restore() {}
  translate() {}
  rotate() {}
  scale() {}
  drawImage() {}
  clip() {}
  isPointInPath() { return false; }
  createLinearGradient(x0, y0, x1, y1) {
    return new MockCanvasGradient();
  }
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return new MockCanvasGradient();
  }
}

// Mock HTMLCanvasElement
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function(contextType) {
    if (contextType === '2d') {
      return new MockCanvasRenderingContext2D();
    }
    return null;
  };

  HTMLCanvasElement.prototype.toBlob = function(callback, type = 'image/png', quality = 0.92) {
    // Create a mock blob
    const blob = new Blob(['mock canvas data'], { type });
    setTimeout(() => callback(blob), 0);
  };

  HTMLCanvasElement.prototype.toDataURL = function(type = 'image/png', quality = 0.92) {
    return 'data:image/png;base64,mockbase64data';
  };
}

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof URL !== 'undefined') {
  if (!URL.createObjectURL) {
    URL.createObjectURL = function(blob) {
      return 'blob:mock-url-' + Math.random().toString(36).substring(7);
    };
  }
  
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = function(url) {
      // Mock implementation - does nothing
    };
  }
}
