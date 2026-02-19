import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void; // Placeholder for redirection logic
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch Current User
  const { data: authData, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    retry: false, 
    staleTime: 1000 * 60 * 5, 
  });

  const user = authData?.user ?? null;

  const login = async () => {
    try {
      await authApi.login();
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      queryClient.setQueryData(['auth', 'me'], null);
      window.location.href = '/login';
    }
  };

  // Derived State
  const isAuthenticated = !!user && !isError;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
