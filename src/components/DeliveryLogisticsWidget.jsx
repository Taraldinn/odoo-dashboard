// src/components/DeliveryLogisticsWidget.jsx
import React, { useState } from 'react';
import { 
  Truck, 
  PackageCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Navigation
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatNumber, toBanglaDigits } from '../utils/bengaliUtils';

export const DeliveryLogisticsWidget = () => {
  const { dashboardData, settings, addToast } = useDashboard();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const deliveries = dashboardData?.deliveries || [];
  const numSys = settings.numeralSystem;

  const filteredDeliveries = deliveries.filter((del) => {
    if (selectedStatus === 'in_transit') return del.status === 'assigned';
    if (selectedStatus === 'done') return del.status === 'done';
    if (selectedStatus === 'pending') return del.status === 'ready' || del.status === 'waiting';
    return true;
  });

  const inTransitCount = deliveries.filter((d) => d.status === 'assigned').length;
  const doneCount = deliveries.filter((d) => d.status === 'done').length;

  const handleDeliveryClick = (del) => {
    addToast({
      title: `ডেলিভারি ট্র্যাকিং: ${del.id}`,
      message: `${del.customer} — ${del.items} (${del.statusLabel})`,
      type: 'info',
    });
  };

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="card-header-clean">
        <div className="card-title">
          <div className="icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Truck size={18} />
          </div>
          <div>
            <span>ডেলিভারি ও শিপমেন্ট ট্র্যাকার</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              ওদু স্টক ডিসপ্যাচ ও পণ্য পরিবহন লাইভ আপডেট
            </div>
          </div>
        </div>

        <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
          লাইভ রুট
        </span>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Navigation size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              চলমান ডেলিভারি
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatNumber(inTransitCount, numSys)} টি
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <PackageCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              সম্পন্ন চালান
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatNumber(doneCount, numSys)} টি
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { key: 'all', label: 'সব চালান' },
          { key: 'in_transit', label: 'চলমান রুট' },
          { key: 'pending', label: 'প্যাকিং প্রস্তুত' },
          { key: 'done', label: 'ডেলিভার্ড' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: selectedStatus === tab.key ? 700 : 500,
              border: selectedStatus === tab.key ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: selectedStatus === tab.key ? 'var(--color-primary)' : 'var(--bg-input)',
              color: selectedStatus === tab.key ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deliveries List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxHeight: '340px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {filteredDeliveries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            কোনো ডেলিভারি চালান পাওয়া যায়নি
          </div>
        ) : (
          filteredDeliveries.map((del) => {
            const isDone = del.status === 'done';
            return (
              <div
                key={del.id}
                onClick={() => handleDeliveryClick(del)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      color: 'var(--color-primary)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px'
                    }}>
                      {del.id}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      অর্ডার: {del.origin}
                    </span>
                  </div>

                  <span className={`badge badge-${del.statusColor || (isDone ? 'green' : 'blue')}`} style={{ fontSize: '0.68rem' }}>
                    {del.statusLabel}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {del.customer}
                </div>

                {/* Route */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  background: 'rgba(0,0,0,0.1)',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <MapPin size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span>{del.from}</span>
                  <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                  <span>{del.to}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>পণ্য: <strong>{del.items}</strong></span>
                  <span>তারিখ: {toBanglaDigits(del.date)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DeliveryLogisticsWidget;
