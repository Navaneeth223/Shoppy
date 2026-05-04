import React, { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon, removeCoupon, selectCartCoupon } from '../../../store/slices/cartSlice';
import clsx from 'clsx';

/**
 * Promo code input component for checkout.
 */
export default function PromoCode({ className }) {
  const dispatch = useDispatch();
  const coupon = useSelector(selectCartCoupon);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    await dispatch(applyCoupon(code.trim()));
    setIsLoading(false);
    setCode('');
  };

  const handleRemove = () => {
    dispatch(removeCoupon());
  };

  if (coupon) {
    return (
      <div className={clsx('flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20', className)}>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-success" />
          <div>
            <p className="text-sm font-semibold text-success">{coupon.code}</p>
            <p className="text-xs text-text-muted">
              {coupon.type === 'percentage'
                ? `${coupon.value}% off`
                : coupon.type === 'fixed_amount'
                ? `$${coupon.value} off`
                : 'Free shipping'}
              {' '}— saving ${coupon.discountAmount?.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 text-text-muted hover:text-error transition-colors"
          aria-label="Remove coupon"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={clsx('flex gap-2', className)}>
      <div className="flex-1 relative">
        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Promo code"
          className="input-field pl-9 py-2.5 text-sm"
          aria-label="Promo code"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={isLoading || !code.trim()}
        className="btn-secondary text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '...' : 'Apply'}
      </button>
    </div>
  );
}
