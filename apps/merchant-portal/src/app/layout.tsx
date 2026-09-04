import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { MerchantAuthGuard } from '@/components/layout/MerchantAuthGuard';

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
            <MerchantAuthGuard>
              {children}
            </MerchantAuthGuard>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
