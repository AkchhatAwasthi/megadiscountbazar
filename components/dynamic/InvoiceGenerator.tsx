"use client";

import dynamic from 'next/dynamic';

// Dynamically imports the invoice generator logic to ensure jspdf client-only dependencies do not load on SSR
const InvoiceGenerator = dynamic(
  () => import('@/utils/invoiceGenerator').then((mod) => {
    return function DownloadButton({ order, className, children }: { order: any; className?: string; children?: React.ReactNode }) {
      return (
        <button
          className={className}
          onClick={() => mod.downloadInvoice(order)}
        >
          {children || 'Download Invoice'}
        </button>
      );
    };
  }),
  { ssr: false }
);

export default InvoiceGenerator;
