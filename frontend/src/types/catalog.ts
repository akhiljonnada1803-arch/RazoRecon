export interface ProductSpec {
  key: string;
  value: string;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  cost_price: number;
  original_price?: number;
  currency: string;
  stock_quantity: number;
  reorder_threshold: number;
  stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  rating: number;
  reviews_count: number;
  image_url: string;
  tagline: string;
  description: string;
  features: string[];
  specs: ProductSpec[];
  in_stock: boolean;
  delivery_time: string;
  gst_rate_pct: number;
  hsn_sac_code: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  sku?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  cost_price?: number;
  original_price?: number;
  stock_quantity: number;
  reorder_threshold: number;
  image_url?: string;
  tagline: string;
  description: string;
  features: string[];
  specs: ProductSpec[];
  delivery_time?: string;
  gst_rate_pct: number;
  hsn_sac_code?: string;
}

export interface CatalogStats {
  total_products: number;
  total_inventory_units: number;
  total_valuation_inr: number;
  low_stock_count: number;
  out_of_stock_count: number;
  in_stock_rate_pct: number;
  categories_count: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  total_units: number;
}

export interface ProductListResponse {
  products: CatalogProduct[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  categories: string[];
}

export interface AICatalogProductItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price_inr: number;
  stock_status: string;
  available_units: number;
  key_features: string[];
  specs_summary: Record<string, string>;
  gst_input_credit_pct: number;
}

export interface AICatalogContext {
  schema_version: string;
  platform: string;
  currency: string;
  last_synced: string;
  total_items: number;
  categories: string[];
  products: AICatalogProductItem[];
  instructions_for_llm: string;
}
