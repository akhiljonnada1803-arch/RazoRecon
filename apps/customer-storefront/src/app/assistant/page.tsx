'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Product, 
  CartState, 
  CartItem,
  ChatMessage, 
  ComparisonData, 
  CommerceChatResponse,
  CheckoutResult 
} from '@/types/commerce';
import { CommerceChatInterface } from '@/components/commerce/CommerceChatInterface';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { ProductComparisonModal } from '@/components/commerce/ProductComparisonModal';
import { CheckoutSuccessModal } from '@/components/commerce/CheckoutSuccessModal';
import { AgentConfirmationModal } from '@/components/commerce/AgentConfirmationModal';
import { CustomerAuthModal } from '@/components/commerce/CustomerAuthModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Sparkles, 
  Bot, 
  CreditCard, 
  Tag, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    content: (
      "👋 **Welcome to CartMind AI - Your AI Shopping Companion!**\n\n" +
      "I provide tailored commercial hardware recommendations, side-by-side spec comparisons with Pros & Cons, and seamless 1-click CartMind AutoPay autonomous buying.\n\n" +
      "**Try asking me:**\n" +
      "• *'I need a laptop under ₹60,000'*\n" +
      "• *'Find the best POS machine'*\n" +
      "• *'Recommend a CCTV camera'*\n" +
      "• *'Buy a printer for my store'*"
    ),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggested_prompts: [
      "I need a laptop under ₹60,000",
      "Find the best POS machine",
      "Recommend a CCTV camera",
      "Buy a printer for my store"
    ]
  }
];

