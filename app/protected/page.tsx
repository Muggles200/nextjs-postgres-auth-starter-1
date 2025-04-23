import { auth } from 'app/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session || !session.user?.role || !['admin', 'user'].includes(session.user.role)) {
    redirect('/login');
  }
  
  redirect(`/protected/${session.user.role}`);
}
