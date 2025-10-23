const { GoogleGenerativeAI } = require('@google/generative-ai');

class ArtDirectorAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    }

    async generateVisualPrompt(mnemonicText) {
        const prompt = `You are an AI art director. Convert the following mnemonic idea into a visual, descriptive prompt.

CRITICAL RULE: The prompt must NOT contain any letters, words, or text of any kind. It must be visual only.

Mnemonic Idea: "${mnemonicText}"

Create a prompt for an image that visually represents this mnemonic concept. The image should be:
- Pixar-style, cartoonish, and friendly
- Anthropomorphic (characters with human-like qualities)
- Clear and memorable
- Suitable for vocabulary learning
- NO human faces or recognizable human features
- NO text, letters, or words visible in the image
- Focus on animals, objects, or abstract concepts
- The scene should explain the concept without any textual assistance

Return only the visual prompt as a string, no JSON formatting.`;

        try {
            const result = await this.model.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });
            const response = await result.response;
            const text = response.text().trim();
            
            return {
                success: true,
                data: {
                    visual_prompt: text
                }
            };
        } catch (error) {
            console.error(`Error generating visual prompt:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = ArtDirectorAgent;
