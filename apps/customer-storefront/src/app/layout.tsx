import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { CustomerHeader } from '@/components/layout/CustomerHeader';

export const metadata: Metadata = {
  title: 'CartMind - Your AI Shopping Companion',
  description: 'Discover products, compare options, explore reviews, calculate EMI, and buy with confidence using CartMind AI.',
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
