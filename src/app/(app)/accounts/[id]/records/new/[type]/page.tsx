import { AddRecordFormScreen } from "@/components/screens/add-record-form-screen";
import type { RecordType } from "@/lib/finance/types";

interface NewRecordTypePageProps {
  params: Promise<{ id: string; type: string }>;
}

function isRecordType(value: string): value is RecordType {
  return (
    value === "income" ||
    value === "expense" ||
    value === "transfer" ||
    value === "adjustment"
  );
}

export default async function NewRecordTypePage({
  params,
}: NewRecordTypePageProps) {
  const { id, type } = await params;
  if (!isRecordType(type)) {
    return null;
  }
  return <AddRecordFormScreen accountId={id} type={type} />;
}
