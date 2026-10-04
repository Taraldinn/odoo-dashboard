// src/components/AndroidAppShell.jsx
import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AndroidTopAppBar } from './AndroidTopAppBar';
import { AndroidBottomNav } from './AndroidBottomNav';
import { OdooAppBottomSheet } from './OdooAppBottomSheet';
import { SettingsModal } from './SettingsModal';
import { ToastContainer } from './ToastContainer';
import { MetricCards } from './MetricCards';
import { SalesPurchaseChart } from './SalesPurchaseChart';
import { ProfitLossWidget } from './ProfitLossWidget';
import { InventoryTracker } from './InventoryTracker';
import { OrdersTable } from './OrdersTable';
import { LiveActivityFeed } from './LiveActivityFeed';
import { AttendanceWidget } from './AttendanceWidget';
import { InvoicesPaymentsWidget } from './InvoicesPaymentsWidget';
import { DeliveryLogisticsWidget } from './DeliveryLogisticsWidget';
import { CustomerLedgerWidget } from './CustomerLedgerWidget';

/**
 * AndroidAppShell
 * Clean mobile phone layout matching user's exact specification:
 * - Direct Top App Bar (no upper status/notification bar)
 * - Scrollable card body with high-contrast low-vision cards
 * - Bottom Navigation Bar (Home, Sales, Stock, HR, Apps)
 * - Modal Bottom Sheet for Odoo apps & settings
 */
export const AndroidAppShell = () => {
  const {
    activeTab,
    isBezelExpanded,
  } = useDashboard();

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <>
            <MetricCards />
            <InvoicesPaymentsWidget />
            <OrdersTable />
            <SalesPurchaseChart />
          </>
        );

      case 'invoices':
        return (
          <>
            <InvoicesPaymentsWidget />
            <CustomerLedgerWidget />
          </>
        );

      case 'deliveries':
        return (
          <>
            <DeliveryLogisticsWidget />
            <InventoryTracker />
          </>
        );

      case 'clients':
        return (
          <>
            <CustomerLedgerWidget />
            <InvoicesPaymentsWidget />
          </>
        );

      case 'inventory':
        return (
          <>
            <DeliveryLogisticsWidget />
            <InventoryTracker />
            <MetricCards />
          </>
        );

      case 'attendance':
        return (
          <>
            <AttendanceWidget />
          </>
        );

      case 'home':
      default:
        return (
          <>
            {/* Top KPI Metric Cards */}
            <MetricCards />

            {/* Invoices & Due Payments */}
            <InvoicesPaymentsWidget />

            {/* Deliveries & Logistics Tracking */}
            <DeliveryLogisticsWidget />

            {/* Customer 360 Ledger */}
            <CustomerLedgerWidget />

            {/* Sales vs Purchase trend */}
            <SalesPurchaseChart />

            {/* Profit & Loss Explorer */}
            <ProfitLossWidget />

            {/* Inventory Overview */}
            <InventoryTracker />

            {/* Recent Orders List */}
            <OrdersTable />

            {/* Attendance & HR */}
            <AttendanceWidget />

            {/* Live Activities */}
            <LiveActivityFeed />
          </>
        );
    }
  };


  return (
    <div className={`android-viewport-wrapper ${isBezelExpanded ? 'expanded' : ''}`}>
      {/* Phone Frame */}
      <div className="android-device-bezel" role="main" aria-label="ওদু মোবাইল ড্যাশবোর্ড">
        {/* Screen Container */}
        <div className="android-screen">
          {/* Top App Bar */}
          <AndroidTopAppBar />

          {/* Scrollable Body Content */}
          <main className="android-body-content" id="main-content">
            {renderTabContent()}
          </main>

          {/* Bottom Navigation Bar */}
          <AndroidBottomNav />

          {/* Odoo Home Modal Bottom Sheet */}
          <OdooAppBottomSheet />

          {/* Settings Modal */}
          <SettingsModal />

          {/* Toast Container */}
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default AndroidAppShell;
