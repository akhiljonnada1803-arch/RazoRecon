'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Cart, 
  CheckoutOrderResponse, 
  AuditLog, 
  TransactionStatus,
  AgentCommandResponse
} from '@/types/checkout';
import { CatalogProduct, ProductListResponse } from '@/types/catalog';
import { CheckoutWorkflowStepper, CheckoutStep } from '@/components/checkout/CheckoutWorkflowStepper';
import { AICheckoutAssistant } from '@/components/checkout/AICheckoutAssistant';
import { CartManager } from '@/components/checkout/CartManager';
import { CheckoutSummaryCard } from '@/components/checkout/CheckoutSummaryCard';
import { RazorpayCheckoutModal } from '@/components/checkout/RazorpayCheckoutModal';
import { TransactionStatusTracker } from '@/components/checkout/TransactionStatusTracker';
import { CheckoutAuditLogViewer } from '@/components/checkout/CheckoutAuditLogViewer';
import { 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function AICheckoutEnginePage() {
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrderResponse | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Active Cart
  const { data: cart, isLoading: isCartLoading } = useQuery<Cart>({
    queryKey: ['checkout-cart'],
    queryFn: () => apiClient.get('/checkout/cart'),
  });

  // 2. Fetch Catalog Products for Quick-Add
  const { data: catalogData } = useQuery<ProductListResponse>({
    queryKey: ['catalog-products-for-checkout'],
    queryFn: () => apiClient.get('/products?limit=50'),
  });

  // 3. Fetch Audit Logs
  const { data: auditLogs = [], refetch: refetchAuditLogs, isLoading: isLogsLoading } = useQuery<AuditLog[]>({
    queryKey: ['checkout-audit-logs'],
    queryFn: () => apiClient.get('/checkout/audit-logs?limit=50'),
  });

  // 4. Fetch Transactions
  const { data: transactions = [], refetch: refetchTransactions, isLoading: isTxLoading } = useQuery<TransactionStatus[]>({
    queryKey: ['checkout-transactions'],
    queryFn: () => apiClient.get('/checkout/transactions?limit=50'),
  });

  // Mutation: Add Item
  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => {
      const cartId = cart?.id || 'default';
      return apiClient.post(`/checkout/cart/${cartId}/items`, {
        product_id: productId,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
      showToast('Product added to shopping cart!');
    },
  });

  // Mutation: Update Quantity
  const updateQtyMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => {
      const cartId = cart?.id || 'default';
      return apiClient.put(`/checkout/cart/${cartId}/items/${productId}`, {
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
    },
  });

  // Mutation: Remove Item
  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => {
      const cartId = cart?.id || 'default';
      return apiClient.delete(`/checkout/cart/${cartId}/items/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
      showToast('Item removed from cart.');
    },
  });

  // Mutation: Apply Coupon
  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => {
      const cartId = cart?.id || 'default';
      return apiClient.post(`/checkout/cart/${cartId}/coupon`, { code });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
      showToast('Promotional coupon applied successfully!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Invalid coupon code.');
    },
  });

  // Mutation: Create Order
  const createOrderMutation = useMutation<CheckoutOrderResponse>({
    mutationFn: () => {
      if (!cart) throw new Error('Cart not found');
      return apiClient.post<CheckoutOrderResponse>('/checkout/create-order', {
        cart_id: cart.id,
        customer_name: 'Acme Enterprise Solutions',
        customer_email: 'procurement@acme.com',
        customer_phone: '+91 98765 43210',
      });
    },
    onSuccess: (data: CheckoutOrderResponse) => {
      setCreatedOrder(data);
      setIsCheckoutModalOpen(true);
      setCurrentStep('checkout');
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-transactions'] });
      showToast(`Razorpay Order '${data.order_id}' created!`);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Failed to create Razorpay Order.');
    },
  });


  // Mutation: Simulate Payment Success
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ orderId, paymentMethod }: { orderId: string; paymentMethod: string }) => {
      const paymentId = `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
      // Call payments verify endpoint
      return apiClient.post('/payments/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: `sig_mock_${Math.random().toString(36).substring(2, 12)}`,
        method: paymentMethod,
      });
    },

    onSuccess: () => {
      setPaymentComplete(true);
      setIsCheckoutModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      showToast('Payment verified & automatically reconciled into ledger!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Payment verification failed.');
    },
  });

  // Agent Command Handler
  const handleAgentCommand = async (prompt: string): Promise<AgentCommandResponse> => {
    const cartId = cart?.id || 'default';
    const res: AgentCommandResponse = await apiClient.post('/checkout/agent-command', {
      cart_id: cartId,
      prompt,
    });
    queryClient.invalidateQueries({ queryKey: ['checkout-cart'] });
    queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
    return res;
  };

  const handleSimulatePayment = async (orderId: string, paymentMethod: string) => {
    await verifyPaymentMutation.mutateAsync({ orderId, paymentMethod });
  };

  const availableProducts = catalogData?.products || [];
  const itemsCount = cart?.summary?.items_count || 0;
  const finalAmount = cart?.summary?.final_amount || 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#072654] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-500/30 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Visual 4-Step Workflow Stepper */}
      <section>
        <CheckoutWorkflowStepper
          currentStep={currentStep}
          itemsCount={itemsCount}
          finalAmount={finalAmount}
          orderCreated={!!createdOrder}
          paymentComplete={paymentComplete}
          onStepClick={setCurrentStep}
        />
      </section>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): AI Assistant + Cart Manager */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Checkout Assistant */}
          <section>
            <AICheckoutAssistant
              onSendCommand={handleAgentCommand}
              isProcessing={false}
              onApplyCoupon={(code) => applyCouponMutation.mutate(code)}
              onQuickAddProduct={(pId, qty) => addItemMutation.mutate({ productId: pId, quantity: qty })}
            />
          </section>

          {/* Cart Items Manager */}
          <section>
            <CartManager
              cart={cart}
              availableProducts={availableProducts}
              onAddToCart={(pId, qty) => addItemMutation.mutate({ productId: pId, quantity: qty })}
              onUpdateQuantity={(pId, qty) => updateQtyMutation.mutate({ productId: pId, quantity: qty })}
              onRemoveItem={(pId) => removeItemMutation.mutate(pId)}
              isLoading={addItemMutation.isPending || updateQtyMutation.isPending || removeItemMutation.isPending}
            />
          </section>

          {/* Audit Logs Viewer */}
          <section>
            <CheckoutAuditLogViewer
              logs={auditLogs}
              isLoading={isLogsLoading}
              onRefresh={refetchAuditLogs}
            />
          </section>
        </div>

        {/* Right Column (4 cols): Checkout Summary + Transaction Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Checkout Summary Card */}
          <section>
            <CheckoutSummaryCard
              summary={cart?.summary}
              onApplyCoupon={(code) => applyCouponMutation.mutate(code)}
              onProceedToCheckout={() => createOrderMutation.mutate()}
              onGeneratePaymentLink={() => createOrderMutation.mutate()}
              isCheckingOut={createOrderMutation.isPending}
              orderCreated={!!createdOrder}
            />
          </section>

          {/* Transaction & Settlement Status Tracker */}
          <section>
            <TransactionStatusTracker
              transactions={transactions}
              isLoading={isTxLoading}
              onRefresh={refetchTransactions}
            />
          </section>
        </div>
      </div>

      {/* Razorpay Test Mode Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        order={createdOrder}
        onSimulatePaymentSuccess={handleSimulatePayment}
        isVerifying={verifyPaymentMutation.isPending}
      />
    </div>
  );
}
