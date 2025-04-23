// Mock analytics data - replace with actual data fetching
const mockAnalytics = {
  totalUsers: 1234,
  activeUsers: 789,
  newUsers: 45,
  totalSessions: 5678,
  averageSessionDuration: '12m 34s',
  bounceRate: '32.5%',
};

const mockChartData = {
  dailyUsers: [
    { date: '2024-04-16', users: 120 },
    { date: '2024-04-17', users: 145 },
    { date: '2024-04-18', users: 98 },
    { date: '2024-04-19', users: 167 },
    { date: '2024-04-20', users: 134 },
    { date: '2024-04-21', users: 156 },
    { date: '2024-04-22', users: 189 },
  ],
  userRoles: [
    { role: 'Admin', count: 12 },
    { role: 'User', count: 1222 },
  ],
};

export default async function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAnalytics.totalUsers}</p>
          <p className="mt-1 text-sm text-green-600">+{mockAnalytics.newUsers} new users this week</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAnalytics.activeUsers}</p>
          <p className="mt-1 text-sm text-gray-500">Currently online</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAnalytics.totalSessions}</p>
          <p className="mt-1 text-sm text-gray-500">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg. Session Duration</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAnalytics.averageSessionDuration}</p>
          <p className="mt-1 text-sm text-gray-500">Bounce rate: {mockAnalytics.bounceRate}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Users Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Active Users</h2>
          <div className="h-64 flex items-end space-x-2">
            {mockChartData.dailyUsers.map((day) => (
              <div key={day.date} className="flex-1">
                <div
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${(day.users / 200) * 100}%` }}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Roles Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-64 h-64 relative">
              {mockChartData.userRoles.map((role, index) => {
                const percentage = (role.count / mockAnalytics.totalUsers) * 100;
                const rotation = index === 0 ? 0 : (mockChartData.userRoles[0].count / mockAnalytics.totalUsers) * 360;
                return (
                  <div
                    key={role.role}
                    className="absolute inset-0"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.cos((rotation * Math.PI) / 180) * 50}% ${
                        50 + Math.sin((rotation * Math.PI) / 180) * 50
                      }%)`,
                      backgroundColor: index === 0 ? '#3B82F6' : '#10B981',
                    }}
                  />
                );
              })}
            </div>
            <div className="ml-8">
              {mockChartData.userRoles.map((role, index) => (
                <div key={role.role} className="flex items-center mb-2">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: index === 0 ? '#3B82F6' : '#10B981' }}
                  />
                  <span className="text-sm text-gray-700">
                    {role.role}: {((role.count / mockAnalytics.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {mockChartData.dailyUsers.slice().reverse().map((day) => (
            <div key={day.date} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {day.users} active users
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {day.users > 150 ? 'High' : day.users > 100 ? 'Medium' : 'Low'} activity
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 