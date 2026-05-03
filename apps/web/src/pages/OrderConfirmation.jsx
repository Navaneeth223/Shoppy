import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { orderAPI } from '../services/api/orderAPI';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      orderAPI.trackOrder(orderNumber)
        .then((res) => setOrder(res.data.data))
        .catch(() => {});
    }

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [orderNumber]);

  return (
    <>
      <SEOHead title="Order Confirmed!" noIndex />
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} colors={['#C9A84C', '#00E5FF', '#00C896']} />}

      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={48} className="text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl font-display font-bold text-text-primary mb-4">
            Order Confirmed! 🎉
          </h1>
          <p className="text-text-secondary mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {orderNumber && (
            <p className="text-accent-gold font-semibold text-lg mb-8">
              Order #{orderNumber}
            </p>
          )}

          <div className="card p-6 text-left mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package size={20} className="text-accent-gold" />
              <h2 className="font-semibold text-text-primary">What happens next?</h2>
            </div>
            <ol className="space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                You'll receive an order confirmation email shortly.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                The seller will process and ship your order within 1-2 business days.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                You'll receive a tracking number once your order ships.
              </li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/profile/orders" className="btn-primary">
              Track Order <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
