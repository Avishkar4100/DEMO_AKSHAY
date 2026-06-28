import { useState } from 'react';

export default function AppointmentsPage() {
  const [appointments] = useState([
    { id: 1, patient: 'Alice Johnson', doctor: 'Dr. Smith', date: '2026-06-27', time: '09:00', type: 'Consultation', status: 'Scheduled' },
    { id: 2, patient: 'Bob Williams', doctor: 'Dr. Patel', date: '2026-06-27', time: '10:30', type: 'Follow-up', status: 'Completed' },
    { id: 3, patient: 'Carol Davis', doctor: 'Dr. Smith', date: '2026-06-27', time: '11:00', type: 'Surgery', status: 'Scheduled' },
    { id: 4, patient: 'David Brown', doctor: 'Dr. Patel', date: '2026-06-28', time: '14:00', type: 'Consultation', status: 'Pending' },
  ]);

  const statusColors = {
    Scheduled: 'bg-blue-100 text-blue-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Schedule and manage hospital appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap">
            + New Appointment
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
                <th className="px-6 py-4 font-semibold">Doctor</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.patient}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                        {a.doctor.split(' ')[1][0]}
                      </div>
                      <span className="text-gray-700 dark:text-slate-300 font-medium">{a.doctor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-white font-medium">{a.date}</div>
                    <div className="text-gray-500 dark:text-slate-400 text-xs">{a.time}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{a.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[a.status] || 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-semibold hover:underline">
                      Reschedule
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
