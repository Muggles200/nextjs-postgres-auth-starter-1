import { auth, signOut } from 'app/auth';
import Link from 'next/link';
import { Users, Settings, BarChart2, LogOut } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();

  const cards = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      href: '/protected/admin/users',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      href: '/protected/admin/settings',
      icon: Settings,
      color: 'green',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View system analytics and usage statistics',
      href: '/protected/admin/analytics',
      icon: BarChart2,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {session?.user?.email}</h1>
        <p className="text-green-600 mt-2">Role: Administrator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className={`p-3 rounded-full bg-${card.color}-50 w-fit mb-4`}>
              <card.icon className={`h-6 w-6 text-${card.color}-600`} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
            <p className="text-gray-600 mt-2">{card.description}</p>
            <div className="mt-4 inline-flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
              View details
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
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
      className="flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <LogOut className="h-5 w-5 text-gray-600" />
        <span className="text-gray-700">Ready to sign out?</span>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Sign out
      </button>
    </form>
  );
} 