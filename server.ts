import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  app.use(express.json());

  // Gemini Chat Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const chat = ai.chats.create({
        model: 'gemini-3.8-flash',
        history: history || [],
      });
      const result = await chat.sendMessage({ message });
      res.json({ response: result.text });
    } catch (error) {
      console.error('Gemini chat error:', error);
      res.status(500).json({ error: 'Failed to get chat response' });
    }
  });

  // Vite Middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
