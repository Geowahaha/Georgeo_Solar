import type { LeadTemperature } from "@/types/database";

export type ScoringInput = {
  monthlyBillThb: number;
  roofImageCount: number;
  hasLocation: boolean;
  budgetRange: string;
};

const HIGH_BUDGET_MARKERS = [
  "high",
  "500k",
  "500000",
  "1m",
  "1000000",
  "premium",
  "unlimited",
];

export function computeLeadScore(input: ScoringInput): number {
  let score = 0;

  if (input.monthlyBillThb > 3000) {
    score += 30;
  }

  if (input.roofImageCount > 0) {
    score += 20;
  }

  if (input.hasLocation) {
    score += 10;
  }

  const budgetLower = input.budgetRange.toLowerCase();
  if (HIGH_BUDGET_MARKERS.some((m) => budgetLower.includes(m))) {
    score += 20;
  }

  return Math.min(100, score);
}

export function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 70) return "HOT";
  if (score >= 40) return "WARM";
  return "COLD";
}