export default function CustomerAssistantPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    tax_gst: 0,
    shipping: 0,
    discount: 0,
    coupon_applied: null,
    total: 0,
    currency: 'INR'
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [comparisonModalData, setComparisonModalData] = useState<ComparisonData | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [agentConfirmation, setAgentConfirmation] = useState<any | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // 1. Fetch available products catalog
  const { data: catalogProducts = [] } = useQuery<Product[]>({
    queryKey: ['commerce-products'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>('/catalog/products');
        return res?.items || res?.products || (Array.isArray(res) ? res : []);
      } catch (e) {
        return [];
      }
    },
  });

  // 1b. Fetch customer AutoPay configuration
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

  // 1c. One-Click AutoPay Buy Mutation
  const oneClickBuyMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      return await apiClient.post<any>('/customer/autopay/one-click-buy', {
        product_id: productId,
        quantity
      });
    },
    onSuccess: (res) => {
      if (res.confirmation) {
        setAgentConfirmation(res.confirmation);
        setIsConfirmationModalOpen(true);
      }
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail || err?.message || 'AutoPay purchase could not be completed.';
      alert(`⚠️ AutoPay Error: ${detail}`);
    }
  });

  const handleBuyAutoPay = async (product: Product) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      setIsAuthModalOpen(true);
      return;
    }
    if (!isAutoPayEnabled) {
      router.push('/customer/autopay');
      return;
    }
    oneClickBuyMutation.mutate({ productId: product.id, quantity: 1 });
  };

  // 2. Chat mutation supporting advisor actions
  interface ChatPayload {
    query: string;
    action?: string;
    selected_product_id?: string;
    selected_address?: any;
    quantity?: number;
  }

  const chatMutation = useMutation({
    mutationFn: (payload: string | ChatPayload) => {
      const body = typeof payload === 'string'
        ? { query: payload, history: messages, cart }
        : { ...payload, history: messages, cart };
      return apiClient.post<CommerceChatResponse>('/commerce/chat', body);
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        flow_step: data.flow_step,
        recommended_products: data.recommended_products,
        comparison_data: data.comparison_data,
        ai_recommendation_reason: data.ai_recommendation_reason,
        selected_product: data.selected_product,
        selected_address: data.selected_address,
        order_summary: data.order_summary,
        saved_addresses: data.saved_addresses,
        suggested_prompts: data.suggested_prompts,
        action_type: data.action_triggered,
        checkout_link: data.checkout_link,
        autonomous_order: data.autonomous_order,
        requires_approval: data.requires_approval
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.cart) {
        setCart(data.cart);
        try {
          localStorage.setItem('razorcommerce_cart', JSON.stringify(data.cart.items.map((i: any) => ({
            product_id: i.product_id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image_url: i.image_url,
            sku: `SKU-${i.product_id.toUpperCase()}`
          }))));
        } catch (e) {}
      }

      if (data.comparison_data) {
        setComparisonModalData(data.comparison_data);
      }

      if ((data.action_triggered === 'checkout_link_created' && data.checkout_link) || data.flow_step === 'MANDATE_REQUIRED' || data.action_triggered === 'add_to_cart') {
        setIsCartOpen(true);
      }

      if (data.autonomous_order?.confirmation) {
        setAgentConfirmation(data.autonomous_order.confirmation);
        setIsConfirmationModalOpen(true);
      }
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: "⚠️ I encountered a temporary connection issue. Please try your request again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  });

  const handleSelectProduct = (product: Product) => {
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: `👉 I select ${product.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({
      query: `Select ${product.name}`,
      action: 'select_product',
      selected_product_id: product.id
    });
  };

  const handleSelectAddress = (address: any, product: Product) => {
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: `📍 Ship to ${address.label} (${address.city})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({
      query: `Ship to ${address.label}`,
      action: 'select_address',
      selected_product_id: product.id,
      selected_address: address
    });
  };

  const handleConfirmAutoPayPurchase = (product: Product, address: any) => {
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: `⚡ Confirm & Buy ${product.name} via AutoPay`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({
      query: `Confirm & Buy ${product.name} via AutoPay`,
      action: 'confirm_autopay_purchase',
      selected_product_id: product.id,
      selected_address: address
    });
  };

  // 3. Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: () => apiClient.post<CheckoutResult>('/commerce/checkout', { cart }),
    onSuccess: (res) => {
      setCheckoutResult(res);
      setIsCartOpen(false);
      setIsCheckoutModalOpen(true);
      setCart({
        items: [],
        subtotal: 0,
        tax_gst: 0,
        shipping: 0,
        discount: 0,
        coupon_applied: null,
        total: 0,
        currency: 'INR'
      });
    }
  });

  const handleSendMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(text);
  };

  const calculateCart = (items: CartItem[], coupon: string | null = cart.coupon_applied || null): CartState => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    if (coupon?.toUpperCase() === 'RAZOR2026') {
      discount = Math.round(subtotal * 0.10);
    } else if (coupon?.toUpperCase() === 'FINTECH50') {
      discount = Math.min(2500, Math.round(subtotal * 0.15));
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gst_included = Math.round(discountedSubtotal - (discountedSubtotal / 1.18));
    const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 49;
    const total = discountedSubtotal + shipping;

    return {
      items,
      items_total: subtotal,
      subtotal,
      delivery_fee: shipping,
      platform_fee: 0,
      gst_included,
      tax_gst: gst_included,
      shipping,
      discount,
      coupon_applied: coupon,
      total,
      currency: 'INR'
    };
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      setPendingProduct(product);
      try {
        localStorage.setItem('razorcommerce_pending_item', JSON.stringify(product));
      } catch (e) {}
      setIsAuthModalOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.items.find(i => i.product_id === product.id);
      let updatedItems: CartItem[];
      const maxStock = product.stock_quantity ?? product.stock ?? 99;

      if (existing) {
        updatedItems = prev.items.map(i => 
          i.product_id === product.id 
            ? { ...i, quantity: Math.min(maxStock, i.quantity + 1) }
            : i
        );
      } else {
        const newItem: CartItem = {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
          category: product.category,
          product
        };
        updatedItems = [...prev.items, newItem];
      }
      return calculateCart(updatedItems, prev.coupon_applied || null);
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updatedItems = prev.items
        .map(i => {
          if (i.product_id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];

      return calculateCart(updatedItems, prev.coupon_applied || null);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter(i => i.product_id !== productId);
      return calculateCart(updatedItems, prev.coupon_applied || null);
    });
  };

  const handleApplyCoupon = (code: string) => {
    setCart((prev) => calculateCart(prev.items, code));
  };

  const handleCompare = (product: Product) => {
    const related = catalogProducts.filter(p => p.id !== product.id && p.category === product.category);
    const opponent = related[0] || catalogProducts.find(p => p.id !== product.id);

    if (!opponent) return;

    const compData: ComparisonData = {
      product_ids: [product.id, opponent.id],
      title: `${product.name} vs ${opponent.name}`,
      verdict: `${product.name} is recommended for high-throughput enterprise environments, while ${opponent.name} provides cost-effective flexibility.`,
      products: [product, opponent],
      attributes: [
        { attribute: 'Price', values: { [product.id]: `₹${product.price.toLocaleString('en-IN')}`, [opponent.id]: `₹${opponent.price.toLocaleString('en-IN')}` } },
        { attribute: 'Category', values: { [product.id]: product.category, [opponent.id]: opponent.category } },
        { attribute: 'Stock Status', values: { [product.id]: product.in_stock ? `${product.stock_quantity ?? product.stock ?? 50} units` : 'Out of Stock', [opponent.id]: opponent.in_stock ? `${opponent.stock_quantity ?? opponent.stock ?? 50} units` : 'Out of Stock' } },
        { attribute: 'Offer / Discount', values: { [product.id]: product.offer || product.active_offer || 'Standard Pricing', [opponent.id]: opponent.offer || opponent.active_offer || 'Standard Pricing' } }
      ]
    };

    setComparisonModalData(compData);
    setIsComparisonOpen(true);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 bg-slate-50/50">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Customer Experience</span>
            <span>/</span>
            <span className="text-[#0B72E7] font-semibold">CartMind AI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] mt-0.5 flex items-center gap-2.5">
            CartMind AI Shopping Assistant
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-[11px] px-2.5 py-0.5 shadow-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/customer/products">
            <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-500" />
              Browse 50 SKUs
            </Button>
          </Link>

          <Button
            onClick={() => setIsCartOpen(true)}
            className="h-9 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Cart</span>
            {cart.items.length > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-white text-[#0B72E7] font-bold text-[10px] flex items-center justify-center">
                {cart.items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Interactive Chat Layout */}
      <div className="flex-1 min-h-0">
        <CommerceChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
          onAddToCart={handleAddToCart}
          onBuyAutoPay={handleBuyAutoPay}
          isAutoPayEnabled={isAutoPayEnabled}
          onCompare={handleCompare}
          onOpenComparison={(data) => {
            setComparisonModalData(data);
            setIsComparisonOpen(true);
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onResetChat={handleResetChat}
          onSelectProduct={handleSelectProduct}
          onSelectAddress={handleSelectAddress}
          onConfirmAutoPayPurchase={handleConfirmAutoPayPurchase}
        />
      </div>

      {/* Slide-out Shopping Cart Drawer */}
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onApplyCoupon={handleApplyCoupon}
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
              sku: `SKU-${i.product_id.toUpperCase()}`
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

      {/* Side-by-Side Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        data={comparisonModalData}
        onAddToCart={handleAddToCart}
      />

      {/* Post-Checkout Razorpay Success & Upsell Modal */}
      <CheckoutSuccessModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        result={checkoutResult}
      />

      {/* Autonomous Agent Purchase Confirmation Modal */}
      <AgentConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        data={agentConfirmation}
      />

      {/* Customer Authentication Gating Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath="/cart"
        pendingItemName={pendingProduct?.name}
      />
    </div>
  );
}
