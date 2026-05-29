// PDF-derived lender worksheet scenarios used to estimate monthly payment and cash-to-close ranges.
export interface LenderScenario {
  purchasePrice: number;
  baseLoanAmount: number;
  closingCosts: number;
  prepaidReserves: number;
  totalMonthlyPayment: number;
  principalInterest: number;
  insurance: number;
  taxes: number;
  mortgageInsurance: number;
  hoa: number;
  estimatedCashFromBorrower: number;
}

export const LENDER_WORKSHEET_SCENARIOS: LenderScenario[] = [
  {
    purchasePrice: 400000,
    baseLoanAmount: 380000,
    closingCosts: 7905,
    prepaidReserves: 1891.21,
    totalMonthlyPayment: 2771.21,
    principalInterest: 2278.29,
    insurance: 88.67,
    taxes: 168.75,
    mortgageInsurance: 85.5,
    hoa: 150,
    estimatedCashFromBorrower: 29796.21,
  },
  {
    purchasePrice: 450000,
    baseLoanAmount: 427500,
    closingCosts: 8380,
    prepaidReserves: 2085.37,
    totalMonthlyPayment: 3077.77,
    principalInterest: 2563.08,
    insurance: 99.75,
    taxes: 168.75,
    mortgageInsurance: 96.19,
    hoa: 150,
    estimatedCashFromBorrower: 32965.37,
  },
  {
    purchasePrice: 500000,
    baseLoanAmount: 475000,
    closingCosts: 8855,
    prepaidReserves: 2328.29,
    totalMonthlyPayment: 3408.7,
    principalInterest: 2847.86,
    insurance: 110.83,
    taxes: 193.13,
    mortgageInsurance: 106.88,
    hoa: 150,
    estimatedCashFromBorrower: 36183.29,
  },
];

function interpolateValue(
  price: number,
  field: keyof LenderScenario,
): number {
  const scenarios = LENDER_WORKSHEET_SCENARIOS;

  if (price <= scenarios[0].purchasePrice) {
    const low = scenarios[0];
    const high = scenarios[1];
    const ratio = (price - low.purchasePrice) / (high.purchasePrice - low.purchasePrice);
    return low[field] + (high[field] - low[field]) * ratio;
  }

  for (let index = 0; index < scenarios.length - 1; index += 1) {
    const low = scenarios[index];
    const high = scenarios[index + 1];
    if (price >= low.purchasePrice && price <= high.purchasePrice) {
      const ratio = (price - low.purchasePrice) / (high.purchasePrice - low.purchasePrice);
      return low[field] + (high[field] - low[field]) * ratio;
    }
  }

  const low = scenarios[scenarios.length - 2];
  const high = scenarios[scenarios.length - 1];
  const ratio = (price - low.purchasePrice) / (high.purchasePrice - low.purchasePrice);
  return low[field] + (high[field] - low[field]) * ratio;
}

export function estimateWorksheetScenario(price: number): LenderScenario {
  return {
    purchasePrice: price,
    baseLoanAmount: interpolateValue(price, "baseLoanAmount"),
    closingCosts: interpolateValue(price, "closingCosts"),
    prepaidReserves: interpolateValue(price, "prepaidReserves"),
    totalMonthlyPayment: interpolateValue(price, "totalMonthlyPayment"),
    principalInterest: interpolateValue(price, "principalInterest"),
    insurance: interpolateValue(price, "insurance"),
    taxes: interpolateValue(price, "taxes"),
    mortgageInsurance: interpolateValue(price, "mortgageInsurance"),
    hoa: interpolateValue(price, "hoa"),
    estimatedCashFromBorrower: interpolateValue(price, "estimatedCashFromBorrower"),
  };
}

export function estimateMaxWorksheetPriceForMonthlyBudget(monthlyBudget: number): number {
  const low = LENDER_WORKSHEET_SCENARIOS[0];
  const high = LENDER_WORKSHEET_SCENARIOS[LENDER_WORKSHEET_SCENARIOS.length - 1];
  const slope =
    (high.totalMonthlyPayment - low.totalMonthlyPayment) /
    (high.purchasePrice - low.purchasePrice);
  return low.purchasePrice + (monthlyBudget - low.totalMonthlyPayment) / slope;
}

export function estimateMaxWorksheetPriceForCash(cashBudget: number): number {
  const low = LENDER_WORKSHEET_SCENARIOS[0];
  const high = LENDER_WORKSHEET_SCENARIOS[LENDER_WORKSHEET_SCENARIOS.length - 1];
  const slope =
    (high.estimatedCashFromBorrower - low.estimatedCashFromBorrower) /
    (high.purchasePrice - low.purchasePrice);
  return low.purchasePrice + (cashBudget - low.estimatedCashFromBorrower) / slope;
}
