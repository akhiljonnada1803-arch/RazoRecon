'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MerchantDashboardPage from '../dashboard/page';

export default function MerchantRootRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/merchant/dashboard');
  }, [router]);

  return <MerchantDashboardPage />;
}
