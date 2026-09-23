import { PublicProofScreen } from "@/screens/public-proof/PublicProofScreen";
export default async function Page({ params }: { params: Promise<{ receiptKey: string }> }) {
  const { receiptKey } = await params;
  return <PublicProofScreen receiptKey={receiptKey} />;
}
