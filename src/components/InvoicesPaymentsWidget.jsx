// src/components/InvoicesPaymentsWidget.jsx
import React, { useState } from 'react';
import { 
  Receipt, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  DollarSign
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, toBanglaDigits } from '../utils/bengaliUtils';

export const InvoicesPaymentsWidget = () => {
  const { dashboardData, settings, addToast } = useDashboard();
  const [filter, setFilter] = useState('all'); // 'all' | 'not_paid' | 'paid' | 'overdue'

  const invoices = dashboardData?.invoices || [];
  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'not_paid') return inv.status === 'not_paid' || inv.status === 'partial';
    if (filter === 'paid') return inv.status === 'paid';
    if (filter === 'overdue') return inv.status === 'not_paid' && inv.statusLabel === 'বিলম্বিত';
    return true;
  });

  const totalDue = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.residual || inv.amount), 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleInvoiceClick = (inv) => {
    addToast({
      title: `চালান: ${inv.id}`,
      message: `${inv.customer} — মোট: ${formatCurrency(inv.amount, numSys, currency)} (${inv.statusLabel})`,
      type: 'info',
    });
  };

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Receipt size={18} />
          </div>
          <div>
            <span>ইনভয়েস ও অর্থপ্রাপ্তি ট্র্যাকার</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              ওদু বিলিং, বাকি টাকা ও পেমেন্ট রিসিট
            </div>
          </div>
        </div>

        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
          {formatNumber(invoices.length, numSys)} টি চালান
        </span>
      </div>

      {/* Mini KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.76rem', fontWeight: 600 }}>
            <AlertTriangle size={14} />
            <span>মোট বাকি পাওনা</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalDue, numSys, currency)}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.76rem', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>পরিশোধিত অর্থ</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalPaid, numSys, currency)}
          </div>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { key: 'all', label: 'সবগুলো' },
          { key: 'not_paid', label: 'বকেয়া' },
          { key: 'paid', label: 'পরিশোধিত' },
          { key: 'overdue', label: 'বিলম্বিত' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: filter === tab.key ? 700 : 500,
              border: filter === tab.key ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: filter === tab.key ? 'var(--color-primary)' : 'var(--bg-input)',
              color: filter === tab.key ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        maxHeight: '340px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {filteredInvoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            কোনো চালান খুঁজে পাওয়া যায়নি
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'paid';
            return (
              <div
                key={inv.id}
                onClick={() => handleInvoiceClick(inv)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isPaid ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isPaid ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {inv.customer}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace' }}>{inv.id}</span>
                      <span>•</span>
                      <span>মেয়াদ: {toBanglaDigits(inv.dueDate || inv.date)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(inv.amount, numSys, currency)}
                  </div>
                  <span className={`badge badge-${inv.statusColor || (isPaid ? 'green' : 'orange')}`} style={{ fontSize: '0.68rem', marginTop: '2px' }}>
                    {inv.statusLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InvoicesPaymentsWidget;
