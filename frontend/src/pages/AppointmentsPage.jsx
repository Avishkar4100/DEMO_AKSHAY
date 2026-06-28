import { useState, useEffect } from 'react';
import { validators, validateField } from '../utils/validation';
import { Modal } from '../components/ValidatedInput';

const DOCTORS = ['Dr. Smith', 'Dr. Patel', 'Dr. Garcia', 'Dr. Lee'];
const APPT_TYPES = ['Consultation', 'Follow-up', 'Surgery', 'Check-up', 'Emergency'];
const PATIENTS_LIST = ['Alice Johnson', 'Bob Williams', 'Carol Davis', 'David Brown', 'Eve Martin'];

const STATUS_COLORS = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'Alice Johnson', doctor: 'Dr. Smith', date: '2026-06-27', time: '09:00', type: 'Consultation', status: 'Scheduled' },
    { id: 2, patient: 'Bob Williams', doctor: 'Dr. Patel', date: '2026-06-27', time: '10:30', type: 'Follow-up', status: 'Completed' },
    { id: 3, patient: 'Carol Davis', doctor: 'Dr. Smith', date: '2026-06-27', time: '11:00', type: 'Surgery', status: 'Scheduled' },
    { id: 4, patient: 'David Brown', doctor: 'Dr. Patel', date: '2026-06-28', time: '14:00', type: 'Consultation', status: 'Pending' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', time: '', type: '', status: 'Scheduled' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setFieldErrors({
      patient: touched.patient ? validateField(form.patient, [validators.required], 'Patient') : null,
      doctor: touched.doctor ? validateField(form.doctor, [validators.required], 'Doctor') : null,
      date: touched.date ? validateField(form.date, [validators.required], 'Date') : null,
      time: touched.time ? validateField(form.time, [validators.required], 'Time') : null,
      type: touched.type ? validateField(form.type, [validators.required], 'Type') : null,
    });
  }, [form, touched]);

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const resetForm = () => {
    setForm({ patient: '', doctor: '', date: '', time: '', type: '', status: 'Scheduled' });
    setFieldErrors({}); setTouched({}); setSaved(false);
  };

  const inputClass = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && form[field];
    return `
      w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200 appearance-none
      ${hasError ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
        : isValid ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
      focus:ring-2 pr-10
    `;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTouched({ patient: true, doctor: true, date: true, time: true, type: true });
    const errs = {
      patient: validateField(form.patient, [validators.required], 'Patient'),
      doctor: validateField(form.doctor, [validators.required], 'Doctor'),
      date: validateField(form.date, [validators.required], 'Date'),
      time: validateField(form.time, [validators.required], 'Time'),
      type: validateField(form.type, [validators.required], 'Type'),
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const newAppt = { id: appointments.length + 1, ...form, status: form.status };
    setAppointments((prev) => [...prev, newAppt]);
    setSaved(true);
    setTimeout(() => { setShowModal(false); resetForm(); }, 800);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 items-center justify-center shadow-sm shrink-0">
            <i className="fas fa-calendar-check text-white text-lg"></i>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 text-xs md:text-sm">Schedule and manage appointments</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
        >
          <i className="fas fa-plus mr-1.5"></i> New Appointment
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2 animate-fade-in">
          <i className="fas fa-check-circle"></i> Appointment created successfully!
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm tablet-responsive-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-user text-indigo-400 mr-1.5"></i>Patient</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-user-md text-indigo-400 mr-1.5"></i>Doctor</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-calendar text-indigo-400 mr-1.5"></i>Date</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-clock text-indigo-400 mr-1.5"></i>Time</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap tablet-hide-col"><i className="fas fa-tag text-indigo-400 mr-1.5"></i>Type</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status</th>
                <th className="text-right px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-cog text-indigo-400 mr-1.5"></i>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-3 font-medium">{a.patient}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600">{a.doctor}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600 whitespace-nowrap">{a.date}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600">{a.time}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600 tablet-hide-col">{a.type}</td>
                  <td className="px-3 md:px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      <i className={`fas fa-circle text-[6px] ${
                        a.status === 'Scheduled' ? 'text-blue-500' :
                        a.status === 'Completed' ? 'text-green-500' :
                        a.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                      }`}></i>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium whitespace-nowrap">
                      <i className="fas fa-edit mr-1"></i>Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Schedule New Appointment">
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-user text-indigo-400 mr-1.5"></i>Patient <span className="text-red-500">*</span>
            </label>
            <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}
              onBlur={() => handleBlur('patient')} className={inputClass('patient')} required>
              <option value="">Select patient</option>
              {PATIENTS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {touched.patient && fieldErrors.patient && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.patient}</p>}
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-user-md text-indigo-400 mr-1.5"></i>Doctor <span className="text-red-500">*</span>
            </label>
            <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              onBlur={() => handleBlur('doctor')} className={inputClass('doctor')} required>
              <option value="">Select doctor</option>
              {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {touched.doctor && fieldErrors.doctor && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.doctor}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <i className="fas fa-calendar text-indigo-400 mr-1.5"></i>Date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                onBlur={() => handleBlur('date')} className={inputClass('date')} required />
              {touched.date && fieldErrors.date && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <i className="fas fa-clock text-indigo-400 mr-1.5"></i>Time <span className="text-red-500">*</span>
              </label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                onBlur={() => handleBlur('time')} className={inputClass('time')} required />
              {touched.time && fieldErrors.time && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.time}</p>}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-tag text-indigo-400 mr-1.5"></i>Appointment Type <span className="text-red-500">*</span>
            </label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              onBlur={() => handleBlur('type')} className={inputClass('type')} required>
              <option value="">Select type</option>
              {APPT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {touched.type && fieldErrors.type && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.type}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status
            </label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
              <option value="Scheduled">Scheduled</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              <i className="fas fa-calendar-plus mr-1.5"></i> Create Appointment
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
