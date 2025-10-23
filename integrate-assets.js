const fs = require('fs');
const path = require('path');

class AssetIntegrator {
    constructor() {
        this.sourceDir = 'C:\\Users\\jrkag\\OneDrive\\Desktop\\vocabulary-images';
        this.targetDir = path.join(__dirname, 'content', 'images', 'creator');
        this.mnemonicsFile = path.join(this.sourceDir, 'mneumonics.txt');
    }

    async integrateAssets() {
        console.log('🔄 Integrating existing assets...');
        
        try {
            // Create target directory
            if (!fs.existsSync(this.targetDir)) {
                fs.mkdirSync(this.targetDir, { recursive: true });
                console.log(`✅ Created directory: ${this.targetDir}`);
            }

            // Parse mnemonics file
            const mnemonicsMap = await this.parseMnemonicsFile();
            console.log(`📝 Loaded ${Object.keys(mnemonicsMap).length} mnemonics`);

            // Copy and rename images
            const imageFiles = fs.readdirSync(this.sourceDir)
                .filter(file => file.endsWith('.png'))
                .sort();

            let copiedCount = 0;
            for (const imageFile of imageFiles) {
                const word = this.extractWordFromFilename(imageFile);
                if (word) {
                    const sourcePath = path.join(this.sourceDir, imageFile);
                    const targetPath = path.join(this.targetDir, `${word.toLowerCase()}.png`);
                    
                    fs.copyFileSync(sourcePath, targetPath);
                    copiedCount++;
                    console.log(`  ✓ Copied: ${imageFile} → ${word.toLowerCase()}.png`);
                }
            }

            console.log(`✅ Successfully copied ${copiedCount} images`);
            
            // Save mnemonics mapping
            const mnemonicsPath = path.join(__dirname, 'content', 'mnemonics.json');
            fs.writeFileSync(mnemonicsPath, JSON.stringify(mnemonicsMap, null, 2));
            console.log(`✅ Saved mnemonics mapping to: ${mnemonicsPath}`);

            return {
                success: true,
                data: {
                    imagesCopied: copiedCount,
                    mnemonicsLoaded: Object.keys(mnemonicsMap).length,
                    mnemonicsPath: mnemonicsPath
                }
            };

        } catch (error) {
            console.error('❌ Error integrating assets:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    extractWordFromFilename(filename) {
        // Extract word from filename like "1738756799450-reticent.png"
        const match = filename.match(/\d+-(.+)\.png$/);
        return match ? match[1] : null;
    }

    async parseMnemonicsFile() {
        try {
            const content = fs.readFileSync(this.mnemonicsFile, 'utf8');
            const mnemonicsMap = {};
            
            // Split by word separators
            const wordSections = content.split(/={40,}/);
            
            for (const section of wordSections) {
                const lines = section.trim().split('\n');
                if (lines.length < 2) continue;
                
                const word = lines[0].trim().toUpperCase();
                if (!word) continue;
                
                // Find the best mnemonic (usually the first one after "Mnemonics:")
                let bestMnemonic = '';
                let inMnemonicsSection = false;
                
                for (const line of lines) {
                    if (line.includes('Mnemonics:')) {
                        inMnemonicsSection = true;
                        continue;
                    }
                    
                    if (inMnemonicsSection && line.trim().startsWith('?')) {
                        // Extract the mnemonic text (remove the "? " prefix)
                        const mnemonicText = line.trim().substring(2);
                        if (mnemonicText && !bestMnemonic) {
                            bestMnemonic = mnemonicText;
                            break; // Take the first good mnemonic
                        }
                    }
                }
                
                if (bestMnemonic) {
                    mnemonicsMap[word] = bestMnemonic;
                }
            }
            
            return mnemonicsMap;
            
        } catch (error) {
            console.error('Error parsing mnemonics file:', error);
            return {};
        }
    }
}

// Main execution
if (require.main === module) {
    const integrator = new AssetIntegrator();
    integrator.integrateAssets();
}

module.exports = AssetIntegrator;
