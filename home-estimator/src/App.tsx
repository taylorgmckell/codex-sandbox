// Main application screen that coordinates estimator inputs, outputs, and layout.
import { useMemo, useState } from "react";
import { AmortizationChart } from "./components/AmortizationChart";
import { BreakdownChart } from "./components/BreakdownChart";
import { CalculationHelpModal } from "./components/CalculationHelpModal";
import { NumberInput } from "./components/NumberInput";
import { OptionGroup } from "./components/OptionGroup";
import { RoommateList } from "./components/RoommateList";
import { SectionCard } from "./components/SectionCard";
import { SummaryCard } from "./components/SummaryCard";
import { calculateEstimate } from "./lib/estimates";
import { formatCurrency, formatPercent } from "./lib/format";
import type { CostInputs, HomeInputs, LoanInputs, PropertyType, Roommate } from "./types";

const PROPERTY_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "single-family", label: "Single-family" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "fourplex", label: "Fourplex" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "Multi-family" },
];

const initialHome: HomeInputs = {
  price: 525000,
  beds: 4,
  baths: 2.5,
  squareFootage: 2200,
  zipCode: "84121",
  propertyType: "single-family",
  hoaMonthly: 0,
};

const initialLoan: LoanInputs = {
  downPaymentMode: "percent",
  downPaymentAmount: 105000,
  downPaymentPercent: 20,
  interestRate: 6.75,
  termYears: 30,
  mortgageType: "conventional",
  occupancyType: "primary",
};

const initialCosts: CostInputs = {
  propertyTaxMode: "auto",
  propertyTaxMonthly: 500,
  insuranceMode: "auto",
  insuranceMonthly: 140,
  pmiMode: "auto",
  pmiMonthly: 150,
  utilitiesMode: "auto",
  electricMonthly: 110,
  gasMonthly: 65,
  waterMonthly: 90,
  internetMonthly: 70,
  maintenanceMode: "auto",
  maintenanceMonthly: 390,
};

function createRoommate(index: number): Roommate {
  return {
    id: crypto.randomUUID(),
    name: `Room ${index}`,
    rent: 850,
    notes: "",
    isActive: true,
  };
}

function StatRow({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {helper ? <p className="text-xs text-slate">{helper}</p> : null}
      </div>
      <p className="text-right text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function EstimateToggle({
  label,
  isAuto,
  onChange,
}: {
  label: string;
  isAuto: boolean;
  onChange: (isAuto: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-fog px-4 py-3 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!isAuto)}
        className={`rounded-full px-3 py-1 font-semibold transition ${
          isAuto ? "bg-pine text-white" : "bg-white text-slate"
        }`}
      >
        {isAuto ? "Auto" : "Manual"}
      </button>
    </label>
  );
}

