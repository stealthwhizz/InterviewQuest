/**
 * Storage Manager for InterviewQuest
 * Handles localStorage persistence for game progress
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

const STORAGE_KEYS = {
  XP: 'interviewquest_xp',
  ACHIEVEMENTS: 'interviewquest_achievements',
  UNLOCKED_BOSSES: 'interviewquest_unlocked_bosses'
};

/**
 * Default values for initialization
 */
const DEFAULTS = {
  xp: 0,
  achievements: [],
  unlockedBosses: [0] // Junior Dev always unlocked
};

/**
 * Validate that a value is a non-negative number
 */
function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validate that a value is an array
 */
function isValidArray(value) {
  return Array.isArray(value);
}

/**
 * Save XP to localStorage
 * Requirements: 12.1
 */
export function saveXP(xp) {
  try {
    if (!isValidNumber(xp)) {
      throw new Error('Invalid XP value');
    }
    localStorage.setItem(STORAGE_KEYS.XP, JSON.stringify(xp));
    return true;
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else {
      console.error('Error saving XP:', error);
    }
    return false;
  }
}

/**
 * Load XP from localStorage
 * Returns default value if missing or corrupted
 * Requirements: 12.4
 */
export function loadXP() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.XP);
    if (stored === null) {
      return DEFAULTS.xp;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate loaded data
    if (!isValidNumber(parsed)) {
      console.warn('Corrupted XP data, using default');
      return DEFAULTS.xp;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading XP:', error);
    return DEFAULTS.xp;
  }
}

/**
 * Save achievements to localStorage
 * Requirements: 12.2
 */
export function saveAchievements(achievements) {
  try {
    // Convert Set to Array if needed
    const achievementsArray = achievements instanceof Set 
      ? Array.from(achievements) 
      : achievements;
    
    if (!isValidArray(achievementsArray)) {
      throw new Error('Invalid achievements value');
    }
    
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievementsArray));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else {
      console.error('Error saving achievements:', error);
    }
    return false;
  }
}

/**
 * Load achievements from localStorage
 * Returns default value if missing or corrupted
 * Requirements: 12.4
 */
export function loadAchievements() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (stored === null) {
      return DEFAULTS.achievements;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate loaded data
    if (!isValidArray(parsed)) {
      console.warn('Corrupted achievements data, using default');
      return DEFAULTS.achievements;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading achievements:', error);
    return DEFAULTS.achievements;
  }
}

/**
 * Save unlocked bosses to localStorage
 * Requirements: 12.3
 */
export function saveUnlockedBosses(unlockedBosses) {
  try {
    if (!isValidArray(unlockedBosses)) {
      throw new Error('Invalid unlocked bosses value');
    }
    
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_BOSSES, JSON.stringify(unlockedBosses));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else {
      console.error('Error saving unlocked bosses:', error);
    }
    return false;
  }
}

/**
 * Load unlocked bosses from localStorage
 * Returns default value if missing or corrupted
 * Requirements: 12.4
 */
export function loadUnlockedBosses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.UNLOCKED_BOSSES);
    if (stored === null) {
      return DEFAULTS.unlockedBosses;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate loaded data
    if (!isValidArray(parsed)) {
      console.warn('Corrupted unlocked bosses data, using default');
      return DEFAULTS.unlockedBosses;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading unlocked bosses:', error);
    return DEFAULTS.unlockedBosses;
  }
}

/**
 * Save complete game state
 */
export function saveGameState(state) {
  const xpSaved = saveXP(state.xp);
  const achievementsSaved = saveAchievements(state.achievements);
  const bossesSaved = saveUnlockedBosses(state.unlockedBosses || [0]);
  
  return xpSaved && achievementsSaved && bossesSaved;
}

/**
 * Load complete game state
 */
export function loadGameState() {
  return {
    xp: loadXP(),
    achievements: loadAchievements(),
    unlockedBosses: loadUnlockedBosses()
  };
}

/**
 * Clear all stored data
 */
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEYS.XP);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.UNLOCKED_BOSSES);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}
