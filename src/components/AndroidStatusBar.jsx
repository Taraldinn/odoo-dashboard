// src/components/AndroidStatusBar.jsx
import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging, Bell } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { toBanglaDigits } from '../utils/bengaliUtils';

/**
 * AndroidStatusBar
 * Authentic Android System Status Bar displaying live clock,
 * network signal (5G), Wi-Fi, battery percentage, and active notification alerts.
 */
export const AndroidStatusBar = () => {
  const { settings } = useDashboard();
  const isBangla = settings.numeralSystem === 'bangla';
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const isPm = hours >= 12;
      hours = hours % 12 || 12;
      
      const timeFormatted = `${hours}:${minutes}`;
      const suffix = isPm ? (isBangla ? 'অপ.' : 'PM') : (isBangla ? 'পূ.' : 'AM');
      setTimeStr(`${isBangla ? toBanglaDigits(timeFormatted) : timeFormatted} ${suffix}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, [isBangla]);

  return (
    <div className="android-status-bar" role="region" aria-label="অ্যান্ড্রয়েড স্ট্যাটাস বার">
      {/* Left: Clock & App Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{timeStr}</span>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          boxShadow: '0 0 6px var(--color-primary)'
        }} title="ওদু ইআরপি ব্যাকগ্রাউন্ড সার্ভিস অ্যাক্টিভ" />
      </div>

      {/* Right: Network, Wi-Fi & Battery */}
      <div className="android-status-icons">
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>5G</span>
        <Signal size={13} style={{ color: 'var(--text-primary)' }} />
        <Wifi size={13} style={{ color: 'var(--text-primary)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
            {isBangla ? toBanglaDigits('98') : '98'}%
          </span>
          <BatteryCharging size={14} style={{ color: 'var(--color-success)' }} />
        </div>
      </div>
    </div>
  );
};

export default AndroidStatusBar;
