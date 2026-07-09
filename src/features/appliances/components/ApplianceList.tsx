import { useState } from 'react';
import { Trash2, Edit2, Copy, Search, Power, Filter, Calendar, Zap, AlertCircle } from 'lucide-react';
import type { Appliance, ApplianceWithCost, ApplianceCategory } from '../types';

interface ApplianceListProps {
  appliances: ApplianceWithCost[];
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (appliance: Appliance) => void;
  onDuplicate: (id: string) => void;
  onClearAll: () => void;
}

const CATEGORIES: (ApplianceCategory | 'All')[] = [
  'All',
  'Cooling',
  'Kitchen',
  'Lighting',
  'Entertainment',
  'Laundry',
  'Workspace',
  'Others',
];

export function ApplianceList({
  appliances,
  onToggleActive,
  onDelete,
  onEdit,
  onDuplicate,
  onClearAll,
}: ApplianceListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ApplianceCategory | 'All'>('All');

  // Filtered list
  const filteredAppliances = appliances.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryEmoji = (category: ApplianceCategory) => {
    switch (category) {
      case 'Cooling':
        return '❄️';
      case 'Kitchen':
        return '🍳';
      case 'Lighting':
        return '💡';
      case 'Entertainment':
        return '📺';
      case 'Laundry':
        return '🧺';
      case 'Workspace':
        return '💻';
      default:
        return '🔌';
    }
  };

  const getCategoryBadgeColor = (category: ApplianceCategory) => {
    switch (category) {
      case 'Cooling':
        return 'bg-blue-50 text-blue-700 border-blue-105 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
      case 'Kitchen':
        return 'bg-amber-50 text-amber-700 border-amber-105 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
      case 'Lighting':
        return 'bg-yellow-50 text-yellow-700 border-yellow-105 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30';
      case 'Entertainment':
        return 'bg-indigo-50 text-indigo-700 border-indigo-105 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'Laundry':
        return 'bg-purple-50 text-purple-700 border-purple-105 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30';
      case 'Workspace':
        return 'bg-emerald-50 text-emerald-700 border-emerald-105 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-105 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-xs transition-all duration-300">
      {/* Header Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            📋 Appliance Inventory
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded-full font-sans font-bold">
              {appliances.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, edit, and toggle appliances to see real-time bill effects.
          </p>
        </div>
        {appliances.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire appliance inventory?')) {
                onClearAll();
              }
            }}
            className="text-xs font-semibold px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/35 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
          <input
            type="text"
            placeholder="Search appliances..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-600"
          />
        </div>

        {/* Category Selector scroll area */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
          <Filter className="w-3.5 h-3.5 text-slate-450 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border shrink-0 transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-650 dark:text-slate-350'
              }`}
            >
              {cat === 'All' ? 'All' : `${getCategoryEmoji(cat)} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Appliance Grid/List */}
      {filteredAppliances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30">
          <AlertCircle className="w-10 h-10 text-slate-400 dark:text-slate-650 mb-3" />
          <p className="font-display font-medium text-slate-700 dark:text-slate-300 text-sm">
            {appliances.length === 0
              ? "Your appliance list is empty!"
              : "No appliances match your filters."}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-550 text-center max-w-[280px] mt-1">
            {appliances.length === 0
              ? "Add some appliances above or apply a preset to start tracking consumption."
              : "Try adjusting your search terms or selecting 'All' categories."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredAppliances.map((app) => (
            <div
              key={app.id}
              className={`border rounded-xl p-4 transition-all duration-350 flex flex-col md:flex-row md:items-center justify-between gap-4 card-print hover:shadow-2xs ${
                app.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800'
                  : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 opacity-60'
              }`}
            >
              {/* Left Side: Info */}
              <div className="flex items-start gap-3">
                {/* Active Toggle Switch */}
                <button
                  type="button"
                  onClick={() => onToggleActive(app.id)}
                  title={app.isActive ? 'Deactivate (Unplug)' : 'Activate (Plug in)'}
                  className={`mt-1 flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer ${
                    app.isActive
                      ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-450'
                      : 'bg-slate-205 hover:bg-slate-250 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>

                {/* Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-150">
                      {app.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadgeColor(app.category)}`}>
                      {getCategoryEmoji(app.category)} {app.category}
                    </span>
                    {app.quantity > 1 && (
                      <span className="text-[10px] font-bold bg-slate-150 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        Qty: {app.quantity}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-405 font-medium">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {app.powerWatts >= 1000
                        ? `${(app.powerWatts / 1000).toFixed(2)} kW`
                        : `${app.powerWatts} W`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {app.hoursPerDay}h/day • {app.daysPerWeek}d/wk
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Cost & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 dark:border-slate-850">
                {/* Cost summary */}
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Estimated Monthly</div>
                  <div className="font-display font-extrabold text-base text-slate-850 dark:text-slate-100 flex items-baseline gap-0.5">
                    <span className="text-sm font-bold">₱</span>
                    {app.isActive ? app.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 ml-1">
                      ({app.isActive ? app.monthlyKwh.toFixed(1) : '0'} kWh)
                    </span>
                  </div>
                  {app.isActive && app.costPercentage > 0 && (
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                      {app.costPercentage.toFixed(1)}% of total bill
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 no-print">
                  <button
                    onClick={() => onDuplicate(app.id)}
                    title="Duplicate appliance"
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(app)}
                    title="Edit details"
                    className="p-2 text-slate-500 hover:text-emerald-650 dark:text-slate-400 dark:hover:text-emerald-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    title="Delete appliance"
                    className="p-2 text-slate-500 hover:text-red-650 dark:text-slate-400 dark:hover:text-red-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
