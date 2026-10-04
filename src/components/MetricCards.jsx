// src/components/MetricCards.jsx
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  ShoppingCart, 
  DollarSign, 
  Boxes, 
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, formatPercent, toBanglaDigits } from '../utils/bengaliUtils';

export const MetricCards = () => {
  const { dashboardData, settings } = useDashboard();
  const metrics = dashboardData?.metrics;

  if (!metrics) return null;

  const isBangla = settings.numeralSystem === 'bangla';
  const currency = settings.currencySymbol;
  const numSys = settings.numeralSystem;

  const cards = [
    {
      id: 'sales',
      title: 'মোট বিক্রয় (Revenue)',
      subtitle: 'আজকের বিক্রয় ইনভয়েস',
      value: formatCurrency(metrics.totalSales, currency, numSys),
      growth: metrics.salesGrowth,
      icon: ShoppingBag,
      color: 'var(--color-primary)',
      badgeClass: 'badge-blue',
      meta: `মোট অর্ডার: ${formatNumber(dashboardData.salesOrders?.length || 0, numSys)} টি`,
      sparkline: [40, 55, 60, 52, 70, 65, 85, 92]
    },
    {
      id: 'purchases',
      title: 'মোট ক্রয় (Purchases)',
      subtitle: 'সাপ্লায়ার বিল ও খরচ',
      value: formatCurrency(metrics.totalPurchases, currency, numSys),
      growth: metrics.purchaseGrowth,
      icon: ShoppingCart,
      color: 'var(--color-purple)',
      badgeClass: 'badge-purple',
      meta: `ক্রয় অর্ডার: ${formatNumber(dashboardData.purchaseOrders?.length || 0, numSys)} টি`,
      sparkline: [30, 45, 40, 60, 50, 55, 48, 52]
    },
    {
      id: 'profit',
      title: 'নিট লাভ (Net Profit)',
      subtitle: `মার্জিন: ${formatPercent(metrics.profitMargin, numSys)}`,
      value: formatCurrency(metrics.netProfit, currency, numSys),
      growth: metrics.profitGrowth,
      icon: DollarSign,
      color: 'var(--color-success)',
      badgeClass: 'badge-green',
      meta: `গ্রস লাভ: ${formatCurrency(metrics.grossProfit, currency, numSys)}`,
      sparkline: [20, 25, 35, 30, 48, 52, 60, 68]
    },
    {
      id: 'inventory',
      title: 'মজুদ পণ্যের মূল্য',
      subtitle: `${formatNumber(metrics.totalSkus, numSys)} টি SKU • ${formatNumber(metrics.totalUnitsInStock, numSys)} ইউনিট`,
      value: formatCurrency(metrics.inventoryValuation, currency, numSys),
      growth: null,
      icon: Boxes,
      color: 'var(--color-warning)',
      badgeClass: 'badge-orange',
      meta: metrics.lowStockCount > 0 ? (
        <span style={{ color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <AlertTriangle size={12} /> {formatNumber(metrics.lowStockCount, numSys)} টি পণ্যে কম স্টক!
        </span>
      ) : 'স্টক লেভেল স্বাভাবিক',
      sparkline: [80, 78, 75, 74, 76, 73, 71, 70]
    },
    {
      id: 'cashflow',
      title: 'পাওনা ও দেনা স্থিতি',
      subtitle: 'বকেয়া হিসাব বিবরণী',
      value: formatCurrency(metrics.accountsReceivable, currency, numSys),
      growth: null,
      icon: CreditCard,
      color: 'var(--color-info)',
      badgeClass: 'badge-blue',
      meta: `দেনা: ${formatCurrency(metrics.accountsPayable, currency, numSys)}`,
      sparkline: [45, 50, 52, 49, 58, 62, 60, 64]
    }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        const isPositive = c.growth !== null && c.growth >= 0;

        return (
          <div key={c.id} className="metric-card animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {c.title}
                </span>
                <h3 className="bangla-number" style={{ fontSize: '1.55rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: 'var(--text-primary)' }}>
                  {c.value}
                </h3>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `rgba(${c.id === 'sales' ? '99, 102, 241' : c.id === 'profit' ? '16, 185, 129' : c.id === 'purchases' ? '168, 85, 247' : c.id === 'inventory' ? '245, 158, 11' : '6, 182, 212'}, 0.15)`,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={22} />
              </div>
            </div>

            {/* Sparkline & Subtitle Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.65rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.82rem',
            }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                {c.meta}
              </div>

              {c.growth !== null ? (
                <div className={`badge ${isPositive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{formatPercent(c.growth, numSys)}</span>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {c.subtitle}
                </span>
              )}
            </div>

            {/* SVG Sparkline Bar/Wave */}
            <div style={{ marginTop: '0.6rem', height: '24px', opacity: 0.7 }}>
              <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={c.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={c.sparkline.map((val, idx) => `${(idx / (c.sparkline.length - 1)) * 100},${24 - (val / 100) * 20}`).join(' ')}
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
