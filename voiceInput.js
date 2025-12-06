/**
 * Voice Input Handler
 * Manages Web Speech API integration for voice-to-text transcription
 */

export class VoiceInputHandler {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    
    // Initialize Speech Recognition if supported
    this._initializeSpeechRecognition();
  }
  
  /**
   * Initialize the Speech Recognition API
   * @private
   */
  _initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }
    
    // Create recognition instance
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = false; // Stop after one result
    this.recognition.interimResults = false; // Only final results
    this.recognition.lang = 'en-US'; // Language
    this.recognition.maxAlternatives = 1; // Only one alternative
    
    // Set up event handlers
    this._setupEventHandlers();
  }
  
  /**
   * Set up event handlers for speech recognition
   * @private
   */
  _setupEventHandlers() {
    if (!this.recognition) return;
    
    // Handle successful transcription
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(transcript);
      }
    };
    
    // Handle recognition start
    this.recognition.onstart = () => {
      this.isRecording = true;
      
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };
    
    // Handle recognition end
    this.recognition.onend = () => {
      this.isRecording = false;
      
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
    
    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      this.isRecording = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };
  }
  
  /**
   * Check if Web Speech API is supported
   * @returns {boolean} True if supported, false otherwise
   */
  isSupported() {
    return this.recognition !== null;
  }
  
  /**
   * Start recording voice input
   * @throws {Error} If speech recognition is not supported or already recording
   */
  startRecording() {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported');
    }
    
    if (this.isRecording) {
      throw new Error('Already recording');
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }
  
  /**
   * Stop recording voice input
   */
  stopRecording() {
    if (!this.isSupported() || !this.isRecording) {
      return;
    }
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }
  
  /**
   * Set callback for when transcription is complete
   * @param {Function} callback - Function to call with transcript text
   */
  onTranscript(callback) {
    this.onTranscriptCallback = callback;
  }
  
  /**
   * Set callback for when recording starts
   * @param {Function} callback - Function to call when recording starts
   */
  onStart(callback) {
    this.onStartCallback = callback;
  }
  
  /**
   * Set callback for when recording ends
   * @param {Function} callback - Function to call when recording ends
   */
  onEnd(callback) {
    this.onEndCallback = callback;
  }
  
  /**
   * Set callback for errors
   * @param {Function} callback - Function to call with error message
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }
  
  /**
   * Get current recording status
   * @returns {boolean} True if currently recording
   */
  getIsRecording() {
    return this.isRecording;
  }
}
