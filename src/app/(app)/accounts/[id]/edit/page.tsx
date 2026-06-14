import { EditAccountRouterScreen } from "@/components/screens/edit-account-router-screen";

interface EditAccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params;
  return <EditAccountRouterScreen accountId={id} />;
}
