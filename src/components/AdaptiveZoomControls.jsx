// src/components/AdaptiveZoomControls.jsx
import React from 'react';
import { ZoomIn, ZoomOut, Type } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { toBanglaDigits } from '../utils/bengaliUtils';

/**
 * AdaptiveZoomControls
 * Accessible Android MD3 Assist Chip for low-vision users who cannot read small text.
 * Dynamically scales UI text and components up to 160% with instant reflow.
 */
export const AdaptiveZoomControls = () => {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, settings } = useDashboard();
  const isBangla = settings.numeralSystem === 'bangla';
  const percentNumber = Math.round(zoomLevel * 100);
  const percentLabel = `${isBangla ? toBanglaDigits(percentNumber) : percentNumber}%`;

  return (
    <div
      className="md3-action-chip"
      role="group"
      aria-label="টেক্সট ও ডিসপ্লে জুম স্কেলিং"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '3px 6px',
        gap: '2px',
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
      }}
    >
      <button
        onClick={zoomOut}
        disabled={zoomLevel <= 1.0}
        aria-label="টেক্সটের আকার ছোট করুন"
        title="টেক্সট ছোট করুন (A-)"
        style={{
          background: 'none',
          border: 'none',
          color: zoomLevel <= 1.0 ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: zoomLevel <= 1.0 ? 'not-allowed' : 'pointer',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 800,
          fontSize: '0.85rem',
          borderRadius: '8px',
        }}
      >
        A-
      </button>

      <button
        onClick={resetZoom}
        aria-label={`বর্তমান জুম ${percentLabel}, স্বাভাবিক মাপে রিসেট করুন`}
        title="স্বাভাবিক আকারে রিসেট করুন (100%)"
        style={{
          background: zoomLevel > 1.0 ? 'var(--color-primary-light)' : 'transparent',
          border: 'none',
          color: zoomLevel > 1.0 ? 'var(--color-primary)' : 'var(--text-primary)',
          cursor: 'pointer',
          padding: '3px 7px',
          fontWeight: 800,
          fontSize: '0.78rem',
          borderRadius: '8px',
        }}
      >
        {percentLabel}
      </button>

      <button
        onClick={zoomIn}
        disabled={zoomLevel >= 1.60}
        aria-label="টেক্সটের আকার বড় করুন"
        title="টেক্সট বড় করুন (A+)"
        style={{
          background: 'none',
          border: 'none',
          color: zoomLevel >= 1.60 ? 'var(--text-muted)' : 'var(--color-primary)',
          cursor: zoomLevel >= 1.60 ? 'not-allowed' : 'pointer',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 900,
          fontSize: '0.88rem',
          borderRadius: '8px',
        }}
      >
        A+
      </button>
    </div>
  );
};

export default AdaptiveZoomControls;
