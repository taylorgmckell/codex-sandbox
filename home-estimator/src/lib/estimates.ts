// Core estimate engine for mortgage math, auto-estimated costs, and amortization data.
import { inferStateFromZip } from "../data/geo";
import type {
  AmortizationPoint,
  CostInputs,
  EstimateResult,
  HomeInputs,
  LoanInputs,
  MonthlyBreakdownItem,
  OccupancyType,
  PropertyType,
  Roommate,
} from "../types";
import { clamp } from "./format";

const PROPERTY_TYPE_MULTIPLIERS: Record<
  PropertyType,
  { utilities: number; insurance: number; maintenance: number; tax: number }
> = {
  "single-family": { utilities: 1, insurance: 1, maintenance: 1, tax: 1 },
  duplex: { utilities: 1.2, insurance: 1.07, maintenance: 1.05, tax: 1.02 },
  triplex: { utilities: 1.34, insurance: 1.12, maintenance: 1.1, tax: 1.03 },
  fourplex: { utilities: 1.48, insurance: 1.18, maintenance: 1.14, tax: 1.05 },
  condo: { utilities: 0.72, insurance: 0.56, maintenance: 0.48, tax: 0.94 },
  townhouse: { utilities: 0.84, insurance: 0.78, maintenance: 0.62, tax: 0.97 },
  "multi-family": { utilities: 1.42, insurance: 1.2, maintenance: 1.15, tax: 1.04 },
};

const NATIONAL_DEFAULTS = {
  taxRate: 0.0098,
  insuranceRate: 0.0035,
};

const OCCUPANCY_CLOSING_COST: Record<OccupancyType, number> = {
  primary: 0.022,
  "second-home": 0.026,
  investment: 0.031,
};

function getDownPayment(homePrice: number, loan: LoanInputs) {
  if (loan.downPaymentMode === "amount") {
    const amount = clamp(loan.downPaymentAmount, 0, homePrice);
    const percent = homePrice > 0 ? (amount / homePrice) * 100 : 0;
    return { amount, percent };
  }

  const percent = clamp(loan.downPaymentPercent, 0, 100);
  const amount = (homePrice * percent) / 100;
  return { amount, percent };
}

function calculateMonthlyMortgage(loanAmount: number, annualRate: number, termYears: number) {
  if (loanAmount <= 0) {
    return 0;
  }
  const monthlyRate = annualRate / 100 / 12;
  const payments = termYears * 12;

  if (monthlyRate === 0) {
    return loanAmount / payments;
  }

  return (
    (loanAmount * monthlyRate * (1 + monthlyRate) ** payments) /
    ((1 + monthlyRate) ** payments - 1)
  );
}

function getAnnualPmiRate(
  mortgageType: LoanInputs["mortgageType"],
  ltv: number,
  occupancyType: OccupancyType,
) {
  if (ltv <= 0.8) {
    return 0;
  }

  if (mortgageType === "VA") {
    return 0;
  }

  if (mortgageType === "USDA") {
    return 0.0035;
  }

  if (mortgageType === "FHA") {
    return ltv >= 0.95 ? 0.0055 : 0.005;
  }

  const occupancyAdjustment =
    occupancyType === "investment" ? 0.0028 : occupancyType === "second-home" ? 0.0012 : 0;
  if (ltv >= 0.97) {
    return 0.009 + occupancyAdjustment;
  }
  if (ltv >= 0.95) {
    return 0.0072 + occupancyAdjustment;
  }
  if (ltv >= 0.9) {
    return 0.0058 + occupancyAdjustment;
  }
  if (ltv >= 0.85) {
    return 0.0041 + occupancyAdjustment;
  }
  return 0.0029 + occupancyAdjustment;
}

function estimatePropertyTax(home: HomeInputs) {
  const state = inferStateFromZip(home.zipCode);
  const taxRate = (state?.taxRate ?? NATIONAL_DEFAULTS.taxRate) * PROPERTY_TYPE_MULTIPLIERS[home.propertyType].tax;
  return {
    monthly: (home.price * taxRate) / 12,
    stateCode: state?.code ?? null,
    stateName: state?.name ?? null,
    label: state ? `${state.name} effective tax rate` : "National fallback tax estimate",
  };
}

