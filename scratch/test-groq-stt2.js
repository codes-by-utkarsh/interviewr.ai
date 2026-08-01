const fs = require('fs');
const { Groq } = require('groq-sdk');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GROQ_API_KEY=(.+)/);
const key = match ? match[1].trim() : '';

async function testGroqSTT() {
  try {
    const groq = new Groq({ apiKey: key });
    console.log('Groq SDK initialized with key starting with:', key.substring(0, 8));
    console.log('groq.audio:', Object.keys(groq.audio || {}));
    console.log('groq.audio.transcriptions:', Object.keys(groq.audio?.transcriptions || {}));
  } catch (err) {
    console.error('Error:', err);
  }
}
testGroqSTT();
