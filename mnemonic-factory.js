require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Import all agents
const LexicographerAgent = require('./agents/lexicographer');
const PronouncerAgent = require('./agents/pronouncer');
const MnemonicCreatorAgent = require('./agents/mnemonic-creator');
const ArtDirectorAgent = require('./agents/art-director');
const IllustratorAgent = require('./agents/illustrator');
const StorytellerAgent = require('./agents/storyteller');
const NarratorAgent = require('./agents/narrator');

class MnemonicFactory {
    constructor(apiKey) {
        this.apiKey = apiKey;
        
        // Initialize all agents
        this.lexicographer = new LexicographerAgent(apiKey);
        this.pronouncer = new PronouncerAgent(apiKey);
        this.mnemonicCreator = new MnemonicCreatorAgent(apiKey);
        this.artDirector = new ArtDirectorAgent(apiKey);
        this.illustrator = new IllustratorAgent(apiKey);
        this.storyteller = new StorytellerAgent(apiKey);
        this.narrator = new NarratorAgent(apiKey);
        
        // Configuration
        this.batchSize = 5;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // Paths
        this.contentDir = path.join(__dirname, 'content');
        this.imagesDir = path.join(this.contentDir, 'images');
        this.imagesCreatorDir = path.join(this.imagesDir, 'creator');
        this.imagesAiDir = path.join(this.imagesDir, 'ai');
        this.audioDir = path.join(this.contentDir, 'audio');
        this.audioPronounceDir = path.join(this.audioDir, 'pronounce');
        this.audioStoryDir = path.join(this.audioDir, 'story');
        this.wordlistPath = path.join(__dirname, 'wordlist.txt');
        this.outputPath = path.join(this.contentDir, 'content.json');
        this.mnemonicsPath = path.join(this.contentDir, 'mnemonics.json');
    }

    async loadWordlist() {
        try {
            const content = fs.readFileSync(this.wordlistPath, 'utf8');
            const words = content.split('\n')
                .map(word => word.trim())
                .filter(word => word.length > 0);
            
            console.log(`Loaded ${words.length} words from wordlist.txt`);
            return words;
        } catch (error) {
            console.error('Error loading wordlist:', error);
            throw error;
        }
    }

    async loadCreatorMnemonics() {
        try {
            if (fs.existsSync(this.mnemonicsPath)) {
                const content = fs.readFileSync(this.mnemonicsPath, 'utf8');
                const mnemonics = JSON.parse(content);
                console.log(`Loaded ${Object.keys(mnemonics).length} creator mnemonics`);
                return mnemonics;
            } else {
                console.log('No creator mnemonics found');
                return {};
            }
        } catch (error) {
            console.error('Error loading creator mnemonics:', error);
            return {};
        }
    }

    hasCreatorAssets(word) {
        const imagePath = path.join(this.imagesCreatorDir, `${word.toLowerCase()}.png`);
        return fs.existsSync(imagePath);
    }

    async processWord(word, index, creatorMnemonics) {
        console.log(`\nProcessing word ${index + 1}: ${word}`);
        
        try {
            // Agent 1: Lexicographer (always runs)
            console.log('  → Getting definition and example...');
            const lexResult = await this.retryOperation(() => 
                this.lexicographer.generateDefinitionAndExample(word)
            );
            
            if (!lexResult.success) {
                throw new Error(`Lexicographer failed: ${lexResult.error}`);
            }

            // Agent 2: Pronouncer (always runs)
            console.log('  → Generating pronunciation...');
            const pronouncerResult = await this.retryOperation(() => 
                this.pronouncer.generatePronunciation(word, this.audioPronounceDir)
            );
            
            if (!pronouncerResult.success) {
                throw new Error(`Pronouncer failed: ${pronouncerResult.error}`);
            }

            // Initialize word data
            const wordData = {
                word: word,
                definition: lexResult.data.definition,
                example: lexResult.data.example,
                pronunciation_audio_path: pronouncerResult.data.audio_path,
                options: [],
                story_text: '', // Will be filled by storyteller
                story_audio_path: ''   // Will be filled by narrator
            };

            // Check if we have creator assets
            const hasCreatorAssets = this.hasCreatorAssets(word);
            const creatorMnemonic = creatorMnemonics[word.toUpperCase()];

            if (hasCreatorAssets && creatorMnemonic) {
                // Add Creator option
                wordData.options.push({
                    type: "creator",
                    mnemonic_text: creatorMnemonic,
                    image_path: `images/creator/${word.toLowerCase()}.png`
                });
                console.log(`  ✓ Added Creator option`);
            }

            // Always generate AI option
            console.log('  → Creating AI mnemonic...');
            const mnemonicResult = await this.retryOperation(() => 
                this.mnemonicCreator.generateMnemonic(word, lexResult.data.definition)
            );
            
            if (!mnemonicResult.success) {
                throw new Error(`Mnemonic Creator failed: ${mnemonicResult.error}`);
            }

            console.log('  → Creating AI visual prompt...');
            const artResult = await this.retryOperation(() => 
                this.artDirector.generateVisualPrompt(mnemonicResult.data.mnemonic_text)
            );
            
            if (!artResult.success) {
                throw new Error(`Art Director failed: ${artResult.error}`);
            }

            console.log('  → Generating AI image...');
            const imageResult = await this.retryOperation(() => 
                this.illustrator.generateImage(artResult.data.visual_prompt, word, this.imagesAiDir)
            );
            
            if (!imageResult.success) {
                throw new Error(`Illustrator failed: ${imageResult.error}`);
            }

            // Add AI option
            wordData.options.push({
                type: "ai",
                mnemonic_text: mnemonicResult.data.mnemonic_text,
                image_path: imageResult.data.image_path
            });

            console.log(`  ✓ Completed ${word} (${wordData.options.length} options)`);
            return wordData;

        } catch (error) {
            console.error(`  ✗ Failed to process ${word}:`, error.message);
            return null;
        }
    }

