"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/lib/types';
import { authApi, companiesApi } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Optionally refresh the profile from the backend
        // refreshProfile();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Call the real backend API
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Map backend user data to frontend User type
        const mappedUser: User = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.name,
          role: mapBackendRole(userData.role),
          avatar: userData.avatar,
          company: userData.company,
          companies: userData.companies,
        };

        // Store token with user data (using 'token' key for consistency with API client)
        const userWithToken = { ...mappedUser, token: accessToken, refreshToken };

        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const switchCompany = async (companyId: string) => {
    if (!user || user.role !== 'ca') return;

    try {
      // Fetch company details from backend
      const response = await companiesApi.getById(companyId);

      if (response.success && response.data) {
        const company = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          logo: response.data.logo,
          industry: response.data.industry || '',
          size: response.data.size || '',
          status: response.data.status || 'active',
        };

        const updatedUser = { ...user, selectedCompany: company };
        setUser(updatedUser);

        // Update localStorage
        const storedData = localStorage.getItem('user');
        if (storedData) {
          const userData = JSON.parse(storedData);
          localStorage.setItem('user', JSON.stringify({ ...userData, selectedCompany: company }));
        }
      }
    } catch (error) {
      console.error('Error switching company:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to map backend roles to frontend roles
function mapBackendRole(backendRole: string): 'admin' | 'ca' | 'company' {
  switch (backendRole) {
    case 'SUPER_ADMIN':
      return 'admin';
    case 'CA':
      return 'ca';
    case 'COMPANY_ADMIN':
    case 'COMPANY_USER':
      return 'company';
    default:
      return 'company';
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};