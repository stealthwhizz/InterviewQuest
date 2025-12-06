# Design Document

## Overview

InterviewQuest is a single-page application (SPA) that combines game mechanics with AI-powered interview evaluation. The architecture follows a client-heavy design where the frontend handles all game logic, state management, and UI rendering, while the backend provides a single serverless endpoint for AI evaluation via AWS Bedrock.

The application uses a state machine pattern to manage screen transitions (menu → game → feedback → complete/game-over → menu), with localStorage providing persistence across sessions. The game engine implements a tick-based update loop for animations and a scoring system that drives XP, lives, combos, and achievements.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              index.html (SPA)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   UI Layer   │  │  Game Engine │  │   Storage   │ │ │
│  │  │  (5 Screens) │  │   (State)    │  │ (localStorage)│ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (fetch API)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Cloud                                 │
│  ┌────────────────┐      ┌──────────────────────────────┐  │
│  │  API Gateway   │─────▶│   Lambda Function            │  │
│  │  (REST API)    │      │   (evaluator.py)             │  │
│  └────────────────┘      └──────────────────────────────┘  │
│                                     │                        │
│                                     ▼                        │
│                          ┌──────────────────────────────┐   │
│                          │   AWS Bedrock                │   │
│                          │   (Claude 3 Sonnet)          │   │
│                          └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend (index.html)**
- Screen rendering and transitions
- Game state management (XP, lives, combo, achievements)
- User input handling (text and voice)
- Animation and visual effects
- localStorage persistence
- API communication with Lambda

**Backend (Lambda + API Gateway)**
- Receive evaluation requests
- Construct Bedrock prompts with difficulty-based instructions
- Parse and validate AI responses
- Return structured feedback

**External Services**
- AWS Bedrock: AI-powered answer evaluation
- Web Speech API: Voice-to-text transcription

## Components and Interfaces

### Frontend Components

#### 1. Screen Manager
Manages transitions between five screens using a state machine.

**States:**
- `menu`: Main menu with start, achievements, instructions
- `game`: Active gameplay with question display
- `feedback`: Post-answer feedback display
- `complete`: Victory screen after boss defeat
- `gameOver`: Failure screen when lives reach zero

**Interface:**
```javascript
class ScreenManager {
  showScreen(screenName)
  hideAllScreens()
  getCurrentScreen()
}
```

#### 2. Game Engine
Core game logic and state management.

**State:**
```javascript
{
  currentBoss: 0-2,           // Junior Dev, Senior Engineer, FAANG Boss
  currentQuestionIndex: 0-9,
  lives: 0-3,
  xp: number,
  consecutiveGoodAnswers: 0,
  comboActive: boolean,
  bossHealth: 0-100,
  questions: Array,
  achievements: Set
}
```

**Interface:**
```javascript
class GameEngine {
  startGame(bossLevel)
  submitAnswer(answerText)
  processScore(score, feedback)
  updateLives(delta)
  awardXP(baseXP)
  checkCombo()
  updateBossHealth(score)
  checkAchievements()
  saveProgress()
  loadProgress()
}
```

#### 3. UI Renderer
Handles dynamic UI updates and animations.

**Interface:**
```javascript
class UIRenderer {
  renderLives(count)
  renderXPBar(current, max)
  renderBossHealth(percentage)
  renderComboIndicator(count, active)
  renderQuestion(questionObj)
  renderFeedback(feedbackObj)
  showAchievementNotification(achievement)
  animateComboActivation()
  animateLiveLost()
  animateLiveGained()
}
```

#### 4. Storage Manager
Handles localStorage persistence.

**Storage Schema:**
```javascript
{
  xp: number,
  achievements: Array<string>,
  unlockedBosses: Array<number>
}
```

**Interface:**
```javascript
class StorageManager {
  saveXP(xp)
  loadXP()
  saveAchievements(achievements)
  loadAchievements()
  saveUnlockedBosses(bosses)
  loadUnlockedBosses()
  clearAll()
}
```

#### 5. Voice Input Handler
Manages Web Speech API integration.

**Interface:**
```javascript
class VoiceInputHandler {
  startRecording()
  stopRecording()
  onTranscript(callback)
  isSupported()
}
```

#### 6. API Client
Communicates with Lambda backend.

**Interface:**
```javascript
class APIClient {
  async evaluateAnswer(question, answer, difficulty)
  // Returns: { score, strengths, improvements, motivation }
}
```

