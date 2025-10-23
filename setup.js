#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Indelible v0 - Mnemonic Factory Setup');
console.log('==========================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'config.example.env');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file');
        console.log('⚠️  Please edit .env and add your Google AI Studio API key');
    } else {
        console.log('❌ config.example.env not found');
        process.exit(1);
    }
} else {
    console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('\n📦 Installing dependencies...');
    console.log('Run: npm install');
} else {
    console.log('✅ Dependencies already installed');
}

// Check project structure
console.log('\n📁 Checking project structure...');
const requiredDirs = ['content', 'content/images', 'content/audio', 'agents'];
const requiredFiles = ['wordlist.txt', 'mnemonic-factory.js', 'package.json'];

let structureOk = true;

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/`);
    } else {
        console.log(`❌ ${dir}/ - Missing`);
        structureOk = false;
    }
});

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - Missing`);
        structureOk = false;
    }
});

if (!structureOk) {
    console.log('\n❌ Project structure incomplete');
    process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Get your Google AI Studio API key from: https://aistudio.google.com/');
console.log('2. Edit .env file and add your API key');
console.log('3. Run: npm install');
console.log('4. Test with: npm test');
console.log('5. Generate full content with: npm start');
