// Simple pricing helper: RRP-based discount, GST excluded by default (NZ 15%).
export const GST_RATE = 0.15;

export function priceFromRRP(rrp: number, discountPct: number) {
  const exGst = +(rrp * (1 - discountPct / 100)).toFixed(2);
  const incGst = +(exGst * (1 + GST_RATE)).toFixed(2);
  return { exGst, incGst };
}
