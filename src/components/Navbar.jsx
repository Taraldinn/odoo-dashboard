// src/components/Navbar.jsx
import React, { useState } from 'react';
import {
  Activity, RotateCw, Settings, Volume2, VolumeX,
  PlusCircle, Printer, Database, Layers, Menu, X as XIcon,
  Calendar
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatBanglaTime, toBanglaDigits } from '../utils/bengaliUtils';

export const Navbar = () => {
  const {
    settings, updateSettings, isSyncing, lastSyncedAt, countdown,
    dateFilter, setDateFilter, refreshData, triggerManualSale, setIsSettingsOpen,
  } = useDashboard();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isBangla = settings.numeralSystem === 'bangla';

  const dateFilterOptions = [
    { key: 'today',      label: 'আজকের তথ্য' },
    { key: 'yesterday',  label: 'গতকাল' },
    { key: 'this_week',  label: 'এই সপ্তাহ' },
    { key: 'this_month', label: 'এই মাস' },
    { key: 'this_year',  label: 'এই বছর' },
  ];

  const countdownLabel = isSyncing
    ? 'সিঙ্ক হচ্ছে...'
    : `${isBangla ? toBanglaDigits(countdown) : countdown} সে.`;

  return (
    <header className="glass-card" style={{ padding: 0, marginBottom: '1rem', overflow: 'visible', borderRadius: 'var(--radius-lg)' }}>
      {/* Main bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        gap: '0.75rem',
      }}>
        {/* Brand */}
        <div className="navbar-brand" style={{ flex: '1 1 0', minWidth: 0 }}>
          <div className="navbar-logo">
            <Layers size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 className="navbar-title">ওদু রিয়েলটাইম ড্যাশবোর্ড</h1>
              <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                লাইভ
              </span>
            </div>
            <div className="navbar-subtitle">
              <Database size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span className="truncate" style={{ maxWidth: '180px' }}>
                {settings.odooConfig.db || 'fardin'} • {formatBanglaTime(lastSyncedAt, settings.numeralSystem)}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop controls */}
        <div className="navbar-controls" style={{ display: 'none' }} data-desktop-controls>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.82rem', width: 'auto' }}
          >
            {dateFilterOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>

          <button onClick={triggerManualSale} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
            <PlusCircle size={14} style={{ color: 'var(--color-success)' }} />
            <span>নতুন সেলস</span>
          </button>

          <button
            onClick={() => refreshData(false)}
            disabled={isSyncing}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', minWidth: '88px' }}
          >
            <RotateCw size={14} className={isSyncing ? 'spin' : ''} style={{ color: 'var(--color-primary)' }} />
            <span>{countdownLabel}</span>
          </button>

          <button
            onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
            className={`btn btn-icon ${settings.soundAlerts ? 'btn-secondary' : 'btn-ghost'}`}
            title={settings.soundAlerts ? 'শব্দ বন্ধ করুন' : 'শব্দ চালু করুন'}
          >
            {settings.soundAlerts
              ? <Volume2 size={17} style={{ color: 'var(--color-success)' }} />
              : <VolumeX size={17} style={{ color: 'var(--text-muted)' }} />
            }
          </button>

          <button onClick={() => window.print()} className="btn btn-icon btn-secondary no-print" title="প্রিন্ট করুন">
            <Printer size={17} />
          </button>

          <button onClick={() => setIsSettingsOpen(true)} className="btn btn-primary" style={{ fontSize: '0.84rem' }}>
            <Settings size={16} />
            <span>সেটিংস</span>
          </button>
        </div>

        {/* Mobile: refresh + menu toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} data-mobile-controls>
          <button
            onClick={() => refreshData(false)}
            disabled={isSyncing}
            className="btn btn-icon btn-secondary"
            title="রিফ্রেশ"
          >
            <RotateCw size={16} className={isSyncing ? 'spin' : ''} style={{ color: 'var(--color-primary)' }} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-icon btn-primary"
            title="সেটিংস"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="btn btn-icon btn-secondary"
            title="মেনু"
          >
            {mobileMenuOpen ? <XIcon size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile expanded menu */}
      {mobileMenuOpen && (
        <div className="animate-slide-down" style={{
          padding: '0.75rem 1rem 1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}>
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); }}
            className="form-select"
            style={{ fontSize: '0.85rem' }}
          >
            {dateFilterOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { triggerManualSale(); setMobileMenuOpen(false); }}
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.84rem' }}
            >
              <PlusCircle size={14} style={{ color: 'var(--color-success)' }} />
              নতুন সেলস যোগ
            </button>
            <button
              onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
              className={`btn btn-icon ${settings.soundAlerts ? 'btn-secondary' : 'btn-ghost'}`}
            >
              {settings.soundAlerts
                ? <Volume2 size={16} style={{ color: 'var(--color-success)' }} />
                : <VolumeX size={16} style={{ color: 'var(--text-muted)' }} />
              }
            </button>
            <button onClick={() => window.print()} className="btn btn-icon btn-secondary no-print">
              <Printer size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS injection */}
      <style>{`
        [data-desktop-controls] { display: none !important; }
        [data-mobile-controls]  { display: flex !important; }
        @media (min-width: 900px) {
          [data-desktop-controls] { display: flex !important; }
          [data-mobile-controls]  { display: none !important; }
        }
      `}</style>
    </header>
  );
};
