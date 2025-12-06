# Implementation Plan

- [x] 1. Create project structure and questions data





  - Create directory structure (lambda folder)
  - Create questions.json with 30 interview questions (10 per level: behavioral, technical, system design)
  - Ensure questions are properly categorized by level (junior, senior, faang) and type
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 1.1 Write property test for question type diversity


  - **Property 9: Question type diversity per level**
  - **Validates: Requirements 8.5**

- [x] 2. Implement core game state and logic functions





  - Create game state object structure (lives, XP, combo, boss health, achievements)
  - Implement XP calculation function based on score (1-10 mapping to XP values)
  - Implement combo tracking and activation logic (3 consecutive scores ≥6)
  - Implement lives management (decrease on score <4, restore on score 9-10, cap at 3)
  - Implement boss unlock logic based on XP thresholds (500, 1500)
  - Implement boss health calculation and decrease logic
  - _Requirements: 3.1, 3.2, 3.3, 4.1-4.8, 5.1, 5.4, 2.2, 2.3, 2.4, 9.1, 9.2_

- [x] 2.1 Write property test for XP calculation


  - **Property 2: XP calculation correctness**
  - **Validates: Requirements 4.1-4.8**

- [x] 2.2 Write property test for combo activation and multiplier



  - **Property 3: Combo activation and XP multiplier**
  - **Validates: Requirements 5.1, 5.2**


- [x] 2.3 Write property test for combo deactivation


  - **Property 4: Combo deactivation on low score**
  - **Validates: Requirements 5.4**

- [x] 2.4 Write property test for lives decrease

  - **Property 5: Lives decrease on poor performance**
  - **Validates: Requirements 3.2**

- [x] 2.5 Write property test for lives restoration

  - **Property 6: Lives restoration with cap**
  - **Validates: Requirements 3.3**

- [x] 2.6 Write property test for boss unlock thresholds

  - **Property 1: Boss unlock based on XP thresholds**
  - **Validates: Requirements 2.2, 2.3, 2.4**


- [x] 2.7 Write property test for boss health decrease


  - **Property 8: Boss health decrease on good answers**
  - **Validates: Requirements 9.2, 9.3**

- [x] 3. Implement localStorage persistence layer





  - Create storage manager functions (save/load XP, achievements, unlocked bosses)
  - Implement data validation for loaded data
  - Implement default initialization for missing/corrupted data
  - Add error handling for quota exceeded scenarios
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3.1 Write property test for localStorage round-trip


  - **Property 11: localStorage persistence round-trip**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [x] 4. Implement achievement system





  - Define all 10 achievements with unlock conditions (First Blood, Flawless Victory, Combo Master, etc.)
  - Implement achievement checking logic after each answer
  - Implement achievement unlock notification system
  - Integrate achievement persistence with storage manager
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 4.1 Write property test for achievement notifications


  - **Property 10: Achievement notification on unlock**
  - **Validates: Requirements 6.5**

- [x] 5. Create HTML structure with all five screens





  - Create single index.html file with semantic structure
  - Implement menu screen (start game, achievements, instructions buttons)
  - Implement game screen (question display, answer input, voice button, lives, XP bar, boss health, combo indicator)
  - Implement feedback screen (score, strengths, improvements, motivation, XP earned, continue button)
  - Implement complete screen (victory card, stats, share button, return to menu)
  - Implement game over screen (stats, retry button, return to menu)
  - Add screen visibility toggle logic
  - _Requirements: 1.1, 1.3, 1.5, 14.3_

