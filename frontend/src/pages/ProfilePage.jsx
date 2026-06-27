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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Username', value: user.username },
            { label: 'Email', value: user.email },
            { label: 'Role', value: user.role },
            { label: 'Department', value: user.department },
            { label: 'Member Since', value: user.joined },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
