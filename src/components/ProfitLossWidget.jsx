// src/components/ProfitLossWidget.jsx
import React from 'react';
import { DollarSign, PieChart, TrendingUp, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatPercent, toBanglaDigits } from '../utils/bengaliUtils';

export const ProfitLossWidget = () => {
  const { dashboardData, settings } = useDashboard();
  const metrics = dashboardData?.metrics;

  if (!metrics) return null;

  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  const revenue = metrics.totalSales || 1;
  const cogs = metrics.totalSales - metrics.grossProfit;
  const cogsPct = (cogs / revenue) * 100;
  const opExp = metrics.operatingExpenses;
  const opExpPct = (opExp / revenue) * 100;
  const netProfit = metrics.netProfit;
  const netProfitMargin = metrics.profitMargin;

  const isProfit = netProfit >= 0;

  return (
    <div className="glass-card animate-fade-in">
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <DollarSign size={18} />
          </div>
          <div>
            <span>লাভ ও ক্ষতি বিবরণী (P&L Explorer)</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              রিয়েলটাইম রাজস্ব, ব্যয় ও নিট মার্জিন
            </div>
          </div>
        </div>

        <span className={`badge ${isProfit ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.78rem' }}>
          {isProfit ? 'মুনাফাজনক স্থিতি' : 'ক্ষতিগ্রস্ত স্থিতি'}
        </span>
      </div>

      {/* Margin Gauge Card */}
      <div style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            সামগ্রিক নিট প্রফিট মার্জিন
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span className="bangla-number" style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: isProfit ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {formatPercent(netProfitMargin, numSys)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              (টার্নওভারের ওপর)
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          <svg width="64" height="64" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="3.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={isProfit ? 'var(--color-success)' : 'var(--color-danger)'}
              strokeWidth="3.8"
              strokeDasharray={`${Math.min(100, Math.max(0, Math.abs(netProfitMargin)))}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            <Activity size={18} style={{ color: isProfit ? 'var(--color-success)' : 'var(--color-danger)' }} />
          </div>
        </div>
      </div>

      {/* Revenue & Expense Stacked Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <span>ব্যয় বিভাজন অনুপাত</span>
          <span>রাজস্বের ১০০%</span>
        </div>
        <div style={{
          display: 'flex',
          height: '10px',
          borderRadius: '9999px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-input)'
        }}>
          <div
            title={`পণ্য ক্রয় ব্যয়: ${cogsPct.toFixed(1)}%`}
            style={{ width: `${Math.min(100, cogsPct)}%`, backgroundColor: 'var(--color-purple)' }}
          />
          <div
            title={`পরিচালন ব্যয়: ${opExpPct.toFixed(1)}%`}
            style={{ width: `${Math.min(100 - cogsPct, opExpPct)}%`, backgroundColor: 'var(--color-warning)' }}
          />
          <div
            title={`নিট লাভ: ${netProfitMargin.toFixed(1)}%`}
            style={{ width: `${Math.max(0, netProfitMargin)}%`, backgroundColor: 'var(--color-success)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-purple)' }}></span>
            পণ্য ব্যয় (COGS)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }}></span>
            পরিচালন খরচ
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
            নিট প্রফিট
          </span>
        </div>
      </div>

      {/* Breakdown Line Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Total Revenue */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(99, 102, 241, 0.06)',
          borderLeft: '3px solid var(--color-primary)'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>মোট আয় / রাজস্ব (Revenue)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>গ্রাহক বিক্রয় ইনভয়েস</div>
          </div>
          <span className="bangla-number" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {formatCurrency(revenue, currency, numSys)}
          </span>
        </div>

        {/* COGS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-input)',
          borderLeft: '3px solid var(--color-purple)'
        }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>বিক্রিত পণ্যের মূল্য (COGS)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>কাঁচামাল ও সরাসরি সাপ্লায়ার খরচ</div>
          </div>
          <span className="bangla-number" style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-danger)' }}>
            - {formatCurrency(cogs, currency, numSys)}
          </span>
        </div>

        {/* Gross Profit */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.8rem',
          fontSize: '0.84rem',
          color: 'var(--text-secondary)'
        }}>
          <span>গ্রস লাভ (Gross Profit)</span>
          <span className="bangla-number" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {formatCurrency(metrics.grossProfit, currency, numSys)}
          </span>
        </div>

        {/* Operating Expenses */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-input)',
          borderLeft: '3px solid var(--color-warning)'
        }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>পরিচালন ও ওভারহেড ব্যয়</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>লজিস্টিকস, ক্লাউড ও অফিস ব্যয়</div>
          </div>
          <span className="bangla-number" style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-danger)' }}>
            - {formatCurrency(opExp, currency, numSys)}
          </span>
        </div>

        {/* Final Net Profit */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: isProfit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          marginTop: '0.35rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: isProfit ? 'var(--color-success)' : 'var(--color-danger)' }}>
              নিট লাভ / লোকসান (Net Profit)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>সমস্ত খরচ বাদ দিয়ে চূড়ান্ত মুনাফা</div>
          </div>
          <span className="bangla-number" style={{
            fontWeight: 800,
            fontSize: '1.25rem',
            color: isProfit ? 'var(--color-success)' : 'var(--color-danger)'
          }}>
            {formatCurrency(netProfit, currency, numSys)}
          </span>
        </div>
      </div>
    </div>
  );
};