- [x] 6. Implement CSS styling and animations





  - Apply dark theme colors (#0f1419 background, #e8e9ed text)
  - Style all UI components (buttons, progress bars, health bars, hearts)
  - Implement smooth transitions for all interactive elements
  - Create keyframe animations for combo activation (fire effects)
  - Create keyframe animations for achievement notifications
  - Create animations for life lost/gained
  - Implement responsive design for mobile and desktop
  - Style boss health bar with smooth transitions
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 3.5, 5.3, 9.4, 14.1_

- [x] 7. Implement screen manager and navigation





  - Create screen manager to handle transitions between screens
  - Implement menu screen navigation (start game based on XP, view achievements)
  - Implement game flow (game → feedback → game/complete/gameOver)
  - Implement return to menu functionality from all end screens
  - Add boss level selection based on unlocked status
  - _Requirements: 1.1, 1.2, 1.5, 2.5_

- [x] 8. Implement game session logic





  - Initialize game session with selected boss level
  - Load and shuffle questions for the selected difficulty
  - Implement question progression through session
  - Track session statistics (questions answered, XP earned, lives remaining)
  - Implement session end conditions (boss defeated, lives depleted)
  - _Requirements: 1.3, 3.1, 3.4, 8.7, 9.1, 9.3_

- [x] 8.1 Write property test for game over condition


  - **Property 7: Game over on zero lives**
  - **Validates: Requirements 3.4**

- [x] 9. Implement AWS Lambda backend function





  - Create evaluator.py Lambda function
  - Implement request validation (question, answer, difficulty parameters)
  - Construct Bedrock prompt with difficulty-based evaluation criteria
  - Integrate with AWS Bedrock Claude 3 Sonnet model
  - Parse and validate Bedrock JSON response
  - Return structured response (score, strengths, improvements, motivation)
  - Implement error handling for API failures and invalid responses
  - _Requirements: 7.2, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 9.1 Write property test for Lambda request structure


  - **Property 12: API request structure**
  - **Validates: Requirements 7.1, 15.1**

- [x] 9.2 Write property test for Lambda response structure

  - **Property 13: Lambda response structure**
  - **Validates: Requirements 7.3, 7.4, 7.5, 7.6, 15.5**

- [x] 9.3 Write property test for difficulty-based prompt variation

  - **Property 14: Difficulty-based prompt variation**
  - **Validates: Requirements 15.3**

- [x] 10. Implement API client in frontend





  - Create API client class for Lambda communication
  - Implement answer evaluation request with proper payload structure
  - Handle API responses and errors
  - Implement retry logic for failed requests
  - Display user-friendly error messages for network failures
  - Add loading indicators during API calls
  - _Requirements: 1.4, 7.1, 7.3, 7.4, 7.5, 7.6_

- [x] 11. Integrate answer submission and feedback flow








  - Connect answer input to submission handler
  - Send answer to Lambda via API client
  - Process returned score and feedback
  - Update game state (XP, lives, combo, boss health, achievements)
  - Display feedback screen with all components
  - Implement continue button to return to game or show end screen
  - _Requirements: 1.4, 7.7, 5.2_

- [x] 12. Implement UI rendering and updates





  - Create functions to render lives as heart icons
  - Create XP progress bar with visual updates
  - Create boss health bar with smooth animations
  - Create combo indicator with consecutive count display
  - Implement dynamic question rendering
  - Implement feedback display with all components
  - Update all UI elements reactively based on game state changes
  - _Requirements: 3.5, 4.9, 5.5, 9.4, 9.5, 7.7_

- [x] 13. Implement Web Speech API integration





  - Create voice input handler class
  - Check browser compatibility and hide button if unsupported
  - Implement microphone activation on button click
  - Display visual indicator during recording
  - Implement speech-to-text transcription
  - Populate answer input field with transcribed text
  - Handle errors and permission denials gracefully
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 13.1 Write property test for voice transcription integration


  - **Property 15: Voice transcription integration**
  - **Validates: Requirements 10.5**

- [x] 14. Implement victory card generation and sharing




  - Create victory card generator using Canvas API
  - Include boss name, XP earned, and completion time in card
  - Implement share button functionality
  - Enable card download as image
  - Add fallback for browsers without Canvas support
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 15. Implement achievements screen





  - Display all 10 achievements with icons
  - Show locked/unlocked states visually
  - Display achievement descriptions
  - Add progress indicators for partially completed achievements
  - Implement return to menu navigation
  - _Requirements: 6.7_

- [x] 16. Initialize application and load game data





  - Implement application initialization on page load
  - Load questions.json via fetch API
  - Restore saved progress from localStorage
  - Initialize default game state if no saved data
  - Handle errors in data loading gracefully
  - Display menu screen after initialization
  - _Requirements: 8.6, 12.4, 14.4_

- [x] 17. Final integration and polish





  - Ensure all screens are embedded in single HTML file
  - Verify all CSS is embedded in style tags
  - Verify all JavaScript is embedded in script tags
  - Remove any TODO comments or placeholder code
  - Test all game flows end-to-end
  - Verify localStorage persistence across page refreshes
  - Test responsive design on mobile and desktop
  - Verify all animations are smooth
  - _Requirements: 14.1, 14.2, 14.3, 14.5, 13.5_

- [x] 18. Create deployment documentation




  - Write README.md with project overview
  - Document AWS setup instructions (Lambda, API Gateway, Bedrock permissions)
  - Document local testing instructions
  - Document deployment steps for S3/CloudFront
  - Include environment variable configuration
  - Add troubleshooting section
  - _Requirements: All_

- [x] 19. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
