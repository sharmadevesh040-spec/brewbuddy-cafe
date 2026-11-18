import { z } from 'zod';

export const recommendationSchema = z.object({
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional().default(''),
  maxBudget: z.number().positive('Budget must be positive').max(5000, 'Budget must be realistic').optional(),
  temperature: z.enum(['hot', 'cold', 'all']).optional().default('all'),
  coffeePreference: z.enum(['coffee', 'non-coffee', 'any']).optional().default('any'),
  vegan: z.boolean().optional().default(false),
  dairyFree: z.boolean().optional().default(false),
  glutenFree: z.boolean().optional().default(false),
  allergenExclusions: z.array(z.string()).optional().default([]),
  caffeinePreference: z.enum(['high', 'medium', 'low', 'none', 'any']).optional().default('any'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      text: z.string().max(1000),
    })
  ).optional().default([]),
});

export const orderItemSchema = z.object({
  id: z.string().optional(),
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Max 20 per item'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  customization: z.object({
    base: z.string().optional(),
    milk: z.string().optional(),
    temperature: z.string().optional(),
    sweetness: z.string().optional(),
    size: z.string().optional(),
    extras: z.array(z.string()).optional(),
    extraPrice: z.number().optional().default(0),
  }).optional(),
  specialInstructions: z.string().max(300, 'Instructions max 300 characters').optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required').max(10, 'Invalid Table ID'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least 1 item'),
  specialNotes: z.string().max(300).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
  note: z.string().max(200).optional(),
});

export const staffRequestSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  reason: z.enum(['assistance', 'water', 'bill', 'other']),
  details: z.string().max(300).optional(),
});

export const billRequestSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  orderId: z.string().optional(),
});
