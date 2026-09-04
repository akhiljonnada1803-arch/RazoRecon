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
  isCustomer: boolean;
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
    'MANAGE_CATALOG',
    'MANAGE_INVENTORY',
    'MANAGE_PRICING',
    'MANAGE_PROMOTIONS',
    'MANAGE_ORDERS',
    'ASSIGN_DELIVERY_PARTNERS',
    'VIEW_MERCHANT_ANALYTICS',
    'MANAGE_MERCHANT_SETTINGS',
    'UPDATE_SHIPMENT_STATUS',
    'MANAGE_LOGISTICS',
    'VIEW_AUDIT_LOGS',
  ],
};

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Flagship Hero Demo & Simulator
  '/hero-demo': ['VIEW_MERCHANT_ANALYTICS', 'MANAGE_CATALOG', 'BROWSE_CATALOG'],
  '/agent-commerce': ['VIEW_MERCHANT_ANALYTICS', 'MANAGE_CATALOG'],
  
  // Merchant Operations (Shopify / Amazon Seller Style)
  '/dashboard': ['VIEW_MERCHANT_ANALYTICS', 'MANAGE_CATALOG'],
  '/merchant/dashboard': ['VIEW_MERCHANT_ANALYTICS', 'MANAGE_CATALOG', 'MANAGE_ORDERS'],
  '/merchant/catalog': ['MANAGE_CATALOG', 'MANAGE_INVENTORY'],
  '/merchant/inventory': ['MANAGE_INVENTORY', 'MANAGE_CATALOG'],
  '/merchant/orders': ['MANAGE_ORDERS', 'VIEW_ALL_ORDERS'],
  '/merchant/shipping': ['ASSIGN_DELIVERY_PARTNERS', 'MANAGE_LOGISTICS', 'UPDATE_SHIPMENT_STATUS'],
  '/merchant/customers': ['VIEW_MERCHANT_ANALYTICS', 'MANAGE_ORDERS'],
  '/merchant/settings': ['MANAGE_MERCHANT_SETTINGS', 'VIEW_MERCHANT_ANALYTICS'],

  // Customer Experience
  '/customer/assistant': ['USE_AI_SHOPPING_ASSISTANT', 'BROWSE_CATALOG'],
  '/customer/products': ['BROWSE_CATALOG'],
  '/customer/orders': ['PLACE_ORDERS', 'TRACK_ORDERS'],
  '/customer/track': ['TRACK_ORDERS', 'PLACE_ORDERS'],
  '/customer/wishlist': ['MANAGE_WISHLIST', 'BROWSE_CATALOG'],
  '/customer/recommendations': ['VIEW_RECOMMENDATIONS', 'BROWSE_CATALOG'],
  '/customer/profile': ['MANAGE_PROFILE'],

  // Growth Engine
  '/growth': ['MANAGE_PROMOTIONS', 'VIEW_MERCHANT_ANALYTICS'],
  '/growth/upsell': ['MANAGE_PROMOTIONS'],
  '/growth/campaigns': ['MANAGE_PROMOTIONS'],
  '/growth/segments': ['MANAGE_PROMOTIONS', 'VIEW_MERCHANT_ANALYTICS'],

  // Platform Admin Developer & Infrastructure Console
  '/admin/dashboard': ['MANAGE_PLATFORM_SETTINGS'],
  '/admin/agent-api': ['MANAGE_PLATFORM_SETTINGS', 'MANAGE_AGENT_CONFIG'],
  '/admin/agent-catalog-feed': ['MANAGE_PLATFORM_SETTINGS', 'MANAGE_AGENT_CONFIG'],
  '/admin/api-keys': ['MANAGE_PLATFORM_SETTINGS'],
  '/admin/webhooks': ['MANAGE_PLATFORM_SETTINGS'],
  '/admin/ai-buyer-logs': ['MANAGE_PLATFORM_SETTINGS'],
  '/admin/protocol-monitoring': ['MANAGE_PLATFORM_SETTINGS'],
  '/admin/users': ['MANAGE_USERS', 'MANAGE_PLATFORM_SETTINGS'],
  '/admin/roles': ['MANAGE_USERS', 'MANAGE_PLATFORM_SETTINGS'],
  '/admin/integrations': ['MANAGE_PLATFORM_SETTINGS', 'MANAGE_DELIVERY_PARTNERS'],
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
      id: 'org_consumer_hub',
      name: 'Consumer Commerce Network',
      merchant_id: 'rzp_live_cust_1010',
      industry: 'Retail & Consumer Goods',
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
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
      setToken(null);
      setUser(null);
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
        
        router.push('/');
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
        
        router.push('/');
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
    router.push('/');
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
      user.permissions?.includes('MANAGE_PLATFORM_SETTINGS')
    ) {
      return true;
    }
    return !!user.permissions?.includes(permissionName);
  };

  const PUBLIC_ROUTES = [
    '/', 
    '/login', 
    '/cart', 
    '/checkout',
    '/customer/products', 
    '/customer/assistant', 
    '/customer/orders',
    '/customer/wishlist',
    '/customer/profile',
    '/customer/track',
    '/customer/recommendations',
    '/categories',
    '/shop', 
    '/hero-demo'
  ];

  const canAccessRoute = (routePath: string): boolean => {
    // 1. Unconditionally allow public storefront routes & product details
    if (
      PUBLIC_ROUTES.includes(routePath) || 
      routePath.startsWith('/customer') || 
      routePath.startsWith('/product')
    ) {
      return true;
    }

    // 2. If no authenticated user, only public routes allowed
    if (!user) return false;
    
    // 3. Platform Admin has full access to admin routes
    if (
      user.role === 'Platform Admin' || 
      user.role_id === 'role_platform_admin' || 
      user.permissions?.includes('MANAGE_PLATFORM_SETTINGS')
    ) {
      return true;
    }

    // 4. Customer role cannot access merchant or admin routes
    const isCust = user.role === 'Customer' || user.role_id === 'role_customer';
    if (isCust) {
      return (
        routePath.startsWith('/customer') || 
        routePath.startsWith('/shop') || 
        routePath === '/' || 
        routePath === '/cart' || 
        routePath === '/checkout' || 
        routePath === '/hero-demo'
      );
    }

    // 5. Merchant cannot access admin routes
    if (routePath.startsWith('/admin')) {
      return false;
    }

    const required = ROUTE_PERMISSIONS[routePath];
    if (!required) {
      const matchingPrefix = Object.keys(ROUTE_PERMISSIONS).find(
        (prefix) => routePath.startsWith(prefix) && prefix !== '/'
      );
      if (matchingPrefix) {
        return ROUTE_PERMISSIONS[matchingPrefix].some((req) => user.permissions?.includes(req));
      }
      return true;
    }

    return required.some((req) => user.permissions?.includes(req));
  };

  const isCustomer = user?.role === 'Customer' || user?.role_id === 'role_customer';

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
        isCustomer,
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
