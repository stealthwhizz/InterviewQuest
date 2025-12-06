/**
 * Simple API Test Script for InterviewQuest Lambda Function
 * Run with: node test-api.js
 */

const API_ENDPOINT = 'https://s0v99eipni.execute-api.ap-south-1.amazonaws.com/prod/evaluate-answer';

async function testAPI() {
    console.log('🧪 Testing InterviewQuest API...\n');
    console.log(`Endpoint: ${API_ENDPOINT}\n`);

    const testPayload = {
        question: "What is your greatest strength?",
        answer: "My greatest strength is problem-solving. I enjoy breaking down complex challenges into manageable parts and finding creative solutions.",
        difficulty: "junior"
    };

    console.log('📤 Sending test request...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    console.log('');

    try {
        const startTime = Date.now();
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });

        const duration = Date.now() - startTime;

        console.log(`⏱️  Response time: ${duration}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log('');

        const responseText = await response.text();
        console.log('📥 Raw response:');
        console.log(responseText);
        console.log('');

        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ API is working!');
                console.log('');
                console.log('📋 Evaluation Result:');
                console.log(`   Score: ${data.score}/10`);
                console.log(`   Strengths: ${data.strengths ? data.strengths.length : 0} items`);
                console.log(`   Improvements: ${data.improvements ? data.improvements.length : 0} items`);
                console.log(`   Motivation: ${data.motivation ? 'Present' : 'Missing'}`);
                console.log('');
                console.log('Full response:');
                console.log(JSON.stringify(data, null, 2));
                
                return true;
            } catch (parseError) {
                console.log('⚠️  Response is not valid JSON');
                console.log('Parse error:', parseError.message);
                return false;
            }
        } else {
            console.log('❌ API returned an error');
            try {
                const errorData = JSON.parse(responseText);
                console.log('Error details:', JSON.stringify(errorData, null, 2));
            } catch {
                console.log('Error response:', responseText);
            }
            return false;
        }

    } catch (error) {
        console.log('❌ Failed to connect to API');
        console.log('Error:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('\n💡 Tip: Make sure you have internet connection and the API endpoint is correct');
        }
        
        return false;
    }
}

// Run the test
testAPI().then(success => {
    console.log('');
    console.log('='.repeat(60));
    if (success) {
        console.log('✅ TEST PASSED - API is working correctly!');
    } else {
        console.log('❌ TEST FAILED - Check the errors above');
    }
    console.log('='.repeat(60));
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
