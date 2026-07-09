import { useState, useEffect, lazy, Suspense } from 'react';
import { useAppliances } from './features/appliances/hooks/useAppliances';
import { ApplianceForm } from './features/appliances/components/ApplianceForm';
import { ApplianceList } from './features/appliances/components/ApplianceList';
import { MascotTips } from './features/appliances/components/MascotTips';
import type { Appliance } from './features/appliances/types';
import {
  Sun,
  Moon,
  Printer,
  RotateCcw,
  Zap,
  TrendingUp,
  Wallet,
  Sliders,
  Gauge,
} from 'lucide-react';

// Lazy load Recharts component to optimize bundle size and startup speed
const DashboardCharts = lazy(() =>
  import('./features/appliances/components/DashboardCharts').then((m) => ({
    default: m.DashboardCharts,
  }))
);

const ChartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-80 animate-pulse flex flex-col justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="w-40 h-40 rounded-full border-8 border-slate-150 dark:border-slate-800 border-t-emerald-500 animate-spin mx-auto"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto"></div>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-80 animate-pulse flex flex-col justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="flex items-end justify-between gap-2 h-44 px-4">
        <div className="bg-slate-200 dark:bg-slate-800 w-full h-1/3 rounded-t"></div>
        <div className="bg-slate-200 dark:bg-slate-800 w-full h-2/3 rounded-t"></div>
        <div className="bg-slate-200 dark:bg-slate-800 w-full h-4/5 rounded-t"></div>
        <div className="bg-slate-200 dark:bg-slate-800 w-full h-1/2 rounded-t"></div>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);

