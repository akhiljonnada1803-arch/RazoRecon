'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CatalogProduct, PriceTier } from '@/types/catalog';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Percent, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Calculator,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface VolumeTierPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct | null;
  onSave: (productId: string, tiers: PriceTier[]) => Promise<void> | void;
  isSaving?: boolean;
}

export function VolumeTierPricingModal({
  isOpen,
  onClose,
  product,
  onSave,
  isSaving = false,
}: VolumeTierPricingModalProps) {
  if (!isOpen || !product) return null;

  // Clone tiers from product
  const [tiers, setTiers] = useState<PriceTier[]>([]);

  // Sub-modal for Add/Edit Tier
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null = add new, number = edit existing
  
  // Tier form state
  const [tierFormMin, setTierFormMin] = useState<number>(5);
  const [tierFormHasMax, setTierFormHasMax] = useState<boolean>(true);
  const [tierFormMax, setTierFormMax] = useState<number | null>(9);
  const [tierFormDiscount, setTierFormDiscount] = useState<number>(8.0);
  const [formError, setFormError] = useState<string | null>(null);

  // Interactive Simulator State
  const [simQuantity, setSimQuantity] = useState<number>(8);

  // Initialize tiers from product
  useEffect(() => {
    if (product) {
      if (product.price_tiers && Array.isArray(product.price_tiers)) {
        setTiers([...product.price_tiers]);
      } else if (product.price_tiers_json) {
        try {
          const parsed = JSON.parse(product.price_tiers_json);
          if (Array.isArray(parsed)) {
            setTiers(parsed);
          } else {
            setTiers([]);
          }
        } catch {
          setTiers([]);
        }
      } else {
        setTiers([]);
      }
    }
  }, [product]);

  // Sort tiers by min_qty
  const sortedTiers = useMemo(() => {
    return [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  }, [tiers]);

  // Validation function for a candidate tier against existing tiers
  const validateTier = (
    candidate: PriceTier,
    ignoreIndex: number | null
  ): { isValid: boolean; error?: string } => {
    // 1. Min quantity validation
    if (!candidate.min_qty || candidate.min_qty < 1) {
      return { isValid: false, error: 'Minimum quantity must be at least 1 unit.' };
    }

    // 2. Max quantity validation
    if (candidate.max_qty !== null && candidate.max_qty !== undefined) {
      if (candidate.max_qty <= candidate.min_qty) {
        return { 
          isValid: false, 
          error: `Maximum quantity (${candidate.max_qty}) must be strictly greater than minimum quantity (${candidate.min_qty}).` 
        };
      }
    }

    // 3. Discount percentage validation
    if (candidate.discount_pct < 0 || candidate.discount_pct > 100) {
      return { isValid: false, error: 'Discount percentage must be between 0% and 100%.' };
    }

    // 4. Overlapping tier validation
    const candMax = candidate.max_qty ?? Infinity;

    for (let i = 0; i < tiers.length; i++) {
      if (ignoreIndex !== null && i === ignoreIndex) continue;
      const existing = tiers[i];
      const existMax = existing.max_qty ?? Infinity;

      // Overlap condition: max(minA, minB) <= min(maxA, maxB)
      const overlapStart = Math.max(candidate.min_qty, existing.min_qty);
      const overlapEnd = Math.min(candMax, existMax);

      if (overlapStart <= overlapEnd) {
        const existLabel = existing.max_qty 
          ? `${existing.min_qty} - ${existing.max_qty} units`
          : `${existing.min_qty}+ units`;
        return {
          isValid: false,
          error: `Tier conflict: Quantity range overlaps with existing Tier (${existLabel}). Tiers must be mutually exclusive.`
        };
      }
    }

    return { isValid: true };
  };

  // Open Add Tier Form
  const handleOpenAddModal = () => {
    setEditingIndex(null);
    // Suggest a sensible next tier min_qty
    const lastTier = sortedTiers[sortedTiers.length - 1];
    let nextMin = 5;
    let nextMax: number | null = 9;
    let nextHasMax = true;
    let nextDiscount = 8;

    if (lastTier) {
      if (lastTier.max_qty !== null) {
        nextMin = lastTier.max_qty + 1;
        nextMax = nextMin + 4;
        nextDiscount = Math.min(100, Math.round(lastTier.discount_pct + 5));
      } else {
        // If last tier was unbounded, default to empty
        nextMin = 2;
        nextMax = 4;
        nextDiscount = 5;
      }
    }

    setTierFormMin(nextMin);
    setTierFormHasMax(nextHasMax);
    setTierFormMax(nextMax);
    setTierFormDiscount(nextDiscount);
    setFormError(null);
    setIsTierModalOpen(true);
  };

  // Open Edit Tier Form
  const handleOpenEditModal = (index: number) => {
    const tier = tiers[index];
    setEditingIndex(index);
    setTierFormMin(tier.min_qty);
    setTierFormHasMax(tier.max_qty !== null && tier.max_qty !== undefined);
    setTierFormMax(tier.max_qty ?? null);
    setTierFormDiscount(tier.discount_pct);
    setFormError(null);
    setIsTierModalOpen(true);
  };

  // Save Tier from Form
  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate: PriceTier = {
      min_qty: Number(tierFormMin),
      max_qty: tierFormHasMax && tierFormMax ? Number(tierFormMax) : null,
      discount_pct: Number(tierFormDiscount)
    };

    const validation = validateTier(candidate, editingIndex);
    if (!validation.isValid) {
      setFormError(validation.error || 'Validation failed');
      return;
    }

    let updated: PriceTier[];
    if (editingIndex !== null) {
      updated = [...tiers];
      updated[editingIndex] = candidate;
    } else {
      updated = [...tiers, candidate];
    }

    // Sort updated tiers by min_qty
    updated.sort((a, b) => a.min_qty - b.min_qty);
    setTiers(updated);
    setIsTierModalOpen(false);
  };

  // Delete a Tier
  const handleDeleteTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
  };

  // Reset to Recommended Enterprise Defaults (5-9 -> 8%, 10+ -> 15%)
  const handleResetDefaults = () => {
    setTiers([
      { min_qty: 5, max_qty: 9, discount_pct: 8.0 },
      { min_qty: 10, max_qty: null, discount_pct: 15.0 }
    ]);
  };

  // Save all tiers to backend
  const handleSaveAll = async () => {
    await onSave(product.id, sortedTiers);
    onClose();
  };

  // ---------------------------------------------------------------------------
  // LIVE PRICE SIMULATOR CALCULATIONS
  // ---------------------------------------------------------------------------
  const unitPrice = product.price;

  // Find matching tier for simQuantity
  const activeSimTier = useMemo(() => {
    if (simQuantity <= 0) return null;
    return sortedTiers.find(t => 
      simQuantity >= t.min_qty && (t.max_qty === null || simQuantity <= t.max_qty)
    ) || null;
  }, [sortedTiers, simQuantity]);

  const simDiscountPct = activeSimTier ? activeSimTier.discount_pct : 0;
  const simOriginalSubtotal = Math.round(unitPrice * simQuantity * 100) / 100;
  const simDiscountAmount = Math.round(simOriginalSubtotal * (simDiscountPct / 100) * 100) / 100;
  const simEffectiveSubtotal = Math.round((simOriginalSubtotal - simDiscountAmount) * 100) / 100;
  const simEffectiveUnitPrice = simQuantity > 0 
    ? Math.round((simEffectiveSubtotal / simQuantity) * 100) / 100 
    : unitPrice;
  const simEmbeddedGst = Math.round((simEffectiveSubtotal - (simEffectiveSubtotal / (1 + (product.gst_rate_pct / 100)))) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-[#072654] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-[#0B72E7] border border-blue-400/30">
              <Layers className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">
                  Volume Tier Pricing Management
                </h3>
                <Badge className="bg-blue-600/50 text-blue-100 border border-blue-400/40 text-[10px] font-mono">
                  B2B WHOLESALE
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure tiered quantity discounts and automatic bulk price breaks for AI agents and enterprise buyers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PRODUCT BANNER */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{product.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {product.sku}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{product.category}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600">
                  Stock: <strong className="text-slate-800 font-bold">{product.stock_quantity} units</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Base Selling Price
            </div>
            <div className="text-base font-extrabold text-[#072654]">
              ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              Inclusive of {product.gst_rate_pct}% GST
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* 1. VOLUME TIERS TABLE VIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Configured Pricing Tiers</span>
                  <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-[#0B72E7] border-blue-200">
                    {tiers.length} {tiers.length === 1 ? 'Tier' : 'Tiers'} Active
                  </Badge>
                </h4>
                <p className="text-xs text-slate-500">
                  Purchases within these quantity bounds will automatically receive the matching discounted rate.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaults}
                  className="h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-100 gap-1.5"
                  title="Reset to recommended standard tiers (5-9 -> 8%, 10+ -> 15%)"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Use Standard Defaults</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleOpenAddModal}
                  className="h-8 text-xs bg-[#0B72E7] hover:bg-blue-600 text-white gap-1.5 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Tier</span>
                </Button>
              </div>
            </div>

            {/* TABLE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3 pl-4">Tier</th>
                    <th className="p-3">Quantity Range</th>
                    <th className="p-3 text-center">Discount %</th>
                    <th className="p-3 text-right">Effective Unit Price</th>
                    <th className="p-3 text-right">Savings / Unit</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* BASELINE ROW (1 to Min-1) */}
                  <tr className="bg-slate-50/50 text-slate-600 italic">
                    <td className="p-3 pl-4 font-semibold text-slate-500">Baseline</td>
                    <td className="p-3 font-medium text-slate-700 not-italic">
                      {sortedTiers.length > 0 && sortedTiers[0].min_qty > 1
                        ? `1 - ${sortedTiers[0].min_qty - 1} units`
                        : '1 unit (Standard)'}
                    </td>
                    <td className="p-3 text-center not-italic">
                      <span className="text-slate-400 font-medium">0.0%</span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800 not-italic">
                      ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-slate-400 not-italic">
                      —
                    </td>
                    <td className="p-3 pr-4 text-right text-slate-400 text-[10px]">
                      Default Price
                    </td>
                  </tr>

                  {sortedTiers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-600 text-xs">No Volume Tiers Configured</p>
                          <p className="text-[11px] text-slate-400">
                            Click <strong>Add Tier</strong> or <strong>Use Standard Defaults</strong> to incentivize bulk orders.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedTiers.map((tier, idx) => {
                      const effUnitPrice = Math.round(unitPrice * (1 - tier.discount_pct / 100) * 100) / 100;
                      const savings = Math.round((unitPrice - effUnitPrice) * 100) / 100;
                      const originalIndex = tiers.findIndex(
                        t => t.min_qty === tier.min_qty && t.max_qty === tier.max_qty && t.discount_pct === tier.discount_pct
                      );

                      return (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-3 pl-4">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-bold">
                              Tier {idx + 1}
                            </Badge>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {tier.max_qty !== null ? (
                              <span>{tier.min_qty} – {tier.max_qty} units</span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-indigo-700">
                                {tier.min_qty}+ units
                                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-indigo-50 border-indigo-200">
                                  Unbounded
                                </Badge>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[11px] font-extrabold border">
                              {tier.discount_pct}% OFF
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-extrabold text-sm text-[#072654]">
                              ₹{effUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            Save ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditModal(originalIndex)}
                                className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                title="Edit Tier Range"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTier(originalIndex)}
                                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Remove Tier"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. LIVE PRICE PREVIEW MATRIX & SIMULATOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PROGRESSION MATRIX */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Live Price Progression Schedule
                </h5>
              </div>
              <div className="space-y-1.5 text-xs">
                {/* Baseline */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                  <span className="font-medium text-slate-600">
                    {sortedTiers.length > 0 && sortedTiers[0].min_qty > 1
                      ? `1 - ${sortedTiers[0].min_qty - 1} units`
                      : '1 unit'}
                  </span>
                  <span className="text-slate-400">No discount</span>
                  <strong className="text-slate-800 font-extrabold">
                    ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / unit
                  </strong>
                </div>

                {sortedTiers.map((t, i) => {
                  const eff = Math.round(unitPrice * (1 - t.discount_pct / 100) * 100) / 100;
                  return (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-200/60"
                    >
                      <span className="font-bold text-slate-800">
                        {t.max_qty !== null ? `${t.min_qty} - ${t.max_qty} units` : `${t.min_qty}+ units`}
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                        {t.discount_pct}% off
                      </span>
                      <strong className="text-emerald-900 font-extrabold">
                        ₹{eff.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / unit
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE QUANTITY SIMULATOR */}
            <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-[#0B72E7]" />
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Interactive Order Simulator
                  </h5>
                </div>
                <span className="text-[11px] text-slate-500">Test volume discounts</span>
              </div>

              {/* Quantity input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Purchased Quantity:</span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={simQuantity}
                      onChange={(e) => setSimQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-7 text-xs font-bold text-center bg-white border-blue-300"
                    />
                    <span className="text-xs font-bold text-slate-700">units</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={Math.max(30, (sortedTiers[sortedTiers.length - 1]?.max_qty || 25) + 5)}
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-[#0B72E7]"
                />
              </div>

              {/* SIMULATION RESULTS */}
              <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Matched Tier:</span>
                  {activeSimTier ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                      {activeSimTier.discount_pct}% Volume Discount ({activeSimTier.min_qty}{activeSimTier.max_qty ? `-${activeSimTier.max_qty}` : '+'} units)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[10px]">
                      Standard Baseline (0% off)
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Effective Unit Price:</span>
                  <span className="font-extrabold text-[#072654]">
                    ₹{simEffectiveUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Subtotal:</span>
                  <span className="font-bold text-slate-800">
                    ₹{simEffectiveSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="font-semibold text-emerald-700">Total Bulk Savings:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    ₹{simDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Embedded GST (18% ITC):</span>
                  <span>₹{simEmbeddedGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-4 w-4 text-[#0B72E7]" />
            <span>AI Autonomous Agents query these tiers to optimize checkout quantities for clients.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs text-slate-600 border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="text-xs bg-[#072654] hover:bg-[#0b336d] text-white gap-1.5 shadow-sm font-bold px-5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Volume Tiers'}</span>
            </Button>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* SUB-MODAL: ADD / EDIT TIER FORM DIALOG */}
      {/* =================================================================== */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* SUB-MODAL HEADER */}
            <div className="px-5 py-4 bg-[#072654] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-300" />
                <h4 className="font-bold text-sm">
                  {editingIndex !== null ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}
                </h4>
              </div>
              <button
                onClick={() => setIsTierModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* SUB-MODAL FORM */}
            <form onSubmit={handleSaveTier} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Minimum Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Minimum Quantity (min_qty) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={tierFormMin}
                  onChange={(e) => setTierFormMin(parseInt(e.target.value) || 1)}
                  required
                  className="text-xs font-semibold"
                  placeholder="e.g. 5"
                />
                <p className="text-[10px] text-slate-400">
                  The tier kicks in when the cart contains at least this many units.
                </p>
              </div>

              {/* Upper Limit Toggle & Max Qty */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Has Upper Limit (max_qty)?
                  </label>
                  <input
                    type="checkbox"
                    checked={tierFormHasMax}
                    onChange={(e) => {
                      setTierFormHasMax(e.target.checked);
                      if (!e.target.checked) setTierFormMax(null);
                      else if (!tierFormMax) setTierFormMax(tierFormMin + 4);
                    }}
                    className="h-4 w-4 rounded text-[#0B72E7] border-slate-300 focus:ring-blue-500"
                  />
                </div>

                {tierFormHasMax ? (
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min={tierFormMin + 1}
                      value={tierFormMax ?? ''}
                      onChange={(e) => setTierFormMax(e.target.value ? parseInt(e.target.value) : null)}
                      required={tierFormHasMax}
                      className="text-xs font-semibold"
                      placeholder={`e.g. ${tierFormMin + 4}`}
                    />
                    <p className="text-[10px] text-slate-400">
                      Tier applies up to this quantity (must be strictly greater than {tierFormMin}).
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-indigo-50/60 border border-indigo-200/70 rounded-xl text-xs text-indigo-800 flex items-center gap-2 font-medium">
                    <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Unbounded upper limit (e.g. {tierFormMin}+ units without ceiling).</span>
                  </div>
                )}
              </div>

              {/* Discount Percentage */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Discount Percentage (discount_pct) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-extrabold text-emerald-600 font-mono">
                    {tierFormDiscount}% OFF
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={tierFormDiscount}
                    onChange={(e) => setTierFormDiscount(parseFloat(e.target.value) || 0)}
                    required
                    className="text-xs font-bold text-right"
                    placeholder="e.g. 8.0"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={0.5}
                  value={tierFormDiscount}
                  onChange={(e) => setTierFormDiscount(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-1"
                />
              </div>

              {/* LIVE PREVIEW FOR THIS CANDIDATE TIER */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="text-[11px] font-bold text-slate-600">Calculated Rate Preview:</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Unit Price with {tierFormDiscount}% discount:</span>
                  <span className="font-extrabold text-[#072654]">
                    ₹{(Math.round(unitPrice * (1 - tierFormDiscount / 100) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Unit Savings:</span>
                  <span className="font-bold">
                    ₹{(Math.round(unitPrice * (tierFormDiscount / 100) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / unit
                  </span>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTierModalOpen(false)}
                  className="text-xs text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-[#0B72E7] hover:bg-blue-600 text-white font-bold"
                >
                  {editingIndex !== null ? 'Save Changes' : 'Add Pricing Tier'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
