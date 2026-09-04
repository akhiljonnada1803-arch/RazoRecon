import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { CustomerHeader } from '@/components/layout/CustomerHeader';

export const metadata: Metadata = {
  title: 'RazorCommerce AI - Smart Consumer Marketplace',
  description: 'AI-Powered Consumer Marketplace with Instant Razorpay Checkout',
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
            <div className="min-h-screen flex flex-col justify-between">
              <CustomerHeader />
              <main className="flex-1 w-full">
                {children}
              </main>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
