'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Product, 
  CartState, 
  ChatMessage, 
  ComparisonData, 
  CommerceChatResponse,
  CheckoutResult 
} from '@/types/commerce';
import { CommerceChatInterface } from '@/components/commerce/CommerceChatInterface';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { ProductComparisonModal } from '@/components/commerce/ProductComparisonModal';
import { CheckoutSuccessModal } from '@/components/commerce/CheckoutSuccessModal';
import { 
  ShoppingBag, 
  Sparkles, 
  Bot, 
  CreditCard, 
  Tag, 
  ShieldCheck, 
  Zap, 
  LayoutGrid, 
  Search,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    content: (
      "👋 **Welcome to the Razorpay Commerce Agent!**\n\n" +
      "I am your conversational shopping assistant for fintech hardware, developer peripherals, enterprise software licenses, and secure payment devices.\n\n" +
      "**How can I help you today?**\n" +
      "• Search products in natural language (e.g., *'Show smart POS machines for retail'*)\n" +
      "• Ask technical specifications & warranty questions\n" +
      "• Compare multiple products side-by-side\n" +
      "• Manage your shopping cart & generate 1-click Razorpay payment links"
    ),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggested_prompts: [
      "Show smart POS terminals for offline stores",
      "Compare Razorpay POS Terminal V3 and Smart Soundbox 4G",
      "Recommend mechanical keyboards & 5K monitors",
      "Apply coupon RAZOR2026 and generate checkout link"
    ]
  }
];

export default function CommerceAgentPage() {
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

  // 1. Fetch available products catalog
  const { data: catalogProducts = [] } = useQuery<Product[]>({
    queryKey: ['commerce-products'],
    queryFn: () => apiClient.get('/commerce/products'),
  });

  // 2. Chat mutation
  const chatMutation = useMutation({
    mutationFn: (query: string) => 
      apiClient.post<CommerceChatResponse>('/commerce/chat', {
        query,
        history: messages,
        cart
      }),
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommended_products: data.recommended_products,
        comparison_data: data.comparison_data,
        suggested_prompts: data.suggested_prompts,
        action_type: data.action_triggered,
        checkout_link: data.checkout_link,
        recommendation_reason: data.recommendation_reason,
        confidence_score: data.confidence_score,
        review_intelligence: data.review_intelligence,
        before_checkout_summary: data.before_checkout_summary,
      };

      setMessages((prev) => [...prev, assistantMessage]);


      if (data.cart) {
        setCart(data.cart);
      }

      // If user requested checkout in chat, automatically trigger checkout modal
      if (data.action_triggered === 'checkout' && data.checkout_link) {
        checkoutMutation.mutate();
      }

      if (data.action_triggered === 'add_to_cart' || data.action_triggered === 'view_cart') {
        setIsCartOpen(true);
      }
    }
  });

  // 3. Checkout Link Generation Mutation
  const checkoutMutation = useMutation({
    mutationFn: () => 
      apiClient.post<CheckoutResult>('/commerce/checkout', {
        cart,
        customer_email: 'finance.ops@acmedirect.com',
        customer_name: 'Acme Direct Corp'
      }),
    onSuccess: (result) => {
      setCheckoutResult(result);
      setIsCheckoutModalOpen(true);
      setIsCartOpen(false);
    }
  });

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    chatMutation.mutate(text);
  };

  const handleAddToCart = (product: Product) => {
    handleSendMessage(`Add ${product.name} to my cart`);
  };

  const handleCompare = (product: Product) => {
    handleSendMessage(`Compare ${product.name} with alternatives`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.product_id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      const subtotal = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const tax_gst = roundMoney(subtotal * 0.18);
      const discount = prev.coupon_applied ? roundMoney(subtotal * 0.10) : 0;
      const total = roundMoney(subtotal + tax_gst - discount);

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax_gst,
        discount,
        total
      };
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.product_id !== productId);
      const subtotal = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const tax_gst = roundMoney(subtotal * 0.18);
      const discount = prev.coupon_applied ? roundMoney(subtotal * 0.10) : 0;
      const total = roundMoney(subtotal + tax_gst - discount);

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax_gst,
        discount,
        total
      };
    });
  };

  const handleApplyCoupon = (code: string) => {
    handleSendMessage(`Apply coupon code ${code}`);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const totalCartCount = cart.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0B72E7] to-[#072654] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#072654] tracking-tight">
                Conversational Commerce Agent
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-semibold">
                AI Powered
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Discover hardware, compare specifications, and create Razorpay payment links in real-time
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Tag className="h-3.5 w-3.5 text-[#0B72E7]" />
            <span>Use code <strong className="font-mono text-slate-800">RAZOR2026</strong> for 10% off</span>
          </div>

          <Button
            onClick={() => setIsCartOpen(true)}
            className="h-10 px-4 bg-[#072654] hover:bg-[#0c397a] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 relative"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-[#0B72E7] text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
                {totalCartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Conversational Workspace */}
      <div className="flex-1 min-h-0">
        <CommerceChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
          onAddToCart={handleAddToCart}
          onCompare={handleCompare}
          onOpenComparison={(data) => {
            setComparisonModalData(data);
            setIsComparisonOpen(true);
          }}
          onOpenCart={() => setIsCartOpen(true)}
          onResetChat={handleResetChat}
        />
      </div>

      {/* Slide-Over Shopping Cart Drawer */}
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onApplyCoupon={handleApplyCoupon}
        onCheckout={() => checkoutMutation.mutate()}
        isCheckingOut={checkoutMutation.isPending}
      />

      {/* Side-by-Side Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        data={comparisonModalData}
        onAddToCart={handleAddToCart}
      />

      {/* Razorpay Checkout Link Success Modal */}
      <CheckoutSuccessModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        result={checkoutResult}
      />
    </div>
  );
}

function roundMoney(num: number): number {
  return Math.round(num * 100) / 100;
}
