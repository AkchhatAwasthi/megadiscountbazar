import type { Metadata } from 'next';
import Contact from '../../src/views/Contact';

export const revalidate = false; // fully static

export const metadata: Metadata = {
  title: 'Contact Us | Megadiscountbazar',
  description: 'Get in touch with Megadiscountbazar customer support, store locations, and business inquiries.',
};

export default function Page() {
  return <Contact />;
}
