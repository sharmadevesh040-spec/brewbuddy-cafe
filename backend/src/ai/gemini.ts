import { GoogleGenAI } from '@google/genai';
import { store } from '../data/store.js';
import type {
  MenuItem,
  RecommendationRequest,
  RecommendationResponse,
  ValidatedRecommendation,
} from '../types/index.js';

interface RawAiRecommendation {
  id: string;
  reason: string;
}

interface RawAiResponse {
  greeting?: string;
  recommendations: RawAiRecommendation[];
  thoughtProcess?: string;
}

/**
 * Filter menu items deterministically before passing to AI
 */
export function filterEligibleMenuItems(
  catalog: MenuItem[],
  criteria: RecommendationRequest
): { eligible: MenuItem[]; rejectionReasons: Record<string, string[]> } {
  const rejectionReasons: Record<string, string[]> = {};

  const eligible = catalog.filter((item) => {
    const reasons: string[] = [];

    // 1. Budget filter (STRICT)
    if (criteria.maxBudget !== undefined && criteria.maxBudget > 0) {
      if (item.price > criteria.maxBudget) {
        reasons.push(`Price ₹${item.price} exceeds budget ₹${criteria.maxBudget}`);
      }
    }

    // 2. Coffee preference filter
    if (criteria.coffeePreference === 'coffee' && item.category !== 'Coffee' && item.category !== 'Specials') {
      reasons.push(`Item is not coffee`);
    } else if (criteria.coffeePreference === 'non-coffee' && (item.category === 'Coffee' || item.id === 'salted-pistachio-affogato')) {
      reasons.push(`User requested non-coffee drinks only`);
    }

    // 3. Temperature filter
    if (criteria.temperature && criteria.temperature !== 'all') {
      if (item.temperature !== criteria.temperature && item.temperature !== 'room') {
        reasons.push(`Item temperature is ${item.temperature}, requested ${criteria.temperature}`);
      }
    }

    // 4. Vegan filter
    if (criteria.vegan) {
      if (!item.dietaryTags.includes('vegan')) {
        reasons.push(`Item is not certified vegan`);
      }
    }

    // 5. Dairy-free filter
    if (criteria.dairyFree) {
      if (!item.dietaryTags.includes('dairy-free') && item.allergens.includes('dairy')) {
        reasons.push(`Contains dairy`);
      }
    }

    // 6. Gluten-free filter
    if (criteria.glutenFree) {
      if (!item.dietaryTags.includes('gluten-free') && item.allergens.includes('gluten')) {
        reasons.push(`Contains gluten`);
      }
    }

    // 7. Allergen exclusions filter
    if (criteria.allergenExclusions && criteria.allergenExclusions.length > 0) {
      for (const allergen of criteria.allergenExclusions) {
        const normalized = allergen.toLowerCase().trim();
        if (item.allergens.map((a) => a.toLowerCase()).includes(normalized)) {
          reasons.push(`Contains excluded allergen: ${allergen}`);
        }
      }
    }

    // 8. Caffeine preference
    if (criteria.caffeinePreference && criteria.caffeinePreference !== 'any') {
      if (criteria.caffeinePreference === 'none' && item.caffeine !== 'none') {
        reasons.push(`User requested caffeine-free, item has ${item.caffeine} caffeine`);
      } else if (criteria.caffeinePreference === 'high' && item.caffeine !== 'high') {
        reasons.push(`User requested high caffeine`);
      } else if (criteria.caffeinePreference === 'low' && item.caffeine !== 'low' && item.caffeine !== 'none') {
        reasons.push(`User requested low caffeine`);
      }
    }

    if (reasons.length > 0) {
      rejectionReasons[item.id] = reasons;
      return false;
    }
    return true;
  });

  return { eligible, rejectionReasons };
}

/**
 * Fallback semantic reasoning engine when GEMINI_API_KEY is not configured
 */
