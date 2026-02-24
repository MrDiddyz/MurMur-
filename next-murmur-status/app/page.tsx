import StatusCard from "@/components/StatusCard";
import { fetchStatus } from "@/lib/fetchStatus";

export default async function Home() {
  const status = await fetchStatus();

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#000"
      }}
    >
      <StatusCard {...status} />
    </main>
  );
}
