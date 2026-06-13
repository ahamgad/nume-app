import { EditCertificateScreen } from "@/components/screens/edit-certificate-screen";

interface EditCertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificatePage({ params }: EditCertificatePageProps) {
  const { id } = await params;
  return <EditCertificateScreen accountId={id} />;
}
