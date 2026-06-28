import { useState } from 'react';

export default function PatientsPage() {
  const [patients] = useState([
    { id: 1, name: 'Alice Johnson', age: 34, gender: 'F', contact: '+1 555-0101', status: 'Active', avatar: '👩' },
    { id: 2, name: 'Bob Williams', age: 45, gender: 'M', contact: '+1 555-0102', status: 'Active', avatar: '👨' },
    { id: 3, name: 'Carol Davis', age: 28, gender: 'F', contact: '+1 555-0103', status: 'Inactive', avatar: '👱‍♀️' },
    { id: 4, name: 'David Brown', age: 52, gender: 'M', contact: '+1 555-0104', status: 'Active', avatar: '👴' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Patients Directory</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage and view patient medical records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 transition-all" />
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap">
            + New Patient
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Age</th>
                <th className="px-6 py-4 font-semibold">Gender</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-lg shadow-sm border border-gray-200 dark:border-slate-600">
                        {p.avatar}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">{p.age}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{p.gender}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{p.contact}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                    }`}>
                      {p.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-semibold hover:underline">
                      View Details
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