function estimateInsurance(home: HomeInputs) {
  const state = inferStateFromZip(home.zipCode);
  const multiplier = PROPERTY_TYPE_MULTIPLIERS[home.propertyType].insurance;
  const annualRate = (state?.insuranceRate ?? NATIONAL_DEFAULTS.insuranceRate) * multiplier;
  const rebuildBuffer = home.propertyType === "condo" ? 0.82 : 1;
  return {
    monthly: (home.price * rebuildBuffer * annualRate) / 12,
    label: state ? `${state.name} insurance average` : "National fallback insurance estimate",
  };
}

function estimateUtilities(home: HomeInputs) {
  const sqft = home.squareFootage ?? Math.max(900, home.beds * 500);
  const propertyMultiplier = PROPERTY_TYPE_MULTIPLIERS[home.propertyType].utilities;
  const electric = (78 + home.beds * 22 + sqft / 65) * propertyMultiplier * 0.55;
  const gasBase = home.propertyType === "condo" ? 18 : 28;
  const gas = (gasBase + sqft / 95) * propertyMultiplier * 0.32;
  const water = (48 + home.beds * 16 + home.baths * 6) * propertyMultiplier;
  const internet = 68 + (home.propertyType === "multi-family" ? 12 : 0);

  return {
    electric,
    gas,
    water,
    internet,
    total: electric + gas + water + internet,
  };
}

function estimateMaintenance(home: HomeInputs) {
  const annualRateBase =
    home.propertyType === "condo"
      ? 0.004
      : home.propertyType === "townhouse"
        ? 0.0055
        : home.propertyType.includes("plex") || home.propertyType === "multi-family"
          ? 0.0105
          : 0.009;
  const annualRate = annualRateBase * PROPERTY_TYPE_MULTIPLIERS[home.propertyType].maintenance;
  return (home.price * annualRate) / 12;
}

function estimateFundingFee(homePrice: number, loan: LoanInputs, downPaymentPercent: number) {
  if (loan.mortgageType === "VA") {
    const rate = downPaymentPercent >= 10 ? 0.014 : downPaymentPercent >= 5 ? 0.015 : 0.0215;
    return homePrice * rate;
  }
  if (loan.mortgageType === "USDA") {
    return homePrice * 0.01;
  }
  return 0;
}

function buildAmortization(
  loanAmount: number,
  annualRate: number,
  termYears: number,
  monthlyPayment: number,
): AmortizationPoint[] {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  let remaining = loanAmount;
  let principalPaid = 0;
  let interestPaid = 0;
  const rows: AmortizationPoint[] = [{ year: 0, balance: loanAmount, principalPaid: 0, interestPaid: 0 }];

  for (let month = 1; month <= totalMonths; month += 1) {
    const interest = monthlyRate === 0 ? 0 : remaining * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, remaining);
    remaining = Math.max(0, remaining - principal);
    principalPaid += principal;
    interestPaid += interest;

    if (month % 12 === 0 || month === totalMonths) {
      rows.push({
        year: Math.ceil(month / 12),
        balance: remaining,
        principalPaid,
        interestPaid,
      });
    }
  }

  return rows;
}

