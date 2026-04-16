export type ProposalEstimate = {
  systemKw: number;
  priceThb: number;
  monthlySavingsThb: number;
  annualSavingsThb: number;
  roiYears: number;
};

/**
 * Basic Thai-market heuristic (THB): kW from bill, price per kW, savings fraction.
 */
export function estimateProposal(monthlyBillThb: number): ProposalEstimate {
  const systemKw = monthlyBillThb / 600;
  const priceThb = systemKw * 35000;
  const monthlySavingsThb = monthlyBillThb * 0.6;
  const annualSavingsThb = monthlySavingsThb * 12;
  const roiYears =
    annualSavingsThb > 0 ? Math.round((priceThb / annualSavingsThb) * 10) / 10 : 0;

  return {
    systemKw: Math.round(systemKw * 1000) / 1000,
    priceThb: Math.round(priceThb * 100) / 100,
    monthlySavingsThb: Math.round(monthlySavingsThb * 100) / 100,
    annualSavingsThb: Math.round(annualSavingsThb * 100) / 100,
    roiYears,
  };
}
