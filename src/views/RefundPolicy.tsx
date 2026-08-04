import { Card, CardContent } from '@/components/ui/card';

const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-[var(--color-brand-red)]">Cancellation & Refund Policy</h1>
      <Card>
        <CardContent className="p-8 prose prose-sm sm:prose lg:prose-lg max-w-none text-[var(--color-text-secondary)]">
          <p className="text-sm text-gray-500 mb-6">Last updated on 25-04-2026 08:39:42</p>
          <p className="mb-4">
            Mega Discount Bazar believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
          </p>
          <ul className="list-disc pl-6 space-y-4 mb-4">
            <li>
              Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
            </li>
            <li>
              Mega Discount Bazar does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
            </li>
            <li>
              In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 2 Days of receipt of the products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 2 Days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
            </li>
            <li>
              In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them. In case of any Refunds approved by the Mega Discount Bazar, it’ll take 6-8 Days for the refund to be processed to the end customer.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundPolicy;
