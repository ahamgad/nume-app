import { AddCreditCardPaymentScreen } from "@/components/screens/add-credit-card-payment-screen";

interface NewCreditCardPaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewCreditCardPaymentPage({
  params,
}: NewCreditCardPaymentPageProps) {
  const { id } = await params;
  return <AddCreditCardPaymentScreen accountId={id} />;
}
