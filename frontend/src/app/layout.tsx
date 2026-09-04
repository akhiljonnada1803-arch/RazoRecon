import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'RazorRecon AI — Autonomous Financial Reconciliation Platform',
  description: 'Enterprise deterministic bookkeeping, agent memory, and counterparty risk intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
