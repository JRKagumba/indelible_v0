const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class IllustratorAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    }

    async generateImage(visualPrompt, word, outputDir) {
        try {
            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: visualPrompt
                    }]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"]
                }
            });

            const response = await result.response;
            
            // Extract image data from response
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                const imageData = response.candidates[0].content.parts[0].inlineData.data;
                const imageBuffer = Buffer.from(imageData, 'base64');
                
                // Save image to file
                const filename = `${word.toLowerCase()}.png`;
                const filepath = path.join(outputDir, filename);
                
                fs.writeFileSync(filepath, imageBuffer);
                
                return {
                    success: true,
                    data: {
                        image_path: `images/${filename}`,
                        filepath: filepath
                    }
                };
            } else {
                throw new Error('No image data found in response');
            }
        } catch (error) {
            console.error(`Error generating image for ${word}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = IllustratorAgent;
