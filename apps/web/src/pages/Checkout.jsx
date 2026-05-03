import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { selectCartItems, selectCartTotal } from '../store/slices/cartSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { orderAPI } from '../services/api/orderAPI';
import { paymentAPI } from '../services/api/paymentAPI';
import toast from 'react-hot-toast';
import { Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const STEPS = [
  { id: 1, label: 'Contact & Delivery' },
  { id: 2, label: 'Shipping' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Review' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectCurrentUser);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
    shippingMethod: { name: 'Standard Shipping', cost: 0, estimatedDays: 5 },
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderRes = await orderAPI.createOrder({
        shippingAddress: orderData.shippingAddress,
        shippingMethod: orderData.shippingMethod,
        guestEmail: !user ? orderData.shippingAddress.email : undefined,
      });

      const { orderId, orderNumber, clientSecret } = orderRes.data.data;

      // Confirm payment with Stripe
      const stripe = await stripePromise;
      if (stripe && clientSecret) {
        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/order/confirmation/${orderNumber}`,
          },
        });

        if (error) {
          toast.error(error.message || 'Payment failed. Please try again.');
          return;
        }
      }

      navigate(`/order/confirmation/${orderNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Checkout" noIndex />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  currentStep > step.id ? 'bg-success text-white' :
                  currentStep === step.id ? 'bg-accent-gold text-bg' :
                  'bg-surface-2 text-text-muted border border-border'
                )}>
                  {currentStep > step.id ? <Check size={14} /> : step.id}
                </div>
                <span className={clsx(
                  'text-sm font-medium hidden sm:block',
                  currentStep === step.id ? 'text-text-primary' : 'text-text-muted'
                )}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx(
                  'flex-1 h-px mx-3 transition-all',
                  currentStep > step.id ? 'bg-success' : 'bg-border'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-text-primary">Contact & Delivery</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">First Name</label>
                    <input
                      className="input-field"
                      value={orderData.shippingAddress.firstName}
                      onChange={(e) => setOrderData((prev) => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, firstName: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">Last Name</label>
                    <input
                      className="input-field"
                      value={orderData.shippingAddress.lastName}
                      onChange={(e) => setOrderData((prev) => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, lastName: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={orderData.shippingAddress.email}
                    onChange={(e) => setOrderData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Address</label>
                  <input
                    className="input-field"
                    placeholder="Street address"
                    value={orderData.shippingAddress.addressLine1}
                    onChange={(e) => setOrderData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, addressLine1: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">City</label>
                    <input
                      className="input-field"
                      value={orderData.shippingAddress.city}
                      onChange={(e) => setOrderData((prev) => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">State</label>
                    <input
                      className="input-field"
                      value={orderData.shippingAddress.state}
                      onChange={(e) => setOrderData((prev) => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">ZIP</label>
                    <input
                      className="input-field"
                      value={orderData.shippingAddress.postalCode}
                      onChange={(e) => setOrderData((prev) => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, postalCode: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full btn-primary py-3"
                >
                  Continue to Shipping <ChevronRight size={16} />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-text-primary">Shipping Method</h2>
                {[
                  { name: 'Standard Shipping', cost: 0, days: '5-7 business days', carrier: 'USPS' },
                  { name: 'Express Shipping', cost: 9.99, days: '2-3 business days', carrier: 'FedEx' },
                  { name: 'Overnight Shipping', cost: 24.99, days: '1 business day', carrier: 'UPS' },
                ].map((method) => (
                  <label
                    key={method.name}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                      orderData.shippingMethod.name === method.name
                        ? 'border-accent-gold bg-accent-gold/5'
                        : 'border-border hover:border-text-muted'
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={orderData.shippingMethod.name === method.name}
                      onChange={() => setOrderData((prev) => ({
                        ...prev,
                        shippingMethod: { name: method.name, cost: method.cost, estimatedDays: parseInt(method.days) }
                      }))}
                      className="sr-only"
                    />
                    <div className={clsx(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      orderData.shippingMethod.name === method.name ? 'border-accent-gold' : 'border-border'
                    )}>
                      {orderData.shippingMethod.name === method.name && (
                        <div className="w-2 h-2 rounded-full bg-accent-gold" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{method.name}</p>
                      <p className="text-sm text-text-muted">{method.carrier} · {method.days}</p>
                    </div>
                    <span className="font-semibold text-text-primary">
                      {method.cost === 0 ? 'Free' : `$${method.cost.toFixed(2)}`}
                    </span>
                  </label>
                ))}
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(1)} className="btn-ghost flex-1">Back</button>
                  <button onClick={() => setCurrentStep(3)} className="btn-primary flex-1 py-3">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-text-primary">Payment</h2>
                <div className="p-4 rounded-xl bg-surface-2 border border-border text-center text-text-muted text-sm">
                  <p>Stripe payment form would be rendered here.</p>
                  <p className="mt-1 text-xs">Configure VITE_STRIPE_PUBLISHABLE_KEY in your .env file.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(2)} className="btn-ghost flex-1">Back</button>
                  <button onClick={() => setCurrentStep(4)} className="btn-primary flex-1 py-3">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-text-primary">Review & Place Order</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img src={item.image || 'https://picsum.photos/seed/item/60/60'} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{item.title}</p>
                        <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(3)} className="btn-ghost flex-1">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="btn-primary flex-1 py-3"
                  >
                    {isLoading ? 'Placing Order...' : `Place Order · $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="card p-6 h-fit space-y-4">
            <h2 className="font-display font-semibold text-text-primary">Order Summary</h2>
            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <div key={item._id} className="flex gap-2 text-sm">
                  <img src={item.image || 'https://picsum.photos/seed/item/40/40'} alt={item.title} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary line-clamp-1">{item.title}</p>
                    <p className="text-text-muted">×{item.quantity}</p>
                  </div>
                  <p className="text-text-primary font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-text-muted">+{items.length - 3} more items</p>
              )}
            </div>
            <div className="divider" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>{orderData.shippingMethod.cost === 0 ? 'Free' : `$${orderData.shippingMethod.cost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>${(total + orderData.shippingMethod.cost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
