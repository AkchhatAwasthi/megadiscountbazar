import type { Metadata } from 'next';
import RefundPolicy from '../../src/views/RefundPolicy';

export const revalidate = false; // fully static

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Megadiscountbazar',
  description: 'Learn about the cancellations and refund policies at Megadiscountbazar.',
};

export default function Page() {
  return <RefundPolicy />;
}
