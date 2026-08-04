'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
          <h2 className="text-[28px] font-[700] text-gray-900 mb-3">Critical Application Error</h2>
          <p className="text-[14px] text-gray-600 mb-6 max-w-md">
            A critical error occurred at the application level.
          </p>
          <button
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
