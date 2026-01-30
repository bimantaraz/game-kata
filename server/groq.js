const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function validateWord(word, startLetter, endLetter, category = "General") {
    const prompt = `
      You are an strict word referee for a game.
      Check if the word "${word}" is valid in INDONESIAN or ENGLISH.
      
      Constraints:
      1. MUST start with letter '${startLetter}'.
      2. MUST end with letter '${endLetter}'.
      3. MUST be a valid word found in a standard dictionary.
      4. MUST fit the category: "${category}" (General means any valid word).
      5. NO names of people, cities, or brands unless commonly treated as generic nouns.

      Respond ONLY with this exact JSON structure:
      {
        "isValid": boolean,
        "reason": "Short explanation IN INDONESIAN (Contoh: 'Kata APEL adalah buah yang valid')"
      }
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            // Using a reliable model. User requested openai/gpt-oss-120b but that is not standard Groq.
            // fallback to llama-3.3-70b-versatile which is excellent.
            model: "openai/gpt-oss-120b",
            response_format: { type: "json_object" },
        });

        const content = chatCompletion.choices[0]?.message?.content;
        console.log(`[Groq] Raw response: ${content}`);

        return JSON.parse(content);
    } catch (error) {
        console.error("Groq Validation Error:", error);
        return {
            isValid: false,
            reason: "AI Error (Groq). Coba kata lain."
        };
    }
}

module.exports = { validateWord };
