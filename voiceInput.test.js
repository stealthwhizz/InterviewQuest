import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { VoiceInputHandler } from './voiceInput.js';

/**
 * **Feature: interview-quest, Property 15: Voice transcription integration**
 * **Validates: Requirements 10.5**
 * 
 * For any completed voice transcription, the transcribed text should populate 
 * the answer input field
 */
describe('Property 15: Voice transcription integration', () => {
  let voiceHandler;
  let mockRecognition;
  
  beforeEach(() => {
    // Mock the SpeechRecognition API
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: '',
      maxAlternatives: 1,
      onresult: null,
      onstart: null,
      onend: null,
      onerror: null,
      start: vi.fn(),
      stop: vi.fn()
    };
    
    // Mock window.SpeechRecognition
    global.window = global.window || {};
    global.window.SpeechRecognition = vi.fn(() => mockRecognition);
    
    voiceHandler = new VoiceInputHandler();
  });
  
  test('transcribed text should trigger onTranscript callback', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }), // Random transcript text
        (transcript) => {
          // Set up callback to capture transcribed text
          let capturedText = null;
          voiceHandler.onTranscript((text) => {
            capturedText = text;
          });
          
          // Simulate speech recognition result
          const mockEvent = {
            results: [
              [
                { transcript: transcript }
              ]
            ]
          };
          
          // Trigger the onresult handler
          mockRecognition.onresult(mockEvent);
          
          // Verify the callback was called with the correct transcript
          return capturedText === transcript;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('voice input should be supported when SpeechRecognition exists', () => {
    expect(voiceHandler.isSupported()).toBe(true);
  });
  
  test('voice input should not be supported when SpeechRecognition is missing', () => {
    // Create handler without SpeechRecognition
    delete global.window.SpeechRecognition;
    delete global.window.webkitSpeechRecognition;
    
    const handler = new VoiceInputHandler();
    expect(handler.isSupported()).toBe(false);
  });
  
  test('startRecording should set isRecording to true', () => {
    voiceHandler.startRecording();
    
    // Simulate onstart event
    mockRecognition.onstart();
    
    expect(voiceHandler.getIsRecording()).toBe(true);
  });
  
  test('stopRecording should set isRecording to false', () => {
    voiceHandler.startRecording();
    mockRecognition.onstart();
    
    voiceHandler.stopRecording();
    mockRecognition.onend();
    
    expect(voiceHandler.getIsRecording()).toBe(false);
  });
  
  test('onStart callback should be triggered when recording starts', () => {
    let startCalled = false;
    voiceHandler.onStart(() => {
      startCalled = true;
    });
    
    voiceHandler.startRecording();
    mockRecognition.onstart();
    
    expect(startCalled).toBe(true);
  });
  
  test('onEnd callback should be triggered when recording ends', () => {
    let endCalled = false;
    voiceHandler.onEnd(() => {
      endCalled = true;
    });
    
    voiceHandler.startRecording();
    mockRecognition.onstart();
    mockRecognition.onend();
    
    expect(endCalled).toBe(true);
  });
  
  test('onError callback should be triggered on recognition error', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('not-allowed', 'no-speech', 'audio-capture', 'network', 'aborted'),
        (errorType) => {
          let capturedError = null;
          voiceHandler.onError((error) => {
            capturedError = error;
          });
          
          // Simulate error event
          const mockErrorEvent = {
            error: errorType
          };
          
          mockRecognition.onerror(mockErrorEvent);
          
          return capturedError === errorType;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('startRecording should throw error if not supported', () => {
    delete global.window.SpeechRecognition;
    delete global.window.webkitSpeechRecognition;
    
    const handler = new VoiceInputHandler();
    
    expect(() => handler.startRecording()).toThrow('Speech recognition not supported');
  });
  
  test('startRecording should throw error if already recording', () => {
    voiceHandler.startRecording();
    mockRecognition.onstart();
    
    expect(() => voiceHandler.startRecording()).toThrow('Already recording');
  });
});
