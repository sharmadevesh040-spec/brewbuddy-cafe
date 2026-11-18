import { Router } from 'express';
import { getBaristaRecommendations } from '../ai/gemini.js';
import { recommendationSchema } from '../validation/schemas.js';

export const aiRouter = Router();

aiRouter.post('/recommend', async (req, res) => {
  const result = recommendationSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid AI request parameters',
      details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  try {
    const response = await getBaristaRecommendations(result.data);
    res.json(response);
  } catch (err: any) {
    console.error('[AI Router Error]:', err);
    res.status(500).json({
      error: 'AI Barista is temporarily unavailable.',
      message: 'Please try again or browse our menu directly.',
    });
  }
});
