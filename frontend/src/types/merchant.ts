export interface OrderItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStageStatus = 
  | 'PAYMENT_RECEIVED'
  | 'PENDING_CONFIRMATION'
  | 'ACCEPTED'
  | 'PICKING'
  | 'PROCESSING'
  | 'PACKED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP_BY_COURIER'
  | 'IN_TRANSIT'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TimelineCheckpoint {
  status: string;
  time: string;
  location: string;
  completed: boolean;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  code: string;
  prefix: string;
  sla: string;
  rating: number;
  status: string;
  tracking_base_url: string;
  active_shipments?: number;
}

export interface MerchantOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  currency: string;
  payment_status: 'PAID' | 'PENDING' | 'REFUNDED';
  order_status: OrderStageStatus;
  status?: string; // backwards compatibility
  delivery_partner?: string | null;
  awb_number?: string | null;
  tracking_id?: string | null;
  current_location?: string | null;
  estimated_delivery?: string | null;
  timeline?: TimelineCheckpoint[];
  payment_id?: string;
  payment_method?: string;
  reconciled: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerPreferences {
  favourite_categories: string[];
  preferred_payment: string;
  city?: string;
  buying_frequency?: string;
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
  pending_orders?: number;
  ready_for_pickup?: number;
  active_shipments?: number;
  total_products: number;
  total_customers?: number;
  conversion_rate_pct: number;
  customer_growth_pct: number;
  average_order_value: number;
  recent_orders: MerchantOrder[];
  revenue_trend: Array<{ date: string; revenue: number; orders: number }>;
}
