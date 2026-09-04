'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CustomerStorefrontLayout } from '@/components/layout/CustomerStorefrontLayout';
import { MerchantPortalLayout } from '@/components/layout/MerchantPortalLayout';
import { AdminConsoleLayout } from '@/components/layout/AdminConsoleLayout';
import { AccessDenied403 } from '@/components/common/AccessDenied403';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isCustomer, canAccessRoute } = useAuth();

  const isLoginPage = pathname === '/login';
  
  // 1. Route Category Identification
  const isCustomerRoute = 
    pathname === '/' || 
    pathname.startsWith('/customer') || 
    pathname.startsWith('/shop') || 
    pathname.startsWith('/cart') || 
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/product');

  const isMerchantRoute = 
    pathname.startsWith('/merchant') || 
    pathname.startsWith('/growth') || 
    pathname.startsWith('/campaigns');

  const isAdminRoute = 
    pathname.startsWith('/admin') || 
    pathname === '/reconciliation' || 
    pathname === '/exceptions' || 
    pathname === '/vendor-intelligence' ||
    pathname === '/audit';

  const isPlatformAdmin = user?.role === 'Platform Admin' || user?.role_id === 'role_platform_admin';

  useEffect(() => {
    if (isLoading) return;

    // A. Unauthenticated protection for Merchant and Admin routes
    if (!isAuthenticated && (isMerchantRoute || isAdminRoute)) {
      router.push('/login');
      return;
    }

    // B. Customer role attempting to access Merchant or Admin route -> Redirect to Storefront
    if (isAuthenticated && isCustomer && (isMerchantRoute || isAdminRoute)) {
      router.push('/');
      return;
    }

    // C. Non-admin attempting to access Admin route -> Redirect to Merchant Dashboard
    if (isAuthenticated && !isPlatformAdmin && isAdminRoute) {
      router.push('/merchant/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, isCustomer, isPlatformAdmin, isMerchantRoute, isAdminRoute, router]);

  // 1. Isolated Login Screen (Zero Dashboard / Zero Shell elements)
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC]">
        {children}
      </div>
    );
  }

  // 2. Loading State
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

  const isAllowed = canAccessRoute(pathname);

  // 3. Customer Storefront Experience (Amazon + Flipkart Theme, No Sidebar)
  if (isCustomerRoute) {
    return (
      <CustomerStorefrontLayout>
        {children}
      </CustomerStorefrontLayout>
    );
  }

  // 4. Platform Admin Console Experience (Enterprise SaaS Console)
  if (isAdminRoute) {
    return (
      <AdminConsoleLayout>
        {isAllowed && isPlatformAdmin ? children : <AccessDenied403 routePath={pathname} />}
      </AdminConsoleLayout>
    );
  }

  // 5. Merchant Portal Experience (Shopify Seller Dashboard)
  if (isMerchantRoute) {
    return (
      <MerchantPortalLayout>
        {isAllowed ? children : <AccessDenied403 routePath={pathname} />}
      </MerchantPortalLayout>
    );
  }

  // Default fallback layout based on user persona
  if (isPlatformAdmin) {
    return <AdminConsoleLayout>{children}</AdminConsoleLayout>;
  } else if (!isCustomer && isAuthenticated) {
    return <MerchantPortalLayout>{children}</MerchantPortalLayout>;
  }

  return (
    <CustomerStorefrontLayout>
      {children}
    </CustomerStorefrontLayout>
  );
}
