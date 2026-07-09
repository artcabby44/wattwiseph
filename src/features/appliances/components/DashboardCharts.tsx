import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { CategorySummary, ApplianceWithCost } from '../types';
import { BarChart3, PieChartIcon } from 'lucide-react';

interface DashboardChartsProps {
  categorySummaries: CategorySummary[];
  applianceCosts: ApplianceWithCost[];
  isDarkMode: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Cooling: '#3b82f6',      // Blue
  Kitchen: '#f59e0b',      // Amber
  Lighting: '#eab308',     // Yellow
  Entertainment: '#6366f1', // Indigo
  Laundry: '#a855f7',      // Purple
  Workspace: '#10b981',    // Emerald
  Others: '#64748b',       // Slate
};

export function DashboardCharts({ categorySummaries, applianceCosts, isDarkMode }: DashboardChartsProps) {
  const textLabelColor = isDarkMode ? '#94a3b8' : '#475569';
  const gridBorderColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#1e293b' : '#e2e8f0';

  // Only active appliances for the bar chart
  const activeAppliancesData = useMemo(() => {
    return applianceCosts
      .filter((app) => app.isActive && app.monthlyCost > 0)
      .map((app) => ({
        name: app.name.length > 15 ? `${app.name.substring(0, 15)}...` : app.name,
        fullName: app.name,
        cost: Math.round(app.monthlyCost),
        kwh: Math.round(app.monthlyKwh),
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 6); // Top 6 consumers
  }, [applianceCosts]);

  // Pie chart data
  const pieData = useMemo(() => {
    return categorySummaries.map((cat) => ({
      name: cat.category,
      value: Math.round(cat.monthlyCost),
      kwh: Math.round(cat.monthlyKwh),
      percentage: cat.costPercentage,
    }));
  }, [categorySummaries]);

  // Custom tooltips
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="p-3 border rounded-xl shadow-md text-xs font-semibold"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
        >
          <p className="text-slate-800 dark:text-slate-100 font-bold mb-1">{data.name}</p>
          <p className="text-emerald-600 dark:text-emerald-450 font-extrabold text-sm mb-0.5">
            ₱{data.value.toLocaleString()} / mo
          </p>
          <p className="text-slate-400 dark:text-slate-500 font-medium">
            {data.kwh} kWh • {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="p-3 border rounded-xl shadow-md text-xs font-semibold"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
        >
          <p className="text-slate-800 dark:text-slate-100 font-bold mb-1">{data.fullName}</p>
          <p className="text-emerald-600 dark:text-emerald-450 font-extrabold text-sm mb-0.5">
            ₱{data.cost.toLocaleString()} / mo
          </p>
          <p className="text-slate-400 dark:text-slate-500 font-medium">
            {data.kwh} kWh / month
          </p>
        </div>
      );
    }
    return null;
  };

  if (categorySummaries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
        <BarChart3 className="w-12 h-12 text-slate-350 dark:text-slate-650 mb-3" />
        <p className="font-display font-bold text-slate-700 dark:text-slate-300 text-sm">
          Visualizations Unavailable
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-550 max-w-[280px] mt-1 leading-relaxed">
          Please add appliances and ensure at least one is turned ON to render consumption analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown (Pie) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm card-print flex flex-col">
        <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
          <PieChartIcon className="w-4 h-4 text-emerald-555" />
          Monthly Cost by Category
        </h3>
        <div className="h-[240px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 6 Appliance (Bar) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm card-print flex flex-col">
        <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-555" />
          Top Consumer Appliances (₱ / mo)
        </h3>
        <div className="h-[240px] w-full relative">
          {activeAppliancesData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No active appliances to compare.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeAppliancesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridBorderColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: textLabelColor, fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: textLabelColor, fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" ₱"
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                  {activeAppliancesData.map((entry, index) => {
                    const originalApp = applianceCosts.find((a) => a.name === entry.fullName);
                    const color = originalApp ? CATEGORY_COLORS[originalApp.category] : '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
