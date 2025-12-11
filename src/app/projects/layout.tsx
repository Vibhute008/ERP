'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['Founder', 'Tech Lead']}>
        <div className="flex bg-[#F8FAFC]">
          <Sidebar />
          <main className="flex-1 ml-[260px] p-0">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}