import HealthStatus from "./components/HealthStatus";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>RightWhip</h1>
      <HealthStatus />
    </main>
  );
}