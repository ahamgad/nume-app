import { AddCreditCardPurchaseScreen } from "@/components/screens/add-credit-card-purchase-screen";

interface NewCreditCardPurchasePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewCreditCardPurchasePage({
  params,
}: NewCreditCardPurchasePageProps) {
  const { id } = await params;
  return <AddCreditCardPurchaseScreen accountId={id} />;
}
