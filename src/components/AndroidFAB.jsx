// src/components/AndroidFAB.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

/**
 * AndroidFAB
 * Material Design 3 Floating Action Button (FAB).
 * Anchored above the bottom navigation bar for quick order creation.
 */
export const AndroidFAB = () => {
  const { triggerManualSale, activeTab } = useDashboard();

  // If in attendance or inventory, label adapts or remains "+ নতুন সেলস"
  const getFabLabel = () => {
    switch (activeTab) {
      case 'sales':
      case 'home':
      default:
        return 'নতুন সেলস';
    }
  };

  return (
    <button
      onClick={triggerManualSale}
      className="android-fab"
      aria-label="নতুন বিক্রয় অর্ডার যোগ করুন"
      title="নতুন বিক্রয় অর্ডার যুক্ত করুন"
    >
      <Plus size={22} strokeWidth={2.8} />
      <span>{getFabLabel()}</span>
    </button>
  );
};

export default AndroidFAB;
