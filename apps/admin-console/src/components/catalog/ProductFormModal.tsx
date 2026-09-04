'use client';

import React, { useState, useEffect } from 'react';
import { CatalogProduct, ProductFormData, ProductSpec } from '@/types/catalog';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  Package, 
  ShieldCheck,
  Tag,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: CatalogProduct | null;
  onSubmit: (data: ProductFormData) => void;
  isSaving: boolean;
}

const CATEGORIES_LIST = [
  'Payment Terminals',
  'Payment Audio Alerts',
  'FinOps Software',
  'Workstations & Peripherals',
  'Security & Access Tokens',
  'Storage & Servers',
  'Retail Peripherals',
];

const PRESET_OFFERS = [
  { label: 'None', text: '', badge: '', discount: 0 },
  { label: '10% Off with RAZOR2026', text: '10% Off with RAZOR2026', badge: 'BESTSELLER', discount: 10.0 },
  { label: '15% Seasonal Discount (FESTIVE15)', text: '15% Seasonal Hardware Discount', badge: 'FESTIVE SALE', discount: 15.0 },
  { label: 'Flat ₹5,000 Annual Rebate (ENTERPRISE5000)', text: 'Flat ₹5,000 Annual License Rebate', badge: 'ENTERPRISE', discount: 10.0 },
  { label: '12% Pro Fleet Deal (MODELDOCK12)', text: '12% Workstation Fleet Bundle', badge: 'PRO WORKSTATION', discount: 12.0 },
  { label: '20% Compliance Deal (COMPLIANCE20)', text: '20% Security & Archive Storage Rebate', badge: 'COMPLIANCE DEAL', discount: 20.0 },
];

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  isSaving,
}: ProductFormModalProps) {
  const isEditing = !!product;

  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    brand: 'Razorpay Hardware',
    category: 'Payment Terminals',
    price: 9999,
    cost_price: 6999,
    original_price: 11999,
    stock_quantity: 50,
    reorder_threshold: 10,
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80',
    tagline: '',
    description: '',
    features: ['High durability casing', 'Instant cloud sync'],
    specs: [{ key: 'Warranty', value: '1 Year Comprehensive' }],
    delivery_time: '2-3 business days',
    gst_rate_pct: 18.0,
    hsn_sac_code: '84705010',
    offer_text: '10% Off with RAZOR2026',
    offer_badge: 'BESTSELLER',
    offer_discount_pct: 10.0
  });

  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        cost_price: product.cost_price,
        original_price: product.original_price,
        stock_quantity: product.stock_quantity,
        reorder_threshold: product.reorder_threshold,
        image_url: product.image_url,
        tagline: product.tagline,
        description: product.description,
        features: product.features || [],
        specs: product.specs || [],
        delivery_time: product.delivery_time,
        gst_rate_pct: product.gst_rate_pct,
        hsn_sac_code: product.hsn_sac_code,
        offer_id: product.offer_id,
        offer_text: product.offer_text || '',
        offer_badge: product.offer_badge || '',
        offer_discount_pct: product.offer_discount_pct || 0
      });
    } else {
      setFormData({
        sku: `RZP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name: '',
        brand: 'Razorpay Hardware',
        category: 'Payment Terminals',
        price: 9999,
        cost_price: 6999,
        original_price: 11999,
        stock_quantity: 50,
        reorder_threshold: 10,
        image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80',
        tagline: '',
        description: '',
        features: ['High durability casing', 'Instant cloud sync'],
        specs: [{ key: 'Warranty', value: '1 Year Comprehensive' }],
        delivery_time: '2-3 business days',
        gst_rate_pct: 18.0,
        hsn_sac_code: '84705010',
        offer_text: '10% Off with RAZOR2026',
        offer_badge: 'BESTSELLER',
        offer_discount_pct: 10.0
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature.trim()]
    }));
    setNewFeature('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { key: newSpecKey.trim(), value: newSpecVal.trim() }]
    }));
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#072654] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-[#0B72E7]">
              <Package className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? `Edit Product: ${product.name}` : 'Add New Product SKU'}
              </h3>
              <p className="text-xs text-blue-200/80">
                Configure pricing, stock thresholds, specs, and Offer Engine discounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Basic Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Product Name *</label>
              <Input
                required
                placeholder="e.g. Razorpay Smart POS Terminal V4"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">SKU Code *</label>
              <Input
                required
                placeholder="RZP-POS-V4"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="h-10 text-xs font-mono uppercase rounded-xl"
              />
            </div>
          </div>

          {/* Row 2: Category, Brand & HSN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#0B72E7]"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Brand *</label>
              <Input
                required
                placeholder="e.g. Razorpay Hardware"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">HSN / SAC Code</label>
              <Input
                placeholder="84705010"
                value={formData.hsn_sac_code}
                onChange={(e) => setFormData({ ...formData, hsn_sac_code: e.target.value })}
                className="h-10 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Row 3: Pricing & Cost */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#072654]">Selling Price (₹) *</label>
              <Input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="h-10 text-xs font-bold bg-white rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Cost Price (₹)</label>
              <Input
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                className="h-10 text-xs bg-white rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Original / MRP (₹)</label>
              <Input
                type="number"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                className="h-10 text-xs bg-white rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">GST Rate (%)</label>
              <Input
                type="number"
                value={formData.gst_rate_pct}
                onChange={(e) => setFormData({ ...formData, gst_rate_pct: parseFloat(e.target.value) || 0 })}
                className="h-10 text-xs bg-white rounded-xl"
              />
            </div>
          </div>

          {/* Row 4: Offer Engine Integration */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Offer Engine & Promotional Discount
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold">Auto-Applied in Commerce</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Preset Template</label>
                <select
                  onChange={(e) => {
                    const found = PRESET_OFFERS.find((p) => p.text === e.target.value);
                    if (found) {
                      setFormData({
                        ...formData,
                        offer_text: found.text,
                        offer_badge: found.badge,
                        offer_discount_pct: found.discount
                      });
                    }
                  }}
                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="">Choose preset offer...</option>
                  {PRESET_OFFERS.map((po, idx) => (
                    <option key={idx} value={po.text}>{po.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Offer Badge</label>
                <Input
                  placeholder="e.g. BESTSELLER, FESTIVE SALE"
                  value={formData.offer_badge || ''}
                  onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                  className="h-9 text-xs bg-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Discount %</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.offer_discount_pct || 0}
                  onChange={(e) => setFormData({ ...formData, offer_discount_pct: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-xs bg-white rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Offer Description Text</label>
              <Input
                placeholder="e.g. 10% Off with RAZOR2026 promo code"
                value={formData.offer_text || ''}
                onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
                className="h-9 text-xs bg-white rounded-xl"
              />
            </div>
          </div>

          {/* Row 5: Stock Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Initial Stock Units *</label>
              <Input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reorder Threshold *</label>
              <Input
                type="number"
                required
                value={formData.reorder_threshold}
                onChange={(e) => setFormData({ ...formData, reorder_threshold: parseInt(e.target.value) || 0 })}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Delivery SLA</label>
              <Input
                placeholder="1-2 business days"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Row 6: Tagline & Description */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tagline / Short Summary *</label>
              <Input
                required
                placeholder="e.g. Next-gen all-in-one smart Android POS terminal with dual displays"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Description</label>
              <textarea
                rows={3}
                placeholder="Detailed technical description for product brochure & AI copilot inquiries..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#0B72E7]"
              />
            </div>
          </div>

          {/* Row 7: Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Product Image URL</label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Key Features List Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Key Features</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add key feature bullet point..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="h-9 text-xs flex-1 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
                className="h-9 text-xs rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.features.map((feat, idx) => (
                <div key={idx} className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] text-slate-700 flex items-center gap-1.5 border border-slate-200">
                  <span>{feat}</span>
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-slate-400 hover:text-rose-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs Key-Value Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Technical Specifications</label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input
                placeholder="Spec Key (e.g. Battery)"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="h-9 text-xs md:col-span-2 rounded-xl"
              />
              <Input
                placeholder="Value (e.g. 5200mAh)"
                value={newSpecVal}
                onChange={(e) => setNewSpecVal(e.target.value)}
                className="h-9 text-xs md:col-span-2 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpec}
                className="h-9 text-xs rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Spec
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {formData.specs.map((s, idx) => (
                <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-700">{s.key}: </span>
                    <span className="text-slate-600">{s.value}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveSpec(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 px-5 bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-xl gap-2 shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product SKU'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
