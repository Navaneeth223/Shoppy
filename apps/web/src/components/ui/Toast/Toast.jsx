// Toast notifications are handled globally by react-hot-toast in main.jsx.
// This file exports helper functions for consistent toast usage.

import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

const iconStyle = { size: 18, className: 'shrink-0' };

/**
 * Shows a success toast.
 * @param {string} message
 */
export function toastSuccess(message) {
  toast.success(message, {
    icon: React.createElement(CheckCircle, { ...iconStyle, className: 'text-success shrink-0' }),
  });
}

/**
 * Shows an error toast.
 * @param {string} message
 */
export function toastError(message) {
  toast.error(message, {
    icon: React.createElement(XCircle, { ...iconStyle, className: 'text-error shrink-0' }),
  });
}

/**
 * Shows a warning toast.
 * @param {string} message
 */
export function toastWarning(message) {
  toast(message, {
    icon: React.createElement(AlertTriangle, { ...iconStyle, className: 'text-warning shrink-0' }),
    style: {
      background: '#1A1A1E',
      color: '#F2F2F3',
      border: '1px solid rgba(255,184,0,0.2)',
    },
  });
}

/**
 * Shows an info toast.
 * @param {string} message
 */
export function toastInfo(message) {
  toast(message, {
    icon: React.createElement(Info, { ...iconStyle, className: 'text-accent-cyan shrink-0' }),
    style: {
      background: '#1A1A1E',
      color: '#F2F2F3',
      border: '1px solid rgba(0,229,255,0.2)',
    },
  });
}

/**
 * Shows a loading toast that can be updated.
 * @param {string} message
 * @returns {string} Toast ID for updating
 */
export function toastLoading(message) {
  return toast.loading(message, {
    style: {
      background: '#1A1A1E',
      color: '#F2F2F3',
      border: '1px solid rgba(255,255,255,0.08)',
    },
  });
}

/**
 * Dismisses a toast by ID.
 * @param {string} id
 */
export function toastDismiss(id) {
  toast.dismiss(id);
}

export default toast;
