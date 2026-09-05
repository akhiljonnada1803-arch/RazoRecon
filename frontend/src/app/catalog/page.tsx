'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  CatalogProduct, 
  ProductFormData, 
  CatalogStats, 
  ProductListResponse,
  PriceTier
} from '@/types/catalog';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { CatalogSummarySections } from '@/components/catalog/CatalogSummarySections';
import { CatalogFilterBar } from '@/components/catalog/CatalogFilterBar';
import { CatalogTable } from '@/components/catalog/CatalogTable';
import { CatalogGrid } from '@/components/catalog/CatalogGrid';
import { ProductFormModal } from '@/components/catalog/ProductFormModal';
import { StockAdjustmentModal } from '@/components/catalog/StockAdjustmentModal';
import { AICatalogViewModal } from '@/components/catalog/AICatalogViewModal';
import { VolumeTierPricingModal } from '@/components/catalog/VolumeTierPricingModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CatalogManagementPage() {
  const queryClient = useQueryClient();

  // State Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<CatalogProduct | null>(null);
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [volumeModalProduct, setVolumeModalProduct] = useState<CatalogProduct | null>(null);
  const [isAISchemaOpen, setIsAISchemaOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Fetch Catalog Stats
  const { data: stats } = useQuery<CatalogStats>({
    queryKey: ['catalog-stats'],
    queryFn: () => apiClient.get('/catalog/stats'),
  });

  // 2. Fetch Filtered Catalog Products
  const { 
    data: catalogData, 
    isLoading, 
    error 
  } = useQuery<ProductListResponse>({
    queryKey: ['catalog-products', searchTerm, selectedCategory, stockStatus, sortBy, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (stockStatus && stockStatus !== 'all') params.append('stock_status', stockStatus);
      if (sortBy) params.append('sort_by', sortBy);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return apiClient.get(`/catalog?${params.toString()}`);
    },
  });

  // 3. Create/Update Product Mutation
  const saveProductMutation = useMutation({
    mutationFn: (formData: ProductFormData) => {
      if (selectedProduct) {
        return apiClient.put(`/catalog/${selectedProduct.id}`, formData);
      } else {
        return apiClient.post('/catalog', formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-ai-context'] });
      queryClient.invalidateQueries({ queryKey: ['commerce-products'] });
      setIsFormOpen(false);
      setSelectedProduct(null);
      showToast(selectedProduct ? 'Product SKU successfully updated!' : 'New product SKU added to catalog!');
    }
  });

  // 4. Stock Adjustment Mutation
  const stockMutation = useMutation({
    mutationFn: ({ productId, quantity, adjustmentType }: { productId: string; quantity: number; adjustmentType: string }) => {
      return apiClient.patch(`/catalog/${productId}/stock`, {
        quantity,
        adjustment_type: adjustmentType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-ai-context'] });
      setIsStockModalOpen(false);
      setStockModalProduct(null);
      showToast('Inventory stock level updated successfully!');
    }
  });

  // 5. Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => apiClient.delete(`/catalog/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-ai-context'] });
      showToast('Product successfully removed from catalog.');
    }
  });

  // 6. Volume Tier Pricing Mutation
  const saveVolumeTiersMutation = useMutation({
    mutationFn: ({ productId, tiers }: { productId: string; tiers: PriceTier[] }) => {
      return apiClient.put(`/catalog/${productId}`, {
        price_tiers: tiers
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-ai-context'] });
      queryClient.invalidateQueries({ queryKey: ['commerce-products'] });
      setIsVolumeModalOpen(false);
      setVolumeModalProduct(null);
      showToast('Volume tier pricing rules saved successfully!');
    }
  });

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (prod: CatalogProduct) => {
    setSelectedProduct(prod);
    setIsFormOpen(true);
  };

  const handleDelete = (prod: CatalogProduct) => {
    if (confirm(`Are you sure you want to delete SKU "${prod.sku}" (${prod.name}) from the catalog?`)) {
      deleteMutation.mutate(prod.id);
    }
  };

  const handleAdjustStock = (prod: CatalogProduct) => {
    setStockModalProduct(prod);
    setIsStockModalOpen(true);
  };

  const handleManageVolumeTiers = (prod: CatalogProduct) => {
    setVolumeModalProduct(prod);
    setIsVolumeModalOpen(true);
  };

  const products = catalogData?.products || [];
  const categories = catalogData?.categories || [];
  const totalCount = catalogData?.total_count || 0;
  const totalPages = catalogData?.total_pages || 1;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#072654] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-500/30 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <section>
        <CatalogHeader
          stats={stats}
          onAddNewProduct={handleAddNew}
          onOpenAISchema={() => setIsAISchemaOpen(true)}
        />
      </section>

      {/* 4 Distinct Requested Sections: Total Products, Categories, Inventory Status, AI Readable Catalog */}
      <section>
        <CatalogSummarySections
          stats={stats}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => { setSelectedCategory(cat); setPage(1); }}
          onOpenAISchema={() => setIsAISchemaOpen(true)}
        />
      </section>

      {/* Search & Stock Filter Bar */}
      <section>
        <CatalogFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => { setSelectedCategory(cat); setPage(1); }}
          stockStatus={stockStatus}
          onSelectStockStatus={(status) => { setStockStatus(status); setPage(1); }}
          searchTerm={searchTerm}
          onSearchChange={(term) => { setSearchTerm(term); setPage(1); }}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          totalResults={totalCount}
        />
      </section>

      {/* Products Table with Columns: Product, Price, Stock, Category, Offer */}
      <section>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px] text-slate-500 text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-3 border-[#0B72E7] border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-slate-600">Loading catalog inventory & offer engines...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive bg-rose-50 border border-rose-200 rounded-2xl max-w-lg mx-auto shadow-xs">
            <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
            Failed to load catalog products. Please check that the backend is running.
          </div>
        ) : viewMode === 'table' ? (
          <CatalogTable
            products={products}
            onEditProduct={handleEdit}
            onDeleteProduct={handleDelete}
            onAdjustStock={handleAdjustStock}
            onViewProduct={handleEdit}
            onManageVolumeTiers={handleManageVolumeTiers}
          />
        ) : (
          <CatalogGrid
            products={products}
            onEditProduct={handleEdit}
            onDeleteProduct={handleDelete}
            onAdjustStock={handleAdjustStock}
            onViewProduct={handleEdit}
            onManageVolumeTiers={handleManageVolumeTiers}
          />
        )}
      </section>

      {/* Pagination Footer */}
      {totalCount > limit && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{(page - 1) * limit + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(page * limit, totalCount)}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> products
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs rounded-xl"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 text-xs rounded-xl"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onSubmit={(data) => saveProductMutation.mutate(data)}
        isSaving={saveProductMutation.isPending}
      />

      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => { setIsStockModalOpen(false); setStockModalProduct(null); }}
        product={stockModalProduct}
        onConfirm={(productId, qty, type) => 
          stockMutation.mutate({ productId, quantity: qty, adjustmentType: type })
        }
        isSaving={stockMutation.isPending}
      />

      <AICatalogViewModal
        isOpen={isAISchemaOpen}
        onClose={() => setIsAISchemaOpen(false)}
      />

      <VolumeTierPricingModal
        isOpen={isVolumeModalOpen}
        onClose={() => {
          setIsVolumeModalOpen(false);
          setVolumeModalProduct(null);
        }}
        product={volumeModalProduct}
        onSave={async (productId, tiers) => {
          await saveVolumeTiersMutation.mutateAsync({ productId, tiers });
        }}
        isSaving={saveVolumeTiersMutation.isPending}
      />
    </div>
  );
}
