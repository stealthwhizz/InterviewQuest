# Requirements Document

## Introduction

InterviewQuest is a gamified interview practice platform inspired by Dark Souls mechanics. The system transforms traditional interview preparation into an engaging game where users progress through three boss levels (Junior Dev, Senior Engineer, FAANG Boss), earning XP, unlocking achievements, and receiving AI-powered feedback on their responses. The platform addresses the challenge of making interview practice engaging and accessible by combining game mechanics with AWS Bedrock AI evaluation.

## Glossary

- **InterviewQuest System**: The complete gamified interview practice platform
- **Boss Level**: A difficulty tier representing interview complexity (Junior Dev, Senior Engineer, FAANG Boss)
- **XP (Experience Points)**: Numerical progression currency earned through successful answers
- **Life/Heart**: A resource representing remaining attempts, lost on poor answers
- **Combo System**: A multiplier mechanism activated after consecutive good answers
- **Achievement**: An unlockable reward for completing specific milestones
- **Boss Health Bar**: A visual indicator of progress through a boss level's questions
- **AWS Bedrock**: The AI service used for answer evaluation
- **Victory Card**: A shareable social media image generated upon level completion
- **Question Bank**: The collection of 30 interview questions across all difficulty levels
- **Web Speech API**: Browser API enabling voice input for answers

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to practice interview questions in a game format, so that I stay motivated and engaged during practice sessions.

#### Acceptance Criteria

1. WHEN the user launches the application THEN the InterviewQuest System SHALL display a main menu screen with options to start game, view achievements, and see instructions
2. WHEN the user selects start game THEN the InterviewQuest System SHALL load the appropriate boss level based on current XP
3. WHEN the user is in a game session THEN the InterviewQuest System SHALL display the current question, boss health bar, player lives, XP counter, and combo indicator
4. WHEN the user submits an answer THEN the InterviewQuest System SHALL send the answer to AWS Bedrock for evaluation and display feedback
5. WHEN the user completes or fails a session THEN the InterviewQuest System SHALL display the appropriate end screen with statistics

### Requirement 2

**User Story:** As a player, I want to progress through three distinct boss levels, so that I can gradually increase interview difficulty as my skills improve.

#### Acceptance Criteria

1. THE InterviewQuest System SHALL provide exactly three boss levels: Junior Dev, Senior Engineer, and FAANG Boss
2. WHEN the user has less than 500 XP THEN the InterviewQuest System SHALL restrict access to Junior Dev level only
3. WHEN the user has between 500 and 1499 XP THEN the InterviewQuest System SHALL unlock Senior Engineer level
4. WHEN the user has 1500 or more XP THEN the InterviewQuest System SHALL unlock FAANG Boss level
5. WHEN a boss level is locked THEN the InterviewQuest System SHALL display the XP requirement for unlock

### Requirement 3

**User Story:** As a player, I want a lives system with visual hearts, so that I understand my remaining attempts and feel tension during gameplay.

#### Acceptance Criteria

1. WHEN a game session starts THEN the InterviewQuest System SHALL initialize the player with exactly 3 lives
2. WHEN the user receives a score below 4 THEN the InterviewQuest System SHALL decrease lives by 1 and display a visual animation
3. WHEN the user receives a score of 9 or 10 THEN the InterviewQuest System SHALL restore 1 life up to a maximum of 3
4. WHEN lives reach 0 THEN the InterviewQuest System SHALL end the session and display the game over screen
5. THE InterviewQuest System SHALL display lives as heart icons with visual states for full, empty, and transition animations

### Requirement 4

**User Story:** As a player, I want to earn XP based on answer quality, so that I can track my improvement and unlock new content.

#### Acceptance Criteria

