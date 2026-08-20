import { TrackView } from "@/components/TrackView";

export const metadata = { title: "Suivi / Tracking" };

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackView orderId={id} />;
}
