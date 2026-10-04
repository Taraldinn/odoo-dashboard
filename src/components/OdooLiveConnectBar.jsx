// src/components/OdooLiveConnectBar.jsx
import React, { useState, useEffect } from 'react';
import { Database, Key, Globe, User, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { odooApi } from '../services/odooApi';

export const OdooLiveConnectBar = () => {
  const { settings, updateSettings, refreshData, addToast } = useDashboard();

  const [url,    setUrl]    = useState(settings.odooConfig.baseUrl || 'https://fardin.odoo.com');
  const [apiKey, setApiKey] = useState(settings.odooConfig.apiKey  || '63c5bca000bd4bf28f7b710193fb8058610ac12c');
  const [db,     setDb]     = useState(settings.odooConfig.db      || 'fardin');
  const [login,  setLogin]  = useState(settings.odooConfig.login   || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settings.odooConfig) {
      setUrl(settings.odooConfig.baseUrl   || 'https://fardin.odoo.com');
      setApiKey(settings.odooConfig.apiKey || '63c5bca000bd4bf28f7b710193fb8058610ac12c');
      setDb(settings.odooConfig.db         || 'fardin');
      setLogin(settings.odooConfig.login   || '');
    }
  }, [settings.odooConfig]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!url) {
      addToast({ type: 'error', title: 'ইউআরএল প্রয়োজন', message: 'দয়া করে আপনার ওদু সার্ভারের URL লিখুন' });
      return;
    }
    setIsLoading(true);
    try {
      updateSettings({ odooConfig: { baseUrl: url, apiKey, db, login, useLiveOdoo: true } });
      await refreshData(false);
      if (login) {
        addToast({ type: 'success', title: 'লাইভ ওদু ডেটা লোড হয়েছে!', message: `${url} থেকে ডেটা সিঙ্ক সফল।` });
      } else {
        addToast({ type: 'info', title: 'সংযুক্ত!', message: 'রিয়েল সেলস লোড করতে আপনার ওদু লগইন ইমেইল লিখুন।' });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'সংযোগ ব্যর্থ', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = settings.odooConfig.useLiveOdoo && settings.odooConfig.baseUrl && settings.odooConfig.login;

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.85rem 1.1rem',
        marginBottom: '1rem',
        background: isConnected
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05))'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.05))',
        borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glow)',
      }}
    >
      <form onSubmit={handleConnect}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
            background: isConnected ? 'var(--color-success-light)' : 'var(--color-primary-light)',
            color: isConnected ? 'var(--color-success)' : 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {isConnected ? <CheckCircle2 size={18} /> : <Zap size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span>লাইভ ওদু GET সার্ভার</span>
              <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                {settings.odooConfig.db || 'fardin'}.odoo.com
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              {login ? `ইউজার: ${login}` : 'লগইন ইমেইল দিলে সরাসরি রিয়েল ডেটা লোড হবে'}
            </div>
          </div>
        </div>

        {/* Inputs — responsive grid */}
        <div className="connect-bar-grid">
          <div style={{ position: 'relative' }}>
            <Globe size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="ওদু URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '28px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <User size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="লগইন ইমেইল"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '28px',
                fontSize: '0.82rem',
                borderColor: !login ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-color)',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Database size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="ডাটাবেজ"
              value={db}
              onChange={(e) => setDb(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '28px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <Key size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="password"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ fontSize: '0.82rem', flexShrink: 0 }}>
              <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
              <span className="no-mobile">{isLoading ? 'সিঙ্ক...' : 'ফেচ'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
