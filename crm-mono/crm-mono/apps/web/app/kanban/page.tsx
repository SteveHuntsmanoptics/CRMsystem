
import { prisma } from "@/lib/db";
import KanbanBoard from "@/components/KanbanBoard";

export default async function Kanban() {
  const board = await prisma.board.findFirst({
    include: { columns: { orderBy: { orderIndex: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main>
      <h2 className="text-xl font-semibold mb-4">Kanban</h2>
      {!board ? (
        <p className="text-sm text-slate-600">No boards yet. Seed some data to see columns.</p>
      ) : (
        <KanbanBoard board={board as any} />
      )}
    </main>
  );
}