1. WHEN the user receives a score of 10 THEN the InterviewQuest System SHALL award 100 base XP
2. WHEN the user receives a score of 9 THEN the InterviewQuest System SHALL award 75 base XP
3. WHEN the user receives a score of 8 THEN the InterviewQuest System SHALL award 75 base XP
4. WHEN the user receives a score of 7 THEN the InterviewQuest System SHALL award 50 base XP
5. WHEN the user receives a score of 6 THEN the InterviewQuest System SHALL award 50 base XP
6. WHEN the user receives a score of 5 THEN the InterviewQuest System SHALL award 25 base XP
7. WHEN the user receives a score of 4 THEN the InterviewQuest System SHALL award 25 base XP
8. WHEN the user receives a score below 4 THEN the InterviewQuest System SHALL award 0 XP
9. THE InterviewQuest System SHALL display XP progression with a visual progress bar

### Requirement 5

**User Story:** As a player, I want a combo system that rewards consecutive good answers, so that I feel rewarded for maintaining performance.

#### Acceptance Criteria

1. WHEN the user achieves 3 consecutive scores of 6 or higher THEN the InterviewQuest System SHALL activate combo mode
2. WHILE combo mode is active THEN the InterviewQuest System SHALL multiply all XP awards by 2
3. WHEN combo mode activates THEN the InterviewQuest System SHALL display fire effect animations
4. WHEN the user receives a score below 6 THEN the InterviewQuest System SHALL deactivate combo mode and reset the consecutive counter
5. THE InterviewQuest System SHALL display the current consecutive good answer count

### Requirement 6

**User Story:** As a player, I want to unlock achievements for completing milestones, so that I feel a sense of accomplishment and have goals to pursue.

#### Acceptance Criteria

1. THE InterviewQuest System SHALL provide exactly 10 distinct achievements
2. WHEN the user completes their first question with score 6 or higher THEN the InterviewQuest System SHALL unlock the First Blood achievement
3. WHEN the user completes a boss level without losing any lives THEN the InterviewQuest System SHALL unlock the Flawless Victory achievement
4. WHEN the user activates combo mode for the first time THEN the InterviewQuest System SHALL unlock the Combo Master achievement
5. WHEN an achievement is unlocked THEN the InterviewQuest System SHALL display an animated notification
6. THE InterviewQuest System SHALL persist achievement status in localStorage
7. THE InterviewQuest System SHALL provide an achievements screen displaying all achievements with locked and unlocked states

### Requirement 7

**User Story:** As a player, I want my answers evaluated by AI, so that I receive intelligent feedback on interview response quality.

#### Acceptance Criteria

1. WHEN the user submits an answer THEN the InterviewQuest System SHALL send the question, answer, and difficulty level to AWS Bedrock
2. THE InterviewQuest System SHALL use Claude 3 Sonnet model for evaluation
3. WHEN AWS Bedrock processes the answer THEN the InterviewQuest System SHALL receive a score from 1 to 10
4. WHEN AWS Bedrock processes the answer THEN the InterviewQuest System SHALL receive 2-3 strength points
5. WHEN AWS Bedrock processes the answer THEN the InterviewQuest System SHALL receive 2-3 improvement suggestions
6. WHEN AWS Bedrock processes the answer THEN the InterviewQuest System SHALL receive a motivational message
7. THE InterviewQuest System SHALL display all feedback components on the feedback screen

### Requirement 8

**User Story:** As a player, I want access to a diverse question bank, so that I can practice different types of interview questions.

#### Acceptance Criteria

1. THE InterviewQuest System SHALL provide exactly 30 interview questions
2. THE InterviewQuest System SHALL allocate 10 questions to Junior Dev level
3. THE InterviewQuest System SHALL allocate 10 questions to Senior Engineer level
4. THE InterviewQuest System SHALL allocate 10 questions to FAANG Boss level
5. WHEN questions are allocated to a level THEN the InterviewQuest System SHALL include behavioral, technical, and system design question types
6. THE InterviewQuest System SHALL load questions from a questions.json file
7. WHEN a game session starts THEN the InterviewQuest System SHALL randomly select questions from the appropriate difficulty level

### Requirement 9

**User Story:** As a player, I want to see a boss health bar that decreases with good answers, so that I can visualize my progress through the level.

#### Acceptance Criteria

1. WHEN a game session starts THEN the InterviewQuest System SHALL initialize the boss health bar at 100 percent
2. WHEN the user receives a score of 6 or higher THEN the InterviewQuest System SHALL decrease boss health proportionally
3. WHEN boss health reaches 0 THEN the InterviewQuest System SHALL complete the level and display the victory screen
4. THE InterviewQuest System SHALL display the boss health bar with smooth animation transitions
5. THE InterviewQuest System SHALL display the boss name and personality description

