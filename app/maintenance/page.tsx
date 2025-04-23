import { auth } from 'app/auth';
import { redirect } from 'next/navigation';

export default async function MaintenancePage() {
  const session = await auth();
  
  // If user is admin, redirect to admin dashboard
  if (session?.user?.role === 'admin') {
    redirect('/protected/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Mode</h1>
          <p className="mt-2 text-gray-600">
            The system is currently undergoing maintenance. Please check back later.
          </p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            If you are an administrator, you can disable maintenance mode from the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
} 