### Backend Components

#### Lambda Function (evaluator.py)

**Input Schema:**
```json
{
  "question": "string",
  "answer": "string",
  "difficulty": "junior|senior|faang"
}
```

**Output Schema:**
```json
{
  "score": 1-10,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "motivation": "string"
}
```

**Bedrock Prompt Template:**
```
You are an expert interview evaluator for a {difficulty} level interview.

Question: {question}
Candidate's Answer: {answer}

Score 1-10 based on these criteria:
- Junior: Basic understanding, clear communication
- Senior: Depth, trade-offs, real-world experience
- FAANG: System thinking, scalability, edge cases

Provide:
1. Score (number 1-10, be STRICTER at higher levels)
2. Strengths (2-3 specific points)
3. Improvements (2-3 actionable suggestions)
4. Motivation (one encouraging sentence)

Return ONLY valid JSON:
{"score": <number>, "strengths": ["...", "..."], "improvements": ["...", "..."], "motivation": "..."}
```

## Data Models

### Question Model
```javascript
{
  id: string,
  level: "junior" | "senior" | "faang",
  type: "behavioral" | "technical" | "system-design",
  text: string,
  hints: Array<string>
}
```

### Boss Model
```javascript
{
  id: number,
  name: string,
  level: "junior" | "senior" | "faang",
  personality: string,
  unlockXP: number,
  healthPoints: number,
  questionsPerSession: number
}
```

### Achievement Model
```javascript
{
  id: string,
  name: string,
  description: string,
  icon: string,
  unlocked: boolean,
  condition: function
}
```

### Feedback Model
```javascript
{
  score: number,
  strengths: Array<string>,
  improvements: Array<string>,
  motivation: string,
  xpEarned: number,
  comboActive: boolean
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Boss unlock based on XP thresholds
*For any* XP value, the system should unlock exactly the bosses whose unlock requirements are met (Junior Dev always, Senior Engineer at 500+, FAANG Boss at 1500+)
**Validates: Requirements 2.2, 2.3, 2.4**

### Property 2: XP calculation correctness
*For any* score value from 1-10, the base XP awarded should match the scoring table (10→100, 9→75, 8→75, 7→50, 6→50, 5→25, 4→25, <4→0)
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8**

### Property 3: Combo activation and XP multiplier
*For any* sequence of scores, combo mode should activate after exactly 3 consecutive scores ≥6, and while active, all XP awards should be doubled
**Validates: Requirements 5.1, 5.2**

### Property 4: Combo deactivation on low score
*For any* active combo state, receiving a score below 6 should deactivate combo mode and reset the consecutive counter to 0
**Validates: Requirements 5.4**

### Property 5: Lives decrease on poor performance
*For any* score below 4, the player's lives should decrease by exactly 1 (unless already at 0)
**Validates: Requirements 3.2**

### Property 6: Lives restoration with cap
*For any* score of 9 or 10, the player's lives should increase by 1, but never exceed the maximum of 3
**Validates: Requirements 3.3**

### Property 7: Game over on zero lives
*For any* game state where lives reach 0, the session should immediately end and transition to the game over screen
**Validates: Requirements 3.4**

### Property 8: Boss health decrease on good answers
*For any* score of 6 or higher, the boss health should decrease proportionally, and when health reaches 0, the level should complete
**Validates: Requirements 9.2, 9.3**

### Property 9: Question type diversity per level
*For any* boss level, the question set should include at least one question of each type (behavioral, technical, system design)
**Validates: Requirements 8.5**

### Property 10: Achievement notification on unlock
*For any* achievement that transitions from locked to unlocked state, an animated notification should be displayed
**Validates: Requirements 6.5**

### Property 11: localStorage persistence round-trip
*For any* game state (XP, achievements, unlocked bosses), saving to localStorage and then loading should restore the exact same state
**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 12: API request structure
*For any* answer submission, the request to the Lambda function should include all three required fields: question, answer, and difficulty
**Validates: Requirements 7.1, 15.1**

### Property 13: Lambda response structure
*For any* successful Lambda response, the JSON object should contain exactly four fields: score (number 1-10), strengths (array), improvements (array), and motivation (string)
**Validates: Requirements 7.3, 7.4, 7.5, 7.6, 15.5**

### Property 14: Difficulty-based prompt variation
*For any* two requests with different difficulty levels, the constructed Bedrock prompts should contain different evaluation criteria (stricter for higher levels)
**Validates: Requirements 15.3**

### Property 15: Voice transcription integration
*For any* completed voice transcription, the transcribed text should populate the answer input field
**Validates: Requirements 10.5**

## Error Handling

### Frontend Error Scenarios

**Network Failures**
- When API requests fail, display user-friendly error message
- Provide retry button for failed evaluations
- Cache answer locally to prevent data loss
- Fallback to offline mode with mock scores if backend unavailable

**localStorage Failures**
- Catch quota exceeded errors and notify user
- Handle corrupted data by resetting to defaults
- Validate data structure before loading
- Provide manual reset option in settings

**Voice API Failures**
- Detect browser compatibility and hide voice button if unsupported
- Handle microphone permission denials gracefully
- Provide fallback to text input
- Display clear error messages for recognition failures

**Invalid Question Data**
- Validate questions.json structure on load
- Provide default questions if file missing
- Handle malformed question objects
- Log errors to console for debugging

### Backend Error Scenarios

**Bedrock API Failures**
- Implement exponential backoff for rate limits
- Return 503 status with retry-after header
- Log errors for monitoring
- Provide fallback generic feedback if AI unavailable

**Invalid Request Data**
- Validate all input parameters
- Return 400 status with descriptive error messages
- Sanitize inputs to prevent injection
- Enforce maximum answer length

**JSON Parsing Errors**
- Handle malformed Bedrock responses
- Return 500 status with generic error
- Log parsing failures for debugging
- Implement response validation schema

## Testing Strategy

### Unit Testing

The application will use a minimal unit testing approach focused on core logic functions:

**Core Logic Tests:**
- XP calculation function with all score values (1-10)
- Combo activation/deactivation logic with various score sequences
- Lives update logic with boundary conditions (0, 3, restoration)
- Boss unlock logic with XP threshold boundaries (499, 500, 1499, 1500)
- Achievement unlock conditions for specific achievements
- localStorage save/load functions with valid and corrupted data

**Integration Tests:**
- Screen transition flows (menu → game → feedback → complete/gameOver)
- API client with mocked fetch responses
- Voice input handler with mocked Web Speech API

Unit tests will be written using a lightweight testing framework appropriate for vanilla JavaScript (e.g., Jest or Vitest). Tests should be co-located with source code where possible.

### Property-Based Testing

Property-based testing will verify universal properties across randomized inputs using a JavaScript PBT library (fast-check recommended for browser compatibility).

**PBT Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: interview-quest, Property {number}: {property_text}**`
- Each correctness property implemented as a single PBT test

