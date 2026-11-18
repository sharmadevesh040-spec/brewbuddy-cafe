# BrewBuddy Café — 4–6 Minute Assessment Demo Script

This script provides an exact step-by-step sequence for viva examiners, hackathon judges, and presentation demonstrations.

---

## Preparation (Before Starting)
1. Ensure the application is running:
   ```bash
   npm run dev
   ```
2. Open two browser windows side-by-side:
   * **Window A (Customer):** `http://localhost:5173`
   * **Window B (Staff / Kitchen):** `http://localhost:5173/admin/dashboard`

---

## 26-Step Demonstration Sequence

### Part 1: Visual Identity & Responsive Experience (0:00 – 1:00)
1. **Open BrewBuddy Home Page:**
   * Navigate to `http://localhost:5173`.
   * Point out the premium café editorial aesthetic: Fraunces serif typography, warm espresso and oat palette (`#2A201C`, `#F6F1E8`), subtle parallax hero entrance, and the demo mode disclaimer banner.
2. **Show Responsive Design & Accessibility:**
   * Resize window to mobile view (390px) to showcase the touch-friendly mobile drawer, sticky blur navigation, and scroll progress indicator.
   * Open the Accessibility settings modal (eye icon) and toggle Dark Mode and High Contrast to show accessible color contrasts.
3. **Open Menu Page:**
   * Click **Explore Menu** (`/menu`).
   * Show live search, category tabs (Coffee, Tea, Coolers, Snacks, Desserts, Specials), price slider, and allergen exclusions. Note that all items are priced in INR (`₹`) and grounded in `data/menu.json`.

---

### Part 2: Table QR Scan & AI Barista Grounding (1:00 – 2:30)
4. **Scan / Enter Table 12:**
   * Navigate to **Scan Table** (`/scan`).
   * Show the 4 scan modes: Live Camera Scanner, Image Upload, Manual Table Code, and Presentation Demo Grid.
   * Click **Table 12** on the Demo Grid (or type `12` in manual code).
5. **Show Table 12 Experience:**
   * URL routes to `/table/12`.
   * Point out the persistent table indicator in the navigation: `"Active: Table 12"`. No personal customer data (name, email, phone) was harvested.
6. **Ask the AI Barista:**
   * Click **AI Barista** (`/ai-barista`).
   * Type or click the chip prompt:
     > *"Suggest a cold non-coffee drink under ₹150."*
7. **Show Real AI Response:**
   * Highlight the live response: `Lemon Citrus Blossom Iced Tea` (₹130) or `Chamomile Lavender Herbal Tea`.
   * Explain to examiners: The AI *cannot* hallucinate expensive drinks (e.g. ₹190 Cappuccino) because the backend pre-filters the catalog *before* contacting Gemini.
8. **Add Recommendation to Cart:**
   * Click **Add to Cart** directly on the AI recommendation card. Notice the instant toast notification.
9. **Place Demo Order:**
   * Click the Cart icon (`/order`).
   * Review subtotal (₹130), 5% GST (₹6.50), and total (₹136.50).
   * Notice the clear disclaimer: *"Demo ordering system — no real payment is processed."*
   * Click **Place Demo Order**. Confetti fires!

---

### Part 3: Live Order Tracking & Operational Dispatch (2:30 – 4:00)
10. **Show Order #BBxxxx Screen:**
    * Automatically lands on `/order/:orderId` (e.g. `Order #BB1025`).
11. **Show Exact Order Timestamp:**
    * Point out the live status: `NEW` and the timeline showing `Order Placed — 8:42 PM` with estimated preparation time (e.g. 5 minutes).
12. **Switch to Staff Dashboard (Window B):**
    * Open `http://localhost:5173/admin/dashboard`.
    * Show live analytics: Total Orders, Demo Revenue, Active Tables, and the newly received order card in the Live Order Board.
13. **Accept Order:**
    * Click **Accept Order** on the card. Status transitions to `ACCEPTED`.
14. **Start Preparation:**
    * Click **Start Preparing**. Status transitions to `PREPARING`.
15. **Show Preparation Timer:**
    * Notice the active elapsed stopwatch ticking in real time (`00:15`, `00:16`...).
16. **Mark Ready:**
    * Click **Mark Ready**. Status updates to `READY`, stopping the timer and recording the actual preparation duration for average prep analytics.
17. **Return to Customer Screen (Window A):**
    * Look at Window A—synchronized in real time via Server-Sent Events (SSE).
18. **Show Ready Status & Timestamps:**
    * Status shows purple `READY` badge with exact timestamps recorded for each transition.
19. **Call Staff:**
    * Click **Call Staff** on customer screen, select *"Need Water"*, and submit.
20. **Show Staff Notification:**
    * On Staff Dashboard (Window B), the Customer Table Calls card immediately shows: `Table 12 — water — Pending`. Click **Mark Handled**.
21. **Request Bill:**
    * On customer screen, click **Request Bill**.
22. **Show Bill Request:**
    * On Staff Dashboard, the Bill Requests card shows Table 12 bill summary with total demo amount. Click **Bill Prepared** then **Settle Table**.

---

### Part 4: Kitchen Display, AI Lab & GitHub Verification (4:00 – 5:30)
23. **Open Kitchen Display System (KDS):**
    * Navigate to `http://localhost:5173/kitchen`.
    * Show the large-touch screen interface with 3 columns: `1. NEW TICKETS`, `2. PREPARING` (with stopwatch timer), and `3. READY FOR PICKUP`. Show the audio chime toggle.
24. **Open Table QR Management:**
    * Open `http://localhost:5173/admin/tables`.
    * Show the grid of all 20 tables. Click **QR Code** on Table 12 to demonstrate genuine SVG/PNG download and the **Print Table QR** stand layout.
25. **Open AI Transparency Lab:**
    * Navigate to `/ai-lab`.
    * Walk examiners through the 7-stage architectural flowchart: User -> Zod Input Validation -> Menu Filtering -> Gemini Model -> Structured JSON -> Backend Sieve -> Customer.
    * Use the **Interactive Hallucination Sandbox** to simulate an injected fake item ID (`dragon-coffee-999`) and show the terminal rejecting it in real time.
26. **Open GitHub Repository via QR:**
    * Click **View Source on GitHub** in the footer to show the repository QR code and project credits.
