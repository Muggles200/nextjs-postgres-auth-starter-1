import { auth, signOut } from 'app/auth';

export default async function UserDashboard() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {session?.user?.email}</h1>
        <p className="text-green-600 mt-2">Role: {session?.user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Management Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800">Profile Management</h2>
          <p className="text-gray-600 mt-2">Update your personal information and preferences</p>
          <a
            href="/protected/user/profile"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Manage Profile
          </a>
        </div>

        {/* Personal Settings Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800">Personal Settings</h2>
          <p className="text-gray-600 mt-2">Configure your account settings and preferences</p>
          <a
            href="/protected/user/settings"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View Settings
          </a>
        </div>

        {/* Activity History Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800">Activity History</h2>
          <p className="text-gray-600 mt-2">View your recent activities and history</p>
          <a
            href="/protected/user/activity"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View Activity
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <SignOut />
      </div>
    </div>
  );
}

function SignOut() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <button 
        type="submit"
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Sign out
      </button>
    </form>
  );
} 