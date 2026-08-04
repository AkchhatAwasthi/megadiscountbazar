"use client";

import dynamic from 'next/dynamic';

const QRCodeComponent = dynamic(
  () => import('@/components/QRCode'),
  { ssr: false }
);

export default QRCodeComponent;
