# Odoo Android Native App UI & Accessible Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an authentic Android Native App UI/UX (Material Design 3) for the Odoo ERP dashboard, tailored for low-vision users who cannot read small text, featuring Android status bar, MD3 top app bar, 9-dot Odoo bottom sheet launcher, MD3 bottom navigation with animated pill, Android FAB, adaptive zoom scaling (100%-160%), `@shoroborno/react` Bengali fonts, and `.env`-based Odoo 19.0 API connection.

**Architecture:** `AndroidAppShell` encompassing Android System Status Bar, Top App Bar, scrollable tab views, FAB, MD3 Bottom Navigation Bar, and System Gesture Bar. Integrates Odoo Modal Bottom Sheet for apps, `--font-scale` adaptive zoom engine, and High-Contrast OLED theme.

**Tech Stack:** React 19, Vite 8, `@shoroborno/react`, `@shoroborno/core`, Lucide React, Canvas Confetti.

**Spec:** `docs/superpowers/specs/2026-09-27-odoo-mobile-accessible-dashboard-design.md`

## Global Constraints
- Must look and behave exactly like a native Android App (Status Bar, MD3 Top Bar, FAB, MD3 Bottom Navigation with active pill, Gesture Bar).
- On desktop, displays inside a realistic Android phone bezel frame (with toggle for full-screen / real phone testing). On mobile, fills 100% of viewport.
- Low-vision accessibility: Adaptive zoom stepper from 100% to 160% with zero text clipping or horizontal scroll.
- High-Contrast OLED theme: `#000000` surface, `#ffffff` text, `#fbbf24` amber, `#38bdf8` cyan highlights, and 2px neon borders.
- `@shoroborno/react` font loading (`solaiman-lipi`, `kalpurush`).
- `.env` environment variables for Odoo 19.0 API credentials (`VITE_ODOO_URL`, `VITE_ODOO_DB`, `VITE_ODOO_LOGIN`, `VITE_ODOO_API_KEY`).

---

### Task 1: Environment Variables & Odoo API Server Configuration

**Files:**
- Create: `.env`
- Create: `.env.example`
- Modify: `vite.config.js:1-80`
- Modify: `src/services/odooApi.js:400-450`

**Interfaces:**
- Produces: `import.meta.env.VITE_ODOO_*` variables accessible in both server middleware and client.

- [ ] **Step 1: Create `.env` and `.env.example`**
```env
# Odoo ERP 19.0 API Connection Configuration
VITE_ODOO_URL=https://fardin.odoo.com
VITE_ODOO_DB=fardin
VITE_ODOO_LOGIN=aldinn.dev@gmail.com
VITE_ODOO_API_KEY=
```

- [ ] **Step 2: Update `vite.config.js` to load env variables via `loadEnv`**
Load `process.env` from `.env` using Vite's `loadEnv(mode, process.cwd(), 'VITE_')`.

- [ ] **Step 3: Update `src/services/odooApi.js` to read from `import.meta.env`**
Wire client default credentials to `import.meta.env.VITE_ODOO_*`.

- [ ] **Step 4: Verify build**
Run: `npx vite build`
Expected: PASS with 0 errors.

---

### Task 2: Material Design 3 CSS System, Android Bezel & Adaptive Zoom Engine

**Files:**
- Modify: `src/index.css:1-300`
- Modify: `src/context/DashboardContext.jsx:1-120`

**Interfaces:**
- Produces: MD3 tokens, `--font-scale`, `--font-family-bangla`, `.android-device-bezel`, `.android-screen`, `.md3-pill`, `[data-theme="high-contrast"]`.

- [ ] **Step 1: Add Android Device Bezel and MD3 styles to `src/index.css`**
Add styles for `.android-device-bezel`, `.android-screen`, `.android-status-bar`, `.md3-top-app-bar`, `.md3-bottom-nav`, `.md3-nav-item`, `.md3-nav-pill`, `.android-fab`, `.android-gesture-bar`.

- [ ] **Step 2: Add `--font-scale` (1.0 to 1.6) and High-Contrast OLED theme**
Define pure black background (`#000000`), white text, amber/cyan highlights, and 2px neon borders.

- [ ] **Step 3: Update `DashboardContext.jsx` with zoom controls & activeTab state**
Add `zoomLevel` (1.0, 1.15, 1.30, 1.45, 1.60), `activeTab` ('home' | 'sales' | 'inventory' | 'attendance' | 'apps'), and `isAppDrawerOpen`.

- [ ] **Step 4: Verify build**
Run: `npx vite build`
Expected: PASS.

---

### Task 3: `@shoroborno/react` Font Integration

**Files:**
- Create: `src/components/ShorobornoFontManager.jsx`
- Modify: `src/context/DashboardContext.jsx`

**Interfaces:**
- Consumes: `@shoroborno/react` (`useFont` hook).
- Produces: Dynamic injection of high-legibility Bengali fonts (`solaiman-lipi`, `kalpurush`).

- [ ] **Step 1: Implement `ShorobornoFontManager.jsx`**
Call `useFont(selectedFontId || 'solaiman-lipi')` and set `--font-family-bangla` on root.

