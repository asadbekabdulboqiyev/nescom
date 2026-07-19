'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useState } from 'react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <AuthGuard>
 <div className="min-h-screen bg-slate-50">
 <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
 <div className="lg:pl-64">
 <Header onMenuToggle={() => setMobileOpen(true)} />
 <main id="main-content" className="p-4 lg:p-6 page-transition">
 {children}
 </main>
 </div>
 </div>
 </AuthGuard>
 );
}
