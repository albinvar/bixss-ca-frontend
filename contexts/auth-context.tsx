"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/lib/types';
import { mockUsers, mockCompanies } from '@/lib/mock-data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check mock credentials
    const mockUser = mockUsers[email];

    if (mockUser && (
      (email === 'admin@bixssca.com' && password === 'admin123') ||
      (email === 'ca@bixssca.com' && password === 'ca123') ||
      (email === 'company@techsolutions.com' && password === 'company123')
    )) {
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      router.push('/dashboard');
    } else {
      throw new Error('Invalid credentials');
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const switchCompany = (companyId: string) => {
    if (!user || user.role !== 'ca') return;

    const company = mockCompanies.find(c => c.id === companyId);
    if (company) {
      const updatedUser = { ...user, selectedCompany: company };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};