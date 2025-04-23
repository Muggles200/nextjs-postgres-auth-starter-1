import { auth } from 'app/auth';
import Link from 'next/link';
import { User } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-sm fixed top-0 left-0 h-screen">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
              <p className="text-sm text-gray-600 truncate max-w-[180px]">{session?.user?.email}</p>
              <p className="text-xs text-green-600">Administrator</p>
            </div>
          </div>
        </div>
        <nav className="mt-4">
          <ul className="space-y-1">
            {[
              { href: '/protected/admin', label: 'Overview' },
              { href: '/protected/admin/users', label: 'User Management' },
              { href: '/protected/admin/settings', label: 'System Settings' },
              { href: '/protected/admin/analytics', label: 'Analytics Dashboard' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
} 