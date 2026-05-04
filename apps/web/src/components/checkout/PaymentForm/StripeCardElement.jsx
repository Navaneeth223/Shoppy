import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Button from '../../ui/Button/Button';
import { Lock } from 'lucide-react';

const PAYMENT_ELEMENT_OPTIONS = {
  layout: 'tabs',
  appearance: {
    theme: 'night',
    variables: {
      colorPrimary: '#C9A84C',
      colorBackground: '#1A1A1E',
      colorText: '#F2F2F3',
      colorDanger: '#FF4D6D',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      borderRadius: '8px',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': {
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: '#1A1A1E',
        color: '#F2F2F3',
      },
      '.Input:focus': {
        border: '1px solid #00E5FF',
        boxShadow: '0 0 0 3px rgba(0,229,255,0.1)',
      },
      '.Label': {
        color: '#8A8A95',
        fontSize: '13px',
      },
      '.Tab': {
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: '#111113',
      },
      '.Tab--selected': {
        border: '1px solid #C9A84C',
        backgroundColor: 'rgba(201,168,76,0.1)',
      },
    },
  },
};

/**
 * Stripe PaymentElement wrapper component.
 * Must be used inside a Stripe Elements provider.
 */
export default function StripeCardElement({ clientSecret, onSuccess, onError, totalAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      onError?.(error);
    } else {
      onSuccess?.();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />

      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error"
        >
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isProcessing}
        disabled={!stripe || !elements}
        leftIcon={<Lock size={16} />}
      >
        {isProcessing ? 'Processing...' : `Pay $${totalAmount?.toFixed(2)}`}
      </Button>

      <p className="text-center text-xs text-text-muted flex items-center justify-center gap-1">
        <Lock size={10} />
        Secured by Stripe · 256-bit SSL encryption
      </p>
    </form>
  );
}