**Property Test Implementations:**

1. **Property 1: Boss unlock based on XP thresholds**
   - Generate random XP values (0-5000)
   - Verify correct bosses are unlocked based on thresholds
   - Tag: `**Feature: interview-quest, Property 1: Boss unlock based on XP thresholds**`

2. **Property 2: XP calculation correctness**
   - Generate random scores (1-10)
   - Verify base XP matches scoring table
   - Tag: `**Feature: interview-quest, Property 2: XP calculation correctness**`

3. **Property 3: Combo activation and XP multiplier**
   - Generate random score sequences
   - Verify combo activates at 3 consecutive ≥6 scores
   - Verify XP is doubled during combo
   - Tag: `**Feature: interview-quest, Property 3: Combo activation and XP multiplier**`

4. **Property 4: Combo deactivation on low score**
   - Generate random score sequences with combo active
   - Verify score <6 breaks combo
   - Tag: `**Feature: interview-quest, Property 4: Combo deactivation on low score**`

5. **Property 5: Lives decrease on poor performance**
   - Generate random scores <4 with various life counts
   - Verify lives decrease by 1
   - Tag: `**Feature: interview-quest, Property 5: Lives decrease on poor performance**`

6. **Property 6: Lives restoration with cap**
   - Generate random scores 9-10 with various life counts
   - Verify lives increase but cap at 3
   - Tag: `**Feature: interview-quest, Property 6: Lives restoration with cap**`

7. **Property 7: Game over on zero lives**
   - Generate random game states with 0 lives
   - Verify session ends and game over screen shows
   - Tag: `**Feature: interview-quest, Property 7: Game over on zero lives**`

