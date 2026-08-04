import type { Metadata } from 'next';
import Terms from '../../src/views/Terms';

export const revalidate = false; // fully static

export const metadata: Metadata = {
  title: 'Terms of Service | Megadiscountbazar',
  description: 'Terms and conditions for shopping at Megadiscountbazar.',
};

export default function Page() {
  return <Terms />;
}
