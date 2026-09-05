import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { MerchantAuthGuard } from '@/components/layout/MerchantAuthGuard';

export const metadata: Metadata = {
  title: 'CartMind Business - Grow Revenue with AI-Powered Commerce',
  description: 'Manage products, track orders, monitor revenue, launch campaigns, and scale your business with intelligent commerce automation.',
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
