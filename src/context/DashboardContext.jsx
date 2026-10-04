// src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { odooApi, getEnvOdooConfig } from '../services/odooApi';
import { soundService } from '../utils/audioAlerts';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'odoo_bangla_dashboard_settings_v1';
const ZOOM_STORAGE_KEY = 'odoo_zoom_scale_v1';
const FONT_STORAGE_KEY = 'odoo_font_choice_v1';
const ZOOM_LEVELS = [1.0, 1.15, 1.30, 1.45, 1.60];

const envConfig = getEnvOdooConfig();

const DEFAULT_SETTINGS = {
  theme: 'high-contrast', // 'high-contrast' | 'dark' | 'light' | 'odoo-purple' | 'midnight' | 'emerald'
  numeralSystem: 'bangla', // 'bangla' | 'english'
  currencySymbol: '৳', // '৳' | 'BDT' | 'USD'
  refreshInterval: 6, // seconds (0 = manual)
  soundAlerts: true,
  compactMode: false,
  visibleWidgets: {
    metrics: true,
    salesPurchaseChart: true,
    profitLoss: true,
    inventory: true,
    recentOrders: true,
    liveActivity: true,
    warehouseStatus: true,
  },
  odooConfig: {
    baseUrl: envConfig.baseUrl,
    apiKey: envConfig.apiKey,
    db: envConfig.db,
    login: envConfig.login,
    useLiveOdoo: true,
  }
};

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  // Load settings from localStorage — always ensure login is set
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          odooConfig: {
            ...DEFAULT_SETTINGS.odooConfig,
            ...(parsed.odooConfig || {}),
            apiKey: (parsed.odooConfig && parsed.odooConfig.apiKey) || envConfig.apiKey || DEFAULT_SETTINGS.odooConfig.apiKey,
            login: (parsed.odooConfig && parsed.odooConfig.login) || envConfig.login || DEFAULT_SETTINGS.odooConfig.login,
            baseUrl: (parsed.odooConfig && parsed.odooConfig.baseUrl) || envConfig.baseUrl || DEFAULT_SETTINGS.odooConfig.baseUrl,
            db: (parsed.odooConfig && parsed.odooConfig.db) || envConfig.db || DEFAULT_SETTINGS.odooConfig.db,
          }
        };
        return merged;
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const [countdown, setCountdown] = useState(settings.refreshInterval || 6);
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveActivities, setLiveActivities] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Adaptive Zoom State (1.0 = 100%, up to 1.6 = 160%)
  const [zoomLevel, setZoomLevel] = useState(() => {
    try {
      const savedZoom = localStorage.getItem(ZOOM_STORAGE_KEY);
      return savedZoom ? parseFloat(savedZoom) : 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const idx = ZOOM_LEVELS.findIndex((z) => Math.abs(z - prev) < 0.05);
      if (idx !== -1 && idx < ZOOM_LEVELS.length - 1) {
        return ZOOM_LEVELS[idx + 1];
      }
      return Math.min(1.60, Number((prev + 0.15).toFixed(2)));
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const idx = ZOOM_LEVELS.findIndex((z) => Math.abs(z - prev) < 0.05);
      if (idx > 0) {
        return ZOOM_LEVELS[idx - 1];
      }
      return Math.max(1.0, Number((prev - 0.15).toFixed(2)));
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1.0);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(zoomLevel));
    try {
      localStorage.setItem(ZOOM_STORAGE_KEY, String(zoomLevel));
    } catch (e) {}
  }, [zoomLevel]);

  // Selected Bangla Font (from @shoroborno/react)
  const [selectedFontId, setSelectedFontId] = useState(() => {
    try {
      return localStorage.getItem(FONT_STORAGE_KEY) || 'solaiman-lipi';
    } catch (e) {
      return 'solaiman-lipi';
    }
  });

  const updateSelectedFontId = useCallback((fontId) => {
    setSelectedFontId(fontId);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, fontId);
    } catch (e) {}
  }, []);

  // Android Navigation & Modal State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sales' | 'inventory' | 'attendance' | 'apps'
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isBezelExpanded, setIsBezelExpanded] = useState(false);

  const toggleAppDrawer = useCallback(() => {
    setIsAppDrawerOpen((prev) => !prev);
  }, []);

  const toggleBezelExpanded = useCallback(() => {
    setIsBezelExpanded((prev) => !prev);
  }, []);

  // Save settings when modified
  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...partial,
        visibleWidgets: {
          ...prev.visibleWidgets,
          ...(partial.visibleWidgets || {})
        },
        odooConfig: {
          ...prev.odooConfig,
          ...(partial.odooConfig || {})
        }
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }
      return updated;
    });
  }, []);

  // Update theme class on HTML / body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Push toast message
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, time: new Date(), ...toast };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Fetch Dashboard Data via strictly GET — pass all credentials including login
  const refreshData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsSyncing(true);
    try {
      const result = await odooApi.fetchDashboardData({
        baseUrl: settings.odooConfig.baseUrl,
        apiKey: settings.odooConfig.apiKey,
        db: settings.odooConfig.db,
        login: settings.odooConfig.login,     // ← CRITICAL: was missing before
        dateRange: dateFilter,
        useLiveOdoo: settings.odooConfig.useLiveOdoo,
      });

      setDashboardData(result);
      setLastSyncedAt(new Date());
      setCountdown(settings.refreshInterval || 6);
    } catch (err) {
      console.error('GET request error:', err);
      addToast({
        type: 'error',
        title: 'ডেটা সিঙ্ক ত্রুটি',
        message: err.message,
      });
    } finally {
      if (!isBackground) {
        setTimeout(() => setIsSyncing(false), 300);
      }
    }
  }, [settings.odooConfig, dateFilter, settings.refreshInterval, addToast]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time live simulation / poll timer
  useEffect(() => {
    if (!settings.refreshInterval || settings.refreshInterval <= 0) return;

    const intervalTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger simulated live incoming transaction or GET poll
          if (!settings.odooConfig.useLiveOdoo || !settings.odooConfig.login) {
            if (typeof odooApi.generateLiveSimulationEvent === 'function') {
              const event = odooApi.generateLiveSimulationEvent();
              if (event) {
                setLiveActivities((prevList) => [event, ...prevList.slice(0, 29)]);
                
                if (settings.soundAlerts) {
                  if (event.type === 'sale') {
                    soundService.playSaleChime();
                  }
                }

                // Celebrate major sale > 30,000 BDT
                if (event.type === 'sale' && event.amount > 30000) {
                  confetti({
                    particleCount: 40,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#10b981', '#6366f1', '#f59e0b']
                  });
                }

                addToast({
                  type: event.type === 'sale' ? 'success' : 'info',
                  title: event.title,
                  message: event.message,
                });
              }
            }
          }
          // Refresh aggregated metrics
          refreshData(true);
          return settings.refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [settings.refreshInterval, settings.odooConfig.useLiveOdoo, settings.odooConfig.login, settings.soundAlerts, refreshData, addToast]);

  // Trigger manual simulated sale
  const triggerManualSale = useCallback(() => {
    if (typeof odooApi.generateLiveSimulationEvent === 'function') {
      const event = odooApi.generateLiveSimulationEvent();
      if (event) {
        setLiveActivities((prev) => [event, ...prev.slice(0, 29)]);
        if (settings.soundAlerts) soundService.playSaleChime();
        addToast({
          type: 'success',
          title: 'ম্যানুয়াল অর্ডার সংযোজিত',
          message: event.message,
        });
        refreshData(true);
      }
    }
  }, [settings.soundAlerts, addToast, refreshData]);

  const value = {
    settings,
    updateSettings,
    dashboardData,
    isSyncing,
    lastSyncedAt,
    countdown,
    dateFilter,
    setDateFilter,
    searchQuery,
    setSearchQuery,
    liveActivities,
    toasts,
    addToast,
    isSettingsOpen,
    setIsSettingsOpen,
    isExportOpen,
    setIsExportOpen,
    refreshData,
    triggerManualSale,
    // Adaptive Zoom & Accessibility
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    // Shoroborno Fonts
    selectedFontId,
    updateSelectedFontId,
    // Android Navigation
    activeTab,
    setActiveTab,
    isAppDrawerOpen,
    setIsAppDrawerOpen,
    toggleAppDrawer,
    isBezelExpanded,
    setIsBezelExpanded,
    toggleBezelExpanded,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