### Requirement 10

**User Story:** As a player, I want to answer questions using voice input, so that I can practice speaking my answers as in real interviews.

#### Acceptance Criteria

1. THE InterviewQuest System SHALL provide a voice input button on the game screen
2. WHEN the user clicks the voice input button THEN the InterviewQuest System SHALL activate the Web Speech API
3. WHILE voice recording is active THEN the InterviewQuest System SHALL display a visual indicator
4. WHEN the user stops speaking THEN the InterviewQuest System SHALL transcribe the speech to text
5. WHEN transcription completes THEN the InterviewQuest System SHALL populate the answer input field with the transcribed text

### Requirement 11

**User Story:** As a player, I want to share victory cards on social media, so that I can celebrate my achievements with others.

#### Acceptance Criteria

1. WHEN the user completes a boss level THEN the InterviewQuest System SHALL generate a victory card image
2. WHEN a victory card is generated THEN the InterviewQuest System SHALL include the boss name, XP earned, and completion time
3. WHEN the victory card is displayed THEN the InterviewQuest System SHALL provide a share button
4. WHEN the user clicks the share button THEN the InterviewQuest System SHALL enable downloading or sharing the victory card

### Requirement 12

**User Story:** As a player, I want my progress saved automatically, so that I can continue from where I left off across sessions.

#### Acceptance Criteria

1. WHEN the user earns XP THEN the InterviewQuest System SHALL persist the total XP to localStorage immediately
2. WHEN the user unlocks an achievement THEN the InterviewQuest System SHALL persist the achievement status to localStorage immediately
3. WHEN the user unlocks a boss level THEN the InterviewQuest System SHALL persist the unlock status to localStorage immediately
4. WHEN the application loads THEN the InterviewQuest System SHALL restore XP, achievements, and unlock status from localStorage
5. WHEN localStorage data is corrupted or missing THEN the InterviewQuest System SHALL initialize with default values

### Requirement 13

**User Story:** As a user, I want a visually appealing dark-themed interface, so that the game feels immersive and comfortable for extended play sessions.

#### Acceptance Criteria

1. THE InterviewQuest System SHALL use background color #0f1419 for all screens
2. THE InterviewQuest System SHALL use text color #e8e9ed for primary content
3. THE InterviewQuest System SHALL apply smooth CSS transitions to all interactive elements
4. THE InterviewQuest System SHALL use keyframe animations for special effects including combo activation and achievement unlocks
5. THE InterviewQuest System SHALL implement responsive design supporting mobile and desktop viewports

### Requirement 14

**User Story:** As a developer, I want the entire application in a single HTML file, so that deployment is simple and hosting costs are minimal.

#### Acceptance Criteria

1. THE InterviewQuest System SHALL embed all CSS within style tags in the HTML file
2. THE InterviewQuest System SHALL embed all JavaScript within script tags in the HTML file
3. THE InterviewQuest System SHALL contain all five screens (menu, game, feedback, complete, game over) in the single HTML file
4. THE InterviewQuest System SHALL load the questions.json file via fetch API
5. THE InterviewQuest System SHALL contain no placeholder code or TODO comments

### Requirement 15

**User Story:** As a developer, I want a Lambda function that integrates with AWS Bedrock, so that answer evaluation is scalable and serverless.

#### Acceptance Criteria

1. THE Lambda function SHALL accept POST requests with question, answer, and difficulty parameters
2. WHEN the Lambda function receives a request THEN the Lambda function SHALL construct a prompt for AWS Bedrock
3. WHEN constructing the prompt THEN the Lambda function SHALL include stricter evaluation instructions for higher difficulty levels
4. WHEN AWS Bedrock returns a response THEN the Lambda function SHALL parse the JSON response
5. THE Lambda function SHALL return a JSON object containing score, strengths, improvements, and motivation fields
6. WHEN errors occur THEN the Lambda function SHALL return appropriate error responses with status codes
