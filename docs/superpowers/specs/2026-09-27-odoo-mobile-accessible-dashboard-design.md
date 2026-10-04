# Odoo Android Native App UI & Accessible Dashboard — Design Specification

**Date**: 2026-09-27  
**Status**: Approved & Upgraded to Exact Android UI/UX  
**Target Environment**: React 19 + Vite 8, Material Design 3 (MD3) Android Native App Experience  

---

## 1. Overview & Vision

The UI/UX is built to replicate an **authentic native Android mobile application (Material Design 3)**, specifically adapted for **visually impaired (low-vision) users who cannot read small text**. It pairs native Android system conventions with Odoo ERP Home navigation:

1. **Exact Android App Shell**:
   - **Android System Status Bar**: Live digital clock, notification icons, Wi-Fi / 5G signal indicators, and battery percentage with battery icon.
   - **Android Top App Bar (MD3)**: Elevation, leading Odoo 9-dot launcher, headline typography, and action icons.
   - **Android Floating Action Button (FAB)**: Elevated rounded-square FAB for instant transactions (+ নতুন বিক্রয়).
   - **Android Material 3 Navigation Bar**: Bottom bar with pill-shaped active indicator, icon badges, and localized labels.
   - **Android System Navigation Bar**: Gesture pill / 3-button navigation bar (◀ ⬭ ▢) at the bottom.
   - **Android Device Bezel (Desktop)**: Rendered inside a realistic Google Pixel / Samsung Galaxy bezel with camera punch-hole cutout and screen curvature, switching to 100% full screen on actual mobile devices.

2. **Odoo Home Integration (Android Modal Bottom Sheet)**:
   - Tapping the Odoo 9-dot launcher opens a native **Android Modal Bottom Sheet** with a drag handle, displaying large touchable Odoo app tiles:
     - 🛒 বিক্রয় (Sales)
     - 📦 ইনভেন্টরি (Inventory)
     - 🧾 ইনভয়েস (Invoices)
     - 👥 উপস্থিতি (Attendance)
     - 📊 লাভ-ক্ষতি (P&L Analytics)
     - ⚙️ সেটিংস ও API (Settings & API Key)

3. **Android Accessibility Suite for Low-Vision Users**:
   - **Dynamic Display & Text Zoom** (similar to Android Accessibility Text Scaling): Stepper (`A-` / `100%` / `A+`) scaling up to 160% with zero horizontal overflow.
   - **High-Contrast OLED Theme**: Pure black (`#000000`), bright white (`#ffffff`), luminous amber (`#fbbf24`), electric cyan (`#38bdf8`), and 2px neon borders.
   - **Large Material Card-Stacking**: Touch targets ≥ 56dp, high-contrast numbers (24px - 32px), eliminating dense multi-column desktop tables.

4. **`@shoroborno/react` Bangla Typography**:
   - Uses `useFont` / `FontLoader` to dynamically load high-legibility Bengali fonts (`solaiman-lipi`, `kalpurush`) with wide letter counters and distinct conjuncts.

5. **Odoo 19.0 API & `.env` Architecture**:
   - `.env` and `.env.example` with `VITE_ODOO_URL`, `VITE_ODOO_DB`, `VITE_ODOO_LOGIN`, `VITE_ODOO_API_KEY`.
   - Native Android alert card prompting for the API key if missing.

---

## 2. File & Component Architecture

```
frontend/
├── .env                              # Odoo API credentials (URL, DB, Login, API Key)
├── .env.example                      # Template with variable instructions
├── vite.config.js                    # Vite dev server with inotify polling & Odoo GET middleware
├── src/
│   ├── App.jsx                       # Mounts DashboardProvider and AndroidAppShell
│   ├── index.css                     # Material Design 3 tokens, Android bezel, zoom scale, high-contrast
│   ├── context/
│   │   └── DashboardContext.jsx      # State: activeTab, zoomLevel (1.0-1.6), fontId, odooConfig, sync status
│   ├── components/
│   │   ├── AndroidAppShell.jsx       # Complete Android device container (Status bar, Bezel, Viewport, Gestures)
│   │   ├── AndroidStatusBar.jsx      # Live clock, Wi-Fi/5G, battery %, notification icons
│   │   ├── AndroidTopAppBar.jsx      # MD3 Top Bar with Odoo 9-dot launcher, zoom pill, high-contrast switch
│   │   ├── AndroidBottomNav.jsx      # MD3 Navigation Bar with animated active pill indicator
│   │   ├── AndroidFAB.jsx            # MD3 Floating Action Button (+ নতুন বিক্রয়)
│   │   ├── AndroidGestureBar.jsx     # Android home gesture pill / 3-button navigation bar
│   │   ├── OdooAppBottomSheet.jsx    # Native Android Modal Bottom Sheet with drag handle & Odoo app matrix
│   │   ├── ShorobornoFontManager.jsx # @shoroborno/react font injector
│   │   ├── MetricCards.jsx           # High-visibility Android Material cards for metrics
│   │   ├── OrdersTable.jsx           # Android card-list order items (replaces desktop table)
│   │   ├── InventoryTracker.jsx      # Touch-friendly stock & warehouse cards
│   │   ├── AttendanceWidget.jsx      # Daily employee attendance with large check-in indicators
│   │   ├── ProfitLossWidget.jsx      # Android Material surface for P&L breakdown
│   │   ├── SettingsModal.jsx         # Android Settings Sheet (Odoo credentials, font selector)
│   │   └── ToastContainer.jsx        # Android Material Snackbars / Toasts
│   └── services/
│       └── odooApi.js                # Odoo 19.0 API client reading from import.meta.env
```

