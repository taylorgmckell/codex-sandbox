// Lender-style affordability model that separates gross-income qualification from house-hack net cost.
import { estimateMaxWorksheetPriceForCash } from "../data/lenderCalibration";
import { calculateEstimate } from "./estimates";
import type { CostInputs, EstimateResult, HomeInputs, LoanInputs, Roommate } from "../types";

export const FRONT_END_RATIO = 0.28;
export const BACK_END_RATIO = 0.43;
export const PERSONAL_COMFORT_NET_RATIO = 0.35;

export interface AffordabilityInputs {
  grossAnnualSalary: number;
  monthlyTakeHome: number;
  monthlyDebtPayments: number;
  availableCash: number;
}

export interface AffordabilityScenario {
  price: number;
  estimate: EstimateResult;
}

export interface AffordabilityModelResult {
  inputs: AffordabilityInputs;
  grossMonthlyIncome: number;
  affordabilityRatioUsed: number;
  backEndRatioUsed: number;
  frontEndLimit: number;
  backEndLimit: number;
  maximumMonthlyHousingPaymentAllowed: number;
  cashLimitedPurchasePrice: number;
  paymentLimitedPurchasePrice: number;
  maximumAffordablePurchasePrice: number;
  maximumAffordableScenario: AffordabilityScenario;
  selectedScenario: AffordabilityScenario;
  lenderStyleAffordable: boolean;
  personalComfortAffordable: boolean;
  onlyAffordableBecauseOfRoommates: boolean;
  safeBudgetAffordable: boolean;
  statusLabel: "Comfortably Affordable" | "Affordable" | "Stretching Budget" | "Not Recommended";
  statusReason: string;
}

function buildScenario(
  price: number,
  home: HomeInputs,
  loan: LoanInputs,
  costs: CostInputs,
  roommates: Roommate[],
  vacancyRate: number,
): AffordabilityScenario {
  const estimate = calculateEstimate(
    { ...home, price },
    loan,
    costs,
    roommates,
    vacancyRate,
  );

  return {
    price,
    estimate,
  };
}

function searchMaximumPriceForMonthlyHousingBudget(
  monthlyBudget: number,
  home: HomeInputs,
  loan: LoanInputs,
  costs: CostInputs,
): AffordabilityScenario {
  const noRoommates: Roommate[] = [];
  const lowScenario = buildScenario(50000, home, loan, costs, noRoommates, 0);
  if (lowScenario.estimate.monthlyHousingPayment > monthlyBudget) {
    return lowScenario;
  }

  let low = 50000;
  let high = Math.max(home.price * 2, 250000);
  let highScenario = buildScenario(high, home, loan, costs, noRoommates, 0);

  while (highScenario.estimate.monthlyHousingPayment <= monthlyBudget && high < 3000000) {
    high *= 1.25;
    highScenario = buildScenario(high, home, loan, costs, noRoommates, 0);
  }

  let bestScenario = lowScenario;
  for (let iteration = 0; iteration < 30; iteration += 1) {
    const mid = (low + high) / 2;
    const scenario = buildScenario(mid, home, loan, costs, noRoommates, 0);

    if (scenario.estimate.monthlyHousingPayment <= monthlyBudget) {
      low = mid;
      bestScenario = scenario;
    } else {
      high = mid;
    }
  }

  return {
    price: Math.round(bestScenario.price),
    estimate: buildScenario(Math.round(bestScenario.price), home, loan, costs, noRoommates, 0).estimate,
  };
}

function getStatusLabel(result: {
  lenderStyleAffordable: boolean;
  personalComfortAffordable: boolean;
  onlyAffordableBecauseOfRoommates: boolean;
  selectedHousingPayment: number;
  maxHousingPayment: number;
  selectedNetCost: number;
  takeHomeLimit: number;
  availableCash: number;
  estimatedCashToClose: number;
}): { label: AffordabilityModelResult["statusLabel"]; reason: string } {
  if (
    result.lenderStyleAffordable &&
    result.personalComfortAffordable &&
    result.availableCash >= result.estimatedCashToClose
  ) {
    return {
      label: "Comfortably Affordable",
      reason:
        "The home fits the lender-style housing budget, fits the personal monthly comfort budget, and your available cash covers the estimated amount needed to close.",
    };
  }

  if (result.lenderStyleAffordable && result.availableCash >= result.estimatedCashToClose) {
    if (result.onlyAffordableBecauseOfRoommates) {
      return {
        label: "Affordable",
        reason:
          "The home appears to qualify under the lender-style budget and your cash covers closing, but your personal comfort depends on roommate income to keep the monthly cost manageable.",
      };
    }
    return {
      label: "Affordable",
      reason:
        "The home appears to fit the lender-style budget and your available cash covers closing, even if it uses a meaningful portion of your monthly budget.",
    };
  }

  if (result.onlyAffordableBecauseOfRoommates || result.selectedHousingPayment <= result.maxHousingPayment * 1.08) {
    return {
      label: "Stretching Budget",
      reason:
        "The home is near or above the lender-style budget limit, or it only feels manageable once roommate income is included in your personal monthly picture.",
    };
  }

  return {
    label: "Not Recommended",
    reason:
      "The home sits outside the modeled lender-style budget, requires more cash than the current purchase budget supports, or both.",
  };
}