8. **Property 8: Boss health decrease on good answers**
   - Generate random scores ≥6
   - Verify boss health decreases proportionally
   - Verify level completes at 0 health
   - Tag: `**Feature: interview-quest, Property 8: Boss health decrease on good answers**`

9. **Property 9: Question type diversity per level**
   - For each boss level, verify all three question types present
   - Tag: `**Feature: interview-quest, Property 9: Question type diversity per level**`

10. **Property 10: Achievement notification on unlock**
    - Generate random achievement unlock events
    - Verify notification is displayed
    - Tag: `**Feature: interview-quest, Property 10: Achievement notification on unlock**`

11. **Property 11: localStorage persistence round-trip**
    - Generate random game states
    - Save to localStorage, load back, verify equality
    - Tag: `**Feature: interview-quest, Property 11: localStorage persistence round-trip**`

12. **Property 12: API request structure**
    - Generate random answer submissions
    - Verify request contains question, answer, difficulty
    - Tag: `**Feature: interview-quest, Property 12: API request structure**`

13. **Property 13: Lambda response structure**
    - Generate random valid Lambda responses
    - Verify all four required fields present with correct types
    - Tag: `**Feature: interview-quest, Property 13: Lambda response structure**`

14. **Property 14: Difficulty-based prompt variation**
    - Generate requests with different difficulties
    - Verify prompts contain different evaluation criteria
    - Tag: `**Feature: interview-quest, Property 14: Difficulty-based prompt variation**`

15. **Property 15: Voice transcription integration**
    - Generate random transcription results
    - Verify text populates input field
    - Tag: `**Feature: interview-quest, Property 15: Voice transcription integration**`

### Testing Workflow

1. Implement core functionality first
2. Write property-based tests for universal properties
3. Write unit tests for specific examples and edge cases
4. Run tests after each implementation task
5. Fix any failing tests before proceeding
6. Validate end-to-end flows manually in browser

## Deployment Architecture

### Frontend Deployment
- Host index.html on AWS S3 with static website hosting
- Enable CloudFront CDN for global distribution
- Configure CORS for API Gateway access
- Use HTTPS for all connections

### Backend Deployment
- Deploy Lambda function via AWS Console or SAM/CDK
- Configure API Gateway with CORS enabled
- Set Lambda timeout to 30 seconds for Bedrock calls
- Configure IAM role with Bedrock invoke permissions
- Set environment variables for Bedrock model ID

### Required AWS Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/anthropic.claude-3-sonnet-*"
    }
  ]
}
```

## Performance Considerations

### Frontend Optimization
- Minimize DOM manipulations by batching updates
- Use CSS transforms for animations (GPU acceleration)
- Debounce voice input processing
- Lazy load achievement images
- Cache questions in memory after initial load

### Backend Optimization
- Keep Lambda warm with CloudWatch scheduled events
- Use provisioned concurrency for consistent latency
- Implement response caching for identical questions
- Optimize Bedrock prompt length
- Set appropriate Lambda memory allocation (512MB recommended)

### Expected Performance Metrics
- Page load: <2 seconds
- API response time: 2-5 seconds (Bedrock latency)
- Animation frame rate: 60 FPS
- localStorage operations: <10ms

## Security Considerations

### Frontend Security
- Sanitize all user inputs before display
- Validate localStorage data structure
- Use Content Security Policy headers
- Implement rate limiting on API calls
- No sensitive data in localStorage

### Backend Security
- Validate all input parameters
- Implement request size limits (max 5KB)
- Use API Gateway throttling (100 requests/second)
- Enable AWS WAF for DDoS protection
- Log all requests for audit trail
- Sanitize inputs before Bedrock prompts

### Data Privacy
- No PII collection or storage
- Answers not persisted beyond evaluation
- Anonymous usage only
- Clear privacy policy in UI

## Browser Compatibility

### Minimum Requirements
- Modern browsers with ES6+ support
- localStorage API support
- Fetch API support
- CSS Grid and Flexbox support

### Optional Features
- Web Speech API (graceful degradation to text-only)
- Canvas API for victory cards (fallback to text display)

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

### Potential Features (Out of Scope)
- Multiplayer competitive mode
- Custom question creation
- Video response recording
- Leaderboards and rankings
- Additional boss levels
- Mobile native apps
- Offline mode with local AI
- Interview scheduling integration
