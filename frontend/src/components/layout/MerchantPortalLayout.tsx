'use client';

import React from 'react';
import { MerchantSidebar } from '@/components/layout/MerchantSidebar';
import { MerchantHeader } from '@/components/layout/MerchantHeader';

export function MerchantPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] text-foreground antialiased">
      {/* 1. Dedicated Shopify-style Merchant Sidebar */}
      <MerchantSidebar />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <MerchantHeader />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
