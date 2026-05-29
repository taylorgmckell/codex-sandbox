// Separate affordability page that explains lender-style qualification and house-hack comfort with auditable inputs.
import { useMemo } from "react";
import {
  type AffordabilityInputs,
  calculateAffordabilityModel,
  PERSONAL_COMFORT_NET_RATIO,
} from "../lib/affordability";
import { formatCurrency, formatPercent } from "../lib/format";
import type { CostInputs, HomeInputs, LoanInputs, PropertyType, Roommate } from "../types";

interface AffordabilityDashboardProps {
  home: HomeInputs;
  loan: LoanInputs;
  costs: CostInputs;
  roommates: Roommate[];
  vacancyRate: number;
  inputs: AffordabilityInputs;
  onInputsChange: <K extends keyof AffordabilityInputs>(
    key: K,
    value: AffordabilityInputs[K],
  ) => void;
}

function DashboardInput({
  label,
  helper,
  prefix,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  prefix?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/20">
        {prefix ? <span className="text-sm font-medium text-slate">{prefix}</span> : null}
        <input
          className="w-full bg-transparent text-base text-ink outline-none"
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      <span className="mt-2 block text-xs leading-5 text-slate">{helper}</span>
    </label>
  );
}

function SummaryValue({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate">{helper}</p>
    </div>
  );
}

function ComparisonValue({
  label,
  selected,
  maximum,
  helper,
}: {
  label: string;
  selected: string;
  maximum: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate">{label}</p>
      <div className="mt-3 grid gap-2 text-sm text-ink">
        <div className="flex items-center justify-between gap-4">
          <span>Selected home</span>
          <span className="font-semibold">{selected}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Maximum model home</span>
          <span className="font-semibold">{maximum}</span>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate">{helper}</p>
    </div>
  );
}

function labelForPropertyType(propertyType: PropertyType): string {
  switch (propertyType) {
    case "single-family":
      return "Single-family";
    case "multi-family":
      return "Multi-family";
    default:
      return propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
  }
}

function getRecommendedPropertyTypes(maxPrice: number): string {
  if (maxPrice < 325000) {
    return "Condo or townhouse";
  }
  if (maxPrice < 425000) {
    return "Townhouse, condo, or smaller single-family home";
  }
  if (maxPrice < 525000) {
    return "Single-family, townhouse, condo, or entry duplex";
  }
  return "Single-family, townhouse, condo, duplex, or selected small multi-unit properties";
}

