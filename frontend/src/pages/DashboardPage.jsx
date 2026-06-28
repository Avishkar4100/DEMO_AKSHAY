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
    { label: 'Total Patients', value: kpis?.total_patients, icon: 'fa-users', color: 'bg-blue-500' },
    { label: 'Active Patients', value: kpis?.active_patients, icon: 'fa-heart-pulse', color: 'bg-green-500' },
    { label: 'Appointments Today', value: kpis?.appointments_today, icon: 'fa-calendar-day', color: 'bg-amber-500' },
    { label: 'Monthly Revenue', value: kpis?.revenue_month ? `$${kpis.revenue_month.toLocaleString()}` : '$0', icon: 'fa-coins', color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-spinner fa-spin text-3xl text-indigo-500"></i>
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-enter">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <i className="fas fa-chart-line text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Healthcare Dashboard</h1>
            <p className="text-gray-500 text-sm">
              {status?.last_update
                ? `Last updated: ${new Date(status.last_update).toLocaleTimeString()}`
                : 'Real-time hospital metrics and analytics'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1"><i className="fas fa-calendar-alt mr-1 text-indigo-400"></i> From</label>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1"><i className="fas fa-calendar-alt mr-1 text-indigo-400"></i> To</label>
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1"><i className="fas fa-building mr-1 text-indigo-400"></i> Department</label>
          <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All</option>
            <option value="cardiology">Cardiology</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="neurology">Neurology</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <i className={`fas ${kpi.icon} text-2xl text-gray-700`}></i>
              <span className={`${kpi.color} text-white text-xs px-2 py-1 rounded-full`}>
                <i className="fas fa-circle text-[6px] mr-1 align-middle"></i> Live
              </span>
            </div>
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4"><i className="fas fa-chart-bar text-indigo-500 mr-2"></i> Appointment Status</h3>
          <div className="space-y-3">
            {charts?.appointment_status?.labels?.map((label, i) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium">{charts.appointment_status.values[i]}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(charts.appointment_status.values[i] / charts.appointment_status.values.reduce((a, b) => a + b, 0)) * 100}%`,
                      backgroundColor: charts.appointment_status.colors[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4"><i className="fas fa-chart-line text-green-500 mr-2"></i> Revenue Trend (7 Days)</h3>
          <div className="space-y-3">
            {charts?.revenue_trend?.dates?.map((date, i) => (
              <div key={date}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="font-medium">${charts.revenue_trend.revenue[i]}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${(charts.revenue_trend.revenue[i] / Math.max(...charts.revenue_trend.revenue)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4"><i className="fas fa-chart-pie text-purple-500 mr-2"></i> Patient Distribution</h3>
          <div className="space-y-3">
            {charts?.patient_distribution?.categories?.map((cat, i) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-medium">{charts.patient_distribution.counts[i]}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(charts.patient_distribution.counts[i] / Math.max(...charts.patient_distribution.counts)) * 100}%`,
                      backgroundColor: charts.patient_distribution.colors?.[i] || '#6366f1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4"><i className="fas fa-building text-amber-500 mr-2"></i> Department Metrics</h3>
          <div className="space-y-4">
            {charts?.department_metrics?.departments?.map((dept, i) => (
              <div key={dept}>
                <p className="text-sm font-medium text-gray-700 mb-2">{dept}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-600">Patients: {charts.department_metrics.patient_count[i]}</span>
                  <span className="text-purple-600">Appts: {charts.department_metrics.appointment_count[i]}</span>
                  <span className="text-green-600">${charts.department_metrics.revenue[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
