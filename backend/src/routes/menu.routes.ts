import { Router } from 'express';
import { store } from '../data/store.js';

export const menuRouter = Router();

menuRouter.get('/', (req, res) => {
  let items = store.getMenuItems();
  const { category, search, dietary, caffeine, temperature, maxPrice } = req.query;

  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.ingredients.some((ing) => ing.toLowerCase().includes(q))
    );
  }

  if (dietary && typeof dietary === 'string') {
    const tags = dietary.split(',').map((t) => t.trim().toLowerCase());
    items = items.filter((item) => tags.every((tag) => item.dietaryTags.map((t) => t.toLowerCase()).includes(tag)));
  }

  if (caffeine && typeof caffeine === 'string' && caffeine !== 'all') {
    items = items.filter((item) => item.caffeine.toLowerCase() === caffeine.toLowerCase());
  }

  if (temperature && typeof temperature === 'string' && temperature !== 'all') {
    items = items.filter((item) => item.temperature.toLowerCase() === temperature.toLowerCase());
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    const max = Number(maxPrice);
    items = items.filter((item) => item.price <= max);
  }

  res.json({
    count: items.length,
    items,
  });
});

menuRouter.get('/:id', (req, res) => {
  const item = store.getMenuItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json(item);
});
