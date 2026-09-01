export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Nescom — Company Management',
    template: '%s | Nescom',
  },
  description:
    'Nescom is a modern company management platform for teams, tasks, messaging, and payroll.',
  keywords: ['company management', 'tasks', 'messaging', 'payroll', 'HR', 'team collaboration'],
  applicationName: 'Nescom',
  authors: [{ name: 'Nescom' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Nescom — Company Management',
    description: 'A modern platform for managing your team, tasks, messaging, and payroll.',
    type: 'website',
    siteName: 'Nescom',
  },
  twitter: {
    card: 'summary',
    title: 'Nescom — Company Management',
    description: 'A modern platform for managing your team, tasks, messaging, and payroll.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
