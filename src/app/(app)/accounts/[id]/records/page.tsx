import { AccountRecordsHistoryScreen } from "@/components/screens/account-records-history-screen";

interface AccountRecordsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountRecordsPage({ params }: AccountRecordsPageProps) {
  const { id } = await params;
  return <AccountRecordsHistoryScreen accountId={id} />;
}
