import { AccountDetailsScreen } from "@/components/screens/account-details-screen";

interface AccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { id } = await params;
  return <AccountDetailsScreen accountId={id} />;
}
