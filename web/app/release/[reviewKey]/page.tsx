import { ReviewRoomScreen } from "@/screens/review-room/ReviewRoomScreen";
export default async function Page({ params }: { params: Promise<{ reviewKey: string }> }) {
  const { reviewKey } = await params;
  return <ReviewRoomScreen reviewKey={reviewKey} />;
}
