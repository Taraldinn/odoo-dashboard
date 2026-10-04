// src/App.jsx
import React from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { ShorobornoFontManager } from './components/ShorobornoFontManager';
import { AndroidAppShell } from './components/AndroidAppShell';

export default function App() {
  return (
    <DashboardProvider>
      {/* Dynamic @shoroborno/react font injector */}
      <ShorobornoFontManager />

      {/* Android Native App UI Shell */}
      <AndroidAppShell />
    </DashboardProvider>
  );
}
