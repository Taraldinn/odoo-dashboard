// src/components/SettingsModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  Sliders, 
  Database, 
  Volume2, 
  Eye, 
  EyeOff, 
  Check, 
  RefreshCw, 
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Type,
  Contrast,
  Sparkles,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { odooApi } from '../services/odooApi';
import { toBanglaDigits } from '../utils/bengaliUtils';

export const SettingsModal = () => {
  const { 
    settings, 
    updateSettings, 
    isSettingsOpen, 
    setIsSettingsOpen, 
    addToast, 
    refreshData,
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    selectedFontId,
    updateSelectedFontId,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'widgets' | 'odooApi'
  const [testingOdoo, setTestingOdoo] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const isBangla = settings.numeralSystem === 'bangla';
  const percentNumber = Math.round(zoomLevel * 100);
  const percentLabel = `${isBangla ? toBanglaDigits(percentNumber) : percentNumber}%`;
  const isHighContrast = settings.theme === 'high-contrast';

  const toggleHighContrast = () => {
    updateSettings({ theme: isHighContrast ? 'dark' : 'high-contrast' });
  };

  const zoomPresets = [
    { scale: 1.00, label: isBangla ? '১০০% (স্বাভাবিক)' : '100% (Normal)' },
    { scale: 1.15, label: isBangla ? '১১৫% (মাঝারি)' : '115% (Medium)' },
    { scale: 1.30, label: isBangla ? '১৩০% (বড়)' : '130% (Large)' },
    { scale: 1.45, label: isBangla ? '১৪৫% (অতিরিক্ত)' : '145% (XL)' },
    { scale: 1.60, label: isBangla ? '১৬০% (সর্বোচ্চ)' : '160% (Max)' },
  ];

  const fontOptions = [
    { id: 'solaiman-lipi', name: 'সোলায়মান লিপি', desc: 'গোলাকার, স্পষ্ট ও অত্যন্ত জনপ্রিয় বাংলা ফন্ট', sample: 'ব্যবসার সব হিসাব এক পলকে' },
    { id: 'kalpurush', name: 'কালপুরুষ', desc: 'উচ্চ পাঠযোগ্যতা ও সুস্পষ্ট অক্ষর রূপরেখা', sample: 'সহজ ও নির্ভুল তথ্য পর্যবেক্ষণ' },
    { id: 'siyam-rupali', name: 'সিয়াম রূপালী', desc: 'আধুনিক, পরিচ্ছন্ন ও সুষম ফন্ট স্টাইল', sample: 'রিয়েলটাইম ওদু ১৯.০ ড্যাশবোর্ড' },
  ];

  // Local state for Odoo config inputs
  const [localOdooConfig, setLocalOdooConfig] = useState({
    baseUrl: settings.odooConfig.baseUrl || 'https://fardin.odoo.com',
    apiKey: settings.odooConfig.apiKey || '63c5bca000bd4bf28f7b710193fb8058610ac12c',
    db: settings.odooConfig.db || 'fardin',
    login: settings.odooConfig.login || '',
    useLiveOdoo: settings.odooConfig.useLiveOdoo || true,
  });

  React.useEffect(() => {
    if (isSettingsOpen) {
      setLocalOdooConfig({
        baseUrl: settings.odooConfig.baseUrl || 'https://fardin.odoo.com',
        apiKey: settings.odooConfig.apiKey || '63c5bca000bd4bf28f7b710193fb8058610ac12c',
        db: settings.odooConfig.db || 'fardin',
        login: settings.odooConfig.login || '',
        useLiveOdoo: settings.odooConfig.useLiveOdoo || true,
      });
      setTestResult(null);
    }
  }, [isSettingsOpen, settings.odooConfig]);

  if (!isSettingsOpen) return null;

  const themes = [
    { id: 'high-contrast', name: 'হাই-কনট্রাস্ট ওলেড (High-Contrast)', color: '#000000', border: '#fbbf24', text: '#fbbf24' },
    { id: 'dark', name: 'ডার্ক স্লেট (Dark Slate)', color: '#0a0f1d', border: '#6366f1', text: '#f8fafc' },
    { id: 'light', name: 'ক্লিন লাইট (Clean Light)', color: '#f8fafc', border: '#4f46e5', text: '#0f172a' },
    { id: 'odoo-purple', name: 'ওদু পার্পল (Odoo Purple)', color: '#1e131d', border: '#a855f7', text: '#f8fafc' },
    { id: 'midnight', name: 'মিডনাইট নেভি (Midnight)', color: '#060d1a', border: '#0284c7', text: '#f8fafc' },
    { id: 'emerald', name: 'এমারেল্ড নিয়ন (Emerald)', color: '#051912', border: '#10b981', text: '#f8fafc' },
  ];

  const handleOdooSave = (e) => {
    e.preventDefault();
    updateSettings({ odooConfig: localOdooConfig });
    addToast({
      type: 'success',
      title: 'ওদু কনফিগারেশন সংরক্ষিত',
      message: 'নতুন সেটিংসের সাথে ডেটা ফেচ করা হবে।',
    });
    refreshData(false);
  };

  const handleTestConnection = async () => {
    setTestingOdoo(true);
    setTestResult(null);
    try {
      const res = await odooApi.testConnection(
        localOdooConfig.baseUrl,
        localOdooConfig.apiKey,
        localOdooConfig.db,
        localOdooConfig.login
      );
      setTestResult(res);
      if (res.success) {
        addToast({ type: 'success', title: 'GET সংযোগ সফল!', message: res.message });
      } else {
        addToast({ type: 'error', title: 'সংযোগ ব্যর্থ', message: res.message });
      }
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTestingOdoo(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsSettingsOpen(false); }}>
      <div
        className="modal-panel animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary-light)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Settings size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                ড্যাশবোর্ড সেটিংস ও ইউআই কাস্টমাইজেশন
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }} className="truncate">
                ফন্ট জুম, হাই-কনট্রাস্ট, থিম ও ওদু API কনফিগার করুন
              </div>
            </div>
          </div>
          <button onClick={() => setIsSettingsOpen(false)} className="btn btn-icon btn-ghost" style={{ borderRadius: '50%', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tabs">
          {[['appearance', <Palette size={15} />, 'ইউআই ও কাস্টমাইজেশন'],
            ['widgets',    <Sliders size={15} />, 'উইজেট সমূহ'],
            ['odooApi',   <Database size={15} />, 'ওদু API সংযোগ']
          ].map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`modal-tab${activeTab === id ? ' active' : ''}`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* TAB 1: APPEARANCE & UI CUSTOMIZATION */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* SECTION 1: ADAPTIVE ZOOM & FONT SCALING (Accessibility Focus) */}
              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Type size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        টেক্সট ও ডিসপ্লে জুম স্কেলিং
                      </strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        কম দৃষ্টিশক্তি বা দৃষ্টি প্রতিবন্ধী ব্যবহারকারীদের জন্য পাঠযোগ্য আকার
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    অ্যাক্সেসিবিলিটি
                  </span>
                </div>

                {/* Stepper + Slider Control Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-card)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}>
                  {/* Button A- */}
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= 1.0}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      opacity: zoomLevel <= 1.0 ? 0.4 : 1,
                      cursor: zoomLevel <= 1.0 ? 'not-allowed' : 'pointer'
                    }}
                    title="টেক্সট ছোট করুন (A-)"
                    aria-label="টেক্সট ছোট করুন"
                  >
                    A-
                  </button>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="1.0"
                    max="1.6"
                    step="0.05"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary)',
                    }}
                    aria-label="জুম লেভেল স্লাইডার"
                  />

                  {/* Button A+ */}
                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= 1.6}
                    className="btn btn-primary"
                    style={{
                      padding: '6px 12px',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      opacity: zoomLevel >= 1.6 ? 0.4 : 1,
                      cursor: zoomLevel >= 1.6 ? 'not-allowed' : 'pointer'
                    }}
                    title="টেক্সট বড় করুন (A+)"
                    aria-label="টেক্সট বড় করুন"
                  >
                    A+
                  </button>

                  {/* Current Zoom Badge & Reset */}
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    minWidth: '55px',
                    textAlign: 'center'
                  }}>
                    {percentLabel}
                  </div>
                </div>

                {/* Preset Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {zoomPresets.map((preset) => {
                    const isCurrent = Math.abs(zoomLevel - preset.scale) < 0.04;
                    return (
                      <button
                        key={preset.scale}
                        onClick={() => setZoomLevel(preset.scale)}
                        style={{
                          flex: 1,
                          minWidth: '70px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                          background: isCurrent ? 'var(--color-primary-light)' : 'var(--bg-card)',
                          color: isCurrent ? 'var(--color-primary)' : 'var(--text-primary)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  {zoomLevel > 1.0 && (
                    <button
                      onClick={resetZoom}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: '0.74rem',
                        cursor: 'pointer'
                      }}
                      title="স্বাভাবিক মাপে রিসেট"
                    >
                      রিসেট
                    </button>
                  )}
                </div>

                {/* Live Font Scaling Preview Box */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px dashed var(--color-primary)',
                  fontSize: `calc(0.85rem * ${zoomLevel})`,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    লাইভ টেক্সট প্রিভিউ ({percentLabel}):
                  </div>
                  <div>
                    আজকের মোট বিক্রয়: <strong>{isBangla ? '৳ ১,৬৫,৭২০' : '৳ 165,720'}</strong> | স্টক: <strong>{isBangla ? '৮৪টি পণ্য' : '84 Items'}</strong>
                  </div>
                  <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    দৃষ্টি প্রতিবন্ধী ও দুর্বল দৃষ্টির যেকোনো ব্যবহারকারী সহজে এক পলকে পড়তে পারবেন।
                  </div>
                </div>
              </div>

              {/* SECTION 2: HIGH CONTRAST OLED TOGGLE */}
              <div style={{
                background: isHighContrast ? '#000000' : 'var(--bg-input)',
                border: isHighContrast ? '2px solid #fbbf24' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.2s ease',
                boxShadow: isHighContrast ? '0 0 16px rgba(251, 191, 36, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: isHighContrast ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)',
                    color: isHighContrast ? '#000000' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Contrast size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.92rem', color: isHighContrast ? '#fbbf24' : 'var(--text-primary)' }}>
                        উচ্চ বৈসাদৃশ্য হাই-কনট্রাস্ট ওলেড (High Contrast OLED)
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isHighContrast ? '#e2e8f0' : 'var(--text-secondary)', marginTop: '2px' }}>
                      গাঢ় কালো ব্যাকগ্রাউন্ড ও সোনালী টেক্সট বর্ডার — চোখের ক্লান্তি দূর করে ও সুস্পষ্ট দৃশ্যমানতা দেয়
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleHighContrast}
                  className={`btn ${isHighContrast ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    background: isHighContrast ? '#fbbf24' : undefined,
                    color: isHighContrast ? '#000000' : undefined,
                    border: isHighContrast ? '1px solid #fbbf24' : undefined,
                    flexShrink: 0
                  }}
                >
                  {isHighContrast ? '✓ সক্রিয়' : 'চালু করুন'}
                </button>
              </div>

              {/* SECTION 3: SHOROBORNO BENGALI TYPOGRAPHY */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    স্বরবর্ণ বাংলা ফন্ট নির্বাচন (@shoroborno/react):
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {fontOptions.map((f) => {
                    const isSelected = selectedFontId === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => updateSelectedFontId(f.id)}
                        style={{
                          background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-input)',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                            {f.name}
                          </span>
                          {isSelected && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          {f.desc}
                        </div>
                        <div style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          padding: '4px 6px',
                          background: 'rgba(0, 0, 0, 0.12)',
                          borderRadius: '6px'
                        }}>
                          "{f.sample}"
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: COLOR THEME PICKER */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.65rem' }}>
                  ড্যাশবোর্ড কালার থিম নির্বাচন করুন:
                </label>
                <div className="theme-grid">
                  {themes.map((th) => {
                    const isSelected = settings.theme === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => updateSettings({ theme: th.id })}
                        style={{
                          background: th.color,
                          border: `2px solid ${isSelected ? th.border : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? `0 0 14px ${th.border}55` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: th.border }}></span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: th.text || '#f8fafc' }}>
                            {th.name}
                          </span>
                        </div>
                        {isSelected && <Check size={16} style={{ color: th.border }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: NUMBER FORMAT & CURRENCY */}
              <div className="settings-2col">
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    সংখ্যা পদ্ধতি (Numeral System)
                  </label>
                  <select
                    value={settings.numeralSystem}
                    onChange={(e) => updateSettings({ numeralSystem: e.target.value })}
                    className="form-select"
                    style={{ width: '100%' }}
                  >
                    <option value="bangla">বাংলা সংখ্যা (১২৩৪৫)</option>
                    <option value="english">ইংরেজি সংখ্যা (12345)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    মুদ্রা প্রতীক (Currency Symbol)
                  </label>
                  <select
                    value={settings.currencySymbol}
                    onChange={(e) => updateSettings({ currencySymbol: e.target.value })}
                    className="form-select"
                    style={{ width: '100%' }}
                  >
                    <option value="৳">টাকা (৳)</option>
                    <option value="BDT">বিডিটি (BDT)</option>
                    <option value="USD">ডলার ($)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 6: REFRESH INTERVAL & AUDIO NOTIFICATIONS */}
              <div className="settings-2col">
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    স্বয়ংক্রিয় রিফ্রেশ রেট (GET Sync Rate)
                  </label>
                  <select
                    value={settings.refreshInterval}
                    onChange={(e) => updateSettings({ refreshInterval: Number(e.target.value) })}
                    className="form-select"
                    style={{ width: '100%' }}
                  >
                    <option value={5}>প্রতি ৫ সেকেন্ডে (অতি দ্রুত)</option>
                    <option value={10}>প্রতি ১০ সেকেন্ডে (স্ট্যান্ডার্ড)</option>
                    <option value={30}>প্রতি ৩০ সেকেন্ডে</option>
                    <option value={60}>প্রতি ১ মিনিটে</option>
                    <option value={0}>ম্যানুয়াল (বন্ধ)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    শব্দ নোটিফিকেশন (Audio Chime)
                  </label>
                  <button
                    onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
                    className={`btn ${settings.soundAlerts ? 'btn-secondary' : 'btn-ghost'}`}
                    style={{ width: '100%', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Volume2 size={16} />
                      {settings.soundAlerts ? 'শব্দ সতর্কতা চালু' : 'শব্দ সতর্কতা বন্ধ'}
                    </span>
                    <span className={`badge ${settings.soundAlerts ? 'badge-green' : 'badge-red'}`}>
                      {settings.soundAlerts ? 'চালু' : 'বন্ধ'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WIDGET VISIBILITY */}
          {activeTab === 'widgets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                ড্যাশবোর্ডে কোন কোন মডিউল দেখতে চান তা নির্বাচন করুন:
              </div>

              {[
                { id: 'metrics',            title: 'শীর্ষ সারসংক্ষেপ মেট্রিক্স (KPI Cards)',         desc: 'আজকের বিক্রি, ক্রয়, নিট লাভ ও ইনভেন্টরি ভ্যালুেশন' },
                { id: 'salesPurchaseChart', title: 'বিক্রয় বনাম ক্রয় চার্ট (Sales vs Purchase)',    desc: 'ঘণ্টা ও সময়ভিত্তিক ট্রেন্ড বিশ্লেষণ ও বার চার্ট' },
                { id: 'profitLoss',         title: 'লাভ ও ক্ষতি বিবরণী (Profit & Loss Explorer)',   desc: 'রাজস্ব, COGS ও নিট প্রফিট মার্জিন মিটার' },
                { id: 'inventory',          title: 'মজুদ ও ইনভেন্টরি পর্যবেক্ষণ (Inventory)',       desc: 'কম মজুদের অ্যালার্ট ও গুদাম ধারণক্ষমতা' },
                { id: 'recentOrders',       title: 'সাম্প্রতিক অর্ডার তালিকা (Recent Orders)',       desc: 'সর্বশেষ ওদু সেলস ও পারচেস অর্ডার রেকর্ড' },
                { id: 'liveActivity',       title: 'লাইভ ইভেন্ট স্ট্রিম (Live Feed)',                desc: 'রিয়েলটাইম ইনকামিং বিক্রয় ও পণ্য গ্রহণ টিকার' },
                { id: 'attendance',         title: 'কর্মী উপস্থিতি ব্যবস্থাপন (Attendance)',        desc: 'চেক-ইন/আউট, সাপ্তাহিক রিপোর্ট ও উপস্থিতি রেকর্ড' },
              ].map((w) => {
                const isVisible = settings.visibleWidgets[w.id] !== false;
                return (
                  <div
                    key={w.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{w.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{w.desc}</div>
                    </div>
                    <button
                      onClick={() => updateSettings({
                        visibleWidgets: {
                          ...settings.visibleWidgets,
                          [w.id]: !isVisible
                        }
                      })}
                      className={`btn btn-icon ${isVisible ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '36px', height: '36px' }}
                      title={isVisible ? 'হাইড করুন' : 'শো করুন'}
                    >
                      {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: ODOO GET API CONFIGURATION */}
          {activeTab === 'odooApi' && (
            <form onSubmit={handleOdooSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <ShieldCheck size={16} />
                  <span>১০০% শুধুমাত্র HTTP GET রিকোয়েস্ট নিশ্চিতকরণ</span>
                </div>
                ওদু এপিআইয়ের সমস্ত ডেটা কমিউনিকেশন শুধুমাত্র <code>GET</code> মেথডের মাধ্যমে পরিচালিত হয়। আপনি সরাসরি কাস্টম Odoo REST Controller, Proxy বা API Gateway ইউআরএল ব্যবহার করতে পারেন।
              </div>

              {/* Toggle Live Odoo Mode vs Simulator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>লাইভ ওদু GET সার্ভার সংযোগ সক্রিয় করুন</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    বন্ধ থাকলে স্বয়ংক্রিয় লাইভ ওদু সিমুলেটর ডেটা চলবে
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localOdooConfig.useLiveOdoo}
                  onChange={(e) => setLocalOdooConfig({ ...localOdooConfig, useLiveOdoo: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              {/* Base URL */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  ওদু GET এন্ডপয়েন্ট ইউআরএল (Odoo GET Endpoint URL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. http://localhost:8069/api/odoo/dashboard/summary"
                  value={localOdooConfig.baseUrl}
                  onChange={(e) => setLocalOdooConfig({ ...localOdooConfig, baseUrl: e.target.value })}
                  className="form-input"
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  উদাহরণ: <code>https://your-odoo-domain.com/api/odoo/dashboard</code> (যা GET সমর্থন করে)
                </div>
              </div>

              {/* Login Email, Database & API Key */}
              <div className="settings-3col">
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    লগইন ইমেইল (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="fardin@example.com"
                    value={localOdooConfig.login}
                    onChange={(e) => setLocalOdooConfig({ ...localOdooConfig, login: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    ডাটাবেজ নাম
                  </label>
                  <input
                    type="text"
                    value={localOdooConfig.db}
                    onChange={(e) => setLocalOdooConfig({ ...localOdooConfig, db: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    এপিআই কি / টোকেন
                  </label>
                  <input
                    type="password"
                    placeholder="API Key"
                    value={localOdooConfig.apiKey}
                    onChange={(e) => setLocalOdooConfig({ ...localOdooConfig, apiKey: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: testResult.success ? 'var(--color-success)' : 'var(--color-danger)',
                  border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {testResult.message}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingOdoo || !localOdooConfig.baseUrl}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.84rem' }}
                >
                  <RefreshCw size={15} style={{ animation: testingOdoo ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{testingOdoo ? 'পরীক্ষা চলছে...' : 'GET সংযোগ পরীক্ষা করুন'}</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.88rem' }}
                >
                  <span>সংরক্ষণ ও প্রয়োগ করুন</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span>সেটিংস ব্রাউজারে সুরক্ষিত সেভ আছে</span>
          <button
            onClick={() => { localStorage.removeItem('odoo_bangla_dashboard_settings_v1'); window.location.reload(); }}
            className="btn btn-sm btn-danger"
          >
            <RotateCcw size={12} />
            <span>রিসেট</span>
          </button>
        </div>
      </div>
    </div>
  );
};
