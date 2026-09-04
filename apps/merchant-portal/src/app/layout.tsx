import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { MerchantSidebar } from '@/components/layout/MerchantSidebar';
import { MerchantHeader } from '@/components/layout/MerchantHeader';

export const metadata: Metadata = {
  title: 'RazorMerchant - Shopify Seller Portal',
  description: 'Shopify Seller Dashboard for Catalog, Inventory, 7-Stage Orders & Fulfillment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased">
        <Providers>
          <AuthProvider>
            <div className="flex min-h-screen w-full bg-[#F8FAFC]">
              <MerchantSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <MerchantHeader />
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
                  {children}
                </main>
              </div>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
