import { useState } from 'react';

export default function BillingPage() {
  const [bills] = useState([
    { id: 'INV-001', patient: 'Alice Johnson', amount: 250.00, date: '2026-06-27', method: 'Cash', status: 'Paid' },
    { id: 'INV-002', patient: 'Bob Williams', amount: 1500.00, date: '2026-06-26', method: 'Insurance', status: 'Pending' },
    { id: 'INV-003', patient: 'Carol Davis', amount: 750.00, date: '2026-06-25', method: 'Card', status: 'Paid' },
    { id: 'INV-004', patient: 'David Brown', amount: 3200.00, date: '2026-06-24', method: 'Insurance', status: 'Overdue' },
  ]);

  const statusColors = {
    Paid: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-700',
  };

  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage patient invoices and revenue tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-90 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap">
            + Generate Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pending Payments</p>
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Invoices</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{bills.length}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="px-6 py-4 font-semibold">Invoice</th>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{b.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{b.patient}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">${b.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">{b.date}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{b.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold hover:underline">View</button>
                    <button className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 font-semibold hover:underline">Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
