'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { UserDTO, LoginResponseDTO, OrganizationDTO } from '@/types/auth';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  organizations: OrganizationDTO[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  quickSwitchUser: (email: string) => Promise<void>;
  switchOrganization: (orgName: string) => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
  canAccessRoute: (routePath: string) => boolean;
}

const DEFAULT_USER: UserDTO = {
  id: 'usr_controller_01',
  name: 'Finance Controller',
  user_name: 'Finance Controller',
  email: 'controller@acme.com',
  company: 'Acme Direct Corp',
  role: 'Finance Controller',
  role_id: 'role_controller',
  merchant_id: 'rzp_live_acme_8842',
  permissions: [
    'VIEW_DASHBOARD',
    'RUN_RECONCILIATION',
    'VIEW_EXCEPTIONS',
    'RESOLVE_EXCEPTIONS',
    'VIEW_VENDOR_INTELLIGENCE',
    'VIEW_CASH_FORECAST',
    'CLOSE_BOOKS'
  ],
};

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['VIEW_DASHBOARD'],
  '/commerce-agent': ['VIEW_DASHBOARD'],
  '/reconciliation': ['RUN_RECONCILIATION'],
  '/review': ['VIEW_EXCEPTIONS'],
  '/month-close': ['CLOSE_BOOKS'],
  '/vendor-intelligence': ['VIEW_VENDOR_INTELLIGENCE'],
  '/copilot': ['VIEW_CFO_COPILOT'],
  '/forecast': ['VIEW_CASH_FORECAST'],
  '/categorization': ['VIEW_AUDIT_LOGS'],
  '/income-statement': ['VIEW_DASHBOARD'],
  '/fraud': ['VIEW_AUDIT_LOGS', 'VIEW_VENDOR_INTELLIGENCE'],
  '/demo': ['RUN_RECONCILIATION', 'VIEW_DASHBOARD'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationDTO[]>([
    {
      id: 'org_acme_corp',
      name: 'Acme Direct Corp',
      merchant_id: 'rzp_live_acme_8842',
      industry: 'D2C E-Commerce & Retail',
      is_active: true,
    },
    {
      id: 'org_razorpay_ops',
      name: 'Razorpay Merchant Ops',
      merchant_id: 'rzp_live_ops_9921',
      industry: 'Fintech & Payments Platform',
      is_active: false,
    },
    {
      id: 'org_startup_fin',
      name: 'Startup Finance Team',
      merchant_id: 'rzp_test_start_3310',
      industry: 'B2B SaaS Subscriptions',
      is_active: false,
    },
  ]);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('razorrecon_token');
      const savedUser = localStorage.getItem('razorrecon_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        setToken('demo_jwt_session_token');
        setUser(DEFAULT_USER);
        localStorage.setItem('razorrecon_token', 'demo_jwt_session_token');
        localStorage.setItem('razorrecon_user', JSON.stringify(DEFAULT_USER));
      }
    } catch (e) {
      console.error('Failed to load session:', e);
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const resp = await apiClient.post<LoginResponseDTO>('/auth/login', { email, password });
      if (resp && resp.access_token) {
        setToken(resp.access_token);
        setUser(resp.user);
        localStorage.setItem('razorrecon_token', resp.access_token);
        localStorage.setItem('razorrecon_user', JSON.stringify(resp.user));
        router.push('/dashboard');
        return true;
      }
    } catch (err) {
      console.warn('Backend login fallback to demo auth:', err);
    }
    return false;
  };

  const quickSwitchUser = async (email: string) => {
    try {
      const resp = await apiClient.post<LoginResponseDTO>('/auth/quick-switch', { email });
      if (resp && resp.user) {
        setToken(resp.access_token);
        setUser(resp.user);
        localStorage.setItem('razorrecon_token', resp.access_token);
        localStorage.setItem('razorrecon_user', JSON.stringify(resp.user));
        return;
      }
    } catch (e) {
      console.warn('Quick switch fallback:', e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('razorrecon_token');
    localStorage.removeItem('razorrecon_user');
    router.push('/login');
  };

  const switchOrganization = async (orgName: string) => {
    try {
      const updatedUser = await apiClient.post<UserDTO>('/auth/switch-org', { organization_name: orgName });
      setUser(updatedUser);
      localStorage.setItem('razorrecon_user', JSON.stringify(updatedUser));
    } catch (err) {
      if (user) {
        const updated: UserDTO = { ...user, company: orgName };
        setUser(updated);
        localStorage.setItem('razorrecon_user', JSON.stringify(updated));
      }
    }

    setOrganizations((prev) =>
      prev.map((o) => ({
        ...o,
        is_active: o.name === orgName,
      }))
    );
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    if (user.role === 'Platform Admin' || user.permissions?.includes('MANAGE_SYSTEM')) return true;
    return !!user.permissions?.includes(permissionName);
  };

  const canAccessRoute = (routePath: string): boolean => {
    if (!user) return false;
    if (user.role === 'Platform Admin' || user.permissions?.includes('MANAGE_SYSTEM')) return true;

    // Direct route matching
    const required = ROUTE_PERMISSIONS[routePath];
    if (!required) return true; // Default allow if not explicitly gated

    return required.some((req) => user.permissions?.includes(req));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        organizations,
        login,
        logout,
        quickSwitchUser,
        switchOrganization,
        hasPermission,
        canAccessRoute,
      }}
    >
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
