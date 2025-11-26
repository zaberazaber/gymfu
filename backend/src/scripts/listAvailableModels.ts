import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log('🔑 API Key:', apiKey.substring(0, 15) + '...');
    
    // List available models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log('\n📡 Fetching available models...\n');
    
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (response.ok && data.models) {
      console.log('✅ Available Models:\n');
      data.models.forEach((model: any) => {
        console.log(`  - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('❌ Error:', data.error?.message || 'Unknown error');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
