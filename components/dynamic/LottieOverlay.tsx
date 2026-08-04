"use client";

import dynamic from 'next/dynamic';

const LottieOverlay = dynamic(
  () => import('@/components/LottieOverlay'),
  { ssr: false }
);

export default LottieOverlay;
