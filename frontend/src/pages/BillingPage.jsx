import { useState } from 'react';
import { Button, Modal, FormField, FormSelect } from '../components';
import { validators } from '../utils/validation';

const INITIAL = [
  { id: 'INV-001', patient: 'Alice Johnson', amount: 250.00, date: '2026-06-27', method: 'Cash', status: 'Paid', items: 'Consultation fee' },
  { id: 'INV-002', patient: 'Bob Williams', amount: 1500.00, date: '2026-06-26', method: 'Insurance', status: 'Pending', items: 'MRI Scan + Report' },
  { id: 'INV-003', patient: 'Carol Davis', amount: 750.00, date: '2026-06-25', method: 'Card', status: 'Paid', items: 'Blood tests + Checkup' },
  { id: 'INV-004', patient: 'David Brown', amount: 3200.00, date: '2026-06-24', method: 'Insurance', status: 'Overdue', items: 'Surgery + Medication' },
  { id: 'INV-005', patient: 'Emma Wilson', amount: 180.00, date: '2026-06-28', method: 'Cash', status: 'Paid', items: 'General Checkup' },
  { id: 'INV-006', patient: 'Alice Johnson', amount: 450.00, date: '2026-06-23', method: 'Card', status: 'Pending', items: 'Lab Tests' },
];

const statusColors = {
  Paid: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  Pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Overdue: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
};

export default function BillingPage() {
  const [bills, setBills] = useState(INITIAL);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [newBill, setNewBill] = useState({ patient: '', amount: '', method: 'Cash', items: '' });

  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);
  const overdueAmount = bills.filter(b => b.status === 'Overdue').reduce((s, b) => s + b.amount, 0);

  const handleCreate = () => {
    if (!newBill.patient || !newBill.amount) return;
    const invNum = `INV-${String(bills.length + 1).padStart(3, '0')}`;
    setBills([...bills, {
      id: invNum, patient: newBill.patient, amount: parseFloat(newBill.amount),
      date: new Date().toISOString().split('T')[0], method: newBill.method,
      status: 'Pending', items: newBill.items || '—',
    }]);
    setNewBill({ patient: '', amount: '', method: 'Cash', items: '' });
    setShowNewModal(false);
  };

  const handleMarkPaid = (id) => {
    setBills(bills.map(b => b.id === id ? { ...b, status: 'Paid', method: b.method } : b));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{bills.filter(b => b.status === 'Paid').length} paid invoices</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pending</p>
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">${pendingAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{bills.filter(b => b.status === 'Pending').length} pending</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Overdue</p>
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">${overdueAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{bills.filter(b => b.status === 'Overdue').length} overdue</p>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">{bills.length} total invoices</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="px-4 md:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-90 shadow-lg shadow-emerald-200/40 dark:shadow-emerald-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap touch-target">
          + Generate Invoice
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="table-responsive-wrap">
          <table className="w-full text-xs md:text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Invoice</th>
                <th className="hide-tablet px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Patient</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Amount</th>
                <th className="hide-mobile px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Items</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="font-mono font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs">{b.id}</span>
                  </td>
                  <td className="hide-tablet px-4 md:px-6 py-3 md:py-4">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-xs md:text-sm truncate max-w-[120px]">{b.patient}</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 dark:text-white text-xs md:text-sm">${b.amount.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500">{b.date}</div>
                  </td>
                  <td className="hide-mobile px-4 md:px-6 py-3 md:py-4 text-gray-600 dark:text-slate-300 text-xs md:text-sm truncate max-w-[150px]">{b.items}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${statusColors[b.status] || 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 md:gap-2">
                      <button onClick={() => setShowDetailModal(b)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold hover:underline text-xs md:text-sm touch-target touch-pad">View</button>
                      {b.status !== 'Paid' && (
                        <button onClick={() => handleMarkPaid(b.id)}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold hover:underline text-xs md:text-sm touch-target touch-pad">Pay</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">No invoices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Generate New Invoice" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Patient Name" icon="fa-user" placeholder="Full name" required
            value={newBill.patient} onChange={(v) => setNewBill({...newBill, patient: v})}
            rules={[validators.required]} />
          <FormField label="Amount ($)" icon="fa-dollar-sign" type="number" placeholder="0.00" required
            value={newBill.amount} onChange={(v) => setNewBill({...newBill, amount: v})}
            rules={[validators.required]} />
          <FormSelect label="Payment Method" icon="fa-credit-card"
            value={newBill.method} onChange={(v) => setNewBill({...newBill, method: v})}
            options={['Cash', 'Card', 'Insurance', 'Bank Transfer', 'Online']} />
          <FormField label="Description / Items" icon="fa-receipt" placeholder="Services rendered"
            value={newBill.items} onChange={(v) => setNewBill({...newBill, items: v})} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button onClick={() => setShowNewModal(false)}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-90 shadow-lg text-sm font-semibold transition-all hover:-translate-y-0.5">Generate Invoice</button>
        </div>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal isOpen={!!showDetailModal} onClose={() => setShowDetailModal(null)} title="Invoice Details" size="md">
        {showDetailModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700">
              <div>
                <span className="font-mono text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{showDetailModal.id}</span>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Issued: {showDetailModal.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[showDetailModal.status]}`}>{showDetailModal.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Patient', value: showDetailModal.patient },
                { label: 'Amount', value: `$${showDetailModal.amount.toFixed(2)}` },
                { label: 'Method', value: showDetailModal.method },
                { label: 'Items', value: showDetailModal.items },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            {showDetailModal.status !== 'Paid' && (
              <div className="pt-3">
                <button onClick={() => { handleMarkPaid(showDetailModal.id); setShowDetailModal(null); }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-90 shadow-lg text-sm font-semibold transition-all">
                  Mark as Paid
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
