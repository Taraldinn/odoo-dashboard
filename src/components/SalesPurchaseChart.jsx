// src/components/SalesPurchaseChart.jsx
import React, { useState } from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Eye } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, toBanglaDigits } from '../utils/bengaliUtils';

export const SalesPurchaseChart = () => {
  const { dashboardData, settings } = useDashboard();
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const series = dashboardData?.timeSeriesData || [];
  if (series.length === 0) return null;

  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  // Calculate maximum values for scaling
  const maxVal = Math.max(...series.map((d) => Math.max(d.sales, d.purchases))) * 1.15 || 100000;
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 25;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Find peak hour
  const peakItem = [...series].sort((a, b) => b.sales - a.sales)[0];

  return (
    <div className="glass-card animate-fade-in">
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge">
            <BarChart3 size={18} />
          </div>
          <div>
            <span>রিয়েলটাইম বিক্রয় বনাম ক্রয় ট্রেন্ড</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              সময়ভিত্তিক লাইভ টার্নওভার ও ক্যাশ আউটফ্লো
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--color-primary)' }}></span>
              বিক্রি (Sales)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--color-purple)' }}></span>
              ক্রয় (Purchase)
            </span>
          </div>

          {/* Chart Type Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setChartType('bar')}
              style={{
                background: chartType === 'bar' ? 'var(--color-primary)' : 'transparent',
                color: chartType === 'bar' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              বার ভিউ
            </button>
            <button
              onClick={() => setChartType('area')}
              style={{
                background: chartType === 'area' ? 'var(--color-primary)' : 'transparent',
                color: chartType === 'area' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              ট্রেন্ড লাইন
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: '240px', overflow: 'visible' }}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight - paddingY - pct * usableHeight;
            const value = maxVal * pct;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="inherit"
                >
                  {formatNumber(Math.round(value / 1000), numSys)}k
                </text>
              </g>
            );
          })}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            <>
              {/* Sales Area & Line */}
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Purchase Area */}
              <path
                fill="url(#purchaseGrad)"
                d={`M ${paddingX} ${chartHeight - paddingY} ${series
                  .map((d, i) => {
                    const x = paddingX + (i / (series.length - 1)) * usableWidth;
                    const y = chartHeight - paddingY - (d.purchases / maxVal) * usableHeight;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} L ${chartWidth - paddingX} ${chartHeight - paddingY} Z`}
              />
              <path
                fill="none"
                stroke="var(--color-purple)"
                strokeWidth="3"
                d={`M ${series
                  .map((d, i) => {
                    const x = paddingX + (i / (series.length - 1)) * usableWidth;
                    const y = chartHeight - paddingY - (d.purchases / maxVal) * usableHeight;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}`}
              />

              {/* Sales Area */}
              <path
                fill="url(#salesGrad)"
                d={`M ${paddingX} ${chartHeight - paddingY} ${series
                  .map((d, i) => {
                    const x = paddingX + (i / (series.length - 1)) * usableWidth;
                    const y = chartHeight - paddingY - (d.sales / maxVal) * usableHeight;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} L ${chartWidth - paddingX} ${chartHeight - paddingY} Z`}
              />
              <path
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                d={`M ${series
                  .map((d, i) => {
                    const x = paddingX + (i / (series.length - 1)) * usableWidth;
                    const y = chartHeight - paddingY - (d.sales / maxVal) * usableHeight;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}`}
              />

              {/* Points */}
              {series.map((d, i) => {
                const x = paddingX + (i / (series.length - 1)) * usableWidth;
                const ySales = chartHeight - paddingY - (d.sales / maxVal) * usableHeight;
                const isHovered = hoveredIdx === i;

                return (
                  <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={x}
                      cy={ySales}
                      r={isHovered ? 6 : 4}
                      fill="var(--color-primary)"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* Bar Chart Mode */}
          {chartType === 'bar' && (
            <g>
              {series.map((d, i) => {
                const groupWidth = usableWidth / series.length;
                const barWidth = Math.min(18, groupWidth * 0.36);
                const xBase = paddingX + i * groupWidth + (groupWidth - barWidth * 2 - 4) / 2;

                const salesH = (d.sales / maxVal) * usableHeight;
                const salesY = chartHeight - paddingY - salesH;

                const purH = (d.purchases / maxVal) * usableHeight;
                const purY = chartHeight - paddingY - purH;

                const isHovered = hoveredIdx === i;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover highlight bar */}
                    {isHovered && (
                      <rect
                        x={paddingX + i * groupWidth}
                        y={paddingY}
                        width={groupWidth}
                        height={usableHeight}
                        fill="rgba(255,255,255,0.03)"
                        rx="6"
                      />
                    )}

                    {/* Sales Bar */}
                    <rect
                      x={xBase}
                      y={salesY}
                      width={barWidth}
                      height={salesH}
                      rx="4"
                      fill="var(--color-primary)"
                      opacity={isHovered ? 1 : 0.85}
                    />

                    {/* Purchases Bar */}
                    <rect
                      x={xBase + barWidth + 4}
                      y={purY}
                      width={barWidth}
                      height={purH}
                      rx="4"
                      fill="var(--color-purple)"
                      opacity={isHovered ? 1 : 0.85}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* X Axis Labels */}
          {series.map((d, i) => {
            const x = chartType === 'bar' 
              ? paddingX + (i + 0.5) * (usableWidth / series.length)
              : paddingX + (i / (series.length - 1)) * usableWidth;
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 4}
                fill="var(--text-secondary)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="inherit"
              >
                {d.time}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip when hovered */}
        {hoveredIdx !== null && series[hoveredIdx] && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.9rem',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.82rem',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              সময়: {series[hoveredIdx].time} ঘটিকায়
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
              <span>বিক্রি:</span>
              <strong className="bangla-number">{formatCurrency(series[hoveredIdx].sales, currency, numSys)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-purple)', marginBottom: '0.2rem' }}>
              <span>ক্রয়:</span>
              <strong className="bangla-number">{formatCurrency(series[hoveredIdx].purchases, currency, numSys)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
              <span>আনুমানিক লাভ:</span>
              <strong className="bangla-number">{formatCurrency(series[hoveredIdx].profit, currency, numSys)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight bar */}
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        {peakItem && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={15} style={{ color: 'var(--color-success)' }} />
            <span>
              সর্বোচ্চ বিক্রির সময়: <strong style={{ color: 'var(--text-primary)' }}>{peakItem.time}</strong> ({formatCurrency(peakItem.sales, currency, numSys)})
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={14} style={{ color: 'var(--color-primary)' }} />
          <span>রিয়েলটাইম ওদু GET ডেটা স্ট্রিম সক্রিয়</span>
        </div>
      </div>
    </div>
  );
};
