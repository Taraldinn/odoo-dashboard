// src/components/OrdersTable.jsx
import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  ExternalLink, 
  Clock, 
  User, 
  Truck,
  CheckCircle2
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, getRelativeTimeBangla, toBanglaDigits } from '../utils/bengaliUtils';

export const OrdersTable = () => {
  const { dashboardData, settings } = useDashboard();
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'purchases'
  const [searchFilter, setSearchFilter] = useState('');

  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  const salesOrders = dashboardData?.salesOrders || [];
  const purchaseOrders = dashboardData?.purchaseOrders || [];

  const currentList = activeTab === 'sales' ? salesOrders : purchaseOrders;

  const filteredOrders = currentList.filter((o) => {
    const term = searchFilter.toLowerCase();
    const name = (o.customer || o.vendor || '').toLowerCase();
    const id = (o.id || '').toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  return (
    <div className="glass-card animate-fade-in">
      {/* Table Header */}
      <div className="card-header-clean" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="card-title">
          <div className="icon-badge">
            {activeTab === 'sales' ? <ShoppingBag size={18} /> : <ShoppingCart size={18} />}
          </div>
          <div>
            <span>সাম্প্রতিক অর্ডার লেনদেন বিবরণী</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              ওদু ইআরপি থেকে লাইভ ফেচকৃত সেলস ও পারচেস তালিকা
            </div>
          </div>
        </div>

        {/* Action controls & Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="অর্ডার নং বা নাম খুঁজুন..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '30px', paddingRight: '12px', fontSize: '0.82rem', height: '34px', width: '190px' }}
            />
          </div>

          {/* Tab buttons */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('sales')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: activeTab === 'sales' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'sales' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <ShoppingBag size={13} />
              <span>বিক্রয় ({formatNumber(salesOrders.length, numSys)})</span>
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: activeTab === 'purchases' ? 'var(--color-purple)' : 'transparent',
                color: activeTab === 'purchases' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <ShoppingCart size={13} />
              <span>ক্রয় ({formatNumber(purchaseOrders.length, numSys)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Android Mobile Cards List (Accessible, zero horizontal scroll) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            কোনো অর্ডার খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          filteredOrders.slice(0, 10).map((order) => {
            const isSale = activeTab === 'sales';
            const partyName = isSale ? order.customer : order.vendor;

            return (
              <div
                key={order.id}
                className="android-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                }}
              >
                {/* Row 1: ID, time & Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.9rem', letterSpacing: '0.02em' }}>
                      {order.id}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      #{order.odooId}
                    </span>
                  </div>

                  <span
                    className={`badge ${
                      order.statusColor === 'green' ? 'badge-green' :
                      order.statusColor === 'blue' ? 'badge-blue' :
                      order.statusColor === 'orange' ? 'badge-orange' : 'badge-red'
                    }`}
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  >
                    {order.statusLabel}
                  </span>
                </div>

                {/* Row 2: Customer / Vendor with avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isSale ? 'var(--color-primary-light)' : 'var(--color-purple-light)',
                    color: isSale ? 'var(--color-primary)' : 'var(--color-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {partyName ? partyName.charAt(0) : '?'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }} className="truncate">
                      {partyName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={11} />
                      <span>{getRelativeTimeBangla(order.date, numSys)}</span>
                      <span>•</span>
                      <span>{formatNumber(order.itemsCount || 1, numSys)} টি আইটেম</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Amount Highlight */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px dashed var(--border-color)',
                  marginTop: '2px',
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    মোট লেনদেন মূল্য:
                  </span>
                  <strong
                    className="bangla-number"
                    style={{
                      color: isSale ? 'var(--color-success)' : 'var(--color-primary)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                    }}
                  >
                    {formatCurrency(order.amount, currency, numSys)}
                  </strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