---

## 3. Detailed Android UI / UX Specifications

### 3.1 Android Status Bar (`AndroidStatusBar.jsx`)
- Left: Current local time in 12h/24h or Bangla digits (e.g. `৩:১২` বা `3:12 PM`), tiny Odoo app icon indicator.
- Right: Network signal (5G / 4 bars), Wi-Fi icon, Battery outline with percentage badge (`98%`).

### 3.2 Android Material 3 Top App Bar (`AndroidTopAppBar.jsx`)
- Leading Icon: Odoo 9-dot launcher button (`:::`) with purple circular ripple.
- Headline: App title (`ওদু ইআরপি` / `বিক্রয়` / `মজুদ`), subtitle with database name (`fardin`).
- Actions:
  - Adaptive Zoom Stepper (`A-` `100%` `A+`) styled as an MD3 Assist Chip.
  - High Contrast mode toggle button with eye/sun icon.
  - Sync status spinning countdown pill.

### 3.3 Android Floating Action Button (`AndroidFAB.jsx`)
- Position: Anchored bottom-right above the navigation bar (16dp from edges).
- MD3 Large FAB with rounded-square corners (`16px`), icon `<Plus size={24} />` and expandable label (`নতুন সেলস`).
- Triggers instant order creation or manual transaction.

### 3.4 Android Material 3 Bottom Navigation Bar (`AndroidBottomNav.jsx`)
- Height: 68dp + safe area.
- 5 primary destination items:
  1. 🏠 **হোম (Home)**: Metrics, Quick stats, Recent transactions.
  2. 🛒 **বিক্রয় (Sales)**: Sales orders card feed.
  3. 📦 **মজুদ (Stock)**: Inventory levels & warehouses.
  4. 👥 **উপস্থিতি (HR)**: Daily employee attendance.
  5. ⊞ **অ্যাপস (Apps)**: Opens Odoo App Bottom Sheet.
- Active item displays Material 3 pill container behind the icon (`width: 64px; height: 32px; border-radius: 16px; background: var(--md-secondary-container)`).

### 3.5 Android Modal Bottom Sheet (`OdooAppBottomSheet.jsx`)
- Smooth slide-up transition from bottom.
- Pill drag handle (`32px × 4px`, centered).
- Grid of 6 large touchable Odoo app tiles:
  - 🛒 বিক্রয় (Sales)
  - 📦 ইনভেন্টরি (Inventory)
  - 🧾 ইনভয়েস (Invoices)
  - 👥 উপস্থিতি (Attendance)
  - 📊 লাভ-ক্ষতি (P&L Analytics)
  - ⚙️ সেটিংস ও API (Settings & API Key)

### 3.6 Android System Navigation Bar (`AndroidGestureBar.jsx`)
- Centered rounded white/gray gesture handle bar (`72px × 4px`) mimicking modern Android 14/15 navigation.
- Or toggleable 3-button bar (◀ ⬭ ▢) for low-vision accessibility.

---

## 4. Accessibility & Low-Vision Features

1. **Adaptive Zoom (100% - 160%)**:
   - Seamlessly reflows all typography, cards, and buttons via `--font-scale`.
   - Never clips content or causes horizontal scrollbars.
2. **High-Contrast OLED Palette**:
   - Surface: `#000000`
   - Cards / Containers: `#121212` with `2px solid #38bdf8` or `2px solid #fbbf24`
   - Primary text: `#ffffff`
   - Secondary text: `#e2e8f0`
3. **Touch Targets**:
   - All interactive elements adhere to Android's minimum touch target of **48dp × 48dp** (promoted to **56dp** in low-vision mode).
4. **`@shoroborno/react` Typography**:
   - Primary font: `solaiman-lipi` / `kalpurush` with high x-height and clear Bengali conjuncts.

---

## 5. Verification Plan

1. **Build verification**: `npx vite build` passes with zero errors.
2. **Dev server verification**: `npx vite --port 5174` boots with no inotify errors.
3. **Android UI visual fidelity check**:
   - Status bar, top app bar, FAB, bottom navigation with MD3 pill, gesture bar.
   - Odoo bottom sheet opens cleanly on tapping 9-dot launcher or "অ্যাপস" tab.
   - Zoom stepper reflows text cleanly up to 160%.
   - High contrast OLED mode provides stark, legible contrast.
