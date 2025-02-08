// File: server.js
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Initialize Express and Gemini AI
const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper function to create prompts based on user input
const createPrompt = (companyName, product, platform, contentType) => {
    if (contentType === 'headlines') {
        return `Generate 5 engaging headlines for ${companyName}'s product ${product} that would work well on ${platform}. 
                Make them attention-grabbing and optimized for ${platform}'s audience. 
                Format them as a numbered list.`;
    } else {
        return `Generate 3 compelling call-to-action messages for ${companyName}'s product ${product} that would work well on ${platform}. 
                Make them persuasive and optimized for ${platform}'s audience. 
                Format them as a numbered list.`;
    }
};

// Generate content endpoint
app.post('/generate', async (req, res) => {
    try {
        const { companyName, product, platform, contentType } = req.body;
        
        // Validate input
        if (!companyName || !product || !platform || !contentType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Gemini AI model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Generate content
        const prompt = createPrompt(companyName, product, platform, contentType);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the numbered list into an array
        const lines = text.split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim());

        res.json({
            platform,
            contentType,
            content: lines
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});