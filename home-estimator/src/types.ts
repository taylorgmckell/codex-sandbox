export type PropertyType =
  | "single-family"
  | "duplex"
  | "triplex"
  | "fourplex"
  | "condo"
  | "townhouse"
  | "multi-family";

export type MortgageType = "conventional" | "FHA" | "VA" | "USDA";
export type OccupancyType = "primary" | "second-home" | "investment";
export type DownPaymentMode = "amount" | "percent";
export type EstimateMode = "auto" | "manual";

export interface Roommate {
  id: string;
  name: string;
  rent: number;
  notes: string;
  isActive: boolean;
}

export interface HomeInputs {
  price: number;
  beds: number;
  baths: number;
  squareFootage: number | null;
  zipCode: string;
  propertyType: PropertyType;
  hoaMonthly: number;
}

export interface LoanInputs {
  downPaymentMode: DownPaymentMode;
  downPaymentAmount: number;
  downPaymentPercent: number;
  interestRate: number;
  termYears: 15 | 20 | 30;
  mortgageType: MortgageType;
  occupancyType: OccupancyType;
}

export interface CostInputs {
  propertyTaxMode: EstimateMode;
  propertyTaxMonthly: number;
  insuranceMode: EstimateMode;
  insuranceMonthly: number;
  pmiMode: EstimateMode;
  pmiMonthly: number;
  utilitiesMode: EstimateMode;
  electricMonthly: number;
  gasMonthly: number;
  waterMonthly: number;
  internetMonthly: number;
  maintenanceMode: EstimateMode;
  maintenanceMonthly: number;
}

export interface EstimateContext {
  stateCode: string | null;
  stateName: string | null;
  regionalLabel: string;
}

export interface MonthlyBreakdownItem {
  label: string;
  value: number;
  color: string;
}

export interface AmortizationPoint {
  year: number;
  balance: number;
  principalPaid: number;
  interestPaid: number;
}

export interface EstimateResult {
  context: EstimateContext;
  homePrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  loanAmount: number;
  monthlyPrincipalInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  monthlyUtilities: number;
  utilityBreakdown: {
    electric: number;
    gas: number;
    water: number;
    internet: number;
  };
  monthlyMaintenance: number;
  totalOwnershipCost: number;
  grossRoommateIncome: number;
  effectiveRoommateIncome: number;
  vacancyLoss: number;
  netMonthlyCost: number;
  closingCosts: number;
  prepaidReserves: number;
  fundingFee: number;
  estimatedCashToClose: number;
  totalInterestPaid: number;
  breakdown: MonthlyBreakdownItem[];
  amortization: AmortizationPoint[];
  notes: string[];
}