export function AffordabilityDashboard({
  home,
  loan,
  costs,
  roommates,
  vacancyRate,
  inputs,
  onInputsChange,
}: AffordabilityDashboardProps) {
  const model = useMemo(
    () =>
      calculateAffordabilityModel(
        inputs,
        home,
        loan,
        costs,
        roommates,
        vacancyRate,
      ),
    [costs, home, inputs, loan, roommates, vacancyRate],
  );

  const affordabilityUsed =
    model.maximumAffordablePurchasePrice > 0
      ? (home.price / model.maximumAffordablePurchasePrice) * 100
      : 0;
  const remainingAffordabilityBuffer = model.maximumAffordablePurchasePrice - home.price;
  const priceDifference = model.maximumAffordablePurchasePrice - home.price;
  const housingPaymentDifference =
    model.maximumAffordableScenario.estimate.monthlyHousingPayment -
    model.selectedScenario.estimate.monthlyHousingPayment;
  const ownershipCostDifference =
    model.maximumAffordableScenario.estimate.totalOwnershipCost -
    model.selectedScenario.estimate.totalOwnershipCost;
  const netCostDifference =
    model.maximumAffordableScenario.estimate.netMonthlyCost -
    model.selectedScenario.estimate.netMonthlyCost;

  const resultTone =
    model.statusLabel === "Comfortably Affordable"
      ? "border-teal-100 bg-teal-50"
      : model.statusLabel === "Affordable"
        ? "border-sky-100 bg-sky-50"
        : model.statusLabel === "Stretching Budget"
          ? "border-amber-100 bg-amber-50"
          : "border-rose-100 bg-rose-50";

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-br from-cream to-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
          Taylor&apos;s affordability dashboard
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">
          A clean answer to whether this home fits your budget.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate">
          This page intentionally separates{" "}
          <span className="font-semibold text-ink">maximum lender-style affordable property</span>{" "}
          from{" "}
          <span className="font-semibold text-ink">your net monthly cost after roommates</span>.
          Those are not the same thing, so the dashboard shows both clearly.
        </p>
      </div>

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6">
        <h3 className="text-xl font-semibold text-ink">1. Personal Financial Summary</h3>
        <p className="mt-2 text-sm leading-6 text-slate">
          These are the four inputs the affordability model uses from you.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <DashboardInput
            label="Gross annual salary"
            prefix="$"
            value={inputs.grossAnnualSalary}
            onChange={(value) => onInputsChange("grossAnnualSalary", value)}
            helper="Used for lender-style affordability. This is before taxes."
          />
          <DashboardInput
            label="Monthly take-home pay"
            prefix="$"
            value={inputs.monthlyTakeHome}
            onChange={(value) => onInputsChange("monthlyTakeHome", value)}
            helper="Used only for personal comfort checks, not for lender-style qualification."
          />
          <DashboardInput
            label="Monthly debt payments"
            prefix="$"
            value={inputs.monthlyDebtPayments}
            onChange={(value) => onInputsChange("monthlyDebtPayments", value)}
            helper="Required debts like car, student loan, or credit card minimums."
          />
          <DashboardInput
            label="Available cash for home purchase"
            prefix="$"
            value={inputs.availableCash}
            onChange={(value) => onInputsChange("availableCash", value)}
            helper="Used to test whether you likely have enough cash for down payment and closing."
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryValue label="Gross annual income" value={formatCurrency(inputs.grossAnnualSalary)} helper="Before taxes." />
          <SummaryValue label="Monthly take-home pay" value={formatCurrency(inputs.monthlyTakeHome)} helper="After taxes and deductions." />
          <SummaryValue label="Monthly debt obligations" value={formatCurrency(inputs.monthlyDebtPayments)} helper="Debt that lenders count against your budget." />
          <SummaryValue label="Available purchase cash" value={formatCurrency(inputs.availableCash)} helper="Cash available for down payment and closing costs." />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6">
        <h3 className="text-xl font-semibold text-ink">2. Property Summary</h3>
        <p className="mt-2 text-sm leading-6 text-slate">
          This is the specific home currently being analyzed on the estimator page.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryValue label="Purchase price" value={formatCurrency(home.price)} helper="Current selected property price." />
          <SummaryValue
            label="Property details"
            value={labelForPropertyType(home.propertyType)}
            helper={`${home.beds} bed, ${home.baths} bath${home.squareFootage ? `, ${home.squareFootage.toLocaleString()} sq ft` : ""}`}
          />
          <SummaryValue
            label="Current home monthly housing payment"
            value={formatCurrency(model.selectedScenario.estimate.monthlyHousingPayment)}
            helper="Lender-style payment: principal, interest, taxes, insurance, PMI, and HOA."
          />
          <SummaryValue
            label="Current total monthly ownership cost"
            value={formatCurrency(model.selectedScenario.estimate.totalOwnershipCost)}
            helper="All-in monthly cost including utilities and maintenance."
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6">
        <h3 className="text-xl font-semibold text-ink">3. Maximum Affordable Property</h3>
        <p className="mt-2 text-sm leading-6 text-slate">
          This section answers: what is the maximum property you can realistically afford under a
          lender-style qualification model using gross income and debt?
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryValue
            label="Maximum lender-style affordable property"
            value={formatCurrency(model.maximumAffordablePurchasePrice)}
            helper="This is the lower of the payment-based limit and the cash-to-close limit."
          />
          <SummaryValue
            label="Estimated maximum loan amount"
            value={formatCurrency(model.maximumAffordableScenario.estimate.loanAmount)}
            helper="Based on your current rate, term, mortgage type, and down payment setup."
          />
          <SummaryValue
            label="Maximum monthly housing payment allowed"
            value={formatCurrency(model.maximumMonthlyHousingPaymentAllowed)}
            helper="This is the gross-income-based housing budget used before converting to a price."
          />
          <SummaryValue
            label="Recommended property type(s)"
            value={getRecommendedPropertyTypes(model.maximumAffordablePurchasePrice)}
            helper="A simple guide to what usually fits at this price range."
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6">
        <h3 className="text-xl font-semibold text-ink">4. Affordability Comparison</h3>
        <p className="mt-2 text-sm leading-6 text-slate">
          This answers: how does your current home compare to the maximum affordable home in the model?
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryValue
            label="Purchase price difference"
            value={formatCurrency(priceDifference)}
            helper="Positive means your current home is below the modeled max. Negative means it is above."
          />
          <SummaryValue
            label="Monthly housing payment difference"
            value={formatCurrency(housingPaymentDifference)}
            helper="Compares lender-style housing payment for the current home vs the max home."
          />
          <SummaryValue
            label="Percentage of affordability used"
            value={formatPercent(affordabilityUsed)}
            helper="100% means the current home is right at the modeled maximum lender-style price."
          />
          <SummaryValue
            label="Remaining affordability buffer"
            value={formatCurrency(remainingAffordabilityBuffer)}
            helper="How much price headroom is left before you reach the modeled maximum."
          />
          <SummaryValue
            label="Total ownership cost difference"
            value={formatCurrency(ownershipCostDifference)}
            helper="Difference between all-in monthly ownership cost for the max home and the selected home."
          />
          <SummaryValue
            label="Net cost after roommates difference"
            value={formatCurrency(netCostDifference)}
            helper="Difference between roommate-adjusted net monthly cost for the max home and the selected home."
          />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ComparisonValue
            label="Purchase price"
            selected={formatCurrency(model.selectedScenario.price)}
            maximum={formatCurrency(model.maximumAffordableScenario.price)}
            helper="Direct comparison between the selected home and the maximum lender-style affordable home."
          />
          <ComparisonValue
            label="Principal and interest"
            selected={formatCurrency(model.selectedScenario.estimate.monthlyPrincipalInterest)}
            maximum={formatCurrency(model.maximumAffordableScenario.estimate.monthlyPrincipalInterest)}
            helper="Useful if you want to see how much of the difference comes from the loan itself."
          />
          <ComparisonValue
            label="Total monthly ownership cost"
            selected={formatCurrency(model.selectedScenario.estimate.totalOwnershipCost)}
            maximum={formatCurrency(model.maximumAffordableScenario.estimate.totalOwnershipCost)}
            helper="This includes utilities and maintenance, so it is your practical all-in monthly picture."
          />
          <ComparisonValue
            label="Net monthly cost after roommates"
            selected={formatCurrency(model.selectedScenario.estimate.netMonthlyCost)}
            maximum={formatCurrency(model.maximumAffordableScenario.estimate.netMonthlyCost)}
            helper="This is your house-hack view. It is shown separately from lender affordability on purpose."
          />
        </div>
      </section>

      <section className={`rounded-[28px] border p-5 shadow-panel ${resultTone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
          5. Clear Affordability Result
        </p>
        <h3 className="mt-2 text-3xl font-semibold text-ink">{model.statusLabel}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate">{model.statusReason}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryValue
            label="Within lender-style affordability?"
            value={model.lenderStyleAffordable ? "Yes" : "No"}
            helper="Uses gross income, monthly debts, and lender-style housing payment. Roommate income is excluded."
          />
          <SummaryValue
            label="Within personal comfort budget?"
            value={model.personalComfortAffordable ? "Yes" : "No"}
            helper={`Uses your take-home pay and a ${formatPercent(PERSONAL_COMFORT_NET_RATIO * 100)} net-cost comfort check after roommates.`}
          />
          <SummaryValue
            label="Only affordable because of roommate income?"
            value={model.onlyAffordableBecauseOfRoommates ? "Yes" : "No"}
            helper="Yes means the all-in ownership cost looks too high personally, but the net cost after roommates brings it back into range."
          />
          <SummaryValue
            label="Outside a safe budget?"
            value={model.safeBudgetAffordable ? "No" : "Yes"}
            helper="This flags whether the home misses either the lender-style or personal-cushion tests."
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-panel backdrop-blur sm:p-6">
        <h3 className="text-xl font-semibold text-ink">Affordability Explanation Panel</h3>
        <p className="mt-2 text-sm leading-6 text-slate">
          This makes the model easy to audit. The dashboard uses these exact inputs and intermediate values.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-fog p-4">
            <h4 className="text-base font-semibold text-ink">Inputs used</h4>
            <div className="mt-3 space-y-2 text-sm text-slate">
              <p>Gross monthly income used: <span className="font-semibold text-ink">{formatCurrency(model.grossMonthlyIncome)}</span></p>
              <p>Monthly debt obligations used: <span className="font-semibold text-ink">{formatCurrency(model.inputs.monthlyDebtPayments)}</span></p>
              <p>Front-end affordability ratio used: <span className="font-semibold text-ink">{formatPercent(model.affordabilityRatioUsed * 100)}</span></p>
              <p>Back-end affordability ratio used: <span className="font-semibold text-ink">{formatPercent(model.backEndRatioUsed * 100)}</span></p>
              <p>Available cash used: <span className="font-semibold text-ink">{formatCurrency(model.inputs.availableCash)}</span></p>
              <p>Roommate income excluded from lender-style affordability: <span className="font-semibold text-ink">Yes</span></p>
            </div>
          </div>
          <div className="rounded-3xl bg-fog p-4">
            <h4 className="text-base font-semibold text-ink">Intermediate values</h4>
            <div className="mt-3 space-y-2 text-sm text-slate">
              <p>Front-end housing limit: <span className="font-semibold text-ink">{formatCurrency(model.frontEndLimit)}</span></p>
              <p>Back-end housing limit after debts: <span className="font-semibold text-ink">{formatCurrency(model.backEndLimit)}</span></p>
              <p>Maximum monthly housing payment allowed: <span className="font-semibold text-ink">{formatCurrency(model.maximumMonthlyHousingPaymentAllowed)}</span></p>
              <p>Payment-limited max purchase price: <span className="font-semibold text-ink">{formatCurrency(model.paymentLimitedPurchasePrice)}</span></p>
              <p>Cash-limited max purchase price: <span className="font-semibold text-ink">{formatCurrency(model.cashLimitedPurchasePrice)}</span></p>
              <p>Maximum affordable purchase price used: <span className="font-semibold text-ink">{formatCurrency(model.maximumAffordablePurchasePrice)}</span></p>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
          <h4 className="text-base font-semibold text-ink">Exact formulas used</h4>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate">
            <p>
              Gross monthly income = gross annual salary / 12 ={" "}
              <span className="font-semibold text-ink">
                {formatCurrency(model.inputs.grossAnnualSalary)} / 12 = {formatCurrency(model.grossMonthlyIncome)}
              </span>
            </p>
            <p>
              Front-end limit = gross monthly income × {formatPercent(model.affordabilityRatioUsed * 100)} ={" "}
              <span className="font-semibold text-ink">{formatCurrency(model.frontEndLimit)}</span>
            </p>
            <p>
              Back-end limit = gross monthly income × {formatPercent(model.backEndRatioUsed * 100)} - monthly debts ={" "}
              <span className="font-semibold text-ink">{formatCurrency(model.backEndLimit)}</span>
            </p>
            <p>
              Maximum monthly housing payment allowed = lower of front-end and back-end limits ={" "}
              <span className="font-semibold text-ink">{formatCurrency(model.maximumMonthlyHousingPaymentAllowed)}</span>
            </p>
            <p>
              Maximum lender-style affordable property = lower of the payment-limited purchase price and the cash-limited purchase price.
            </p>
            <p>
              Personal comfort budget = monthly take-home pay × {formatPercent(PERSONAL_COMFORT_NET_RATIO * 100)} and compared against{" "}
              <span className="font-semibold text-ink">net monthly cost after roommates</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
