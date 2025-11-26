import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log('🔑 API Key:', apiKey.substring(0, 15) + '...');
    
    // Test with direct fetch - try gemini-2.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    console.log('\n📡 Testing Gemini API with direct fetch...\n');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say hello in one sentence'
          }]
        }]
      })
    });

    console.log('Status:', response.status, response.statusText);
    
    const data: any = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    if (response.ok && data.candidates) {
      console.log('\n✅ SUCCESS! Gemini API is working!');
      console.log('Response text:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('\n❌ API Error:', data.error?.message || 'Unknown error');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
