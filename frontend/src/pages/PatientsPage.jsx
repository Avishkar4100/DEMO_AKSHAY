import { useState, useEffect } from 'react';

export default function PatientsPage() {
  const [patients] = useState([
    { id: 1, name: 'Alice Johnson', age: 34, gender: 'F', contact: '+1 555-0101', status: 'Active' },
    { id: 2, name: 'Bob Williams', age: 45, gender: 'M', contact: '+1 555-0102', status: 'Active' },
    { id: 3, name: 'Carol Davis', age: 28, gender: 'F', contact: '+1 555-0103', status: 'Inactive' },
    { id: 4, name: 'David Brown', age: 52, gender: 'M', contact: '+1 555-0104', status: 'Active' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <i className="fas fa-users text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500 text-sm">Manage patient records</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm">
          <i className="fas fa-plus mr-1.5"></i> Add Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-user text-indigo-400 mr-1.5"></i>Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-cake-candles text-indigo-400 mr-1.5"></i>Age</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-venus-mars text-indigo-400 mr-1.5"></i>Gender</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-phone text-indigo-400 mr-1.5"></i>Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"><i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600"><i className="fas fa-cog text-indigo-400 mr-1.5"></i>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.age}</td>
                  <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{p.contact}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <i className={`fas fa-circle text-[6px] ${p.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}></i>
                      {p.status}
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
