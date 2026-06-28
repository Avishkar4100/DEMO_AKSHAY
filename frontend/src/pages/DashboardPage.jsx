import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [status, setStatus] = useState(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', department: '' });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [kpiRes, chartRes, statusRes] = await Promise.all([
        dashboardAPI.kpis(),
        dashboardAPI.charts(),
        dashboardAPI.realtimeStatus(),
      ]);
      setKpis(kpiRes.data.kpis);
      setCharts(chartRes.data);
      setStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const kpiCards = [
    { label: 'Total Patients', value: kpis?.total_patients, icon: '👥', color: 'bg-blue-500', shadow: 'shadow-blue-200' },
    { label: 'Active Patients', value: kpis?.active_patients, icon: '❤️', color: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
    { label: 'Appointments Today', value: kpis?.appointments_today, icon: '📅', color: 'bg-amber-500', shadow: 'shadow-amber-200' },
    { label: 'Monthly Revenue', value: kpis?.revenue_month ? `$${kpis.revenue_month.toLocaleString()}` : '$0', icon: '💰', color: 'bg-purple-500', shadow: 'shadow-purple-200' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 overflow-hidden shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="relative z-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome to HMS</h1>
            <p className="text-indigo-100 font-medium mt-2 max-w-lg leading-relaxed">
              Real-time hospital metrics and analytics for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wide text-white uppercase">System Live</span>
          </div>
        </div>
      </div>

      {/* Filters (Glass style) */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100/50 dark:border-slate-700/50 p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Start Date</label>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">End Date</label>
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Department Filter</label>
          <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
            <option value="">All Departments Overview</option>
            <option value="cardiology">Cardiology Unit</option>
            <option value="pediatrics">Pediatrics Unit</option>
            <option value="orthopedics">Orthopedics Unit</option>
            <option value="neurology">Neurology Unit</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${kpi.color} blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${kpi.color} text-white ${kpi.shadow}`}>
                {kpi.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">{kpi.label}</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{kpi.value ?? '—'}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mt-2 relative z-10 overflow-hidden">
              <div className={`h-full rounded-full ${kpi.color} w-3/4 opacity-80`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Appointment Status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Appointment Status</h3>
            <button className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>
          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {charts?.appointment_status?.labels?.map((label, i) => {
              const max = Math.max(...charts.appointment_status.values);
              const val = charts.appointment_status.values[i];
              const percent = (val / (max || 1)) * 100;
              return (
                <div key={label} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-slate-300 font-medium">{label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{val}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${percent}%`, backgroundColor: charts.appointment_status.colors[i] }}
                    >
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Revenue Trend (7 Days)</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-100 dark:border-slate-700 pb-2">
            {charts?.revenue_trend?.dates?.map((date, i) => {
              const max = Math.max(...charts.revenue_trend.revenue);
              const val = charts.revenue_trend.revenue[i];
              const height = (val / (max || 1)) * 100;
              return (
                <div key={date} className="w-full flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-slate-700 text-white text-xs font-bold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                    ${val.toLocaleString()}
                  </div>
                  <div 
                    className="w-full max-w-[40px] bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 shadow-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 mt-3 uppercase tracking-wider">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
