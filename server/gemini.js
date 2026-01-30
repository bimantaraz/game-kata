const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function validateWord(word, startLetter, endLetter, category = "General") {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not found in environment variables");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Stricter prompt engineering
        const prompt = `
      You are a strict game referee. Validate if the word "${word}" is a valid word in the category: "${category}".

      Rules:
      1. Starts with letter: "${startLetter}" (case insensitive).
      2. Ends with letter: "${endLetter}" (case insensitive).
      3. MUST be a meaningful, real-world word.
      4. REJECT gibberish, random strings (like "OOOQ", "ASDF"), or made-up words.
      5. Language: Indonesian (preferred) or English (if commonly used).
      6. Category context: "${category}".

      Respond ONLY with this JSON structure:
      {
        "isValid": boolean,
        "reason": "Short explanation IN INDONESIAN (Contoh: 'Kata APEL adalah buah yang valid', atau 'OOOQ tidak memiliki arti')"
      }
    `;

        console.log(`[Gemini] Validating "${word}" for category "${category}"...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`[Gemini] Raw response: ${text}`);

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Validation Error:", error);
        // Debug: Check if it's a safety block
        if (error.response && error.response.promptFeedback) {
            console.error("Safety block:", error.response.promptFeedback);
        }

        // Basic fallback
        const basicCheck = word.toLowerCase().startsWith(startLetter.toLowerCase()) &&
            word.toLowerCase().endsWith(endLetter.toLowerCase());
        return {
            isValid: basicCheck,
            reason: basicCheck ? "AI Check Failed (API Error), fell back to basic letter check." : "Invalid word (Basic Check)"
        };
    }
}

module.exports = { validateWord };
