import { useState } from 'react';

export default function BillingPage() {
  const [bills] = useState([
    { id: 'INV-001', patient: 'Alice Johnson', amount: 250.00, date: '2026-06-27', method: 'Cash', status: 'Paid' },
    { id: 'INV-002', patient: 'Bob Williams', amount: 1500.00, date: '2026-06-26', method: 'Insurance', status: 'Pending' },
    { id: 'INV-003', patient: 'Carol Davis', amount: 750.00, date: '2026-06-25', method: 'Card', status: 'Paid' },
    { id: 'INV-004', patient: 'David Brown', amount: 3200.00, date: '2026-06-24', method: 'Insurance', status: 'Overdue' },
  ]);

  const statusColors = {
    Paid: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-700',
  };

  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <i className="fas fa-file-invoice-dollar text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
            <p className="text-gray-500 text-sm">Invoices and payment tracking</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm">
          <i className="fas fa-plus mr-1.5"></i> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-dollar-sign text-green-500"></i>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-hourglass-half text-amber-500"></i>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-receipt text-indigo-500"></i>
            <p className="text-sm text-gray-500">Total Invoices</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-hashtag text-indigo-400 mr-1.5"></i>Invoice</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-user text-indigo-400 mr-1.5"></i>Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-dollar-sign text-indigo-400 mr-1.5"></i>Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-calendar text-indigo-400 mr-1.5"></i>Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-credit-card text-indigo-400 mr-1.5"></i>Payment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600"><i className="fas fa-cog text-indigo-400 mr-1.5"></i>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.id}</td>
                  <td className="px-4 py-3 text-gray-600">{b.patient}</td>
                  <td className="px-4 py-3 font-medium">${b.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">{b.date}</td>
                  <td className="px-4 py-3 text-gray-600">{b.method}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                      <i className={`fas fa-circle text-[6px] ${
                        b.status === 'Paid' ? 'text-green-500' :
                        b.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                      }`}></i>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      <i className="fas fa-eye mr-1"></i>View
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      <i className="fas fa-print mr-1"></i>Print
                    </button>
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
