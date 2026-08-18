// The admin area is guarded in its layout, so its pages need no check of their own.
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (session?.user?.role !== 'admin') redirect('/login');
  return <section>{children}</section>;
}
