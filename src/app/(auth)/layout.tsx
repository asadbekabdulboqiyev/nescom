'use client';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-auth">
      {children}
    </div>
  );
}
