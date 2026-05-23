import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for generating ad script
  app.post("/api/generate-ad", async (req, res) => {
    try {
      const { product, audience, platform, tone, usp, avoidKeywords, includeVisualCues, language = 'Indonesian' } = req.body;

      if (!product) {
        res.status(400).json({ error: "Product description is required." });
        return;
      }

      const languageInstruction = language === "English" 
        ? "high-converting ad script in English" 
        : "high-converting ad script in Indonesian";

      const languageNuance = language === "English"
        ? "Use emojis, and keep the language natural and engaging. Keep it punchy!"
        : "Use emojis, and keep the language natural, modern Indonesian (using 'kamu', 'gue' or 'kalian' as appropriate for the tone). Keep it punchy!";

      const prompt = `You are a world-class copywriter. Write a highly engaging, ${languageInstruction}.
      
Product Details: ${product}
Target Audience: ${audience || 'General audience'}
Platform: ${platform || 'TikTok/Reels'}
Tone/Style: ${tone || 'Persuasive, energetic, and engaging'}
${usp ? `Unique Selling Point (USP): ${usp}` : ''}
${avoidKeywords ? `Keywords/Phrases to EXCLUDE: DO NOT USE the following words or phrases in the script: ${avoidKeywords}` : ''}

Format the output cleanly into 3 sections:
1. HOOK (first 3-5 seconds to grab attention immediately)
2. BODY (the value proposition, addressing pain points, and product features)
3. CALL TO ACTION (what to do next)

${includeVisualCues ? `IMPORTANT: For EACH section of the script, include a brief "Visual / Camera:" cue or storyboard idea describing what should be happening on screen to assist the video production team (e.g., "[Visual: B-roll of product close-up, text overlay appears]").` : ''}

${languageNuance}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ script: response.text });
    } catch (error) {
      console.error("Error generating ad script:", error);
      res.status(500).json({ error: "Failed to generate ad script. Please try again later." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
