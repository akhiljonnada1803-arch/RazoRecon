import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { AdminAuthGuard } from '@/components/layout/AdminAuthGuard';

export const metadata: Metadata = {
  title: 'CartMind Control Center - Platform Operations & Governance',
  description: 'Enterprise SaaS Administration Console for CartMind Platform Management',
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
            <AdminAuthGuard>
              {children}
            </AdminAuthGuard>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
