// src/components/InventoryTracker.jsx
import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  Warehouse, 
  Search, 
  CheckCircle, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { formatCurrency, formatNumber, toBanglaDigits } from '../utils/bengaliUtils';

export const InventoryTracker = () => {
  const { dashboardData, settings } = useDashboard();
  const [activeTab, setActiveTab] = useState('lowStock'); // 'lowStock' | 'warehouses' | 'allProducts'
  const [searchTerm, setSearchTerm] = useState('');

  const numSys = settings.numeralSystem;
  const currency = settings.currencySymbol;

  const products = dashboardData?.inventoryProducts || [];
  const warehouses = dashboardData?.warehouses || [];
  const lowStockItems = dashboardData?.lowStockItems || [];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card animate-fade-in">
      {/* Header & Tabs */}
      <div className="card-header-clean" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="card-title">
          <div className="icon-badge" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <Boxes size={18} />
          </div>
          <div>
            <span>মজুদ ও ইনভেন্টরি পর্যবেক্ষণ</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              স্টক স্তর, গুদাম ক্ষমতা ও রিয়েলটাইম রি-অর্ডার
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('lowStock')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: activeTab === 'lowStock' ? 'var(--color-warning)' : 'transparent',
              color: activeTab === 'lowStock' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <AlertTriangle size={13} />
            <span>কম মজুদ ({formatNumber(lowStockItems.length, numSys)})</span>
          </button>
          <button
            onClick={() => setActiveTab('warehouses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: activeTab === 'warehouses' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'warehouses' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <Warehouse size={13} />
            <span>গুদাম স্থিতি</span>
          </button>
          <button
            onClick={() => setActiveTab('allProducts')}
            style={{
              background: activeTab === 'allProducts' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'allProducts' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            সমস্ত পণ্য ({formatNumber(products.length, numSys)})
          </button>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'lowStock' && (
        <div>
          {lowStockItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--text-secondary)'
            }}>
              <CheckCircle size={36} style={{ color: 'var(--color-success)', margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                সমস্ত পণ্যের স্টক পর্যাপ্ত রয়েছে!
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                কোনো পণ্যই নির্ধারিত রি-অর্ডার লেভেলের নিচে নেই।
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '330px', overflowY: 'auto', paddingRight: '4px' }}>
              {lowStockItems.map((item) => {
                const stockPct = Math.min(100, Math.round((item.stock / item.minStock) * 100));
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {item.name}
                        </strong>
                        <span className="badge badge-orange" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                          {item.sku}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        ক্যাটাগরি: {item.category} • গুদাম: {item.warehouse}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="bangla-number" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-danger)' }}>
                          {formatNumber(item.stock, numSys)} টি বর্তমান
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ন্যূনতম স্তর: {formatNumber(item.minStock, numSys)} টি
                        </div>
                      </div>

                      <div style={{ minWidth: '70px' }}>
                        <div style={{
                          height: '6px',
                          background: 'var(--border-color)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${stockPct}%`,
                            height: '100%',
                            background: stockPct < 40 ? 'var(--color-danger)' : 'var(--color-warning)'
                          }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
                          {formatNumber(stockPct, numSys)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '330px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {wh.name}
                  </span>
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                    {wh.code}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                  মোট সংরক্ষিত আইটেম: <strong className="bangla-number" style={{ color: 'var(--text-primary)' }}>{formatNumber(wh.totalItems, numSys)}</strong> টি
                </div>
                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    <span>ধারণক্ষমতা ব্যবহার</span>
                    <span className="bangla-number">{formatNumber(wh.utilization, numSys)}%</span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${wh.utilization}%`,
                      height: '100%',
                      background: wh.utilization > 80 ? 'var(--color-warning)' : 'var(--color-primary)'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Products Tab with Search */}
      {activeTab === 'allProducts' && (
        <div>
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="পণ্য, SKU বা ক্যাটাগরি খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '270px', overflowY: 'auto' }}>
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {p.sku} • {p.category}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="bangla-number" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatCurrency(p.salePrice, currency, numSys)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: p.stock <= p.minStock ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                    মজুদ: {formatNumber(p.stock, numSys)} টি
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
