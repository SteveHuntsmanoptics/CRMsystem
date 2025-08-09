
import { prisma } from "@/lib/db";

export default async function Page() {
  const boardsCount = await prisma.board.count();
  const orgsCount = await prisma.organisation.count();
  const dealsCount = await prisma.deal.count();

  return (
    <main className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card title="Organisations" value={orgsCount} />
      <Card title="Boards" value={boardsCount} />
      <Card title="Deals" value={dealsCount} />
      <div className="col-span-1 sm:col-span-3">
        <p className="text-sm text-slate-600 mt-4">
          This is a minimal dashboard pulling live counts from your database. Use the Kanban tab to view columns.
        </p>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}
