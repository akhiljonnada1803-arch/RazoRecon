'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, ProductStats, ProductListResponse } from '@/types/commerce';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Tag, 
  DollarSign, 
  Layers, 
  ArrowUpDown,
  Download,
  Code
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MerchantCatalogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for add/edit product
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Payment Terminals',
    price: 9999,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=500&auto=format&fit=crop&q=60',
    key_features: 'Fast Thermal Printer, 4G Dual SIM, All Cards Accepted',
    active_offer: 'BESTSELLER'
  });

  const { data: catalogData, isLoading } = useQuery<ProductListResponse>({
    queryKey: ['merchant', 'catalog', selectedCategory, search],
    queryFn: () => {
      const categoryParam = selectedCategory !== 'ALL' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      return apiClient.get(`/products?limit=100${categoryParam}${searchParam}`);
    },
  });

  const { data: stats } = useQuery<ProductStats>({
    queryKey: ['merchant', 'catalog', 'stats'],
    queryFn: () => apiClient.get('/products/stats'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'catalog'] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingProduct) {
        return apiClient.put(`/products/${editingProduct.id}`, payload);
      } else {
        return apiClient.post('/products', payload);
      }
    },
    onSuccess: () => {
      setIsAddModalOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'catalog'] });
    }
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Payment Terminals',
      price: 9999,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=500&auto=format&fit=crop&q=60',
      key_features: 'Fast Thermal Printer, 4G Dual SIM, All Cards Accepted',
      active_offer: 'BESTSELLER'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock ?? 50,
      image_url: p.image_url,
      key_features: p.key_features ? p.key_features.join(', ') : '',
      active_offer: p.active_offer || 'BESTSELLER'
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      image_url: formData.image_url,
      key_features: formData.key_features.split(',').map((s) => s.trim()).filter(Boolean),
      active_offer: formData.active_offer,
    };
    saveMutation.mutate(payload);
  };

  const products = catalogData?.items || [];
  const categories = stats?.categories || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Package className="w-3.5 h-3.5 mr-1" />
                Merchant Product Management
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Code className="w-3.5 h-3.5 mr-1" />
                AI-Readable JSON APIs Active
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Catalog & Inventory Matrix
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Manage product pricing, real-time inventory thresholds, category taxonomies, and AI-readable schemas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 text-[#0B72E7]" />
              Add Product SKU
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Catalog Items</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {stats?.total_products || products.length || 50}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Active in Commerce Agent</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Catalog Valuation</span>
          <div className="text-2xl font-extrabold text-[#0B72E7] font-mono">
            ₹{stats?.total_valuation_inr ? stats.total_valuation_inr.toLocaleString('en-IN') : '18,45,000'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">18% GST Eligible</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">In-Stock Rate</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {stats?.in_stock_rate_pct || 96.0}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Healthy Inventory Buffer</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Active Offer Rules</span>
          <div className="text-2xl font-extrabold text-purple-600 font-mono">
            {stats?.active_offers_count || 8}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Promotional Discounts Live</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products by name, SKU, or specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0B72E7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({stats?.total_products || 50})
            </button>
            {categories.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === c.name
                    ? 'bg-[#0B72E7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product Name & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (₹ INR)</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p: Product) => {
                const stock = p.stock ?? 0;
                const isOutOfStock = stock === 0;
                const isLowStock = stock > 0 && stock < 15;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-semibold">
                        {p.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 font-mono">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isOutOfStock ? (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                          OUT OF STOCK
                        </Badge>
                      ) : isLowStock ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                          LOW STOCK
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                          IN STOCK
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-[#0B72E7] hover:bg-blue-50"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? 'Edit Product SKU' : 'Add New Product to Catalog'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="h-7 w-7 p-0 rounded-lg"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Razorpay Android POS Terminal Pro"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white"
                  >
                    <option value="Payment Terminals">Payment Terminals</option>
                    <option value="Soundboxes">Soundboxes</option>
                    <option value="FinOps Software">FinOps Software</option>
                    <option value="Workstations">Workstations</option>
                    <option value="Security">Security</option>
                    <option value="Storage">Storage</option>
                    <option value="Retail Peripherals">Retail Peripherals</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <Input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Units</label>
                  <Input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Active Offer Badge</label>
                  <Input
                    value={formData.active_offer}
                    onChange={(e) => setFormData({ ...formData, active_offer: e.target.value })}
                    placeholder="e.g. BESTSELLER, FESTIVE15"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Features (comma separated)</label>
                <Input
                  value={formData.key_features}
                  onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                  placeholder="Thermal printer, 4G Dual SIM, All Cards"
                  className="rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white font-bold"
                >
                  Save Product SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
