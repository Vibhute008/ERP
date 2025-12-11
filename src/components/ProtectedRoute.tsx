'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ 
  children,
  allowedRoles
}: { 
  children: React.ReactNode;
  allowedRoles?: string[]; // Roles allowed to access this route
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Wait for authentication state to be determined
    if (isAuthenticated !== undefined) {
      setIsLoading(false);
      
      if (!isAuthenticated) {
        router.push('/login');
      } 
      // Check role-based access if allowedRoles is specified
      else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Set redirect flag instead of directly redirecting
        setShouldRedirect(true);
      }
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  // Handle redirection for unauthorized access
  useEffect(() => {
    if (shouldRedirect && user) {
      if (user.role === 'Tech Lead') {
        router.push('/projects');
      } else if (user.role === 'Telecaller') {
        router.push('/leads');
      } else {
        router.push('/dashboard');
      }
    }
  }, [shouldRedirect, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    ); // Show loading state while determining auth status
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Redirecting...</h2>
          <p className="text-gray-700 mb-4">
            Redirecting you to a page you have access to...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}