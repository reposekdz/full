import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config/apiBase';

export type UserRole = 
  | 'parent' 
  | 'advisor'
  | 'director_study' 
  | 'director_discipline' 
  | 'headmaster' 
  | 'teacher' 
  | 'accountant' 
  | 'stock_manager' 
  | 'admin'
  | 'super_admin';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  user_type: 'admin' | 'user';
  /** When true, user must change email/password before using the app (e.g. after login with static credentials). */
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; dashboardPage?: string }>;
  loginWithRole: (role: UserRole, credentials?: { email: string; password: string }) => Promise<{ success: boolean; dashboardPage?: string; token?: string; user?: User }>;
  updateProfile: (data: { email?: string; password?: string; first_name?: string; last_name?: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  registerRole: (roleData: {
    roleName: UserRole;
    email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<{ success: boolean; dashboardPage?: string; message?: string; token?: string; user?: User }>;
  setAuthFromRegistration: (token: string, user: User) => string;
  logout: () => void;
  loading: boolean;
  getRoleDashboard: (role: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_BASE = API_BASE_URL;
  const UNIFIED_EMAIL = 'reponse@gmail.com';
  const UNIFIED_PASSWORD = '2026';

  const getRoleDashboard = (role: string): string => {
    const dashboardMap: Record<string, string> = {
      parent: 'dashboard-parent',
      advisor: 'dashboard-advisor',
      director_study: 'dashboard-director-study',
      director_discipline: 'dashboard-director-discipline',
      headmaster: 'dashboard-headmaster',
      teacher: 'dashboard-teacher',
      accountant: 'dashboard-accountant',
      stock_manager: 'dashboard-stock',
      admin: 'admin',
      super_admin: 'admin',
    };
    return dashboardMap[role] || 'dashboard';
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const u = data.user as User;
              // Backend already sets must_change_password, just use it
              setUser(u);
              setToken(savedToken);
            } else {
              localStorage.removeItem('token');
              setToken(null);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; dashboardPage?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        const user = data.user as User;
        // Backend already sets must_change_password, just use it
        setUser(user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        const dashboardPage = getRoleDashboard(user.role);
        if (user.role === 'parent') {
          setTimeout(() => {
            window.location.href = `/${dashboardPage}`;
          }, 100);
        }
        return { success: true, dashboardPage };
      } else {
        console.error('Login failed:', data.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const loginWithRole = async (role: UserRole, credentials?: { email: string; password: string }): Promise<{ success: boolean; dashboardPage?: string; token?: string; user?: User }> => {
    if (credentials?.email && credentials?.password) {
      try {
        let response = await fetch(`${API_BASE}/role-auth/login-role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roleName: role,
            email: credentials.email,
            password: credentials.password
          })
        });
        let data = await response.json();

        if (!data.success && (role === 'parent' || response.status === 404)) {
          response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password, role })
          });
          data = await response.json();
        }

        if (data.success && data.user) {
          const user = data.user as User;
          const tok = data.token || data.accessToken;
          // Backend already sets must_change_password, just use it
          setUser(user);
          setToken(tok);
          if (tok) localStorage.setItem('token', tok);
          localStorage.setItem('user', JSON.stringify(user));
          const dashboardPage = getRoleDashboard(user.role);
          return { success: true, dashboardPage, token: tok, user };
        }
        return { success: false };
      } catch (error) {
        console.error('Role login error:', error);
        return { success: false };
      }
    }
    return login(UNIFIED_EMAIL, UNIFIED_PASSWORD).then(async (r) => {
      if (!r.success) return { ...r, token: undefined, user: undefined };
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      // Backend already sets must_change_password, just use it
      setUser(u);
      return { success: true, dashboardPage: r.dashboardPage, token: undefined, user: u };
    });
  };

  const updateProfile = async (data: { email?: string; password?: string; first_name?: string; last_name?: string }): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        const loginResult = await login(userData.username, userData.password);
        return loginResult.success;
      } else {
        console.error('Registration failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const registerRole = async (roleData: {
    roleName: UserRole;
    email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<{ success: boolean; dashboardPage?: string; message?: string; token?: string; user?: User }> => {
    try {
      let response = await fetch(`${API_BASE}/role-auth/register-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });
      let data = await response.json();

      if (!data.success && (roleData.roleName === 'parent' || response.status === 404)) {
        response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: roleData.email,
            password: roleData.password,
            first_name: roleData.first_name,
            last_name: roleData.last_name,
            phone: roleData.phone,
            role: roleData.roleName
          })
        });
        data = await response.json();
      }

      if (data.success && data.user) {
        const user = data.user;
        const tok = data.token || data.accessToken;
        setUser(user);
        setToken(tok);
        if (tok) localStorage.setItem('token', tok);
        localStorage.setItem('user', JSON.stringify(data.user));
        const dashboardPage = getRoleDashboard(user.role);
        return { success: true, dashboardPage, token: tok, user };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      console.error('Role registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const setAuthFromRegistration = (token: string, user: User): string => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return getRoleDashboard(user.role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithRole, updateProfile, register, registerRole, setAuthFromRegistration, logout, loading, getRoleDashboard }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default context instead of throwing error
    return {
      user: null,
      token: null,
      login: async () => ({ success: false }),
      loginWithRole: async () => ({ success: false }),
      updateProfile: async () => false,
      register: async () => false,
      registerRole: async () => ({ success: false }),
      setAuthFromRegistration: () => 'home',
      logout: () => {},
      loading: false,
      getRoleDashboard: () => 'home'
    };
  }
  return context;
};
