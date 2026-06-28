import { useState } from 'react';
import { Button, Modal, FormField, FormSelect } from '../components';
import { validators } from '../utils/validation';

const INITIAL = [
  { id: 1, patient: 'Alice Johnson', doctor: 'Dr. Smith', date: '2026-06-27', time: '09:00', type: 'Consultation', dept: 'Cardiology', status: 'Scheduled' },
  { id: 2, patient: 'Bob Williams', doctor: 'Dr. Patel', date: '2026-06-27', time: '10:30', type: 'Follow-up', dept: 'Neurology', status: 'Completed' },
  { id: 3, patient: 'Carol Davis', doctor: 'Dr. Smith', date: '2026-06-27', time: '11:00', type: 'Surgery', dept: 'Cardiology', status: 'Scheduled' },
  { id: 4, patient: 'David Brown', doctor: 'Dr. Patel', date: '2026-06-28', time: '14:00', type: 'Consultation', dept: 'Neurology', status: 'Pending' },
  { id: 5, patient: 'Emma Wilson', doctor: 'Dr. Smith', date: '2026-06-28', time: '15:30', type: 'Check-up', dept: 'General', status: 'Scheduled' },
  { id: 6, patient: 'Alice Johnson', doctor: 'Dr. Chen', date: '2026-06-29', time: '10:00', type: 'Lab Test', dept: 'Pathology', status: 'Scheduled' },
];

const statusColors = {
  Scheduled: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  Pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(INITIAL);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newApt, setNewApt] = useState({ patient: '', doctor: 'Dr. Smith', date: '', time: '', type: 'Consultation', dept: 'Cardiology' });
  const [nextId, setNextId] = useState(7);

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'Scheduled').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    pending: appointments.filter(a => a.status === 'Pending').length,
  };

  const handleCreate = () => {
    if (!newApt.patient || !newApt.date || !newApt.time) return;
    setAppointments([...appointments, { id: nextId, ...newApt, status: 'Scheduled' }]);
    setNextId(nextId + 1);
    setNewApt({ patient: '', doctor: 'Dr. Smith', date: '', time: '', type: 'Consultation', dept: 'Cardiology' });
    setShowNewModal(false);
  };

  const handleCancel = (id) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
  };

  const handleReschedule = (id) => {
    const a = appointments.find(a => a.id === id);
    if (a) {
      const newDate = prompt('Enter new date (YYYY-MM-DD):', a.date);
      const newTime = prompt('Enter new time (HH:MM):', a.time);
      if (newDate && newTime) {
        setAppointments(appointments.map(apt => apt.id === id ? { ...apt, date: newDate, time: newTime, status: 'Scheduled' } : apt));
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-indigo-500', shadow: 'shadow-indigo-200' },
          { label: 'Scheduled', value: stats.scheduled, color: 'bg-blue-500', shadow: 'shadow-blue-200' },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-500', shadow: 'shadow-amber-200' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 md:p-5 text-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 ${s.color} bg-clip-text text-transparent bg-gradient-to-r`}
               style={{backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">Schedule and manage hospital appointments</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="px-4 md:px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg shadow-indigo-200/40 dark:shadow-indigo-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap touch-target">
          + New Appointment
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="table-responsive-wrap">
          <table className="w-full text-xs md:text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Patient</th>
                <th className="hide-tablet px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Doctor</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Date & Time</th>
                <th className="hide-mobile px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Type</th>
                <th className="hide-tablet px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Dept</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{a.patient}</div>
                  </td>
                  <td className="hide-tablet px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {a.doctor.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <span className="text-gray-700 dark:text-slate-300 font-medium text-xs md:text-sm">{a.doctor}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white font-medium text-xs md:text-sm">{a.date}</div>
                    <div className="text-gray-500 dark:text-slate-400 text-[10px] md:text-xs">{a.time}</div>
                  </td>
                  <td className="hide-mobile px-4 md:px-6 py-3 md:py-4 text-gray-600 dark:text-slate-300 text-xs md:text-sm">{a.type}</td>
                  <td className="hide-tablet px-4 md:px-6 py-3 md:py-4 text-gray-500 dark:text-slate-400 text-xs md:text-sm">{a.dept}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${statusColors[a.status] || 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                        <>
                          <button onClick={() => handleReschedule(a.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs md:text-sm font-semibold hover:underline whitespace-nowrap touch-target touch-pad">
                            Reschedule
                          </button>
                          <button onClick={() => handleCancel(a.id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs md:text-sm font-semibold hover:underline whitespace-nowrap touch-target touch-pad">
                            Cancel
                          </button>
                        </>
                      )}
                      {a.status === 'Completed' && (
                        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold">Done</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">No appointments</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Schedule New Appointment" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Patient Name" icon="fa-user" placeholder="Full name" required
            value={newApt.patient} onChange={(v) => setNewApt({...newApt, patient: v})}
            rules={[validators.required]} />
          <FormSelect label="Doctor" icon="fa-user-md"
            value={newApt.doctor} onChange={(v) => setNewApt({...newApt, doctor: v})}
            options={['Dr. Smith', 'Dr. Patel', 'Dr. Chen', 'Dr. Williams']} />
          <FormField label="Date" icon="fa-calendar" type="date" required
            value={newApt.date} onChange={(v) => setNewApt({...newApt, date: v})}
            rules={[validators.required]} />
          <FormField label="Time" icon="fa-clock" type="time" required
            value={newApt.time} onChange={(v) => setNewApt({...newApt, time: v})}
            rules={[validators.required]} />
          <FormSelect label="Type" icon="fa-stethoscope"
            value={newApt.type} onChange={(v) => setNewApt({...newApt, type: v})}
            options={['Consultation', 'Follow-up', 'Check-up', 'Surgery', 'Lab Test']} />
          <FormSelect label="Department" icon="fa-building"
            value={newApt.dept} onChange={(v) => setNewApt({...newApt, dept: v})}
            options={['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General', 'Pathology']} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button onClick={() => setShowNewModal(false)}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg text-sm font-semibold transition-all hover:-translate-y-0.5">Schedule Appointment</button>
        </div>
      </Modal>
    </div>
  );
}
