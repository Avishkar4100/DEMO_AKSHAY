import { useState } from 'react';
import { FormField, FormSelect, Button, Modal } from '../components';
import { validators } from '../utils/validation';

const INITIAL_PATIENTS = [
  { id: 1, name: 'Alice Johnson', age: 34, gender: 'Female', contact: '+1 555-0101', email: 'alice.j@email.com', blood: 'A+', status: 'Active', avatar: '👩', address: '123 Oak St, NY' },
  { id: 2, name: 'Bob Williams', age: 45, gender: 'Male', contact: '+1 555-0102', email: 'bob.w@email.com', blood: 'O+', status: 'Active', avatar: '👨', address: '456 Pine Rd, NY' },
  { id: 3, name: 'Carol Davis', age: 28, gender: 'Female', contact: '+1 555-0103', email: 'carol.d@email.com', blood: 'B-', status: 'Inactive', avatar: '👱‍♀️', address: '789 Elm Ave, NY' },
  { id: 4, name: 'David Brown', age: 52, gender: 'Male', contact: '+1 555-0104', email: 'david.b@email.com', blood: 'AB+', status: 'Active', avatar: '👴', address: '321 Maple Dr, NY' },
  { id: 5, name: 'Emma Wilson', age: 38, gender: 'Female', contact: '+1 555-0105', email: 'emma.w@email.com', blood: 'O-', status: 'Active', avatar: '👩‍🦰', address: '654 Birch Ln, NY' },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male', contact: '', email: '', blood: 'A+', address: '' });
  const [nextId, setNextId] = useState(6);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search)
  );

  const handleCreatePatient = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.contact) return;
    setPatients([...patients, {
      id: nextId,
      ...newPatient,
      age: parseInt(newPatient.age),
      status: 'Active',
      avatar: ['👨','👩','👩‍🦰','👴','👱‍♀️','👨‍🦱','👩‍🦱'][Math.floor(Math.random() * 7)],
    }]);
    setNextId(nextId + 1);
    setNewPatient({ name: '', age: '', gender: 'Male', contact: '', email: '', blood: 'A+', address: '' });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Patients Directory</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">{patients.length} total patients</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..." className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-56 transition-all" />
          </div>
          <button onClick={() => setShowNewModal(true)}
            className="px-4 md:px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg shadow-indigo-200/40 dark:shadow-indigo-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap touch-target">
            + New Patient
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="table-responsive-wrap">
          <table className="w-full text-xs md:text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Patient</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Age</th>
                <th className="hide-tablet px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Blood</th>
                <th className="hide-mobile px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Contact</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm md:text-lg shadow-sm border border-gray-200 dark:border-slate-600 flex-shrink-0">
                        {p.avatar}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 dark:text-slate-300 font-medium">{p.age}</td>
                  <td className="hide-tablet px-4 md:px-6 py-3 md:py-4 text-gray-600 dark:text-slate-300">{p.blood}</td>
                  <td className="hide-mobile px-4 md:px-6 py-3 md:py-4 text-gray-600 dark:text-slate-300 text-xs">{p.contact}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${
                      p.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                    }`}>
                      {p.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <button onClick={() => setShowDetailModal(p)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs md:text-sm font-semibold hover:underline whitespace-nowrap touch-target touch-pad">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Register New Patient" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Full Name" icon="fa-user" placeholder="John Doe" required
            value={newPatient.name} onChange={(v) => setNewPatient({...newPatient, name: v})}
            rules={[validators.required]} />
          <FormField label="Age" icon="fa-calendar" type="number" placeholder="34"
            value={newPatient.age} onChange={(v) => setNewPatient({...newPatient, age: v})}
            rules={[validators.required]} />
          <FormSelect label="Gender" icon="fa-venus-mars"
            value={newPatient.gender} onChange={(v) => setNewPatient({...newPatient, gender: v})}
            options={['Male', 'Female', 'Other']} />
          <FormSelect label="Blood Group" icon="fa-tint"
            value={newPatient.blood} onChange={(v) => setNewPatient({...newPatient, blood: v})}
            options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
          <FormField label="Phone" icon="fa-phone" placeholder="+1 555-0000" required
            value={newPatient.contact} onChange={(v) => setNewPatient({...newPatient, contact: v})}
            rules={[validators.required]} />
          <FormField label="Email" icon="fa-envelope" type="email" placeholder="patient@email.com"
            value={newPatient.email} onChange={(v) => setNewPatient({...newPatient, email: v})} />
          <div className="md:col-span-2">
            <FormField label="Address" icon="fa-map-marker-alt" placeholder="Street, City, State"
              value={newPatient.address} onChange={(v) => setNewPatient({...newPatient, address: v})} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button onClick={() => setShowNewModal(false)}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleCreatePatient}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 shadow-lg text-sm font-semibold transition-all hover:-translate-y-0.5">Create Patient</button>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={!!showDetailModal} onClose={() => setShowDetailModal(null)} title="Patient Details" size="lg">
        {showDetailModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-3xl shadow-md border border-indigo-200 dark:border-indigo-700">
                {showDetailModal.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{showDetailModal.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Patient ID: #{showDetailModal.id}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                showDetailModal.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
              }`}>{showDetailModal.status}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Age', value: `${showDetailModal.age} years` },
                { label: 'Gender', value: showDetailModal.gender },
                { label: 'Blood Group', value: showDetailModal.blood },
                { label: 'Email', value: showDetailModal.email || '—' },
                { label: 'Phone', value: showDetailModal.contact },
                { label: 'Address', value: showDetailModal.address || '—' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