    async processStories(words) {
        console.log('\n=== Processing Stories ===');
        const stories = [];
        
        // Process words in batches
        for (let i = 0; i < words.length; i += this.batchSize) {
            const batch = words.slice(i, i + this.batchSize);
            const batchIndex = Math.floor(i / this.batchSize) + 1;
            
            console.log(`\nProcessing story batch ${batchIndex} (words ${i + 1}-${Math.min(i + this.batchSize, words.length)})`);
            
            try {
                // Agent 5: Storyteller
                console.log('  → Creating story...');
                const storyResult = await this.retryOperation(() => 
                    this.storyteller.generateStory(batch)
                );
                
                if (!storyResult.success) {
                    throw new Error(`Storyteller failed: ${storyResult.error}`);
                }

                // Agent 6: Narrator
                console.log('  → Generating audio...');
                const audioResult = await this.retryOperation(() => 
                    this.narrator.generateAudio(storyResult.data.story_text, batchIndex, this.audioStoryDir)
                );
                
                if (!audioResult.success) {
                    throw new Error(`Narrator failed: ${audioResult.error}`);
                }

                // Update all words in this batch with story and audio info
                batch.forEach(wordData => {
                    wordData.story_text = storyResult.data.story_text;
                    wordData.story_audio_path = audioResult.data.audio_path;
                });

                stories.push({
                    batch_index: batchIndex,
                    words: batch.map(w => w.word),
                    story_text: storyResult.data.story_text,
                    audio_path: audioResult.data.audio_path
                });

                console.log(`  ✓ Completed story batch ${batchIndex}`);

            } catch (error) {
                console.error(`  ✗ Failed to process story batch ${batchIndex}:`, error.message);
            }
        }
        
        return stories;
    }

    async retryOperation(operation) {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === this.maxRetries) {
                    throw error;
                }
                console.log(`    Retry ${attempt}/${this.maxRetries} in ${this.retryDelay}ms...`);
                await this.sleep(this.retryDelay);
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async saveContent(words) {
        console.log('\n=== Saving Content ===');
        try {
            fs.writeFileSync(this.outputPath, JSON.stringify(words, null, 2));
            console.log(`✓ Saved content.json with ${words.length} words`);
        } catch (error) {
            console.error('Error saving content:', error);
            throw error;
        }
    }

    async run() {
        console.log('🚀 Starting Mnemonic Factory (A/B Test Mode)...');
        
        try {
            // Load wordlist and creator mnemonics
            const wordlist = await this.loadWordlist();
            const creatorMnemonics = await this.loadCreatorMnemonics();
            
            // Process individual words (Agents 1-4 + Pronouncer)
            console.log('\n=== Processing Individual Words ===');
            const words = [];
            
            for (let i = 0; i < wordlist.length; i++) {
                const wordData = await this.processWord(wordlist[i], i, creatorMnemonics);
                if (wordData) {
                    words.push(wordData);
                }
                
                // Add delay between words to respect rate limits
                if (i < wordlist.length - 1) {
                    await this.sleep(500);
                }
            }
            
            console.log(`\n✓ Processed ${words.length}/${wordlist.length} words successfully`);
            
            // Process stories (Agents 5-6)
            await this.processStories(words);
            
            // Save final content
            await this.saveContent(words);
            
            console.log('\n🎉 Mnemonic Factory completed successfully!');
            console.log(`📁 Content saved to: ${this.outputPath}`);
            console.log(`🖼️  Creator images: ${this.imagesCreatorDir}`);
            console.log(`🖼️  AI images: ${this.imagesAiDir}`);
            console.log(`🎵 Pronunciation audio: ${this.audioPronounceDir}`);
            console.log(`🎵 Story audio: ${this.audioStoryDir}`);
            
        } catch (error) {
            console.error('❌ Mnemonic Factory failed:', error);
            process.exit(1);
        }
    }
}

// Main execution
if (require.main === module) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ Error: GOOGLE_AI_API_KEY environment variable is required');
        console.log('Please set your API key:');
        console.log('1. Copy config.example.env to .env');
        console.log('2. Add your Google AI Studio API key to .env');
        console.log('3. Run: source .env && npm start');
        process.exit(1);
    }
    
    const factory = new MnemonicFactory(apiKey);
    factory.run();
}

module.exports = MnemonicFactory;
