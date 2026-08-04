import type { Metadata } from 'next';
import AquaSoft from '../../src/views/AquaSoft';

export const revalidate = false; // fully static

export const metadata: Metadata = {
  title: 'Aqua Soft Service | Megadiscountbazar',
  description: 'Water softener installation and service solutions at Megadiscountbazar.',
};

export default function Page() {
  return <AquaSoft />;
}
