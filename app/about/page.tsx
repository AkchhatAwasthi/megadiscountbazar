import type { Metadata } from 'next';
import About from '../../src/views/About';

export const revalidate = false; // fully static

export const metadata: Metadata = {
  title: 'About Us | Megadiscountbazar',
  description: 'Learn about Megadiscountbazar, the premium hypermarket and our core values.',
};

export default function Page() {
  return <About />;
}
