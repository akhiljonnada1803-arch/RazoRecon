'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MerchantSidebar } from '@/components/layout/MerchantSidebar';
import { MerchantHeader } from '@/components/layout/MerchantHeader';

export function MerchantAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const isPublicAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicAuthPage && !isLandingPage) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isPublicAuthPage, isLandingPage, router]);

  if (isPublicAuthPage) {
    return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Verifying merchant session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && isLandingPage) {
    return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MerchantHeader />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