function App() {
  const {
    rate,
    setRate,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    toggleApplianceActive,
    duplicateAppliance,
    resetToDefault,
    clearAll,
    billSummary,
    applianceCosts,
    categoryCosts,
  } = useAppliances();

  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  
  // Theme state following modern color preference patterns
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('wattwise-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Track system preference change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only apply system change if user has not explicitly set a preference
      if (!localStorage.getItem('wattwise-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Update HTML classes & local storage on theme change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('color-scheme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('wattwise-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleEditAppliance = (app: Appliance) => {
    setEditingAppliance(app);
    // Scroll form into view on mobile
    const formElement = document.getElementById('appliance-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-205 dark:border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-650 text-white p-2 rounded-xl shadow-xs text-lg font-bold flex items-center justify-center leading-none">
              🦉
            </span>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-slate-850 dark:text-slate-100 tracking-tight leading-none">
              WattWise<span className="text-emerald-650 dark:text-emerald-500">PH</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Philippine Household Appliance Energy & Electric Bill Calculator
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2.5 no-print">
          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all values to Philippine household defaults?')) {
                resetToDefault();
                setEditingAppliance(null);
              }
            }}
            title="Reset to default settings"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Print button */}
          <button
            onClick={() => window.print()}
            title="Print summary report"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Theme toggle switch */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-650" />}
          </button>
        </div>
      </header>

      {/* Primary KPI Metrics row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Estimated Monthly Bill */}
        <div className="bg-gradient-to-br from-emerald-650 to-teal-700 text-white rounded-2xl p-5 shadow-xs hover:shadow-xs transition-all duration-300 card-print relative overflow-hidden group">
          <div className="absolute right-3 -bottom-3 opacity-15 transform group-hover:scale-110 transition-transform">
            <Wallet className="w-20 h-20 text-white" />
          </div>
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
            Est. Monthly Bill
          </span>
          <div className="font-display font-black text-2xl md:text-3xl mt-1.5 flex items-baseline gap-1">
            <span className="text-lg font-bold">₱</span>
            {billSummary.totalMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-emerald-100/80 font-semibold mt-2.5">
            Average of 30 billing days
          </p>
        </div>

        {/* Monthly Energy (kWh) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xs transition-all duration-300 card-print relative overflow-hidden group">
          <div className="absolute right-3 -bottom-3 opacity-10 dark:opacity-5 transform group-hover:scale-110 transition-transform">
            <Zap className="w-20 h-20 text-slate-900 dark:text-white" />
          </div>
          <span className="text-xs font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider">
            Monthly Consumption
          </span>
          <div className="font-display font-extrabold text-2xl md:text-3xl text-slate-805 dark:text-slate-100 mt-1.5 flex items-baseline gap-0.5">
            {billSummary.totalMonthlyKwh.toFixed(1)}
            <span className="text-sm font-bold text-slate-400 dark:text-slate-550 ml-1">kWh</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-2.5">
            Based on active appliances
          </p>
        </div>

        {/* Estimated Daily Cost */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xs transition-all duration-300 card-print relative overflow-hidden group">
          <div className="absolute right-3 -bottom-3 opacity-10 dark:opacity-5 transform group-hover:scale-110 transition-transform">
            <TrendingUp className="w-20 h-20 text-slate-900 dark:text-white" />
          </div>
          <span className="text-xs font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider">
            Average Daily Cost
          </span>
          <div className="font-display font-extrabold text-2xl md:text-3xl text-slate-805 dark:text-slate-100 mt-1.5 flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-slate-400 dark:text-slate-550">₱</span>
            {billSummary.totalDailyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-2.5">
            Daily running estimate
          </p>
        </div>

        {/* Daily Energy (kWh) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xs transition-all duration-300 card-print relative overflow-hidden group">
          <div className="absolute right-3 -bottom-3 opacity-10 dark:opacity-5 transform group-hover:scale-110 transition-transform">
            <Gauge className="w-20 h-20 text-slate-900 dark:text-white" />
          </div>
          <span className="text-xs font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider">
            Daily Consumption
          </span>
          <div className="font-display font-extrabold text-2xl md:text-3xl text-slate-805 dark:text-slate-100 mt-1.5 flex items-baseline gap-0.5">
            {billSummary.totalDailyKwh.toFixed(2)}
            <span className="text-sm font-bold text-slate-400 dark:text-slate-550 ml-1">kWh</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-2.5">
            Daily energy footprint
          </p>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Form, Rate controls, and Mascot Tips */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Rate Settings Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-2xl p-6 shadow-xs card-print">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-555" />
              Electricity Rate Setting
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mb-4 font-medium">
              Configure your local utility provider rate (₱ per kWh) to calculate costs.
            </p>
            
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-450 dark:text-slate-500">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="100"
                    value={rate || ''}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-16 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-600 font-bold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    per kWh
                  </span>
                </div>
              </div>

              {/* Slider for quick tweaks */}
              <div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 dark:accent-emerald-550 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                  <span>₱5.00</span>
                  <span>₱12.50</span>
                  <span>₱20.00</span>
                </div>
              </div>

              {/* Quick rate info badges */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-2 uppercase tracking-wide">
                  Typical Rates in the Philippines (Est.)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setRate(11.50)}
                    className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-202 dark:border-slate-850 px-2 py-1 rounded-md text-slate-650 dark:text-slate-400 hover:border-emerald-500 dark:hover:border-emerald-650 transition-colors cursor-pointer"
                  >
                    Meralco: ₱11.50
                  </button>
                  <button
                    onClick={() => setRate(10.20)}
                    className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-202 dark:border-slate-850 px-2 py-1 rounded-md text-slate-650 dark:text-slate-400 hover:border-emerald-500 dark:hover:border-emerald-650 transition-colors cursor-pointer"
                  >
                    Davao Light: ₱10.20
                  </button>
                  <button
                    onClick={() => setRate(11.10)}
                    className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-202 dark:border-slate-850 px-2 py-1 rounded-md text-slate-650 dark:text-slate-400 hover:border-emerald-500 dark:hover:border-emerald-650 transition-colors cursor-pointer"
                  >
                    VECO: ₱11.10
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div id="appliance-form-container">
            <ApplianceForm
              onAddAppliance={addAppliance}
              editingAppliance={editingAppliance}
              onUpdateAppliance={updateAppliance}
              onCancelEdit={() => setEditingAppliance(null)}
            />
          </div>

          {/* Mascot Wisdom Tips */}
          <MascotTips applianceCosts={applianceCosts} totalMonthlyCost={billSummary.totalMonthlyCost} />
        </div>

        {/* Right Side: Charts & Appliance Inventory */}
        <div className="lg:col-span-8 space-y-6">
          {/* Charts (Lazy Loaded) */}
          <Suspense fallback={<ChartSkeleton />}>
            <DashboardCharts
              categorySummaries={categoryCosts}
              applianceCosts={applianceCosts}
              isDarkMode={isDarkMode}
            />
          </Suspense>

          {/* Appliance Inventory List */}
          <ApplianceList
            appliances={applianceCosts}
            onToggleActive={toggleApplianceActive}
            onDelete={(id) => {
              deleteAppliance(id);
              if (editingAppliance && editingAppliance.id === id) {
                setEditingAppliance(null);
              }
            }}
            onEdit={handleEditAppliance}
            onDuplicate={duplicateAppliance}
            onClearAll={clearAll}
          />
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between text-xs text-slate-450 dark:text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg text-sm">
            🦉
          </span>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-350 block">
              WattWisePH © 2026 | Deployed by: James Cabiao 
            </span>
            <span className="font-medium text-slate-400 dark:text-slate-550">
              Wise choices lead to light bills.
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-center font-medium md:text-right">
          <span>Formula: (Watts × Qty × Hours × (Days/7)) / 1000 = kWh</span>
          <span className="hidden md:inline">•</span>
          <span>Monthly calculations are normalized to 30 billing days.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
