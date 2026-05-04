import React from 'react';

/**
 * Seller Dashboard — redirects to the main web app's seller dashboard.
 * The seller dashboard is integrated into the main web app at /seller-dashboard.
 * This standalone app is for future expansion.
 */
export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <div className="text-center">
        <div className="text-4xl font-bold text-[#C9A84C] mb-4">NEXUS<span className="text-[#00E5FF]">.</span></div>
        <h1 className="text-2xl font-semibold text-white mb-2">Seller Dashboard</h1>
        <p className="text-[#8A8A95] mb-6">
          The seller dashboard is available at{' '}
          <a
            href="http://localhost:5173/seller-dashboard"
            className="text-[#00E5FF] hover:underline"
          >
            the main storefront
          </a>
          .
        </p>
        <a
          href="http://localhost:5173/seller-dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A84C] text-[#0A0A0B] font-semibold text-sm hover:bg-yellow-400 transition-colors"
        >
          Go to Seller Dashboard →
        </a>
      </div>
    </div>
  );
}