- [ ] **Step 2: Add font selector state in `DashboardContext.jsx`**
Support toggling between Soroborno font presets.

- [ ] **Step 3: Verify build**
Run: `npx vite build`
Expected: PASS.

---

### Task 4: Android Status Bar, Top App Bar & Adaptive Zoom Stepper

**Files:**
- Create: `src/components/AndroidStatusBar.jsx`
- Create: `src/components/AndroidTopAppBar.jsx`
- Create: `src/components/AdaptiveZoomControls.jsx`

**Interfaces:**
- Produces: Native Android Status Bar (live time, battery %, 5G/Wi-Fi) + MD3 Top App Bar with Odoo 9-dot launcher, zoom chip, and theme toggle.

- [ ] **Step 1: Implement `AndroidStatusBar.jsx`**
Display live digital clock (Bangla/English), notification icons, Wi-Fi / 5G, and battery icon with percentage.

- [ ] **Step 2: Implement `AdaptiveZoomControls.jsx`**
Render accessible `A-`, `100%`, `A+` chip buttons with `aria-label` and visual percentage label.

- [ ] **Step 3: Implement `AndroidTopAppBar.jsx`**
MD3 App Bar with Odoo 9-dot grid icon, active screen title, database indicator, zoom chip, and sync countdown.

- [ ] **Step 4: Verify build**
Run: `npx vite build`
Expected: PASS.

---

### Task 5: Android Bottom Navigation Bar (MD3 Pill) & Floating Action Button (FAB)

**Files:**
- Create: `src/components/AndroidBottomNav.jsx`
- Create: `src/components/AndroidFAB.jsx`
- Create: `src/components/AndroidGestureBar.jsx`

**Interfaces:**
- Produces: MD3 Bottom Navigation Bar with animated active pill indicator, large FAB, and Android system gesture pill.

- [ ] **Step 1: Implement `AndroidBottomNav.jsx`**
5 tabs: হোম (Home), বিক্রয় (Sales), মজুদ (Stock), কর্মী (HR), অ্যাপস (Apps). Active tab highlights with MD3 pill.

- [ ] **Step 2: Implement `AndroidFAB.jsx`**
Elevated rounded-square FAB (+ নতুন বিক্রয়) that triggers a sale transaction.

- [ ] **Step 3: Implement `AndroidGestureBar.jsx`**
Bottom Android gesture handle pill / 3-button navigation.

- [ ] **Step 4: Verify build**
Run: `npx vite build`
Expected: PASS.

---

### Task 6: Android Modal Bottom Sheet (Odoo Home App Matrix & Search)

**Files:**
- Create: `src/components/OdooAppBottomSheet.jsx`

**Interfaces:**
- Produces: Native Android Modal Bottom Sheet with drag handle, app search bar, and 6 large Odoo app tiles.

- [ ] **Step 1: Implement `OdooAppBottomSheet.jsx`**
Render slide-up sheet with drag handle, app search, and large tiles for Sales, Inventory, Invoices, Attendance, Analytics, Settings.

- [ ] **Step 2: Verify build**
Run: `npx vite build`
Expected: PASS.

---

### Task 7: Android App Shell Assembly & Screen Content Optimization

**Files:**
- Create: `src/components/AndroidAppShell.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/OrdersTable.jsx` (card list for phone)
- Modify: `src/components/MetricCards.jsx` (large text cards for low vision)

**Interfaces:**
- Produces: Complete native Android App experience.

- [ ] **Step 1: Implement `AndroidAppShell.jsx`**
Wrap Status Bar, Top App Bar, active tab content, FAB, Bottom Navigation, Gesture Bar, and Bottom Sheet inside Android device frame.

- [ ] **Step 2: Update `src/App.jsx`**
Mount `ShorobornoFontManager` and `AndroidAppShell`.

- [ ] **Step 3: Optimize card lists in `OrdersTable.jsx` and `MetricCards.jsx`**
Ensure high-visibility large text card layouts for phone viewport with no table horizontal scrolling.

- [ ] **Step 4: Add Missing API Key alert card**
Display native Android card prompting user to supply their Odoo API key in `.env` or via quick modal.

- [ ] **Step 5: Verify build**
Run: `npx vite build`
Expected: PASS with 0 errors.

---

### Task 8: End-to-End Build & Functional Verification

**Files:** All created & modified files.

- [ ] **Step 1: Run production build**
Run: `npx vite build`
Expected: 0 errors.

- [ ] **Step 2: Smoke test dev server**
Run: `npx vite --port 5174`
Verify:
- Android phone bezel rendering on desktop with toggle to full-screen.
- Status bar time updates live, battery and 5G indicators render.
- MD3 bottom navigation switches tabs with animated pill.
- Odoo bottom sheet opens from 9-dot launcher.
- Adaptive zoom stepper reflows text up to 160% cleanly.
- High contrast mode displays stark black & amber/cyan palette.
- `@shoroborno/react` Bangla typography renders smoothly.
