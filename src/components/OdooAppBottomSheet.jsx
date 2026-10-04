// src/components/OdooAppBottomSheet.jsx
import React, { useState } from 'react';
import {
  X, ShoppingCart, Package, Receipt, Users,
  BarChart3, Settings, Search, Key, Sparkles, Check,
  Truck, CreditCard
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

/**
 * OdooAppBottomSheet
 * Authentic Android Modal Bottom Sheet replicating Odoo Home App Matrix.
 * Touch-friendly with large tiles, app search, Shoroborno font switcher, and API status.
 */
export const OdooAppBottomSheet = () => {
  const {
    isAppDrawerOpen,
    setIsAppDrawerOpen,
    setActiveTab,
    setIsSettingsOpen,
    selectedFontId,
    updateSelectedFontId,
    settings,
  } = useDashboard();

  const [searchTerm, setSearchTerm] = useState('');

  if (!isAppDrawerOpen) return null;

  const odooApps = [
    {
      id: 'sales',
      title: 'বিক্রয়',
      subtitle: 'অর্ডার, কোটেশন ও কাস্টমার',
      icon: ShoppingCart,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
      tab: 'sales',
    },
    {
      id: 'invoices',
      title: 'ইনভয়েস ও বিল',
      subtitle: 'গ্রাহক বিল ও অর্থপ্রাপ্তি',
      icon: Receipt,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      tab: 'invoices',
    },
    {
      id: 'deliveries',
      title: 'ডেলিভারি ও লজিস্টিকস',
      subtitle: 'পণ্য পরিবহন ও চালান ট্র্যাকিং',
      icon: Truck,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.15)',
      tab: 'deliveries',
    },
    {
      id: 'clients',
      title: 'গ্রাহক খতিয়ান ও লেজার',
      subtitle: '৩৬০° ব্যালেন্স ও স্টেটমেন্ট',
      icon: CreditCard,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      tab: 'clients',
    },
    {
      id: 'inventory',
      title: 'ইনভেন্টরি',
      subtitle: 'পণ্য স্টক ও গুদাম নিয়ন্ত্রণ',
      icon: Package,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      tab: 'inventory',
    },
    {
      id: 'attendance',
      title: 'উপস্থিতি ও এইচআর',
      subtitle: 'কর্মী হাজিরা ও ছুটির তথ্য',
      icon: Users,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      tab: 'attendance',
    },
    {
      id: 'analytics',
      title: 'লাভ-ক্ষতি ও পিঅ্যান্ডএল',
      subtitle: 'মোট রাজস্ব ও নিট মুনাফা',
      icon: BarChart3,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      tab: 'home',
    },
    {
      id: 'settings',
      title: 'সেটিংস ও কাস্টমাইজেশন',
      subtitle: 'জুম, থিম ও ওদু API',
      icon: Settings,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
      isModal: true,
    },
  ];


  const filteredApps = odooApps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAppSelect = (app) => {
    setIsAppDrawerOpen(false);
    if (app.isModal) {
      setIsSettingsOpen(true);
    } else if (app.tab) {
      setActiveTab(app.tab);
    }
  };

  const fontOptions = [
    { id: 'solaiman-lipi', name: 'সোলায়মান লিপি', desc: 'স্পষ্ট গোলাকার অক্ষর' },
    { id: 'kalpurush', name: 'কালপুরুষ', desc: 'উচ্চ পাঠযোগ্যতা' },
    { id: 'siyam-rupali', name: 'সিয়াম রূপালী', desc: 'ক্লিন আধুনিক ফন্ট' },
  ];

  const hasApiKey = Boolean(settings.odooConfig.apiKey);

  return (
    <>
      {/* Dimmed Android Backdrop Scrim */}
      <div
        className="android-sheet-backdrop"
        onClick={() => setIsAppDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Android Modal Bottom Sheet */}
      <div
        className="android-bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="ওদু অ্যাপ্লিকেশন ড্রয়ার"
      >
        {/* Android Drag Handle */}
        <div className="android-sheet-drag-handle" />

        {/* Sheet Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px 12px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ওদু অ্যাপ্লিকেশন হাব
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ওদু ১৯.০ • {settings.odooConfig.db || 'fardin'} • নিরাপদ রিড-অনলি মোড
            </span>
          </div>

          <button
            onClick={() => setIsAppDrawerOpen(false)}
            className="md3-icon-button"
            style={{ width: '36px', height: '36px' }}
            aria-label="ড্রয়ার বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '10px 16px 6px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '8px 12px',
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="অ্যাপ বা মডিউল খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                width: '100%',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Scrollable Sheet Content */}
        <div style={{
          overflowY: 'auto',
          padding: '10px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '60vh',
        }}>
          {/* App Tiles Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}>
            {filteredApps.map((app) => {
              const IconComp = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => handleAppSelect(app)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '14px',
                    borderRadius: '18px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  className="android-card-interactive"
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: app.bg,
                    color: app.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    boxShadow: `0 4px 12px ${app.bg}`,
                  }}>
                    <IconComp size={24} />
                  </div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {app.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.2 }}>
                    {app.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Shoroborno Font Ecosystem Selector */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: '16px',
            padding: '12px 14px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                স্বরবর্ণ বাংলা ফন্ট (দৃষ্টি প্রতিবন্ধী বান্ধব)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {fontOptions.map((f) => {
                const isSelected = selectedFontId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => updateSelectedFontId(f.id)}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Odoo API Key Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '14px',
            background: hasApiKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${hasApiKey ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} style={{ color: hasApiKey ? 'var(--color-success)' : 'var(--color-warning)' }} />
              <div style={{ fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  {hasApiKey ? 'ওদু API চাবি কনফিগার করা হয়েছে' : '.env ফাইলে API কী প্রয়োজন'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAppDrawerOpen(false);
                setIsSettingsOpen(true);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {hasApiKey ? 'পরিবর্তন' : 'কী দিন'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OdooAppBottomSheet;
