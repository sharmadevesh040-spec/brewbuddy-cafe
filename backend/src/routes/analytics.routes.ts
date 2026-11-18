import { Router } from 'express';
import { store } from '../data/store.js';

export const analyticsRouter = Router();

analyticsRouter.get('/', (_req, res) => {
  const analytics = store.getAnalytics();
  res.json(analytics);
});
