const { GoogleGenerativeAI } = require('@google/generative-ai');

class MnemonicCreatorAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    }

    async generateMnemonic(word, definition) {
        const prompt = `You are a clever mnemonic generator. Your goal is to create a memorable, 'sound-alike' mnemonic for '${word}'.

The word means: ${definition}

Examples of good mnemonics:
- "Pugnacious = 'PUG' + 'ACE' + 'SHUSH' (a pug holding an ace card, shushing)"
- "Redoubtable = 'Red-Outer-Table'"

Create a short, creative mnemonic for '${word}'. It must be based on breaking the word down into sound-alike parts.

Return this as a JSON object: {"mnemonic_text": "Your mnemonic"}`;

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
                    mnemonic_text: data.mnemonic_text
                }
            };
        } catch (error) {
            console.error(`Error generating mnemonic for ${word}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = MnemonicCreatorAgent;
