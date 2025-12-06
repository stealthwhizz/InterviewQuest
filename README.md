# InterviewQuest

> A gamified interview practice platform with AI-powered feedback

InterviewQuest transforms traditional interview preparation into an engaging Dark Souls-inspired game where you battle through three boss levels (Junior Dev, Senior Engineer, FAANG Boss), earning XP, unlocking achievements, and receiving intelligent feedback powered by AWS Bedrock AI.

## Features

- **Three Boss Levels**: Progress from Junior Dev to FAANG Boss as your skills improve
- **AI-Powered Evaluation**: Get detailed feedback on your answers using Claude 3 Sonnet
- **Game Mechanics**: Lives system, XP progression, combo multipliers, and 10 unlockable achievements
- **Voice Input**: Practice speaking your answers using Web Speech API
- **Victory Cards**: Share your achievements on social media
- **Progress Persistence**: Your XP and achievements are saved automatically
- **Single-Page Application**: Entire game in one HTML file for easy deployment

## Architecture

```
Frontend (index.html)
    ↓ HTTPS
API Gateway
    ↓
Lambda Function (evaluator.py)
    ↓
AWS Bedrock (Claude 3 Sonnet)
```

## Quick Start

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- AWS Account (for backend deployment)
- Python 3.9+ (for Lambda function)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interview-quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Open the application**
   - Simply open `index.html` in your browser
   - For local API testing, you'll need to deploy the Lambda function first (see AWS Setup below)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## AWS Setup

### Step 1: Configure AWS Bedrock Access

1. **Enable Bedrock Model Access**
   - Go to AWS Console → Bedrock → Model access
   - Request access to "Claude 3 Sonnet" model
   - Wait for approval (usually instant)

2. **Note your AWS Region**
   - Bedrock is available in specific regions (us-east-1, us-west-2, etc.)
   - Choose a region and use it consistently

### Step 2: Create IAM Role for Lambda

1. **Create a new IAM role**
   - Go to IAM → Roles → Create role
   - Select "Lambda" as the trusted entity
   - Click "Next"

2. **Attach policies**
   - Attach `AWSLambdaBasicExecutionRole` (for CloudWatch logs)
   - Create and attach a custom policy for Bedrock:

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

3. **Name the role** (e.g., `InterviewQuestLambdaRole`)

### Step 3: Deploy Lambda Function

1. **Prepare the deployment package**
   ```bash
   cd lambda
   zip function.zip evaluator.py
   ```

2. **Create Lambda function**
   - Go to Lambda → Create function
   - Choose "Author from scratch"
   - Function name: `interview-quest-evaluator`
   - Runtime: Python 3.9 or later
   - Architecture: x86_64
   - Execution role: Use the role created in Step 2
   - Click "Create function"

3. **Upload the code**
   - In the Lambda console, go to "Code" tab
   - Click "Upload from" → ".zip file"
   - Upload `function.zip`
   - Click "Save"

4. **Configure the function**
   - Go to "Configuration" → "General configuration"
   - Set timeout to 30 seconds (Bedrock calls can take time)
   - Set memory to 512 MB
   - Click "Save"

5. **Set environment variables**
   - Go to "Configuration" → "Environment variables"
   - Add the following variables:
     - `AWS_REGION`: Your Bedrock region (e.g., `us-east-1`)
     - `BEDROCK_MODEL_ID`: `anthropic.claude-3-sonnet-20240229-v1:0`
   - Click "Save"

### Step 4: Create API Gateway

1. **Create REST API**
   - Go to API Gateway → Create API
   - Choose "REST API" (not private)
   - Click "Build"
   - API name: `interview-quest-api`
   - Click "Create API"

2. **Create resource and method**
   - Click "Actions" → "Create Resource"
   - Resource name: `evaluate`
   - Enable CORS: Check the box
   - Click "Create Resource"
   
   - Select the `/evaluate` resource
   - Click "Actions" → "Create Method"
   - Choose "POST" from dropdown
   - Click the checkmark

3. **Configure POST method**
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: Check the box
   - Lambda Region: Your Lambda region
   - Lambda Function: `interview-quest-evaluator`
   - Click "Save"
   - Click "OK" to grant permissions

