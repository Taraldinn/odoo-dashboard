// src/components/ShorobornoFontManager.jsx
import React, { useEffect } from 'react';
import { useFont } from '@shoroborno/react';
import { useDashboard } from '../context/DashboardContext';

/**
 * ShorobornoFontManager
 * Integrates @shoroborno/react font ecosystem into the dashboard.
 * Dynamically loads and sets the user-chosen high-legibility Bengali font
 * on the root element, optimized for visually impaired (low-vision) readers.
 */
export const ShorobornoFontManager = () => {
  const { selectedFontId } = useDashboard();
  const activeFontId = selectedFontId || 'solaiman-lipi';

  // Load font via @shoroborno/react hook
  const font = useFont(activeFontId, {
    display: 'swap',
  });

  useEffect(() => {
    if (font?.family) {
      const fallback = `'SolaimanLipi', 'Kalpurush', 'Siyam Rupali', 'Hind Siliguri', system-ui, sans-serif`;
      const fullFamily = `'${font.family}', ${fallback}`;
      document.documentElement.style.setProperty('--font-family-bangla', fullFamily);
      document.body.style.fontFamily = fullFamily;
    }
  }, [font?.family, activeFontId]);

  return null; // Headless font injector
};

export default ShorobornoFontManager;
