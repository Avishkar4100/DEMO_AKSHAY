export default function ProfilePage() {
  const user = {
    name: 'System Administrator',
    email: 'admin@hms.local',
    role: 'admin',
    username: 'admin',
    department: 'IT Administration',
    joined: 'Jan 2026',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage your account information and preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,.2)] border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Cover & Avatar Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="responsive-px pb-6 md:pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 md:gap-6 -mt-12 sm:-mt-16 mb-6 md:mb-8">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 flex-shrink-0 relative">
                <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-4xl shadow-inner border border-indigo-100 dark:border-indigo-700">
                  👨‍💻
                </div>
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{user.name}</h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium capitalize mt-0.5">{user.role}</p>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl hover:opacity-90 shadow-lg shadow-gray-200 dark:shadow-indigo-900/40 text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap mb-2">
              Edit Profile
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">Personal Information</h3>
              <div className="space-y-4">
                {[
                  { label: 'Username', value: user.username, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { label: 'Email Address', value: user.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { label: 'Phone Number', value: '+1 (555) 000-0000', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-0.5 text-gray-400 dark:text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{item.label}</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">Employment Details</h3>
              <div className="space-y-4">
                {[
                  { label: 'Department', value: user.department, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                  { label: 'Role Level', value: 'Senior Administration', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
                  { label: 'Member Since', value: user.joined, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-0.5 text-gray-400 dark:text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{item.label}</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
