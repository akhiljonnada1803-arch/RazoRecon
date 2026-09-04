/**
 * Centralized Admin Portal Route Registry & Validation System
 * 
 * Provides type-safe routing constants, navigation metadata,
 * and automated runtime route validation for RazorAdmin Console.
 */

export const ADMIN_ROUTES = {
  // Core Platform
  DASHBOARD: '/admin/dashboard',
  MERCHANTS: '/admin/merchants',
  MERCHANT_APPROVALS: '/admin/merchant-approvals',
  USERS: '/admin/users',
  ROLES: '/admin/roles',
  RBAC: '/admin/rbac',

  // Transactions & Risk
  PAYMENTS: '/admin/payments',
  FRAUD: '/admin/fraud',
  DISPUTES: '/admin/disputes',

  // Infrastructure & APIs
  ANALYTICS: '/admin/analytics',
  PROTOCOL_MONITORING: '/admin/protocol-monitoring',
  PROTOCOLS: '/admin/protocols',
  API_KEYS: '/admin/api-keys',
  WEBHOOKS: '/admin/webhooks',
  SETTINGS: '/admin/settings',

  // Developer & Agent Extensions
  AGENT_API: '/admin/agent-api',
  AGENT_CATALOG_FEED: '/admin/agent-catalog-feed',
  AI_BUYER_LOGS: '/admin/ai-buyer-logs',
  INTEGRATIONS: '/admin/integrations',
} as const;

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;
export type AdminRoutePath = typeof ADMIN_ROUTES[AdminRouteKey];

export const ALL_REGISTERED_ADMIN_ROUTES: string[] = [
  '/admin',
  '/admin/dashboard',
  '/admin/merchants',
  '/admin/merchant-approvals',
  '/admin/users',
  '/admin/roles',
  '/admin/rbac',
  '/admin/payments',
  '/admin/fraud',
  '/admin/disputes',
  '/admin/analytics',
  '/admin/protocol-monitoring',
  '/admin/protocols',
  '/admin/api-keys',
  '/admin/webhooks',
  '/admin/settings',
  '/admin/agent-api',
  '/admin/agent-catalog-feed',
  '/admin/ai-buyer-logs',
  '/admin/integrations',
  // Root fallbacks
  '/',
  '/dashboard',
  '/merchants',
  '/users',
  '/roles',
  '/rbac',
  '/payments',
  '/fraud',
  '/disputes',
  '/analytics',
  '/protocol-monitoring',
  '/protocols',
  '/api-keys',
  '/webhooks',
  '/settings',
  '/login',
];

/**
 * Validates whether an admin navigation route is properly registered in the router.
 * Emits a console warning if an unregistered or broken route is detected.
 */
export function validateAdminRoute(route: string): boolean {
  const cleanPath = route.split('?')[0].split('#')[0];
  const isRegistered = ALL_REGISTERED_ADMIN_ROUTES.some(
    (validRoute) => cleanPath === validRoute || cleanPath.startsWith(validRoute + '/')
  );

  if (!isRegistered) {
    console.warn(
      `[Route Audit Warning] ⚠️ Sidebar navigation attempted to link to an unregistered route: "${route}".\n` +
      `Please register this route in src/routes/admin.ts and create the corresponding page component.`
    );
  }

  return isRegistered;
}