export default function App() {
  const [home, setHome] = useState<HomeInputs>(initialHome);
  const [loan, setLoan] = useState<LoanInputs>(initialLoan);
  const [costs, setCosts] = useState<CostInputs>(initialCosts);
  const [roommates, setRoommates] = useState<Roommate[]>([createRoommate(1), createRoommate(2)]);
  const [vacancyRate, setVacancyRate] = useState(5);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const estimate = useMemo(
    () => calculateEstimate(home, loan, costs, roommates, vacancyRate),
    [home, loan, costs, roommates, vacancyRate],
  );

  const setHomeValue = <K extends keyof HomeInputs>(key: K, value: HomeInputs[K]) => {
    setHome((current) => ({ ...current, [key]: value }));
  };

  const setLoanValue = <K extends keyof LoanInputs>(key: K, value: LoanInputs[K]) => {
    setLoan((current) => ({ ...current, [key]: value }));
  };

  const setCostValue = <K extends keyof CostInputs>(key: K, value: CostInputs[K]) => {
    setCosts((current) => ({ ...current, [key]: value }));
  };

  const addRoommate = () => setRoommates((current) => [...current, createRoommate(current.length + 1)]);
  const removeRoommate = (id: string) =>
    setRoommates((current) => current.filter((roommate) => roommate.id !== id));
  const updateRoommate = (id: string, field: keyof Roommate, value: string | number | boolean) =>
    setRoommates((current) =>
      current.map((roommate) => (roommate.id === id ? { ...roommate, [field]: value } : roommate)),
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,185,66,0.2),_transparent_35%),linear-gradient(180deg,_#fff8ef_0%,_#edf1f6_38%,_#edf1f6_100%)]">
      <CalculationHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        context={{
          stateName: estimate.context.stateName,
          regionalLabel: estimate.context.regionalLabel,
          homePrice: home.price,
          downPaymentAmount: estimate.downPaymentAmount,
          downPaymentPercent: estimate.downPaymentPercent,
          loanAmount: estimate.loanAmount,
          interestRate: loan.interestRate,
          termYears: loan.termYears,
          monthlyPrincipalInterest: estimate.monthlyPrincipalInterest,
          monthlyTaxes: estimate.monthlyTaxes,
          monthlyInsurance: estimate.monthlyInsurance,
          monthlyPmi: estimate.monthlyPmi,
          monthlyHoa: estimate.monthlyHoa,
          monthlyUtilities: estimate.monthlyUtilities,
          monthlyMaintenance: estimate.monthlyMaintenance,
          totalOwnershipCost: estimate.totalOwnershipCost,
          grossRoommateIncome: estimate.grossRoommateIncome,
          effectiveRoommateIncome: estimate.effectiveRoommateIncome,
          vacancyRate,
          vacancyLoss: estimate.vacancyLoss,
          netMonthlyCost: estimate.netMonthlyCost,
          closingCosts: estimate.closingCosts,
          prepaidReserves: estimate.prepaidReserves,
          fundingFee: estimate.fundingFee,
          estimatedCashToClose: estimate.estimatedCashToClose,
          mortgageType: loan.mortgageType,
          occupancyType: loan.occupancyType,
          propertyTaxMode: costs.propertyTaxMode,
          insuranceMode: costs.insuranceMode,
          pmiMode: costs.pmiMode,
          utilitiesMode: costs.utilitiesMode,
          maintenanceMode: costs.maintenanceMode,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 overflow-hidden rounded-[32px] bg-ink px-6 py-8 text-white shadow-panel sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr,0.7fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-gold">
                Zillow Sidekick
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Compare homes fast and see your true monthly cost after roommate income.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/74">
                Drop in the listing basics, let the app estimate the missing monthly costs, and
                pressure-test the deal with roommates, vacancy, and closing cash.
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] bg-white/8 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-sm text-white/72">
                <span>Inferred tax market</span>
                <span className="font-semibold text-white">
                  {estimate.context.stateName ?? "National fallback"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/72">
                <span>Down payment</span>
                <span className="font-semibold text-white">
                  {formatCurrency(estimate.downPaymentAmount)} ({formatPercent(estimate.downPaymentPercent)})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/72">
                <span>Vacancy tested income</span>
                <span className="font-semibold text-white">
                  {formatCurrency(estimate.effectiveRoommateIncome)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="My net monthly cost"
            value={formatCurrency(estimate.netMonthlyCost)}
            sublabel="Ownership cost minus vacancy-adjusted roommate income"
          />
          <SummaryCard
            label="Total monthly ownership cost"
            value={formatCurrency(estimate.totalOwnershipCost)}
            tone="warm"
            sublabel="Before roommate contributions"
          />
          <SummaryCard
            label="Estimated cash to close"
            value={formatCurrency(estimate.estimatedCashToClose)}
            tone="cool"
            sublabel="Down payment + closing + reserves + funding fee"
          />
          <SummaryCard
            label="Principal + interest"
            value={formatCurrency(estimate.monthlyPrincipalInterest)}
            tone="warm"
            sublabel={`Loan amount ${formatCurrency(estimate.loanAmount)}`}
          />
        </div>

        <main className="mt-8 grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <SectionCard title="Home inputs" eyebrow="Property">
              <div className="grid gap-4 md:grid-cols-2">
                <NumberInput
                  label="Home price"
                  prefix="$"
                  value={home.price}
                  onChange={(value) => setHomeValue("price", value)}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink">Zip code</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                    value={home.zipCode}
                    placeholder="Optional"
                    onChange={(event) => setHomeValue("zipCode", event.target.value)}
                  />
                  <span className="mt-2 block text-xs text-slate">
                    Used to infer state averages for taxes and insurance.
                  </span>
                </label>
                <NumberInput
                  label="Beds"
                  value={home.beds}
                  onChange={(value) => setHomeValue("beds", value)}
                />
                <NumberInput
                  label="Baths"
                  value={home.baths}
                  onChange={(value) => setHomeValue("baths", value)}
                  step={0.5}
                />
                <NumberInput
                  label="Square footage"
                  value={home.squareFootage}
                  onChange={(value) => setHomeValue("squareFootage", value)}
                  helper="Optional. If blank, the estimator uses a beds-based fallback."
                />
                <NumberInput
                  label="HOA fee"
                  prefix="$"
                  value={home.hoaMonthly}
                  onChange={(value) => setHomeValue("hoaMonthly", value)}
                  helper="Monthly HOA or condo dues."
                />
              </div>
              <div className="mt-4">
                <OptionGroup
                  label="Property type"
                  value={home.propertyType}
                  options={PROPERTY_OPTIONS}
                  onChange={(value) => setHomeValue("propertyType", value)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Loan inputs" eyebrow="Financing">
              <div className="grid gap-4 md:grid-cols-2">
                <OptionGroup
                  label="Down payment input"
                  value={loan.downPaymentMode}
                  options={[
                    { value: "amount", label: "Dollar amount" },
                    { value: "percent", label: "Percentage" },
                  ]}
                  onChange={(value) => setLoanValue("downPaymentMode", value)}
                />
                {loan.downPaymentMode === "amount" ? (
                  <NumberInput
                    label="Down payment amount"
                    prefix="$"
                    value={loan.downPaymentAmount}
                    onChange={(value) => setLoanValue("downPaymentAmount", value)}
                    helper={`Equivalent to ${formatPercent(estimate.downPaymentPercent)}`}
                  />
                ) : (
                  <NumberInput
                    label="Down payment percent"
                    suffix="%"
                    value={loan.downPaymentPercent}
                    onChange={(value) => setLoanValue("downPaymentPercent", value)}
                    step={0.5}
                    helper={`Equivalent to ${formatCurrency(estimate.downPaymentAmount)}`}
                  />
                )}
                <NumberInput
                  label="Interest rate"
                  suffix="%"
                  value={loan.interestRate}
                  onChange={(value) => setLoanValue("interestRate", value)}
                  step={0.125}
                />
                <OptionGroup
                  label="Loan term"
                  value={String(loan.termYears) as "15" | "20" | "30"}
                  options={[
                    { value: "15", label: "15 years" },
                    { value: "20", label: "20 years" },
                    { value: "30", label: "30 years" },
                  ]}
                  onChange={(value) => setLoanValue("termYears", Number(value) as 15 | 20 | 30)}
                />
              </div>
              <div className="mt-4 grid gap-4">
                <OptionGroup
                  label="Mortgage type"
                  value={loan.mortgageType}
                  options={[
                    { value: "conventional", label: "Conventional" },
                    { value: "FHA", label: "FHA" },
                    { value: "VA", label: "VA" },
                    { value: "USDA", label: "USDA" },
                  ]}
                  onChange={(value) => setLoanValue("mortgageType", value)}
                />
                <OptionGroup
                  label="Occupancy type"
                  value={loan.occupancyType}
                  options={[
                    { value: "primary", label: "Primary" },
                    { value: "second-home", label: "Second home" },
                    { value: "investment", label: "Investment" },
                  ]}
                  onChange={(value) => setLoanValue("occupancyType", value)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Estimated costs and overrides" eyebrow="Monthly carry">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <EstimateToggle
                    label="Property taxes"
                    isAuto={costs.propertyTaxMode === "auto"}
                    onChange={(isAuto) => setCostValue("propertyTaxMode", isAuto ? "auto" : "manual")}
                  />
                  {costs.propertyTaxMode === "manual" ? (
                    <NumberInput
                      label="Property taxes"
                      prefix="$"
                      value={costs.propertyTaxMonthly}
                      onChange={(value) => setCostValue("propertyTaxMonthly", value)}
                    />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <EstimateToggle
                    label="Homeowners insurance"
                    isAuto={costs.insuranceMode === "auto"}
                    onChange={(isAuto) => setCostValue("insuranceMode", isAuto ? "auto" : "manual")}
                  />
                  {costs.insuranceMode === "manual" ? (
                    <NumberInput
                      label="Insurance"
                      prefix="$"
                      value={costs.insuranceMonthly}
                      onChange={(value) => setCostValue("insuranceMonthly", value)}
                    />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <EstimateToggle
                    label="PMI / MIP"
                    isAuto={costs.pmiMode === "auto"}
                    onChange={(isAuto) => setCostValue("pmiMode", isAuto ? "auto" : "manual")}
                  />
                  {costs.pmiMode === "manual" ? (
                    <NumberInput
                      label="PMI / MIP"
                      prefix="$"
                      value={costs.pmiMonthly}
                      onChange={(value) => setCostValue("pmiMonthly", value)}
                    />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <EstimateToggle
                    label="Maintenance reserve"
                    isAuto={costs.maintenanceMode === "auto"}
                    onChange={(isAuto) => setCostValue("maintenanceMode", isAuto ? "auto" : "manual")}
                  />
                  {costs.maintenanceMode === "manual" ? (
                    <NumberInput
                      label="Maintenance reserve"
                      prefix="$"
                      value={costs.maintenanceMonthly}
                      onChange={(value) => setCostValue("maintenanceMonthly", value)}
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <EstimateToggle
                  label="Utilities bundle"
                  isAuto={costs.utilitiesMode === "auto"}
                  onChange={(isAuto) => setCostValue("utilitiesMode", isAuto ? "auto" : "manual")}
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <NumberInput
                    label="Electric"
                    prefix="$"
                    value={
                      costs.utilitiesMode === "manual"
                        ? costs.electricMonthly
                        : Math.round(estimate.utilityBreakdown.electric)
                    }
                    onChange={(value) => setCostValue("electricMonthly", value)}
                    disabled={costs.utilitiesMode === "auto"}
                  />
                  <NumberInput
                    label="Gas"
                    prefix="$"
                    value={
                      costs.utilitiesMode === "manual"
                        ? costs.gasMonthly
                        : Math.round(estimate.utilityBreakdown.gas)
                    }
                    onChange={(value) => setCostValue("gasMonthly", value)}
                    disabled={costs.utilitiesMode === "auto"}
                  />
                  <NumberInput
                    label="Water / trash"
                    prefix="$"
                    value={
                      costs.utilitiesMode === "manual"
                        ? costs.waterMonthly
                        : Math.round(estimate.utilityBreakdown.water)
                    }
                    onChange={(value) => setCostValue("waterMonthly", value)}
                    disabled={costs.utilitiesMode === "auto"}
                  />
                  <NumberInput
                    label="Internet"
                    prefix="$"
                    value={
                      costs.utilitiesMode === "manual"
                        ? costs.internetMonthly
                        : Math.round(estimate.utilityBreakdown.internet)
                    }
                    onChange={(value) => setCostValue("internetMonthly", value)}
                    disabled={costs.utilitiesMode === "auto"}
                  />
                </div>
                <p className="text-xs text-slate">
                  Switch utilities to manual if you want to type exact bills. Otherwise the app keeps
                  these synced to the estimate engine.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Roommate system" eyebrow="Income offset">
              <RoommateList
                roommates={roommates}
                onAdd={addRoommate}
                onRemove={removeRoommate}
                onUpdate={updateRoommate}
                vacancyRate={vacancyRate}
                onVacancyRateChange={setVacancyRate}
              />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Analysis summary"
              eyebrow="Outputs"
              action={
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-ember hover:text-ember"
                >
                  How this works
                </button>
              }
            >
              <div className="grid gap-2">
                <StatRow label="Loan amount" value={formatCurrency(estimate.loanAmount)} />
                <StatRow
                  label="Principal + interest"
                  value={formatCurrency(estimate.monthlyPrincipalInterest)}
                />
                <StatRow label="PMI / MIP" value={formatCurrency(estimate.monthlyPmi)} />
                <StatRow label="Taxes" value={formatCurrency(estimate.monthlyTaxes)} />
                <StatRow label="Insurance" value={formatCurrency(estimate.monthlyInsurance)} />
                <StatRow label="HOA" value={formatCurrency(estimate.monthlyHoa)} />
                <StatRow
                  label="Utilities"
                  value={formatCurrency(estimate.monthlyUtilities)}
                  helper={`${formatCurrency(estimate.utilityBreakdown.electric)} electric, ${formatCurrency(
                    estimate.utilityBreakdown.gas,
                  )} gas, ${formatCurrency(estimate.utilityBreakdown.water)} water, ${formatCurrency(
                    estimate.utilityBreakdown.internet,
                  )} internet`}
                />
                <StatRow
                  label="Maintenance reserve"
                  value={formatCurrency(estimate.monthlyMaintenance)}
                />
                <StatRow
                  label="Total ownership cost"
                  value={formatCurrency(estimate.totalOwnershipCost)}
                />
                <StatRow
                  label="Total roommate income"
                  value={formatCurrency(estimate.grossRoommateIncome)}
                />
                <StatRow
                  label="Vacancy-adjusted roommate income"
                  value={formatCurrency(estimate.effectiveRoommateIncome)}
                  helper={`${formatPercent(vacancyRate)} vacancy haircut = ${formatCurrency(
                    estimate.vacancyLoss,
                  )}`}
                />
                <StatRow label="My net monthly cost" value={formatCurrency(estimate.netMonthlyCost)} />
                <StatRow
                  label="Estimated cash to close"
                  value={formatCurrency(estimate.estimatedCashToClose)}
                  helper={`${formatCurrency(estimate.closingCosts)} closing costs, ${formatCurrency(
                    estimate.prepaidReserves,
                  )} reserves, ${formatCurrency(estimate.fundingFee)} funding fee`}
                />
                <StatRow
                  label="Total interest over loan life"
                  value={formatCurrency(estimate.totalInterestPaid)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Monthly cost breakdown chart" eyebrow="Visualize the carry">
              <BreakdownChart items={estimate.breakdown} />
            </SectionCard>

            <SectionCard title="Amortization chart" eyebrow="How the loan evolves">
              <AmortizationChart data={estimate.amortization} />
            </SectionCard>

            <SectionCard title="Estimator notes" eyebrow="Assumptions">
              <div className="space-y-3">
                {estimate.notes.map((note) => (
                  <div key={note} className="rounded-2xl bg-fog px-4 py-3 text-sm text-slate">
                    {note}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}
