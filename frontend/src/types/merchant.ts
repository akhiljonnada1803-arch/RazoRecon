export interface OrderItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface MerchantOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  payment_id?: string;
  payment_method?: string;
  reconciled: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerPreferences {
  favourite_categories: string[];
  preferred_payment: string;
  buying_frequency: string;
  credit_limit: number;
}

export interface MerchantCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: string;
  lifetime_value: number;
  orders_count: number;
  average_order_value: number;
  preferences: CustomerPreferences;
  ai_insights: string;
  last_purchase_date?: string;
  created_at: string;
}

export interface MerchantDashboardMetrics {
  gross_revenue: number;
  total_orders: number;
  paid_orders: number;
  total_products: number;
  conversion_rate_pct: number;
  customer_growth_pct: number;
  average_order_value: number;
  recent_orders: MerchantOrder[];
  revenue_trend: Array<{ date: string; revenue: number; orders: number }>;
}
