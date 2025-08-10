export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>{process.env.NEXT_PUBLIC_APP_NAME || 'CRM System'}</h1>
      <p>Welcome. API health: <a href="/api/health">/api/health</a></p>
    </main>
  );
}