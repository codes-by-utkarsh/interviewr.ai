const { Groq } = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

async function testGroqSTT() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('Groq SDK initialized with key starting with:', process.env.GROQ_API_KEY?.substring(0, 8));
    // Check if groq.audio.transcriptions exists
    console.log('groq.audio:', Object.keys(groq.audio || {}));
  } catch (err) {
    console.error('Error:', err);
  }
}
testGroqSTT();
