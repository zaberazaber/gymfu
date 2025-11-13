const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testProfileAPI() {
  try {
    console.log('🧪 Testing Profile API\n');

    // Use an existing user's token (you'll need to get this from a real login)
    console.log('📝 To test profile endpoints:');
    console.log('1. Register/Login to get a JWT token');
    console.log('2. Use the token in the Authorization header\n');

    console.log('Example commands:\n');

    console.log('# Get Profile');
    console.log('curl http://localhost:3000/api/v1/users/profile \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN"\n');

    console.log('# Update Profile');
    console.log('curl -X PUT http://localhost:3000/api/v1/users/profile \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"age": 25, "gender": "male", "location": {"city": "Mumbai", "state": "Maharashtra", "country": "India", "pincode": "400001"}, "fitnessGoals": ["weight_loss", "muscle_gain"]}\'');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProfileAPI();