export function calculateAffordabilityModel(
  inputs: AffordabilityInputs,
  home: HomeInputs,
  loan: LoanInputs,
  costs: CostInputs,
  roommates: Roommate[],
  vacancyRate: number,
): AffordabilityModelResult {
  const grossMonthlyIncome = inputs.grossAnnualSalary / 12;
  const frontEndLimit = grossMonthlyIncome * FRONT_END_RATIO;
  const backEndLimit = Math.max(0, grossMonthlyIncome * BACK_END_RATIO - inputs.monthlyDebtPayments);
  const maximumMonthlyHousingPaymentAllowed = Math.max(0, Math.min(frontEndLimit, backEndLimit));
  const paymentLimitedScenario = searchMaximumPriceForMonthlyHousingBudget(
    maximumMonthlyHousingPaymentAllowed,
    home,
    loan,
    costs,
  );
  const cashLimitedPurchasePrice = estimateMaxWorksheetPriceForCash(inputs.availableCash);
  const maximumAffordablePurchasePrice = Math.max(
    0,
    Math.min(paymentLimitedScenario.price, cashLimitedPurchasePrice),
  );
  const maximumAffordableScenario = buildScenario(
    Math.round(maximumAffordablePurchasePrice),
    home,
    loan,
    costs,
    roommates,
    vacancyRate,
  );
  const selectedScenario = buildScenario(home.price, home, loan, costs, roommates, vacancyRate);

  const lenderStyleAffordable =
    selectedScenario.estimate.monthlyHousingPayment <= maximumMonthlyHousingPaymentAllowed &&
    selectedScenario.price <= cashLimitedPurchasePrice;
  const takeHomeComfortLimit = inputs.monthlyTakeHome * PERSONAL_COMFORT_NET_RATIO;
  const personalComfortAffordable = selectedScenario.estimate.netMonthlyCost <= takeHomeComfortLimit;
  const onlyAffordableBecauseOfRoommates =
    selectedScenario.estimate.netMonthlyCost <= takeHomeComfortLimit &&
    selectedScenario.estimate.totalOwnershipCost > takeHomeComfortLimit;
  const safeBudgetAffordable =
    lenderStyleAffordable &&
    personalComfortAffordable &&
    inputs.availableCash >= selectedScenario.estimate.estimatedCashToClose;
  const status = getStatusLabel({
    lenderStyleAffordable,
    personalComfortAffordable,
    onlyAffordableBecauseOfRoommates,
    selectedHousingPayment: selectedScenario.estimate.monthlyHousingPayment,
    maxHousingPayment: maximumMonthlyHousingPaymentAllowed,
    selectedNetCost: selectedScenario.estimate.netMonthlyCost,
    takeHomeLimit: takeHomeComfortLimit,
    availableCash: inputs.availableCash,
    estimatedCashToClose: selectedScenario.estimate.estimatedCashToClose,
  });

  return {
    inputs,
    grossMonthlyIncome,
    affordabilityRatioUsed: FRONT_END_RATIO,
    backEndRatioUsed: BACK_END_RATIO,
    frontEndLimit,
    backEndLimit,
    maximumMonthlyHousingPaymentAllowed,
    cashLimitedPurchasePrice,
    paymentLimitedPurchasePrice: paymentLimitedScenario.price,
    maximumAffordablePurchasePrice,
    maximumAffordableScenario,
    selectedScenario,
    lenderStyleAffordable,
    personalComfortAffordable,
    onlyAffordableBecauseOfRoommates,
    safeBudgetAffordable,
    statusLabel: status.label,
    statusReason: status.reason,
  };
}
