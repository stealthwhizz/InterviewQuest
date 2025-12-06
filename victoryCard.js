/**
 * Victory Card Generator for InterviewQuest
 * Generates shareable victory cards using Canvas API
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

/**
 * Check if Canvas API is supported
 * Requirements: 11.4
 * @returns {boolean} True if Canvas is supported
 */
export function isCanvasSupported() {
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext && canvas.getContext('2d'));
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Generate victory card as canvas element
 * Requirements: 11.1, 11.2
 * @param {Object} victoryData - Victory data object
 * @param {string} victoryData.bossName - Name of defeated boss
 * @param {number} victoryData.xpEarned - XP earned in session
 * @param {number} victoryData.completionTime - Time in seconds
 * @returns {HTMLCanvasElement} Canvas element with victory card
 */
export function generateVictoryCard(victoryData) {
  if (!isCanvasSupported()) {
    throw new Error('Canvas API not supported');
  }
  
  const { bossName, xpEarned, completionTime } = victoryData;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1a73e8');
  gradient.addColorStop(1, '#4a9eff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < canvas.width; i += 40) {
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.fillRect(i, j, 20, 20);
    }
  }
  
  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎉 VICTORY! 🎉', canvas.width / 2, 100);
  
  // Boss name
  ctx.font = 'bold 48px "Segoe UI", sans-serif';
  ctx.fillText(bossName + ' Defeated!', canvas.width / 2, 200);
  
  // Stats container background
  ctx.fillStyle = 'rgba(15, 20, 25, 0.7)';
  // Draw rounded rectangle manually for better browser compatibility
  const x = 100;
  const y = 280;
  const width = canvas.width - 200;
  const height = 240;
  const radius = 20;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  
  // XP Earned
  ctx.fillStyle = '#4a9eff';
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.fillText('XP EARNED', canvas.width / 2, 340);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px "Segoe UI", sans-serif';
  ctx.fillText(xpEarned.toString(), canvas.width / 2, 410);
  
  // Completion time
  ctx.fillStyle = '#e8e9ed';
  ctx.font = '28px "Segoe UI", sans-serif';
  ctx.fillText('Time: ' + formatTime(completionTime), canvas.width / 2, 480);
  
  // Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillText('InterviewQuest', canvas.width / 2, 560);
  
  return canvas;
}

/**
 * Convert canvas to blob for downloading/sharing
 * Requirements: 11.3, 11.4
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Promise<Blob>} Promise resolving to image blob
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Download victory card as image
 * Requirements: 11.4
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} filename - Filename for download
 */
export async function downloadVictoryCard(canvas, filename = 'interviewquest-victory.png') {
  try {
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download victory card:', error);
    throw error;
  }
}

/**
 * Share victory card using Web Share API (if available)
 * Requirements: 11.3
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} victoryData - Victory data for share text
 * @returns {Promise<boolean>} True if shared successfully
 */
export async function shareVictoryCard(canvas, victoryData) {
  // Check if Web Share API is supported
  if (!navigator.share) {
    // Fallback to download
    await downloadVictoryCard(canvas);
    return false;
  }
  
  try {
    const blob = await canvasToBlob(canvas);
    const file = new File([blob], 'interviewquest-victory.png', { type: 'image/png' });
    
    // Check if files can be shared
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      // Fallback to download
      await downloadVictoryCard(canvas);
      return false;
    }
    
    const shareData = {
      title: 'InterviewQuest Victory!',
      text: `I defeated ${victoryData.bossName} and earned ${victoryData.xpEarned} XP in InterviewQuest! 🎉`,
      files: [file]
    };
    
    await navigator.share(shareData);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if (error.name === 'AbortError') {
      console.log('Share cancelled by user');
      return false;
    }
    
    console.error('Failed to share victory card:', error);
    // Fallback to download
    await downloadVictoryCard(canvas);
    return false;
  }
}

/**
 * Generate and display victory card in a modal/overlay
 * Requirements: 11.1, 11.2
 * @param {Object} victoryData - Victory data object
 * @returns {HTMLCanvasElement} Generated canvas element
 */
export function displayVictoryCard(victoryData) {
  if (!isCanvasSupported()) {
    console.warn('Canvas not supported, skipping victory card generation');
    return null;
  }
  
  try {
    const canvas = generateVictoryCard(victoryData);
    
    // Find or create container for canvas
    let container = document.getElementById('victory-card-canvas-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'victory-card-canvas-container';
      container.style.display = 'none';
      document.body.appendChild(container);
    }
    
    // Clear previous canvas
    container.innerHTML = '';
    
    // Add canvas to container
    container.appendChild(canvas);
    
    return canvas;
  } catch (error) {
    console.error('Failed to generate victory card:', error);
    return null;
  }
}

/**
 * Get fallback text for browsers without Canvas support
 * Requirements: 11.4
 * @param {Object} victoryData - Victory data object
 * @returns {string} Fallback text
 */
export function getFallbackText(victoryData) {
  return `🎉 VICTORY! 🎉\n\n${victoryData.bossName} Defeated!\n\nXP Earned: ${victoryData.xpEarned}\nTime: ${formatTime(victoryData.completionTime)}\n\nInterviewQuest`;
}