function runGroundedSemanticEngine(
  eligibleItems: MenuItem[],
  request: RecommendationRequest
): RecommendationResponse {
  const query = (request.message || '').toLowerCase();

  // Score candidate items based on natural language keywords
  const scored = eligibleItems.map((item) => {
    let score = 0;
    const text = `${item.name} ${item.description} ${item.ingredients.join(' ')} ${item.category}`.toLowerCase();

    if (query.includes('cold') && item.temperature === 'cold') score += 5;
    if (query.includes('hot') && item.temperature === 'hot') score += 5;
    if (query.includes('sweet') && (item.category === 'Desserts' || text.includes('sweet') || text.includes('caramel') || text.includes('honey'))) score += 3;
    if (query.includes('refresh') && (item.category === 'Coolers' || text.includes('mint') || text.includes('lemon'))) score += 5;
    if (query.includes('tea') && item.category === 'Tea') score += 6;
    if (query.includes('snack') && item.category === 'Snacks') score += 6;
    if (query.includes('dessert') && item.category === 'Desserts') score += 6;
    if (query.includes('light') && item.caffeine === 'none') score += 3;
    if (query.includes('caffeine') && item.caffeine === 'high') score += 4;
    if (query.includes('under') || query.includes('budget') || query.includes('cheap')) {
      score += (1000 - item.price) / 100; // Prefer cheaper items when budget mentioned
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top 1 to 3 items
  const selected = scored.slice(0, Math.min(scored.length, 3)).map(({ item }) => item);

  const recommendations: ValidatedRecommendation[] = selected.map((item) => {
    let reason = `Specially selected from our artisanal menu.`;
    if (item.category === 'Coolers') {
      reason = `Crisp, refreshing, handcrafted with natural fruits and zero caffeine.`;
    } else if (item.category === 'Tea') {
      reason = `Delicately brewed whole-leaf tea, aromatic, refreshing, and perfectly balanced.`;
    } else if (item.category === 'Coffee') {
      reason = `Single-estate specialty roast with rich crema and nuanced tasting notes.`;
    } else if (item.category === 'Snacks') {
      reason = `Freshly prepared café snack using artisanal bread and quality ingredients.`;
    } else if (item.category === 'Desserts') {
      reason = `Decadent house-baked specialty treat, perfect accompaniment to your drink.`;
    }

    if (request.maxBudget) {
      reason += ` Comfortably within your ₹${request.maxBudget} budget at ₹${item.price}.`;
    }

    return {
      id: item.id,
      item,
      reason,
    };
  });

  let greeting = `Welcome to BrewBuddy! Here are our certified barista recommendations curated just for you.`;
  if (recommendations.length === 0) {
    greeting = `No menu items currently match all of those strict requirements. Try relaxing one constraint (e.g. increasing budget or broadening temperature preferences).`;
  }

  return {
    recommendations,
    greeting,
    disclaimer: 'AI suggestions — verify ingredients and allergens with café staff.',
    modelUsed: 'BrewBuddy Grounded Barista Engine (Catalog-Verified)',
    provider: 'grounded-engine',
    filterStats: {
      totalCatalogItems: store.getMenuItems().length,
      eligibleItemsCount: eligibleItems.length,
    },
  };
}

/**
 * Main AI Recommendation handler with strict Grounding and Hallucination Rejection
 */
export async function getBaristaRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const fullCatalog = store.getMenuItems();

  // Step 1: Pre-filter catalog with deterministic rules (budget, allergens, coffee pref, temp)
  const { eligible: eligibleItems } = filterEligibleMenuItems(fullCatalog, request);

  if (eligibleItems.length === 0) {
    return {
      recommendations: [],
      greeting: `No menu items match all of those requirements. Would you like to relax one constraint, such as increasing the budget or adjusting dietary preferences?`,
      disclaimer: 'AI suggestions — verify ingredients and allergens with café staff.',
      modelUsed: 'BrewBuddy Grounding Filter',
      provider: 'grounded-engine',
      rejectedHallucinations: [],
      filterStats: {
        totalCatalogItems: fullCatalog.length,
        eligibleItemsCount: 0,
      },
    };
  }

  // Check if GEMINI_API_KEY is configured
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Return grounded semantic engine
    return runGroundedSemanticEngine(eligibleItems, request);
  }

  // Step 2: Use Real Gemini API with strict structured schema and catalog grounding
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Prepare controlled menu representation with only eligible items
    const candidateMenuSummary = eligibleItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      temperature: item.temperature,
      caffeine: item.caffeine,
      dietaryTags: item.dietaryTags,
      allergens: item.allergens,
      description: item.description,
    }));

    const conversationHistoryText = (request.history || [])
      .map((h) => `${h.role === 'user' ? 'Customer' : 'Barista'}: ${h.text}`)
      .join('\n');

    const prompt = `You are the Master Barista at BrewBuddy Café.
Your task is to recommend 1 to 3 items from the following PRE-FILTERED ELIGIBLE MENU for the customer's request.

CRITICAL GROUNDING RULES:
1. You MUST ONLY recommend item IDs that exist in the provided ELIGIBLE MENU below.
2. DO NOT invent, hallucinate, or recommend any item not listed in the ELIGIBLE MENU.
3. Every recommended item's price MUST NOT exceed the customer's budget if specified.
4. Provide a warm, concise, professional reason (1-2 sentences) for each recommendation.
5. Return your output strictly as a JSON object matching this schema:
{
  "greeting": "Friendly barista greeting or conversational reply",
  "recommendations": [
    {
      "id": "exact-item-id-from-menu",
      "reason": "Specific reason why this fits the user's taste and requirements"
    }
  ]
}

CUSTOMER REQUEST:
"${request.message || 'Please recommend your top specialties.'}"

MAX BUDGET: ${request.maxBudget ? `₹${request.maxBudget}` : 'Not restricted'}
TEMPERATURE: ${request.temperature || 'Any'}
COFFEE PREFERENCE: ${request.coffeePreference || 'Any'}
VEGAN: ${request.vegan ? 'Yes (Strict)' : 'No'}
ALLERGEN EXCLUSIONS: ${request.allergenExclusions?.join(', ') || 'None'}
CAFFEINE: ${request.caffeinePreference || 'Any'}

PREVIOUS CONVERSATION:
${conversationHistoryText || 'None'}

ELIGIBLE MENU (ONLY CHOOSE FROM HERE):
${JSON.stringify(candidateMenuSummary, null, 2)}
`;

    // Call Gemini Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3, // Low temperature for high adherence to grounding
      },
    });

    const responseText = response.text || '{}';
    let rawOutput: RawAiResponse;

    try {
      rawOutput = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('[AI Barista] Failed to parse Gemini JSON response:', responseText, parseErr);
      return runGroundedSemanticEngine(eligibleItems, request);
    }

    // Step 3: RIGOROUS BACKEND POST-VALIDATION
    // Any hallucinated ID, over-budget item, or allergen violation MUST BE REJECTED!
    const validatedRecommendations: ValidatedRecommendation[] = [];
    const rejectedHallucinations: string[] = [];

    const rawList = Array.isArray(rawOutput.recommendations) ? rawOutput.recommendations : [];

    for (const rec of rawList) {
      if (!rec || !rec.id) continue;

      // 1. Check if ID exists in the original master menu catalog
      const catalogItem = store.getMenuItemById(rec.id);
      if (!catalogItem) {
        console.warn(`[AI Barista Validation] REJECTED HALLUCINATED ITEM ID: "${rec.id}"`);
        rejectedHallucinations.push(`Unknown item ID "${rec.id}" (Rejected hallucination)`);
        continue;
      }

      // 2. Check if ID is in the eligible items list
      const isEligible = eligibleItems.some((e) => e.id === rec.id);
      if (!isEligible) {
        console.warn(`[AI Barista Validation] REJECTED INELIGIBLE ITEM ID: "${rec.id}"`);
        rejectedHallucinations.push(`Item "${catalogItem.name}" rejected because it violates constraints`);
        continue;
      }

      // 3. Check budget constraint
      if (request.maxBudget && catalogItem.price > request.maxBudget) {
        console.warn(`[AI Barista Validation] REJECTED OVER-BUDGET ITEM: "${catalogItem.name}" (₹${catalogItem.price} > ₹${request.maxBudget})`);
        rejectedHallucinations.push(`Item "${catalogItem.name}" price ₹${catalogItem.price} exceeds budget ₹${request.maxBudget}`);
        continue;
      }

      // 4. Check allergen constraint
      if (request.allergenExclusions && request.allergenExclusions.length > 0) {
        const itemAllergens = catalogItem.allergens.map((a) => a.toLowerCase());
        const hasExcluded = request.allergenExclusions.some((exc) =>
          itemAllergens.includes(exc.toLowerCase().trim())
        );
        if (hasExcluded) {
          console.warn(`[AI Barista Validation] REJECTED ALLERGEN VIOLATION: "${catalogItem.name}"`);
          rejectedHallucinations.push(`Item "${catalogItem.name}" contains excluded allergen`);
          continue;
        }
      }

      // 5. Check vegan constraint
      if (request.vegan && !catalogItem.dietaryTags.includes('vegan')) {
        console.warn(`[AI Barista Validation] REJECTED NON-VEGAN ITEM: "${catalogItem.name}"`);
        rejectedHallucinations.push(`Item "${catalogItem.name}" is not certified vegan`);
        continue;
      }

      // Passed all checks!
      validatedRecommendations.push({
        id: catalogItem.id,
        item: catalogItem,
        reason: rec.reason || `A hand-crafted café favorite tailored to your tastes.`,
      });
    }

    // If all AI suggestions were rejected or empty, fallback to grounded engine to ensure user gets a valid answer
    if (validatedRecommendations.length === 0 && eligibleItems.length > 0) {
      console.warn('[AI Barista] All AI recommendations rejected; invoking grounded semantic engine');
      const fallbackResult = runGroundedSemanticEngine(eligibleItems, request);
      return {
        ...fallbackResult,
        rejectedHallucinations,
        provider: 'gemini-api',
        modelUsed: 'gemini-2.5-flash (Validated with Grounded Fallback)',
      };
    }

    return {
      recommendations: validatedRecommendations,
      greeting: rawOutput.greeting || `Here are your personalized BrewBuddy recommendations:`,
      disclaimer: 'AI suggestions — verify ingredients and allergens with café staff.',
      modelUsed: 'gemini-2.5-flash',
      provider: 'gemini-api',
      rejectedHallucinations,
      filterStats: {
        totalCatalogItems: fullCatalog.length,
        eligibleItemsCount: eligibleItems.length,
      },
    };
  } catch (apiErr) {
    console.error('[AI Barista] Gemini API call error:', apiErr);
    // Graceful fallback to verified grounded engine
    const fallback = runGroundedSemanticEngine(eligibleItems, request);
    return {
      ...fallback,
      disclaimer: 'AI suggestions — verify ingredients with staff (Offline Grounded Mode).',
    };
  }
}
