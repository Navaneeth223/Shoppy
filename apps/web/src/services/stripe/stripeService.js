import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Singleton Stripe instance
let stripePromise = null;

/**
 * Returns the Stripe.js instance (singleton).
 * @returns {Promise<import('@stripe/stripe-js').Stripe>}
 */
export function getStripe() {
  if (!stripePromise) {
    if (!STRIPE_KEY) {
      console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not set. Payment features will not work.');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
}

/**
 * Confirms a card payment using Stripe.js.
 * @param {string} clientSecret - PaymentIntent client secret
 * @param {object} [paymentMethod] - Payment method details
 * @returns {Promise<{error?: object, paymentIntent?: object}>}
 */
export async function confirmCardPayment(clientSecret, paymentMethod) {
  const stripe = await getStripe();
  if (!stripe) return { error: { message: 'Stripe not initialized' } };

  return stripe.confirmCardPayment(clientSecret, paymentMethod);
}

/**
 * Confirms a payment using the PaymentElement.
 * @param {string} clientSecret
 * @param {object} options
 * @returns {Promise<{error?: object}>}
 */
export async function confirmPayment(clientSecret, options) {
  const stripe = await getStripe();
  if (!stripe) return { error: { message: 'Stripe not initialized' } };

  return stripe.confirmPayment({
    clientSecret,
    ...options,
  });
}

/**
 * Creates a PaymentMethod from card element.
 * @param {object} cardElement - Stripe card element
 * @param {object} billingDetails
 * @returns {Promise<{error?: object, paymentMethod?: object}>}
 */
export async function createPaymentMethod(cardElement, billingDetails) {
  const stripe = await getStripe();
  if (!stripe) return { error: { message: 'Stripe not initialized' } };

  return stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails,
  });
}
