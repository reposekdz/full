import React, { createContext, useContext, useState } from 'react';

export type UserRole = 
  | 'student' 
  | 'parent' 
  | 'director_of_study' 
  | 'director_of_discipline' 
  | 'head_master' 
  | 'teacher' 
  | 'accountant' 
  | 'stock_manager' 
  | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<string>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'student' | 'parent') => Promise<string>;
  getRoleDashboard: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const getRoleDashboard = (role: UserRole): string => {
    const dashboardMap: Record<UserRole, string> = {
      student: 'dashboard-student',
      parent: 'dashboard-parent',
      director_of_study: 'dashboard-director-study',
      director_of_discipline: 'dashboard-director-discipline',
      head_master: 'dashboard-headmaster',
      teacher: 'dashboard-teacher',
      accountant: 'dashboard-accountant',
      stock_manager: 'dashboard-stock',
      admin: 'dashboard-admin',
    };
    return dashboardMap[role];
  };

  const login = async (email: string, password: string, role?: UserRole): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userRole = role || 'student';
        setUser({
          id: '1',
          name: 'John Doe',
          email,
          role: userRole,
        });
        resolve(getRoleDashboard(userRole));
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'parent'): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          name,
          email,
          role,
        });
        resolve(getRoleDashboard(role));
      }, 500);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, getRoleDashboard }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
