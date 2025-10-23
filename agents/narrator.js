const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class NarratorAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });
    }

    async generateAudio(storyText, storyIndex, outputDir) {
        try {
            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: storyText
                    }]
                }],
                generationConfig: {
                    responseModalities: ["AUDIO"]
                }
            });

            const response = await result.response;
            
            // Extract audio data from response
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                const audioData = response.candidates[0].content.parts[0].inlineData.data;
                const audioBuffer = Buffer.from(audioData, 'base64');
                
                // Save audio to file
                const filename = `story_${storyIndex}.mp3`;
                const filepath = path.join(outputDir, filename);
                
                fs.writeFileSync(filepath, audioBuffer);
                
                return {
                    success: true,
                    data: {
                        audio_path: `audio/story/${filename}`,
                        filepath: filepath
                    }
                };
            } else {
                throw new Error('No audio data found in response');
            }
        } catch (error) {
            console.error(`Error generating audio for story ${storyIndex}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = NarratorAgent;
