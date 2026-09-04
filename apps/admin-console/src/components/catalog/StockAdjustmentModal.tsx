'use client';

import React, { useState } from 'react';
import { CatalogProduct } from '@/types/catalog';
import { 
  X, 
  Sliders, 
  Save, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct | null;
  onConfirm: (productId: string, quantity: number, adjustmentType: 'set' | 'increment' | 'decrement') => void;
  isSaving: boolean;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  isSaving,
}: StockAdjustmentModalProps) {
  if (!isOpen || !product) return null;

  const [mode, setMode] = useState<'set' | 'increment' | 'decrement'>('set');
  const [qtyInput, setQtyInput] = useState<number>(product.stock_quantity);

  const calculateProjectedStock = () => {
    if (mode === 'increment') return product.stock_quantity + (qtyInput || 0);
    if (mode === 'decrement') return Math.max(0, product.stock_quantity - (qtyInput || 0));
    return Math.max(0, qtyInput || 0);
  };

  const projected = calculateProjectedStock();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(product.id, qtyInput, mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#072654] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-[#0B72E7]">
              <Sliders className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Adjust Inventory Stock
              </h3>
              <p className="text-xs text-blue-200/80 line-clamp-1">
                {product.name}
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Current Stock Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">SKU: {product.sku}</span>
              <span className="font-bold text-slate-800">Current Stock:</span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-[#072654]">
                {product.stock_quantity} units
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Reorder @ {product.reorder_threshold} units
              </span>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('set'); setQtyInput(product.stock_quantity); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'set' ? 'bg-white text-[#0B72E7] shadow-xs' : 'text-slate-600'
              }`}
            >
              Set Exact
            </button>
            <button
              type="button"
              onClick={() => { setMode('increment'); setQtyInput(10); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'increment' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              + Restock
            </button>
            <button
              type="button"
              onClick={() => { setMode('decrement'); setQtyInput(5); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'decrement' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              - Deduct
            </button>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {mode === 'set' ? 'New Exact Stock Level' : mode === 'increment' ? 'Units to Add (+)' : 'Units to Deduct (-)'}
            </label>
            <Input
              type="number"
              min="0"
              required
              value={qtyInput}
              onChange={(e) => setQtyInput(parseInt(e.target.value) || 0)}
              className="h-11 text-base font-extrabold text-center rounded-xl"
            />
          </div>

          {/* Projected Outcome */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Projected Final Stock:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-[#0B72E7]">
                {projected} units
              </span>
              {projected <= product.reorder_threshold && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                  Low
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              className="h-10 px-4 bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-xl gap-1.5 shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Confirm Stock Adjustment</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