export function calculateEstimate(
  home: HomeInputs,
  loan: LoanInputs,
  costs: CostInputs,
  roommates: Roommate[],
  vacancyRate: number,
): EstimateResult {
  const downPayment = getDownPayment(home.price, loan);
  const loanAmount = Math.max(0, home.price - downPayment.amount);
  const monthlyPrincipalInterest = calculateMonthlyMortgage(loanAmount, loan.interestRate, loan.termYears);
  const ltv = home.price > 0 ? loanAmount / home.price : 0;

  const taxEstimate = estimatePropertyTax(home);
  const insuranceEstimate = estimateInsurance(home);
  const utilityEstimate = estimateUtilities(home);
  const maintenanceEstimate = estimateMaintenance(home);
  const monthlyPmiEstimate = (loanAmount * getAnnualPmiRate(loan.mortgageType, ltv, loan.occupancyType)) / 12;

  const monthlyTaxes =
    costs.propertyTaxMode === "manual" ? costs.propertyTaxMonthly : taxEstimate.monthly;
  const monthlyInsurance =
    costs.insuranceMode === "manual" ? costs.insuranceMonthly : insuranceEstimate.monthly;
  const monthlyPmi = costs.pmiMode === "manual" ? costs.pmiMonthly : monthlyPmiEstimate;
  const utilityBreakdown =
    costs.utilitiesMode === "manual"
      ? {
          electric: costs.electricMonthly,
          gas: costs.gasMonthly,
          water: costs.waterMonthly,
          internet: costs.internetMonthly,
        }
      : {
          electric: utilityEstimate.electric,
          gas: utilityEstimate.gas,
          water: utilityEstimate.water,
          internet: utilityEstimate.internet,
        };
  const monthlyUtilities =
    utilityBreakdown.electric +
    utilityBreakdown.gas +
    utilityBreakdown.water +
    utilityBreakdown.internet;
  const monthlyMaintenance =
    costs.maintenanceMode === "manual" ? costs.maintenanceMonthly : maintenanceEstimate;

  const totalOwnershipCost =
    monthlyPrincipalInterest +
    monthlyTaxes +
    monthlyInsurance +
    monthlyPmi +
    home.hoaMonthly +
    monthlyUtilities +
    monthlyMaintenance;

  const grossRoommateIncome = roommates.reduce(
    (sum, roommate) => sum + (roommate.isActive ? roommate.rent : 0),
    0,
  );
  const vacancyLoss = grossRoommateIncome * (clamp(vacancyRate, 0, 100) / 100);
  const effectiveRoommateIncome = grossRoommateIncome - vacancyLoss;
  const netMonthlyCost = totalOwnershipCost - effectiveRoommateIncome;

  const closingCosts = home.price * OCCUPANCY_CLOSING_COST[loan.occupancyType];
  const prepaidReserves = monthlyTaxes * 3 + monthlyInsurance * 12;
  const fundingFee = estimateFundingFee(home.price, loan, downPayment.percent);
  const estimatedCashToClose = downPayment.amount + closingCosts + prepaidReserves + fundingFee;
  const totalInterestPaid =
    monthlyPrincipalInterest * loan.termYears * 12 - loanAmount;

  const breakdown: MonthlyBreakdownItem[] = [
    { label: "Principal + Interest", value: monthlyPrincipalInterest, color: "#16181d" },
    { label: "Taxes", value: monthlyTaxes, color: "#f97316" },
    { label: "Insurance", value: monthlyInsurance, color: "#f5b942" },
    { label: "PMI / MIP", value: monthlyPmi, color: "#fb7185" },
    { label: "HOA", value: home.hoaMonthly, color: "#3b82f6" },
    { label: "Utilities", value: monthlyUtilities, color: "#14b8a6" },
    { label: "Maintenance", value: monthlyMaintenance, color: "#8b5cf6" },
  ].filter((item) => item.value > 0.5);

  const notes: string[] = [];
  notes.push(
    costs.propertyTaxMode === "auto"
      ? `Property taxes estimated from ${taxEstimate.label.toLowerCase()}.`
      : "Property tax is using your manual value.",
  );
  notes.push(
    costs.insuranceMode === "auto"
      ? `Insurance estimated from price, ${home.propertyType}, and ${insuranceEstimate.label.toLowerCase()}.`
      : "Insurance is using your manual value.",
  );
  notes.push(
    costs.utilitiesMode === "auto"
      ? "Utilities estimated from beds, baths, square footage, and property type."
      : "Utilities are using your manual line items.",
  );
  notes.push(
    costs.maintenanceMode === "auto"
      ? "Maintenance reserve assumes a monthly capital reserve based on property type."
      : "Maintenance reserve is using your manual value.",
  );
  if (costs.pmiMode === "auto") {
    notes.push(
      monthlyPmi > 0
        ? `PMI/MIP is estimated from LTV, ${loan.mortgageType}, and occupancy.`
        : `${loan.mortgageType} currently does not add a monthly PMI estimate at this down payment.`,
    );
  }

  return {
    context: {
      stateCode: taxEstimate.stateCode,
      stateName: taxEstimate.stateName,
      regionalLabel: taxEstimate.label,
    },
    homePrice: home.price,
    downPaymentAmount: downPayment.amount,
    downPaymentPercent: downPayment.percent,
    loanAmount,
    monthlyPrincipalInterest,
    monthlyTaxes,
    monthlyInsurance,
    monthlyPmi,
    monthlyHoa: home.hoaMonthly,
    monthlyUtilities,
    utilityBreakdown,
    monthlyMaintenance,
    totalOwnershipCost,
    grossRoommateIncome,
    effectiveRoommateIncome,
    vacancyLoss,
    netMonthlyCost,
    closingCosts,
    prepaidReserves,
    fundingFee,
    estimatedCashToClose,
    totalInterestPaid,
    breakdown,
    amortization: buildAmortization(
      loanAmount,
      loan.interestRate,
      loan.termYears,
      monthlyPrincipalInterest,
    ),
    notes,
  };
}
