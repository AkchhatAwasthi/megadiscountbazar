import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-[var(--color-brand-red)]">Privacy Policy</h1>
      <Card>
        <CardContent className="p-8 prose prose-sm sm:prose lg:prose-lg max-w-none text-[var(--color-text-secondary)]">
          <p className="text-sm text-gray-500 mb-6">Last updated on 25-04-2026</p>
          
          <p className="mb-4">
            At Mega Discount Bazar, we value your trust and respect your privacy. This Privacy Policy details how we collect, use, and protect your personal information when you visit and use our website and services.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us when you create an account, make a purchase, or contact customer support. This may include your name, email address, phone number, shipping address, and payment information. We also automatically collect certain information about your device and how you interact with our website.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Process your orders and manage your account.</li>
            <li>Communicate with you regarding your orders, updates, and promotional offers.</li>
            <li>Improve our website, services, and overall customer experience.</li>
            <li>Prevent fraud and ensure the security of our platform.</li>
          </ul>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">3. Sharing of Information</h2>
          <p className="mb-4">
            We do not sell or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and fulfilling orders, provided that those parties agree to keep this information confidential.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">4. Cookies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies help us analyze web traffic and improve our site. You can choose to accept or decline cookies through your browser settings.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to maintain the safety of your personal information. However, please understand that no method of transmission over the internet or electronic storage is 100% secure.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">6. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review this Privacy Policy periodically for any updates.
          </p>

          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-6 mb-3">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us using the information provided on our website.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
