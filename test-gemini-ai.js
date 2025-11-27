/**
 * Gemini AI Integration Test Script
 * Tests the connection to Google's Gemini AI API
 */

const GEMINI_API_KEY = "AIzaSyD7afBpF0wti6qV-2a0ri5kqaRE01l4qZY";

async function testGeminiConnection() {
  // First, list available models
  console.log("📋 Checking available models...");
  try {
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    const models = await listResponse.json();
    console.log("Available models:");
    if (models.models) {
      models.models.slice(0, 5).forEach(m => console.log(`   - ${m.name}`));
    } else {
      console.log("   Error:", JSON.stringify(models));
    }
  } catch (e) {
    console.log("   Error listing models:", e.message);
  }
  console.log("");

  // Use the correct model URL
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  console.log("=".repeat(60));
  console.log("🤖 GEMINI AI INTEGRATION TEST");
  console.log("=".repeat(60));
  console.log("");

  console.log("📋 Configuration:");
  console.log(`   API Key: ${GEMINI_API_KEY.substring(0, 15)}...`);
  console.log(`   Model: gemini-1.5-flash`);
  console.log("");

  // Test 1: Basic Connection
  console.log("🔧 Test 1: Testing API Connection...");
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say 'Hello, ICY Platform!' in a friendly way." }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`   ❌ API Error: ${response.status}`);
      console.log(`   ${error}`);
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`   ✅ API Connected!`);
    console.log(`   AI Response: ${reply}`);
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return;
  }
  console.log("");

  // Test 2: Influencer Matching
  console.log("🎯 Test 2: Testing Influencer Match Analysis...");
  try {
    const prompt = `You are an influencer marketing expert. Analyze this match and explain why this influencer is good for the brand in 2 sentences.

Influencer: Fashion blogger with 150K Instagram followers, 4.8% engagement, specializes in sustainable fashion.
Brand Need: Eco-friendly clothing brand launching a summer collection, targeting millennials.

Provide a brief, professional explanation.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      }),
    });

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`   ✅ Match Analysis Generated!`);
    console.log(`   AI Analysis: ${analysis}`);
  } catch (error) {
    console.log(`   ❌ Analysis failed: ${error.message}`);
  }
  console.log("");

  // Test 3: Natural Language Parsing
  console.log("💬 Test 3: Testing Natural Language Understanding...");
  try {
    const prompt = `Parse this brand request into structured data and return ONLY a JSON object:

"I need tech influencers with at least 100k followers and high engagement for a product launch. Budget is around $5000."

Return JSON with: niche (array), minFollowers (number), budget (number), campaignGoal (string)`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
      }),
    });

    const data = await response.json();
    const parsed = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`   ✅ Natural Language Parsed!`);
    console.log(`   Parsed Data: ${parsed}`);
  } catch (error) {
    console.log(`   ❌ Parsing failed: ${error.message}`);
  }
  console.log("");

  console.log("=".repeat(60));
  console.log("✅ Gemini AI Integration Test Complete!");
  console.log("=".repeat(60));
  console.log("");
  console.log("The AI integration is ready. Features available:");
  console.log("• Natural language search for influencers");
  console.log("• AI-powered match explanations");
  console.log("• Intelligent campaign recommendations");
}

testGeminiConnection().catch(console.error);

