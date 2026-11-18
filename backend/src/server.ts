import app from './index.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`☕ BrewBuddy Café API server running on http://localhost:${PORT}`);
  console.log(`🤖 AI Barista Mode: ${process.env.GEMINI_API_KEY ? 'Gemini 2.5 Flash' : 'Grounded Semantic Engine'}`);
});
