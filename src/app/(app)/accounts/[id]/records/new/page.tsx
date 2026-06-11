import { AddRecordTypeScreen } from "@/components/screens/add-record-type-screen";

interface NewRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewRecordPage({ params }: NewRecordPageProps) {
  const { id } = await params;
  return <AddRecordTypeScreen accountId={id} />;
}
