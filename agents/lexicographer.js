const { GoogleGenerativeAI } = require('@google/generative-ai');

class LexicographerAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    }

    async generateDefinitionAndExample(word) {
        const prompt = `You are a concise lexicographer. For the word '${word}':
1. Provide a single, clear definition.
2. Provide one simple, intuitive example sentence that clearly demonstrates the word's meaning.

Return this as a JSON object with keys "definition" and "example".`;

        try {
            const result = await this.model.generateContent({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const response = await result.response;
            const text = response.text();
            
            // Parse JSON response - no matching needed!
            const data = JSON.parse(text);
            
            return {
                success: true,
                data: {
                    definition: data.definition,
                    example: data.example
                }
            };
        } catch (error) {
            console.error(`Error generating definition for ${word}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = LexicographerAgent;
