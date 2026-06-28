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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
          <i className="fas fa-user-circle text-white text-lg"></i>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm">Your account information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <i className="fas fa-user text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
              <i className="fas fa-user-tag text-indigo-400"></i> {user.role}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Username', icon: 'fa-user', value: user.username },
            { label: 'Email', icon: 'fa-envelope', value: user.email },
            { label: 'Role', icon: 'fa-user-shield', value: user.role },
            { label: 'Department', icon: 'fa-building', value: user.department },
            { label: 'Member Since', icon: 'fa-calendar-alt', value: user.joined },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <i className={`fas ${item.icon} text-indigo-400 w-4 text-center`}></i>
                {item.label}
              </span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
