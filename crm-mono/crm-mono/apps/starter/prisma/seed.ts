
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import "dotenv/config";
const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "..", "data");
function readCsv(name: string) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) return [];
  const content = fs.readFileSync(p, "utf-8");
  if (!content.trim()) return [];
  return parse(content, { columns: true, skip_empty_lines: true });
}
async function main() {
  const orgRows = readCsv("orgs.csv");
  const orgMap = new Map<string, string>();
  for (const r of orgRows) {
    const org = await prisma.organisation.create({
      data: {
        name: r.name,
        tradingName: r.trading_name || null,
        nzbn_abn: r.nzbn_abn || null,
        territory: r.territory || null,
        priceTier: r.price_tier || null,
        ownerEmail: r.owner_email || null,
        customerCode: r.customer_code || null,
      },
    });
    orgMap.set(r.name, org.id);
  }
  const pipeRows = readCsv("pipelines.csv");
  const pipelineMap = new Map<string, string>();
  for (const r of pipeRows) {
    const pname = r.pipeline_name;
    if (!pipelineMap.has(pname)) {
      const p = await prisma.pipeline.create({ data: { name: pname } });
      pipelineMap.set(pname, p.id);
    }
  }
  for (const r of pipeRows) {
    const pipelineId = pipelineMap.get(r.pipeline_name)!;
    await prisma.pipelineStage.create({
      data: {
        pipelineId,
        name: r.stage_name,
        probability: parseFloat(r.probability_0_to_1 || "0"),
        orderIndex: parseInt(r.order_index || "0", 10),
      },
    });
  }
  const boardRows = readCsv("boards_columns.csv");
  const boardMap = new Map<string, string>();
  for (const r of boardRows) {
    const bname = r.board_name;
    if (!boardMap.has(bname)) {
      const relatedOrgId = r.related_org_name_optional ? orgMap.get(r.related_org_name_optional) || null : null;
      const b = await prisma.board.create({
        data: {
          name: bname,
          scope: r["scope_(global|team|account)"] || "global",
          relatedOrgId,
        },
      });
      boardMap.set(bname, b.id);
    }
  }
  for (const r of boardRows) {
    const boardId = boardMap.get(r.board_name)!;
    await prisma.boardColumn.create({
      data: {
        boardId,
        name: r.column_name,
        orderIndex: parseInt(r.order_index || "0", 10),
        wipLimit: r.wip_limit_optional ? parseInt(r.wip_limit_optional, 10) : null,
      },
    });
  }
  const dealRows = readCsv("deals.csv");
  for (const r of dealRows) {
    const pipelineId = r.pipeline ? pipelineMap.get(r.pipeline) || null : null;
    let stageId: string | null = null;
    if (pipelineId && r.stage) {
      const stage = await prisma.pipelineStage.findFirst({
        where: { pipelineId, name: r.stage },
      });
      stageId = stage?.id || null;
    }
    await prisma.deal.create({
      data: {
        orgId: r.org_name ? orgMap.get(r.org_name) || null : null,
        personId: null,
        pipelineId,
        stageId,
        valueCents: r.value_cents ? parseInt(r.value_cents, 10) : null,
        currency: r.currency || "NZD",
        expectedClose: r.expected_close_yyyy_mm_dd ? new Date(r.expected_close_yyyy_mm_dd) : null,
        discountPct: r.discount_pct ? parseFloat(r.discount_pct) : null,
        ownerEmail: r.owner_email || null,
        notes: r.notes || null,
      },
    });
  }
  console.log("Seed complete.");
}
main().then(async()=>{await prisma.$disconnect();}).catch(async(e)=>{console.error(e);await prisma.$disconnect();process.exit(1);});
