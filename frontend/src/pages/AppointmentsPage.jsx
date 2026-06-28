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
    Completed: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <i className="fas fa-calendar-check text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 text-sm">Schedule and manage appointments</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm">
          <i className="fas fa-plus mr-1.5"></i> New Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-user text-indigo-400 mr-1.5"></i>Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-user-md text-indigo-400 mr-1.5"></i>Doctor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-calendar text-indigo-400 mr-1.5"></i>Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-clock text-indigo-400 mr-1.5"></i>Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-tag text-indigo-400 mr-1.5"></i>Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600"><i className="fas fa-cog text-indigo-400 mr-1.5"></i>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.patient}</td>
                  <td className="px-4 py-3 text-gray-600">{a.doctor}</td>
                  <td className="px-4 py-3 text-gray-600">{a.date}</td>
                  <td className="px-4 py-3 text-gray-600">{a.time}</td>
                  <td className="px-4 py-3 text-gray-600">{a.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      <i className={`fas fa-circle text-[6px] ${
                        a.status === 'Scheduled' ? 'text-blue-500' :
                        a.status === 'Completed' ? 'text-green-500' :
                        a.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                      }`}></i>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      <i className="fas fa-edit mr-1"></i>Edit
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
