'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[var(--color-surface-page)] px-6 text-center">
      <h2 className="text-[24px] font-[600] text-[var(--color-text-primary)] mb-3">
        Something went wrong!
      </h2>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6 max-w-md">
        {error.message || 'An unexpected error occurred during rendering.'}
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white px-6 py-2.5 rounded-[8px] font-[500] text-[14px] transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-card)] px-6 py-2.5 rounded-[8px] font-[500] text-[14px] transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
