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
  id: 'usr_merchant_owner',
  name: 'Rajesh Sharma (Merchant Owner)',
  user_name: 'Rajesh Sharma',
  email: 'owner@acme.com',
  company: 'Acme Direct Corp',
  role: 'Merchant Owner',
  role_id: 'role_merchant_owner',
  merchant_id: 'rzp_live_acme_8842',
  permissions: [
    'VIEW_DASHBOARD',
    'MANAGE_CATALOG',
    'MANAGE_INVENTORY',
    'MANAGE_ORDERS',
    'VIEW_CUSTOMERS',
    'MANAGE_GROWTH',
    'VIEW_AUDIT_LOGS',
  ],
};

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Flagship Hero Demo & Agent Commerce
  '/hero-demo': ['VIEW_DASHBOARD'],
  '/agent-commerce': ['VIEW_DASHBOARD', 'MANAGE_GROWTH', 'MANAGE_CATALOG'],
  
  // Merchant Hub
  '/dashboard': ['VIEW_DASHBOARD'],
  '/merchant/dashboard': ['VIEW_DASHBOARD'],
  '/merchant/catalog': ['MANAGE_CATALOG', 'MANAGE_INVENTORY', 'MANAGE_GROWTH'],
  '/merchant/orders': ['MANAGE_ORDERS', 'RUN_RECONCILIATION', 'VIEW_AUDIT_LOGS'],
  '/merchant/customers': ['VIEW_CUSTOMERS', 'MANAGE_GROWTH', 'MANAGE_ORDERS'],
  
  // AI Commerce Storefront
  '/shop': ['VIEW_DASHBOARD', 'MANAGE_CATALOG'],
  '/shop/cart': ['VIEW_DASHBOARD', 'MANAGE_CATALOG'],
  '/shop/checkout': ['VIEW_DASHBOARD', 'MANAGE_CATALOG'],
  '/commerce-agent': ['VIEW_DASHBOARD', 'MANAGE_CATALOG', 'MANAGE_GROWTH'],
  '/catalog': ['MANAGE_CATALOG', 'MANAGE_INVENTORY'],

  // Revenue Growth Engine
  '/growth': ['MANAGE_GROWTH', 'VIEW_DASHBOARD'],
  '/growth/upsell': ['MANAGE_GROWTH'],
  '/growth/campaigns': ['MANAGE_GROWTH'],
  '/growth/segments': ['MANAGE_GROWTH', 'VIEW_CUSTOMERS'],
  '/growth-agent': ['MANAGE_GROWTH'],
  '/campaigns': ['MANAGE_GROWTH'],

  // Finance Intelligence Layer
  '/finance/reconciliation': ['RUN_RECONCILIATION', 'CLOSE_BOOKS'],
  '/finance/exceptions': ['VIEW_EXCEPTIONS', 'RESOLVE_EXCEPTIONS'],
  '/finance/vendors': ['VIEW_VENDOR_INTELLIGENCE'],
  '/finance/copilot': ['VIEW_CFO_COPILOT'],
  '/reconciliation': ['RUN_RECONCILIATION'],
  '/review': ['VIEW_EXCEPTIONS'],
  '/month-close': ['CLOSE_BOOKS'],
  '/vendor-intelligence': ['VIEW_VENDOR_INTELLIGENCE'],
  '/copilot': ['VIEW_CFO_COPILOT'],
  '/forecast': ['VIEW_CASH_FORECAST'],

  // Audit & Compliance
  '/audit/logs': ['VIEW_AUDIT_LOGS'],
  '/audit/timeline': ['VIEW_AUDIT_LOGS', 'VIEW_COMPLIANCE'],
  '/audit/compliance': ['VIEW_COMPLIANCE', 'VIEW_AUDIT_LOGS'],

  // Administration
  '/admin/users': ['MANAGE_USERS', 'MANAGE_SYSTEM'],
  '/admin/roles': ['MANAGE_ROLES', 'MANAGE_SYSTEM'],
  '/admin/integrations': ['MANAGE_SYSTEM'],
  '/admin/merchants': ['MANAGE_SYSTEM'],
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
      const savedToken = localStorage.getItem('razorcommerce_token') || localStorage.getItem('razorrecon_token');
      const savedUser = localStorage.getItem('razorcommerce_user') || localStorage.getItem('razorrecon_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        setToken('demo_jwt_session_token');
        setUser(DEFAULT_USER);
        localStorage.setItem('razorcommerce_token', 'demo_jwt_session_token');
        localStorage.setItem('razorcommerce_user', JSON.stringify(DEFAULT_USER));
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
        localStorage.setItem('razorcommerce_token', resp.access_token);
        localStorage.setItem('razorcommerce_user', JSON.stringify(resp.user));
        router.push('/merchant/dashboard');
        return true;
      }
    } catch (err) {
      console.warn('Backend login fallback to quickswitch auth:', err);
    }
    return false;
  };

  const quickSwitchUser = async (email: string) => {
    try {
      const resp = await apiClient.post<LoginResponseDTO>('/auth/quick-switch', { email });
      if (resp && resp.user) {
        setToken(resp.access_token);
        setUser(resp.user);
        localStorage.setItem('razorcommerce_token', resp.access_token);
        localStorage.setItem('razorcommerce_user', JSON.stringify(resp.user));
        return;
      }
    } catch (e) {
      console.warn('Quick switch fallback:', e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('razorcommerce_token');
    localStorage.removeItem('razorcommerce_user');
    localStorage.removeItem('razorrecon_token');
    localStorage.removeItem('razorrecon_user');
    router.push('/login');
  };

  const switchOrganization = async (orgName: string) => {
    try {
      const updatedUser = await apiClient.post<UserDTO>('/auth/switch-org', { organization_name: orgName });
      setUser(updatedUser);
      localStorage.setItem('razorcommerce_user', JSON.stringify(updatedUser));
    } catch (err) {
      if (user) {
        const updated: UserDTO = { ...user, company: orgName };
        setUser(updated);
        localStorage.setItem('razorcommerce_user', JSON.stringify(updated));
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
    if (
      user.role === 'Platform Admin' || 
      user.role_id === 'role_platform_admin' || 
      user.role_id === 'role_admin' || 
      user.permissions?.includes('MANAGE_SYSTEM')
    ) {
      return true;
    }
    return !!user.permissions?.includes(permissionName);
  };

  const canAccessRoute = (routePath: string): boolean => {
    if (!user) return false;
    
    // Platform Admin has complete access to every route
    if (
      user.role === 'Platform Admin' || 
      user.role_id === 'role_platform_admin' || 
      user.role_id === 'role_admin' || 
      user.permissions?.includes('MANAGE_SYSTEM')
    ) {
      return true;
    }

    // Direct route matching
    const required = ROUTE_PERMISSIONS[routePath];
    if (!required) {
      // Check prefix matching for nested paths e.g. /shop/product/123
      const matchingPrefix = Object.keys(ROUTE_PERMISSIONS).find(
        (prefix) => routePath.startsWith(prefix) && prefix !== '/'
      );
      if (matchingPrefix) {
        return ROUTE_PERMISSIONS[matchingPrefix].some((req) => user.permissions?.includes(req));
      }
      return true; // Default allow if not explicitly gated
    }

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
