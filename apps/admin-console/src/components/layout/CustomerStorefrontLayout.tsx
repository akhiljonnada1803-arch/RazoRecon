'use client';

import React from 'react';
import { CustomerHeader } from '@/components/layout/CustomerHeader';

export function CustomerStorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col justify-between antialiased text-foreground">
      {/* 1. Dedicated Consumer Marketplace Header (Amazon / Flipkart Style) */}
      <CustomerHeader />

      {/* 2. Full Width Consumer Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
