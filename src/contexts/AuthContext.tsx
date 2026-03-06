import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_ADMIN = { id: 'admin-1', username: 'admin', name: 'Administrator', role: 'admin' as const };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (username: string, password: string): boolean => {
    // Check admin
    if (username === 'admin' && password === 'admin96') {
      setUser(DEFAULT_ADMIN);
      localStorage.setItem('currentUser', JSON.stringify(DEFAULT_ADMIN));
      return true;
    }
    // Check staff
    const staff = JSON.parse(localStorage.getItem('staff') || '[]');
    const found = staff.find((s: any) => s.username === username && s.password === password);
    if (found) {
      const u: User = { id: found.id, username: found.username, name: found.name, role: 'employee' };
      setUser(u);
      localStorage.setItem('currentUser', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
