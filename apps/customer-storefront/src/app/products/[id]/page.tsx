'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, CartItem, CartState } from '@/types/commerce';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { RazorpayMultiCheckoutModal } from '@/components/commerce/RazorpayMultiCheckoutModal';
import { AgentConfirmationModal } from '@/components/commerce/AgentConfirmationModal';
import { CustomerAuthModal } from '@/components/commerce/CustomerAuthModal';
import { ProductDetailSkeleton } from '@/components/common/SkeletonLoaders';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  Heart, 
  Share2, 
  CreditCard,
  Sparkles,
  Package,
  Layers,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const productId = params?.id as string;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [pincode, setPincode] = useState('560100');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [agentConfirmation, setAgentConfirmation] = useState<any | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Fetch customer AutoPay configuration
  const { data: autopayData } = useQuery({
    queryKey: ['customer-autopay'],
    queryFn: async () => {
      try {
        return await apiClient.get<any>('/customer/autopay');
      } catch (e) {
        return null;
      }
    },
    enabled: isAuthenticated,
  });

  const isAutoPayEnabled = Boolean(autopayData?.autopay_enabled && autopayData?.connected_payment_method);

  const handleBuyAutoPay = async (p: Product) => {
    if (!isAuthenticated) {
      setPendingProduct(p);
      setIsAuthModalOpen(true);
      return;
    }
    if (!isAutoPayEnabled) {
      router.push('/customer/autopay');
      return;
    }
    try {
      const res = await apiClient.post<any>('/customer/autopay/one-click-buy', {
        product_id: p.id,
        quantity: quantity
      });
      if (res?.confirmation) {
        setAgentConfirmation(res.confirmation);
        setIsConfirmationModalOpen(true);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'AutoPay purchase could not be completed.';
      alert(`⚠️ AutoPay Error: ${detail}`);
    }
  };

  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    delivery_fee: 0,
    platform_fee: 0,
    gst_included: 0,
    tax_gst: 0,
    shipping: 0,
    discount: 0,
    coupon_applied: null,
    total: 0,
    currency: 'INR'
  });

  // Fetch product detail
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/catalog/products/${productId}`);
      return res;
    },
    enabled: !!productId,
  });

  // Fetch related products
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: async () => {
      const cat = product?.category ? `?category=${encodeURIComponent(product.category)}&limit=4` : '?limit=4';
      const res = await apiClient.get<any>(`/catalog/products${cat}`);
      return res?.products || res?.items || [];
    },
    enabled: !!product,
  });

  const relatedProducts: Product[] = Array.isArray(relatedData) ? relatedData.filter((p) => p.id !== productId) : [];

  const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  const handleAddToCart = (p: Product, qty: number = 1) => {
    if (!isAuthenticated) {
      setPendingProduct(p);
      try {
        localStorage.setItem('razorcommerce_pending_item', JSON.stringify(p));
      } catch (e) {}
      setIsAuthModalOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.items.find((i) => i.product_id === p.id);
      let updatedItems: CartItem[];
      if (existing) {
        updatedItems = prev.items.map((i) =>
          i.product_id === p.id ? { ...i, quantity: i.quantity + qty } : i
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            product_id: p.id,
            name: p.name,
            price: p.price,
            quantity: qty,
            image_url: p.image_url,
            category: p.category,
            product: p
          }
        ];
      }
      const subtotal = round2(updatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0));
      const gst_included = round2(subtotal - subtotal / 1.18);
      return {
        ...prev,
        items: updatedItems,
        items_total: subtotal,
        subtotal,
        gst_included,
        tax_gst: gst_included,
        total: subtotal
      };
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = async (p: Product) => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem('razorcommerce_staged_buy_now', JSON.stringify(p));
      } catch (e) {}
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      localStorage.setItem('razorcommerce_staged_buy_now', JSON.stringify({
        product_id: p.id,
        name: p.name,
        price: p.price,
        quantity: quantity,
        image_url: p.image_url,
        sku: p.sku || `SKU-${p.id.toUpperCase()}`
      }));
      router.push('/checkout');
    } catch (e) {
      console.error(e);
      router.push('/checkout');
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product || error) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Product SKU Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been retired or moved.</p>
        <Link href="/products">
          <Button className="bg-[#0B72E7] text-white rounded-xl text-xs font-bold">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const galleryImages = [
    product.image_url,
    'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&auto=format&fit=crop&q=80'
  ];

  const stockQty = product.stock_quantity ?? product.stock ?? 50;
  const isOutOfStock = stockQty === 0;

  return (
    <div className="space-y-10 pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#0B72E7]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-[#0B72E7]">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#0B72E7]">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column (6 cols): Multi-Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-[440px] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative flex items-center justify-center p-6 group">
            <img
              src={galleryImages[selectedImageIdx] || product.image_url}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-[#072654] text-white font-bold text-[10px]">
                {product.category}
              </Badge>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`h-20 rounded-2xl border-2 overflow-hidden bg-slate-50 p-1 transition-all cursor-pointer ${
                  selectedImageIdx === idx ? 'border-[#0B72E7] shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 text-center text-xs">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#0B72E7] mx-auto" />
              <span className="font-bold text-slate-800 block text-[11px]">1 Year Warranty</span>
              <span className="text-[10px] text-slate-400">Manufacturer Assured</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="font-bold text-slate-800 block text-[11px]">Free Shipping</span>
              <span className="text-[10px] text-slate-400">Across All India Hubs</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto" />
              <span className="font-bold text-slate-800 block text-[11px]">7-Day Return</span>
              <span className="text-[10px] text-slate-400">Zero Question Policy</span>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Product Info, Pricing, Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0B72E7] uppercase tracking-wider font-mono">
              SKU: {product.sku || product.id.slice(0, 10).toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#072654] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span className="text-xs text-slate-500">
                {product.reviews_count || 142} Verified Buyer Reviews
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock ({stockQty} units)</span>
              </span>
            </div>
          </div>

          {/* Pricing Box (Amazon/Flipkart Style GST-Inclusive Architecture) */}
          {(() => {
            const sellingPrice = product.price;
            const mrp = product.original_price || Math.round(product.price * 1.25);
            const savings = Math.max(0, mrp - sellingPrice);
            const savingsPct = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;
            const basePrice = product.base_price || Math.round(sellingPrice / 1.18);
            const gstAmount = product.gst_amount || (sellingPrice - basePrice);

            return (
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-[#072654] font-mono">
                    ₹{sellingPrice.toLocaleString('en-IN')}
                  </span>
                  {mrp > sellingPrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                      M.R.P.: ₹{mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {savings > 0 && (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[11px]">
                      You Save: ₹{savings.toLocaleString('en-IN')} ({savingsPct}% OFF)
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] border-0 px-2 py-0.5">
                    Inclusive of GST
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Inclusive of all taxes
                  </span>
                </div>

                {/* Optional Expandable Price Breakdown Section */}
                <div className="pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-[#0B72E7] transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#0B72E7]" />
                      <span>Price Breakdown (Tax & Base Price Details)</span>
                    </span>
                    {showPriceBreakdown ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showPriceBreakdown && (
                    <div className="mt-2 p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs font-mono animate-in fade-in-50 duration-150">
                      <div className="flex justify-between text-slate-600">
                        <span>Base Price (Excl. GST):</span>
                        <span className="font-semibold text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST (18% ITC Eligible):</span>
                        <span className="font-semibold text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-100 text-xs">
                        <span>Final Selling Price:</span>
                        <span className="text-[#072654] font-extrabold text-sm">₹{sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[10px] font-sans text-emerald-700 pt-0.5 font-medium">
                        ✓ Registered GST Invoice with 100% Input Tax Credit provided upon order confirmation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Delivery Pincode Checker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0B72E7]" />
              <span>Check Delivery Speed & Stock Availability:</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeChecked(false);
                }}
                placeholder="Enter 6-digit Pincode"
                className="h-9 text-xs font-mono font-bold rounded-xl max-w-[200px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPincodeChecked(true)}
                className="rounded-xl text-xs font-bold h-9 border-slate-200"
              >
                Check
              </Button>
            </div>
            {pincodeChecked && (
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Express Delivery to <strong>{pincode}</strong> by <strong>Tomorrow, 5:00 PM</strong> via Delhivery Express.</span>
              </div>
            )}
          </div>

          {/* Quantity & Buy CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-mono font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {isAutoPayEnabled ? (
                <Button
                  size="lg"
                  onClick={() => handleBuyAutoPay(product)}
                  disabled={isOutOfStock}
                  className="sm:col-span-2 h-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
                  <span>⚡ Agent AutoPay Purchase (Instant Mandate Charge)</span>
                </Button>
              ) : null}

              <Button
                size="lg"
                onClick={() => handleAddToCart(product, quantity)}
                disabled={isOutOfStock}
                className={`h-12 rounded-2xl bg-white border-2 border-[#0B72E7] text-[#0B72E7] hover:bg-blue-50 font-bold text-xs sm:text-sm gap-2 shadow-xs cursor-pointer ${isAutoPayEnabled ? 'sm:col-span-1' : ''}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </Button>

              <Button
                size="lg"
                onClick={() => handleBuyNow(product)}
                disabled={isOutOfStock}
                className={`h-12 rounded-2xl bg-[#0B72E7] hover:bg-[#095ec2] text-white font-bold text-xs sm:text-sm gap-2 shadow-md cursor-pointer ${isAutoPayEnabled ? 'sm:col-span-1' : ''}`}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Buy Now with 1-Click</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Key Features Table */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-2xs">
        <h3 className="text-lg font-bold text-[#072654] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0B72E7]" />
          <span>Technical Specifications & Features</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            { key: 'Product SKU', val: product.sku || product.id },
            { key: 'Category', val: product.category },
            { key: 'Pricing Structure', val: '100% GST Inclusive (ITC Eligible)' },
            { key: 'Logistics SLA', val: product.delivery_time || '1-2 Business Days' },
            { key: 'Warranty Coverage', val: '1 Year Full Replacement Guarantee' },
            { key: 'Razorpay Gateway Compatible', val: 'UPI, BharatQR, Cards, NetBanking, EMI' }
          ].map((spec, i) => (
            <div key={i} className="flex justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">{spec.key}</span>
              <span className="font-bold text-slate-800">{spec.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#072654]">
            Frequently Bought Together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-36 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                  <img src={rel.image_url} alt={rel.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <Link href={`/products/${rel.id}`} className="font-bold text-xs text-slate-800 line-clamp-1 hover:text-[#0B72E7]">
                    {rel.name}
                  </Link>
                  <span className="text-sm font-extrabold text-[#072654] font-mono block mt-1">
                    ₹{rel.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(rel, 1)}
                  className="w-full bg-slate-100 hover:bg-[#0B72E7] text-slate-800 hover:text-white rounded-xl text-xs font-bold"
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cart Drawer */}
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(pId, delta) => {
          setCart((prev) => {
            const updated = prev.items
              .map((i) => (i.product_id === pId ? { ...i, quantity: i.quantity + delta } : i))
              .filter((i) => i.quantity > 0);
            const sub = round2(updated.reduce((acc, it) => acc + it.price * it.quantity, 0));
            const gst = round2(sub - sub / 1.18);
            return { ...prev, items: updated, subtotal: sub, items_total: sub, gst_included: gst, tax_gst: gst, total: sub };
          });
        }}
        onRemoveItem={(pId) => {
          setCart((prev) => {
            const updated = prev.items.filter((i) => i.product_id !== pId);
            const sub = round2(updated.reduce((acc, it) => acc + it.price * it.quantity, 0));
            const gst = round2(sub - sub / 1.18);
            return { ...prev, items: updated, subtotal: sub, items_total: sub, gst_included: gst, tax_gst: gst, total: sub };
          });
        }}
        onApplyCoupon={(code: string) => {
          const disc = code.toUpperCase() === 'RAZOR2026' ? round2(cart.subtotal * 0.1) : 0;
          setCart((prev) => ({
            ...prev,
            coupon_applied: code,
            discount: disc,
            total: Math.max(0, round2(prev.subtotal - disc))
          }));
        }}
        onCheckout={() => {
          if (!isAuthenticated) {
            setIsCartOpen(false);
            router.push('/login?redirect=/checkout');
            return;
          }
          try {
            localStorage.setItem('razorcommerce_cart', JSON.stringify(cart.items.map(i => ({
              product_id: i.product_id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image_url: i.image_url,
              sku: i.product?.sku || `SKU-${i.product_id.toUpperCase()}`
            }))));
            localStorage.removeItem('razorcommerce_staged_buy_now');
            setIsCartOpen(false);
            router.push('/checkout');
          } catch (e) {
            console.error(e);
            setIsCartOpen(false);
            router.push('/checkout');
          }
        }}
        isCheckingOut={false}
      />

      {/* Razorpay Multi-Checkout Modal */}
      <RazorpayMultiCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        result={checkoutResult}
      />

      {/* Customer Authentication Gating Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath="/cart"
        pendingItemName={pendingProduct?.name}
      />

      {/* Autonomous Agent Purchase Confirmation Modal */}
      <AgentConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        data={agentConfirmation}
      />
    </div>
  );
}
