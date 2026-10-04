// src/components/CustomerLedgerWidget.jsx
import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, toBanglaDigits } from '../utils/bengaliUtils';

export const CustomerLedgerWidget = () => {
  const { dashboardData, settings, addToast } = useDashboard();
  const [selectedPartner, setSelectedPartner] = useState(null);

  const ledgers = dashboardData?.customerLedgers || [];
  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  const handleSelectPartner = (p) => {
    setSelectedPartner(p);
    addToast({
      title: `লেজার নির্বাচিত: ${p.name}`,
      message: `বকেয়া: ${formatCurrency(p.dueAmount, numSys, currency)} | ক্রেডিট সীমা: ${formatCurrency(p.creditLimit, numSys, currency)}`,
      type: 'info',
    });
  };

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Users size={18} />
          </div>
          <div>
            <span>ক্লায়েন্ট খতিয়ান ও ৩৬০° লেজার</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              ওদু গ্রাহক হিসাব, বাকি-পাওনা ও ক্রেডিট ব্যালেন্স
            </div>
          </div>
        </div>

        <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
          {formatNumber(ledgers.length, numSys)} জন ক্লায়েন্ট
        </span>
      </div>

      {/* Selected Partner Detailed Card (if any selected) */}
      {selectedPartner && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                {selectedPartner.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.6rem', marginTop: '2px' }}>
                <span><MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />{selectedPartner.city}</span>
                <span>•</span>
                <span>রেটিং: <strong style={{ color: '#10b981' }}>{selectedPartner.rating}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPartner(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              বন্ধ করুন
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '0.55rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>মোট লেনদেন</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(selectedPartner.totalSales, numSys, currency)}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '0.55rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: selectedPartner.dueAmount > 0 ? '#f59e0b' : '#10b981' }}>
                বর্তমান বাকি
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedPartner.dueAmount > 0 ? '#f59e0b' : '#10b981' }}>
                {formatCurrency(selectedPartner.dueAmount, numSys, currency)}
              </div>
            </div>
          </div>

          {/* Credit limit bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
              <span>ক্রেডিট ব্যবহার</span>
              <span>
                {formatCurrency(selectedPartner.dueAmount, numSys, currency)} / {formatCurrency(selectedPartner.creditLimit, numSys, currency)}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round((selectedPartner.dueAmount / selectedPartner.creditLimit) * 100))}%`,
                height: '100%',
                background: selectedPartner.dueAmount > selectedPartner.creditLimit * 0.8 ? '#ef4444' : '#6366f1',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        maxHeight: '340px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {ledgers.map((p) => {
          const hasDue = p.dueAmount > 0;
          return (
            <div
              key={p.id}
              onClick={() => handleSelectPartner(p)}
              style={{
                background: selectedPartner?.id === p.id ? 'var(--color-primary-light)' : 'var(--bg-input)',
                border: selectedPartner?.id === p.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {p.name.slice(0, 1)}
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {p.city} • মোট অর্ডার: {formatNumber(p.ordersCount, numSys)} টি
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  বাকি পাওনা:
                </div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: hasDue ? '#f59e0b' : '#10b981'
                }}>
                  {hasDue ? formatCurrency(p.dueAmount, numSys, currency) : 'পরিশোধিত'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerLedgerWidget;
