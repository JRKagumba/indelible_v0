# Indelible v0 - AI Vocabulary Builder

## Phase 1: The Mnemonic Factory (A/B Test Mode)

This project generates multi-sensory vocabulary content using AI agents with A/B testing capabilities.

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Keys**
   - Get your Google AI Studio API key from: https://aistudio.google.com/
   - Edit the `.env` file and add your API key: `GOOGLE_AI_API_KEY=your_api_key_here`

3. **Integrate Existing Assets**
   ```bash
   npm run integrate-assets
   ```

4. **Run the Mnemonic Factory**
   ```bash
   npm start
   ```

### Project Structure
```
indelible_v0/
├── content/
│   ├── images/
│   │   ├── creator/        # Your pre-made images
│   │   └── ai/             # AI-generated images
│   ├── audio/
│   │   ├── pronounce/      # Word pronunciation audio
│   │   └── story/          # Story narration audio
│   ├── content.json        # Master vocabulary data
│   └── mnemonics.json      # Your pre-made mnemonics
├── wordlist.txt            # Input vocabulary words
├── mnemonic-factory.js     # Main orchestration script
└── agents/                 # Individual AI agent modules
```

### The 7-Agent Workflow (A/B Test Mode)
1. **Lexicographer**: Generates definitions and examples
2. **Pronouncer**: Creates word pronunciation audio
3. **Mnemonic Creator**: Creates sound-alike mnemonics (AI option)
4. **Art Director**: Converts mnemonics to visual prompts
5. **Illustrator**: Generates images using Imagen 3 (AI option)
6. **Storyteller**: Creates short stories incorporating words
7. **Narrator**: Converts stories to audio using Gemini TTS

### A/B Test Features
- **Creator Option**: Uses your pre-made images and mnemonics
- **AI Option**: Generates new content using AI agents
- **Dual Pipeline**: Both options run in parallel for comparison
- **Pronunciation First**: Audio pronunciation generated before visual content
- **Options Array**: Each word can have multiple content options

### Output Structure
The script generates a complete `content.json` file with A/B test data:
```json
{
  "word": "Reticent",
  "definition": "Not revealing one's thoughts or feelings readily.",
  "example": "He was extremely reticent about his personal life...",
  "pronunciation_audio_path": "audio/pronounce/reticent.mp3",
  "options": [
    {
      "type": "creator",
      "mnemonic_text": "Ready-Cent: A penny was ready to talk...",
      "image_path": "images/creator/reticent.png"
    },
    {
      "type": "ai", 
      "mnemonic_text": "The RAT-IS-SILENT...",
      "image_path": "images/ai/reticent.png"
    }
  ],
  "story_text": "The normally pugnacious fighter...",
  "story_audio_path": "audio/story/story_1.mp3"
}
```

### Testing
- **A/B Test**: `npm test` (tests with 3 words)
- **Full Generation**: `npm start` (processes all words)
- **Asset Integration**: `npm run integrate-assets`
