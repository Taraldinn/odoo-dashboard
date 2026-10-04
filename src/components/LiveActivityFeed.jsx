// src/components/LiveActivityFeed.jsx
import React from 'react';
import { 
  Zap, 
  ShoppingBag, 
  ShoppingCart, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  Radio
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, getRelativeTimeBangla, toBanglaDigits } from '../utils/bengaliUtils';

export const LiveActivityFeed = () => {
  const { liveActivities, dashboardData, settings } = useDashboard();
  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  // Combine real-time push events with Odoo chatter activities
  const odooActivities = (dashboardData?.activities || []).map((act) => ({
    type: act.type || 'sale',
    title: act.summary,
    message: `${act.author} • ${act.resName}`,
    orderId: act.id,
    amount: 0,
    time: act.date || new Date().toISOString(),
  }));

  const allActivities = [...liveActivities, ...odooActivities];

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Radio size={18} className="pulse-dot" style={{ background: 'transparent', animation: 'none' }} />
          </div>
          <div>
            <span>লাইভ ওদু ইভেন্ট ও চ্যাটার স্ট্রিম</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              রিয়েলটাইম বিক্রয়, অর্থপ্রাপ্তি ও লজিস্টিকস নোটিফিকেশন
            </div>
          </div>
        </div>

        <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
          লাইভ ওদু
        </span>
      </div>

      {/* Feed list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        paddingRight: '4px'
      }}>
        {allActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Zap size={28} style={{ color: 'var(--color-primary)', margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>নতুন রিয়েলটাইম ইভেন্টের অপেক্ষা...</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              ওদু থেকে নতুন বিক্রয় বা স্টক মুভমেন্ট এলে এখানে সাথে সাথে দেখা যাবে।
            </div>
          </div>
        ) : (
          allActivities.map((act, index) => {
            const isSale = act.type === 'sale';

            return (
              <div
                key={index}
                className="animate-slide-down"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSale ? 'var(--color-success-light)' : 'var(--color-purple-light)',
                    color: isSale ? 'var(--color-success)' : 'var(--color-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isSale ? <ShoppingBag size={16} /> : <ShoppingCart size={16} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        {act.title}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {act.orderId}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      {act.message}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="bangla-number" style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: isSale ? 'var(--color-success)' : 'var(--text-primary)'
                  }}>
                    {formatCurrency(act.amount, currency, numSys)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                    <Clock size={10} />
                    <span>{getRelativeTimeBangla(act.time, numSys)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
