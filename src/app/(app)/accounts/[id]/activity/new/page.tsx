import { AddCreditCardActivityScreen } from "@/components/screens/add-credit-card-activity-screen";

interface NewCreditCardActivityPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewCreditCardActivityPage({
  params,
}: NewCreditCardActivityPageProps) {
  const { id } = await params;
  return <AddCreditCardActivityScreen accountId={id} />;
}
