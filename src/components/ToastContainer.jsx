// src/components/ToastContainer.jsx
import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useDashboard();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxWidth: '360px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="animate-slide-down"
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-card)',
              border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.4)' : isError ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-glow)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{
              color: isSuccess ? 'var(--color-success)' : isError ? 'var(--color-danger)' : 'var(--color-primary)',
              marginTop: '2px'
            }}>
              {isSuccess ? <CheckCircle2 size={18} /> : isError ? <AlertCircle size={18} /> : <Info size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {toast.message}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
