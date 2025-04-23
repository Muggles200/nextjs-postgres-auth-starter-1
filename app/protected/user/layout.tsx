import { auth } from 'app/auth';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">User Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">{session?.user?.email}</p>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <a
                href="/protected/user"
                className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Overview
              </a>
            </li>
            <li>
              <a
                href="/protected/user/profile"
                className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Profile Management
              </a>
            </li>
            <li>
              <a
                href="/protected/user/settings"
                className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Personal Settings
              </a>
            </li>
            <li>
              <a
                href="/protected/user/activity"
                className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Activity History
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
} 