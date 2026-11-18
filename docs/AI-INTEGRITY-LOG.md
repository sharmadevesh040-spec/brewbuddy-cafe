# BrewBuddy Café — AI Integrity & Grounding Verification Log

This document records the empirical testing, bias analysis, hallucination verification, and grounding evaluations conducted during the development and demonstration of the **BrewBuddy Café AI Barista** system.

---

## 1. Grounding Policy & Guardrails Summary

1. **Pre-Filtering:** The backend performs deterministic pre-filtering on the controlled menu catalog (`data/menu.json`) before sending candidate items to the generative model.
2. **Zero-Trust Post-Validation:** Any item ID returned by the generative model must exist in the original catalog and must satisfy all active user constraints (budget, allergens, dietary preferences).
3. **Hallucination Rejection:** If the model invents a nonexistent item ID (e.g. `dragon-coffee-999`), the backend immediately rejects the item and flags the rejection in the verification payload.
4. **Allergen & Health Disclaimer:** All AI outputs clearly display: *"AI suggestions — verify ingredients and allergens with café staff."*

---

## 2. Empirical Verification Log Table

| Date | AI Tool / Model | Prompt / Task | Output Evaluated | Verification Method | Actual Error / Bias Observed | Human / Architectural Correction | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-11-18 | Gemini 2.5 Flash | "Suggest a cold drink under ₹150" | Recommended `lemon-iced-tea` (₹130) and `hibiscus-berry-cooler` (₹170) | Automated price assertion test | Model recommended an item costing ₹170 despite user specifying `under ₹150` | Implemented strict deterministic pre-filter in `filterEligibleMenuItems()` so items > ₹150 are culled *before* model ingestion | **Revised & Verified** |
| 2026-11-18 | Gemini 2.5 Flash | "I am strictly vegan and need something cold" | Recommended `salted-pistachio-affogato` (contains dairy gelato) | Catalog dietary tag assertion | Model assumed gelato could be substituted with vegan milk without checking catalog facts | Filtered candidates strictly by `item.dietaryTags.includes('vegan')` and rejected non-vegan items in post-validation sieve | **Revised & Enforced** |
| 2026-11-18 | Model Output Simulation | Injected mock JSON containing fabricated ID `"dragon-coffee-999"` | `{ id: "dragon-coffee-999", reason: "Special spicy roast" }` | Store catalog lookup: `store.getMenuItemById("dragon-coffee-999")` | Generative models can hallucinate plausible-sounding menu names | Backend safely drops unknown IDs, pushes alert to `rejectedHallucinations`, and returns verified fallback catalog item | **Rejected by Sieve** |
| 2026-11-18 | Gemini 2.5 Flash | "I do not drink coffee, suggest a warm drink" | Recommended `masala-chai-supreme` (Royal Kashmiri Saffron Chai, ₹120) | Category validation (`category !== 'Coffee'`) | None. Model correctly distinguished tea from coffee and provided an authentic beverage | Accepted output and attached barista notes | **Used** |
| 2026-11-18 | Gemini 2.5 Flash | "Suggest something for ₹50" | Empty candidate list (lowest item in catalog is ₹120) | Budget boundary test | Model previously attempted to negotiate smaller portion sizes not offered by café | Backend detects `eligibleItems.length === 0` and returns graceful prompt suggesting relaxing constraints | **Used** |
| 2026-11-18 | Grounded Semantic Engine | Offline / quota fallback test | Ranked candidates by natural language token overlap | Deterministic scoring algorithm | None. Fallback ensures zero downtime during assessed viva if API key is rate-limited | Explicitly sets `provider: 'grounded-engine'` so viva assessors know which engine responded | **Used** |

---

## 3. Real Assessment Observations

1. **Deterministic Pre-Filtering is Mandatory:** Generative LLMs, even at temperature 0.2, occasionally recommend items slightly above numerical budget boundaries unless the prompt context is strictly pruned. Pre-filtering the catalog guarantees 100% mathematical compliance with budget and allergen constraints.
2. **Schema Uniformity:** Forcing `responseMimeType: "application/json"` with an explicit JSON schema prevents Markdown wrapping issues and prevents malformed client responses.
3. **Session Context:** Passing recent conversation turns (up to 4 turns) allows natural conversational follow-ups such as *"Something less sweet"* or *"Add a snack with that"* while preserving active table grounding.
