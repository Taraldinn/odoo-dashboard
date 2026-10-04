import React from 'react';
import {
  LayoutGrid, RotateCw, Settings, Maximize2, Minimize2,
  Database
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { toBanglaDigits, formatBanglaTime } from '../utils/bengaliUtils';

/**
 * AndroidTopAppBar
 * Material Design 3 Top App Bar featuring:
 * - Odoo 9-dot App Launcher icon
 * - Active screen title & Odoo database live badge
 * - Adaptive Zoom stepper chip for low-vision users
 * - High-Contrast OLED theme switcher
 * - Refresh & Desktop frame expander
 */
export const AndroidTopAppBar = () => {
  const {
    activeTab,
    toggleAppDrawer,
    settings,
    updateSettings,
    refreshData,
    isSyncing,
    countdown,
    lastSyncedAt,
    isBezelExpanded,
    toggleBezelExpanded,
    setIsSettingsOpen,
  } = useDashboard();

  const isBangla = settings.numeralSystem === 'bangla';

  // Screen titles
  const getScreenTitle = () => {
    switch (activeTab) {
      case 'sales':
        return { main: 'বিক্রয়', sub: 'সেলস অর্ডার' };
      case 'invoices':
        return { main: 'ইনভয়েস ও বিল', sub: 'বকেয়া ও অর্থপ্রাপ্তি' };
      case 'deliveries':
        return { main: 'ডেলিভারি', sub: 'লজিস্টিকস ও চালান' };
      case 'clients':
        return { main: 'ক্লায়েন্ট লেজার', sub: '৩৬০° গ্রাহক হিসাব' };
      case 'inventory':
        return { main: 'মজুদ', sub: 'স্টক লেভেল' };
      case 'attendance':
        return { main: 'কর্মী', sub: 'হাজিরা ও সময়' };
      case 'apps':
        return { main: 'ওদু অ্যাপস', sub: 'মডিউল ও সেটিংস' };
      case 'home':
      default:
        return { main: 'ওদু ইআরপি', sub: `${settings?.odooConfig?.db || 'mime'} • লাইভ` };
    }
  };


  const titleInfo = getScreenTitle();

  return (
    <header className="md3-top-app-bar" role="banner">
      {/* Left: Odoo 9-Dot App Launcher */}
      <button
        onClick={toggleAppDrawer}
        className="md3-icon-button"
        title="ওদু অ্যাপ ড্রয়ার খুলুন"
        aria-label="ওদু অ্যাপ্লিকেশন মেনু খুলুন"
        style={{
          background: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.3)',
        }}
      >
        <LayoutGrid size={20} />
      </button>

      {/* Center: Title & Subtitle */}
      <div className="md3-app-title">
        <h2>{titleInfo.main}</h2>
        <div className="md3-app-subtitle">
          <Database size={11} style={{ color: 'var(--color-primary)' }} />
          <span>{titleInfo.sub}</span>
          <span className="badge badge-blue" style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '6px', fontWeight: 700 }}>
            রিড-অনলি
          </span>
        </div>
      </div>

      {/* Right Actions: Refresh + Settings + Expand Bezel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {/* Live Refresh Button */}
        <button
          onClick={() => refreshData(false)}
          disabled={isSyncing}
          className="md3-icon-button"
          style={{ width: '36px', height: '36px' }}
          title="ডেটা রিফ্রেশ করুন"
          aria-label="ওদু ডেটা পুনরায় লোড করুন"
        >
          <RotateCw
            size={17}
            className={isSyncing ? 'spin' : ''}
            style={{ color: 'var(--color-primary)' }}
          />
        </button>

        {/* UI Customization & Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="md3-icon-button"
          style={{ width: '36px', height: '36px' }}
          title="ড্যাশবোর্ড সেটিংস ও ইউআই কাস্টমাইজেশন"
          aria-label="সেটিংস ও ইউআই কাস্টমাইজেশন খুলুন"
        >
          <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Expand / Collapse Device Bezel (Desktop helper only) */}
        <button
          onClick={toggleBezelExpanded}
          className="md3-icon-button desktop-only-btn"
          style={{ width: '36px', height: '36px' }}
          title={isBezelExpanded ? 'ফোন ফ্রেম চালু করুন' : 'সম্পূর্ণ স্ক্রিন করুন'}
          aria-label="স্ক্রিন ফ্রেম পরিবর্তন"
        >
          {isBezelExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
};

export default AndroidTopAppBar;
