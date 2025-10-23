const { GoogleGenerativeAI } = require('@google/generative-ai');

class StorytellerAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    }

    async generateStory(words) {
        const wordList = words.map(w => w.word).join(', ');
        
        const prompt = `You are a short story writer. Write a very brief, engaging story (under 100 words) that naturally incorporates these vocabulary words: ${wordList}

The story should:
- Be entertaining and memorable
- Use each word in context naturally
- Be suitable for vocabulary learning
- Have a clear beginning, middle, and end
- Be appropriate for all ages

Return only the story text, no additional formatting or explanations.`;

        try {
            const result = await this.model.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });
            const response = await result.response;
            const text = response.text().trim();
            
            return {
                success: true,
                data: {
                    story_text: text
                }
            };
        } catch (error) {
            console.error(`Error generating story for words: ${wordList}`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = StorytellerAgent;
