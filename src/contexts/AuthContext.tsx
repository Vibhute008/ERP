'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataProvider } from './DataContext';

// Define user roles
export type UserRole = 'Founder' | 'Tech Lead' | 'Telecaller';

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean | undefined;
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('user');
    
    if (loggedIn && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback((email: string, password: string, role: UserRole): boolean => {
    // For development: accept any non-empty credentials
    // In production, this would connect to a real authentication system
    if (email && password) {
      const userObj: User = {
        email: email,
        role: role as UserRole
      };
      
      setIsAuthenticated(true);
      setUser(userObj);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Redirect to appropriate page based on role
      if (role === 'Founder') {
        router.push('/dashboard');
      } else if (role === 'Tech Lead') {
        router.push('/projects');
      } else if (role === 'Telecaller') {
        router.push('/leads');
      }
      
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    login,
    logout
  }), [isAuthenticated, user, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}