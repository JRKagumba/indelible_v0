require('dotenv').config();

const MnemonicFactory = require('./mnemonic-factory');
const fs = require('fs');
const path = require('path');

class TestABPipeline {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.testWords = ['Reticent', 'Pugnacious', 'Ephemeral']; // Small test set
    }

    async createTestWordlist() {
        const testWordlistPath = path.join(__dirname, 'test-wordlist.txt');
        const content = this.testWords.join('\n');
        fs.writeFileSync(testWordlistPath, content);
        console.log(`Created test wordlist with ${this.testWords.length} words`);
        return testWordlistPath;
    }

    async runTest() {
        console.log('🧪 Starting A/B Test Pipeline...');
        console.log(`Testing with words: ${this.testWords.join(', ')}`);
        
        try {
            // Create test wordlist
            const testWordlistPath = await this.createTestWordlist();
            
            // Temporarily replace the main wordlist
            const originalWordlistPath = path.join(__dirname, 'wordlist.txt');
            const backupPath = path.join(__dirname, 'wordlist-backup.txt');
            
            // Backup original
            if (fs.existsSync(originalWordlistPath)) {
                fs.copyFileSync(originalWordlistPath, backupPath);
            }
            
            // Use test wordlist
            fs.copyFileSync(testWordlistPath, originalWordlistPath);
            
            // Run factory
            const factory = new MnemonicFactory(this.apiKey);
            await factory.run();
            
            // Restore original wordlist
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, originalWordlistPath);
                fs.unlinkSync(backupPath);
            }
            
            // Clean up test files
            fs.unlinkSync(testWordlistPath);
            
            console.log('✅ A/B Test completed successfully!');
            
            // Show sample output
            const contentPath = path.join(__dirname, 'content', 'content.json');
            if (fs.existsSync(contentPath)) {
                const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
                console.log('\n📊 Sample A/B Test Output:');
                content.slice(0, 1).forEach(word => {
                    console.log(`\nWord: ${word.word}`);
                    console.log(`Definition: ${word.definition}`);
                    console.log(`Pronunciation: ${word.pronunciation_audio_path}`);
                    console.log(`Options (${word.options.length}):`);
                    word.options.forEach((option, i) => {
                        console.log(`  ${i + 1}. ${option.type.toUpperCase()}: ${option.mnemonic_text}`);
                        console.log(`     Image: ${option.image_path}`);
                    });
                });
            }
            
        } catch (error) {
            console.error('❌ A/B Test failed:', error);
            
            // Restore original wordlist if it exists
            const backupPath = path.join(__dirname, 'wordlist-backup.txt');
            const originalWordlistPath = path.join(__dirname, 'wordlist.txt');
            
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, originalWordlistPath);
                fs.unlinkSync(backupPath);
            }
            
            process.exit(1);
        }
    }
}

// Main execution
if (require.main === module) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ Error: GOOGLE_AI_API_KEY environment variable is required');
        process.exit(1);
    }
    
    const tester = new TestABPipeline(apiKey);
    tester.runTest();
}

module.exports = TestABPipeline;
