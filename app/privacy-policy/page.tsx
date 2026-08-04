import type { Metadata } from 'next';
import PrivacyPolicy from '../../src/views/PrivacyPolicy';

export const revalidate = false; // fully static

export const metadata: Metadata = {
  title: 'Privacy Policy | Megadiscountbazar',
  description: 'Understand how Megadiscountbazar handles and protects your personal data.',
};

export default function Page() {
  return <PrivacyPolicy />;
}
