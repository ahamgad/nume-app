import { AddAccountTypeRouterScreen } from "@/components/screens/add-account-type-router-screen";

interface NewAccountTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function NewAccountTypePage({ params }: NewAccountTypePageProps) {
  const { type } = await params;
  return <AddAccountTypeRouterScreen type={type} />;
}
