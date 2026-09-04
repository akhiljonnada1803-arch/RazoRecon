'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardPage from '../dashboard/page';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return <AdminDashboardPage />;
}
