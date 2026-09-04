import { Product } from './commerce';
import { MerchantOrder, TimelineCheckpoint } from './merchant';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  default_address: string;
  saved_addresses: Array<{
    id: string;
    label: string;
    address: string;
    city: string;
    pincode: string;
    is_default: boolean;
  }>;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
  added_at: string;
  in_stock: boolean;
  price_drop_alert?: boolean;
}

export interface CustomerOrderTracking {
  order_id: string;
  order_number: string;
  customer_name: string;
  courier_name: string;
  courier_code: string;
  tracking_id: string;
  order_status: string;
  estimated_delivery: string;
  shipping_address: string;
  timeline: TimelineCheckpoint[];
  items: Array<{
    sku: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  total_amount: number;
}
