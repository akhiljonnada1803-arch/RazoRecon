import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

export const metadata: Metadata = {
  title: 'RazorAdmin - Platform Administration Console',
  description: 'Enterprise SaaS Administration Console for RazorCommerce Platform Management',
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
              <AdminSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
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