4. **Enable CORS**
   - Select the `/evaluate` resource
   - Click "Actions" → "Enable CORS"
   - Keep default settings
   - Click "Enable CORS and replace existing CORS headers"
   - Click "Yes, replace existing values"

5. **Deploy API**
   - Click "Actions" → "Deploy API"
   - Deployment stage: [New Stage]
   - Stage name: `prod`
   - Click "Deploy"
   - **Copy the Invoke URL** (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

### Step 5: Update Frontend Configuration

1. **Update API endpoint in index.html**
   - Open `index.html`
   - Find the `APIClient` class
   - Update the `API_ENDPOINT` constant with your API Gateway URL:
   
   ```javascript
   const API_ENDPOINT = 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/prod/evaluate';
   ```

2. **Test the integration**
   - Open `index.html` in your browser
   - Start a game and submit an answer
   - Check browser console for any errors

## Production Deployment

### Option 1: AWS S3 + CloudFront (Recommended)

1. **Create S3 bucket**
   ```bash
   aws s3 mb s3://interview-quest-app --region us-east-1
   ```

2. **Enable static website hosting**
   ```bash
   aws s3 website s3://interview-quest-app --index-document index.html
   ```

3. **Upload files**
   ```bash
   aws s3 cp index.html s3://interview-quest-app/
   aws s3 cp questions.json s3://interview-quest-app/
   ```

4. **Set bucket policy for public read**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::interview-quest-app/*"
       }
     ]
   }
   ```

5. **Create CloudFront distribution**
   - Go to CloudFront → Create distribution
   - Origin domain: Your S3 bucket website endpoint
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Default root object: `index.html`
   - Click "Create distribution"
   - Wait for deployment (5-10 minutes)
   - Access your app via the CloudFront domain

### Option 2: GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy InterviewQuest"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Click "Save"
   - Access your app at `https://username.github.io/repository-name/`

### Option 3: Netlify/Vercel

1. **Connect repository**
   - Sign up for Netlify or Vercel
   - Import your Git repository
   - Build settings: None needed (static site)
   - Deploy

## Environment Variables

### Lambda Function

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `BEDROCK_MODEL_ID` | Claude model identifier | `anthropic.claude-3-sonnet-20240229-v1:0` |

### Frontend (index.html)

| Variable | Description | Example |
|----------|-------------|---------|
| `API_ENDPOINT` | API Gateway invoke URL | `https://abc123.execute-api.us-east-1.amazonaws.com/prod/evaluate` |

## Testing

### Unit Tests

Run unit tests for core game logic:

```bash
npm test
```

Tests cover:
- XP calculation
- Combo system
- Lives management
- Boss unlock logic
- Achievement system
- localStorage persistence
- API client
- Voice input handler

### Property-Based Tests

The project includes property-based tests using fast-check to verify correctness properties across randomized inputs:

```bash
npm test
```

Each property test runs 100 iterations to ensure robustness.

### Manual Testing Checklist

- [ ] Start game from menu
- [ ] Submit text answer and receive feedback
- [ ] Submit voice answer (if browser supports)
- [ ] Lose a life (score < 4)
- [ ] Gain a life (score 9-10)
- [ ] Activate combo (3 consecutive scores ≥ 6)
- [ ] Defeat a boss (complete all questions)
- [ ] Unlock an achievement
- [ ] View achievements screen
- [ ] Share victory card
- [ ] Refresh page and verify progress persists
- [ ] Test on mobile device

## Troubleshooting

### Frontend Issues

**Problem: "Failed to fetch questions.json"**
- **Solution**: Ensure `questions.json` is in the same directory as `index.html`
- **Solution**: If using file:// protocol, use a local server instead:
  ```bash
  npx serve .
  ```

**Problem: Voice input button not showing**
- **Solution**: Web Speech API requires HTTPS (except localhost)
- **Solution**: Check browser compatibility (Chrome/Edge work best)
- **Solution**: Grant microphone permissions when prompted

**Problem: Progress not saving**
- **Solution**: Check browser localStorage is enabled
- **Solution**: Clear localStorage and try again:
  ```javascript
  localStorage.clear()
  ```
- **Solution**: Check for quota exceeded errors in console

**Problem: Animations are choppy**
- **Solution**: Close other browser tabs to free up resources
- **Solution**: Disable browser extensions that might interfere
- **Solution**: Try a different browser

### Backend Issues

**Problem: "API request failed" or CORS errors**
- **Solution**: Verify API Gateway CORS is enabled
- **Solution**: Check API endpoint URL in `index.html` is correct
- **Solution**: Verify Lambda function has correct permissions
- **Solution**: Check CloudWatch logs for Lambda errors:
  ```bash
  aws logs tail /aws/lambda/interview-quest-evaluator --follow
  ```

**Problem: Lambda timeout errors**
- **Solution**: Increase Lambda timeout to 30 seconds
- **Solution**: Check Bedrock model access is enabled
- **Solution**: Verify IAM role has Bedrock permissions

**Problem: "Invalid JSON response from Bedrock"**
- **Solution**: Check CloudWatch logs for actual Bedrock response
- **Solution**: Verify Bedrock model ID is correct
- **Solution**: Try a different AWS region where Bedrock is available

**Problem: High Lambda costs**
- **Solution**: Implement API Gateway caching for repeated questions
- **Solution**: Add rate limiting to prevent abuse
- **Solution**: Consider using Lambda reserved concurrency

### AWS Bedrock Issues

**Problem: "Access denied" when invoking Bedrock**
- **Solution**: Verify model access is enabled in Bedrock console
- **Solution**: Check IAM role has correct permissions
- **Solution**: Ensure you're using a supported region

**Problem: Bedrock throttling errors**
- **Solution**: Implement exponential backoff in Lambda
- **Solution**: Request quota increase in AWS Service Quotas
- **Solution**: Add retry logic with jitter

**Problem: Inconsistent scoring**
- **Solution**: This is expected with AI models - scores may vary
- **Solution**: Adjust prompt in `evaluator.py` for stricter/looser evaluation
- **Solution**: Consider using temperature parameter for more consistent results

### Deployment Issues

**Problem: S3 bucket policy errors**
- **Solution**: Ensure bucket is not blocking public access
- **Solution**: Verify bucket policy JSON is valid
- **Solution**: Check bucket region matches CloudFront origin

**Problem: CloudFront not serving latest version**
- **Solution**: Create invalidation for `/*` path
- **Solution**: Wait 5-10 minutes for distribution to deploy
- **Solution**: Clear browser cache

**Problem: GitHub Pages 404 errors**
- **Solution**: Ensure `index.html` is in repository root
- **Solution**: Check GitHub Pages is enabled in settings
- **Solution**: Verify branch name is correct

## Project Structure

```
interview-quest/
├── index.html              # Main application (SPA)
├── questions.json          # Question bank (30 questions)
├── lambda/
│   └── evaluator.py       # AWS Lambda function
├── package.json           # Node.js dependencies
├── vitest.config.js       # Test configuration
├── *.js                   # Core modules (gameLogic, storage, etc.)
├── *.test.js              # Test files
└── README.md              # This file
```

## Core Modules

- `gameLogic.js` - XP calculation, combo system, lives management
- `storage.js` - localStorage persistence
- `achievements.js` - Achievement system
- `gameSession.js` - Game session management
- `screenManager.js` - Screen transitions
- `uiRenderer.js` - UI updates and animations
- `apiClient.js` - Lambda API communication
- `voiceInput.js` - Web Speech API integration
- `victoryCard.js` - Victory card generation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Dark Souls game mechanics
- Powered by AWS Bedrock and Claude 3 Sonnet
- Built with vanilla JavaScript for maximum compatibility

## Support

For issues and questions:
- Check the Troubleshooting section above
- Review CloudWatch logs for backend errors
- Open an issue on GitHub
- Check browser console for frontend errors

## Roadmap

Future enhancements (not currently implemented):
- Multiplayer competitive mode
- Custom question creation
- Video response recording
- Leaderboards and rankings
- Additional boss levels
- Mobile native apps
- Offline mode with local AI
