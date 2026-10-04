// src/components/AndroidBottomNav.jsx
import React from 'react';
import { Home, ShoppingCart, Package, Users, Grid } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

/**
 * AndroidBottomNav
 * Authentic Material Design 3 Navigation Bar.
 * Features 5 primary thumb-accessible destinations with active pill indicators.
 */
export const AndroidBottomNav = () => {
  const { activeTab, setActiveTab, toggleAppDrawer } = useDashboard();

  const navItems = [
    { key: 'home',       label: 'হোম',        icon: Home },
    { key: 'sales',      label: 'বিক্রয়',     icon: ShoppingCart },
    { key: 'inventory',  label: 'মজুদ',       icon: Package },
    { key: 'attendance', label: 'কর্মী',       icon: Users },
    { key: 'apps',       label: 'ওদু অ্যাপস',  icon: Grid },
  ];

  const handleTabClick = (key) => {
    if (key === 'apps') {
      toggleAppDrawer();
    } else {
      setActiveTab(key);
    }
  };

  return (
    <nav className="md3-bottom-nav" role="navigation" aria-label="প্রধান মোবাইল নেভিগেশন">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            onClick={() => handleTabClick(item.key)}
            className={`md3-nav-item ${isActive ? 'active' : ''}`}
            aria-selected={isActive}
            aria-label={item.label}
          >
            <div className="md3-nav-pill">
              <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default AndroidBottomNav;
