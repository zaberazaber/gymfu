// Simple script to test the authentication flow
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Authentication Flow\n');

    // Step 1: Register a new user
    console.log('1️⃣  Registering new user...');
    const registerData = {
      name: 'Test User',
      phoneNumber: '9876543210',
      password: 'Test@1234',
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('   User ID:', registerResponse.data.data.id);
    console.log('   Message:', registerResponse.data.message);

    // Step 2: Get OTP from console (in real scenario, it would be sent via SMS)
    console.log('\n2️⃣  Simulating OTP verification...');
    console.log('   (In development, check server console for OTP)');
    
    // For testing, we'll use a mock OTP - in real scenario, get from console
    const otp = '123456'; // This should be retrieved from server logs
    
    console.log('\n⚠️  Please check the backend server console for the OTP');
    console.log('   Then run the verification step manually with:');
    console.log(`   curl -X POST ${BASE_URL}/auth/verify-otp \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"phoneNumber": "9876543210", "otp": "YOUR_OTP"}'`);
    
    console.log('\n3️⃣  After verification, test the /users/me endpoint with:');
    console.log(`   curl -X GET ${BASE_URL}/users/me \\`);
    console.log(`     -H "Authorization: Bearer YOUR_JWT_TOKEN"`);

    console.log('\n4️⃣  Test without token (should fail):');
    console.log(`   curl -X GET ${BASE_URL}/users/me`);

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAuthFlow();
