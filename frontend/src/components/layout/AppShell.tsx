'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { CustomerHeader } from '@/components/layout/CustomerHeader';
import { AccessDenied403 } from '@/components/common/AccessDenied403';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, canAccessRoute } = useAuth();

  const isLoginPage = pathname === '/login';
  const isCustomerStorefront = 
    pathname === '/' || 
    pathname.startsWith('/customer') || 
    pathname.startsWith('/shop');

  useEffect(() => {
    // Only redirect to login if attempting to access restricted merchant/admin/system routes while unauthenticated
    if (!isLoading && !isAuthenticated && !isLoginPage && !isCustomerStorefront) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, isCustomerStorefront, router]);

  // 1. Unauthenticated Login Screen: Render ONLY the login screen with ZERO dashboard elements
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC]">
        {children}
      </div>
    );
  }

  // 2. Loading State during session hydration
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[#F8FAFC] text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-[#0B72E7] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-slate-600">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  // 3. Customer Storefront Layout (Amazon / E-Commerce style with CustomerHeader, No Enterprise Sidebar)
  if (isCustomerStorefront) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col antialiased text-foreground">
        <CustomerHeader />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  const isAllowed = canAccessRoute(pathname);

  // 4. Authenticated Enterprise Workstation Layout (Merchant Portal & Platform Admin)
  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] text-foreground antialiased">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {isAllowed ? children : <AccessDenied403 routePath={pathname} />}
        </main>
      </div>
    </div>
  );
}
