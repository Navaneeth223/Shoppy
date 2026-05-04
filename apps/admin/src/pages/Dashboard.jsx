import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <div className="text-center">
        <div className="text-4xl font-bold text-[#C9A84C] mb-4">NEXUS<span className="text-[#00E5FF]">.</span></div>
        <h1 className="text-2xl font-semibold text-white mb-2">Admin Panel</h1>
        <p className="text-[#8A8A95] mb-6">
          The admin panel is available at{' '}
          <a href="http://localhost:5173/admin" className="text-[#00E5FF] hover:underline">
            the main storefront
          </a>
          .
        </p>
        <a
          href="http://localhost:5173/admin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A84C] text-[#0A0A0B] font-semibold text-sm hover:bg-yellow-400 transition-colors"
        >
          Go to Admin Panel →
        </a>
      </div>
    </div>
  );
}
