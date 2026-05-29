// Modal that explains how the app calculates ownership costs, cash to close, and estimate sources.
import { formatCurrency, formatPercent } from "../lib/format";

interface CalculationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    stateName: string | null;
    regionalLabel: string;
    homePrice: number;
    downPaymentAmount: number;
    downPaymentPercent: number;
    loanAmount: number;
    interestRate: number;
    termYears: number;
    monthlyPrincipalInterest: number;
    monthlyTaxes: number;
    monthlyInsurance: number;
    monthlyPmi: number;
    monthlyHoa: number;
    monthlyUtilities: number;
    monthlyMaintenance: number;
    totalOwnershipCost: number;
    grossRoommateIncome: number;
    effectiveRoommateIncome: number;
    vacancyRate: number;
    vacancyLoss: number;
    netMonthlyCost: number;
    closingCosts: number;
    prepaidReserves: number;
    fundingFee: number;
    estimatedCashToClose: number;
    mortgageType: string;
    occupancyType: string;
    propertyTaxMode: "auto" | "manual";
    insuranceMode: "auto" | "manual";
    pmiMode: "auto" | "manual";
    utilitiesMode: "auto" | "manual";
    maintenanceMode: "auto" | "manual";
  };
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-fog p-4 sm:p-5">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate">{children}</div>
    </section>
  );
}

export function CalculationHelpModal({ isOpen, onClose, context }: CalculationHelpModalProps) {
  if (!isOpen) {
    return null;
  }

  const occupancyLabel =
    context.occupancyType === "second-home"
      ? "second home"
      : context.occupancyType === "investment"
        ? "investment property"
        : "primary residence";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
              Outputs explainer
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              How this app is calculating your numbers
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate">
              This walkthrough explains the math, the assumptions, and whether each input is
              based on your manual values, app rules, or regional lookup data.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-fog"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-96px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <InfoBlock title="Big picture">
              <p>
                The app is trying to answer one simple question:{" "}
                <span className="font-semibold text-ink">
                  “What would I actually pay out of pocket each month?”
                </span>
              </p>
              <p>
                It starts with your full ownership cost, then subtracts roommate income. Right now
                it estimates your net monthly cost as{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(context.netMonthlyCost)}
                </span>
                .
              </p>
              <p>
                It also estimates cash needed up front at{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(context.estimatedCashToClose)}
                </span>
                , which includes the down payment plus other closing-related amounts.
              </p>
            </InfoBlock>

            <InfoBlock title="What data is live vs hardcoded?">
              <p>
                This app does{" "}
                <span className="font-semibold text-ink">not pull live Zillow, county, lender, or title company data</span>.
                It is currently an offline calculator.
              </p>
              <p>
                What it does use:
              </p>
              <p>
                <span className="font-semibold text-ink">Your typed inputs</span>: price, down payment,
                rate, HOA, roommate rent, and any manual overrides.
              </p>
              <p>
                <span className="font-semibold text-ink">Hardcoded regional assumptions</span>: ZIP code
                is used to infer a state, then the app uses built-in state-level tax and insurance
                averages stored in the codebase.
              </p>
              <p>
                <span className="font-semibold text-ink">Hardcoded estimation rules</span>: utilities,
                maintenance, PMI, reserves, and generic closing-cost percentages come from formulas
                coded into the app, not from a live API.
              </p>
            </InfoBlock>

            <InfoBlock title="Mortgage payment">
              <p>
                The mortgage payment shown here is{" "}
                <span className="font-semibold text-ink">principal plus interest only</span>. It does not
                include taxes, insurance, HOA, utilities, or maintenance.
              </p>
              <p>
                The app first calculates your loan amount:
              </p>
              <p className="rounded-2xl bg-white px-4 py-3 font-medium text-ink">
                Home price {formatCurrency(context.homePrice)} minus down payment{" "}
                {formatCurrency(context.downPaymentAmount)} = loan amount{" "}
                {formatCurrency(context.loanAmount)}
              </p>
              <p>
                Then it uses the standard amortization formula with your interest rate of{" "}
                {formatPercent(context.interestRate)} and a {context.termYears}-year term to get a
                monthly principal-and-interest payment of{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(context.monthlyPrincipalInterest)}
                </span>
                .
              </p>
            </InfoBlock>

            <InfoBlock title="Property taxes">
              <p>
                Current monthly taxes shown:{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(context.monthlyTaxes)}
                </span>
              </p>
              {context.propertyTaxMode === "manual" ? (
                <p>
                  You manually entered this amount, so the app is using your number directly.
                </p>
              ) : (
                <>
                  <p>
                    This number is{" "}
                    <span className="font-semibold text-ink">estimated, not live</span>.
                  </p>
                  <p>
                    The app looks at your ZIP code, guesses a state{" "}
                    {context.stateName ? `(${context.stateName})` : "(no state confidently inferred)"},
                    then applies a built-in effective property tax rate.
                  </p>
                  <p>
                    Source type:{" "}
                    <span className="font-semibold text-ink">{context.regionalLabel}</span> from the
                    app’s internal lookup table.
                  </p>
                  <p>
                    In plain English: it is using a reasonable state-level average as a shortcut so
                    you do not need to manually look up county taxes for every house.
                  </p>
                </>
              )}
            </InfoBlock>

            <InfoBlock title="Insurance, PMI, utilities, and maintenance">
              <p>
                These categories are meant to reduce manual typing while house hunting, but they are
                still estimates unless you override them.
              </p>
              <p>
                <span className="font-semibold text-ink">Insurance:</span>{" "}
                {context.insuranceMode === "manual"
                  ? `manual value of ${formatCurrency(context.monthlyInsurance)}`
                  : `estimated at ${formatCurrency(context.monthlyInsurance)} using home price, property type, and a built-in state insurance average.`}
              </p>
              <p>
                <span className="font-semibold text-ink">PMI / MIP:</span>{" "}
                {context.pmiMode === "manual"
                  ? `manual value of ${formatCurrency(context.monthlyPmi)}`
                  : `estimated at ${formatCurrency(context.monthlyPmi)} from down payment level, loan-to-value ratio, mortgage type (${context.mortgageType}), and occupancy.`}
              </p>
              <p>
                <span className="font-semibold text-ink">Utilities:</span>{" "}
                {context.utilitiesMode === "manual"
                  ? `manual total of ${formatCurrency(context.monthlyUtilities)}`
                  : `estimated at ${formatCurrency(context.monthlyUtilities)} using beds, square footage, baths, and property type.`}
              </p>
              <p>
                <span className="font-semibold text-ink">Maintenance reserve:</span>{" "}
                {context.maintenanceMode === "manual"
                  ? `manual value of ${formatCurrency(context.monthlyMaintenance)}`
                  : `estimated at ${formatCurrency(context.monthlyMaintenance)} as a monthly reserve based on the home's value and property type.`}
              </p>
            </InfoBlock>

            <InfoBlock title="Total monthly ownership cost">
              <p>
                This is the “all-in before roommates” number:
              </p>
              <p className="rounded-2xl bg-white px-4 py-3 font-medium text-ink">
                P&I {formatCurrency(context.monthlyPrincipalInterest)} + taxes{" "}
                {formatCurrency(context.monthlyTaxes)} + insurance{" "}
                {formatCurrency(context.monthlyInsurance)} + PMI{" "}
                {formatCurrency(context.monthlyPmi)} + HOA {formatCurrency(context.monthlyHoa)} +
                utilities {formatCurrency(context.monthlyUtilities)} + maintenance{" "}
                {formatCurrency(context.monthlyMaintenance)}
              </p>
              <p>
                That produces a total monthly ownership cost of{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(context.totalOwnershipCost)}
                </span>
                .
              </p>
            </InfoBlock>

            <InfoBlock title="Roommate income and vacancy stress testing">
              <p>
                The app totals the rent from active roommates. Right now that gross roommate income
                is{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(context.grossRoommateIncome)}
                </span>
                .
              </p>
              <p>
                Then it applies your vacancy rate of {formatPercent(context.vacancyRate)}.
              </p>
              <p>
                Vacancy is just a safety haircut. It assumes you will not collect 100% of roommate
                rent forever because a room could sit empty, a roommate could move out, or it could
                take time to refill a room.
              </p>
              <p className="rounded-2xl bg-white px-4 py-3 font-medium text-ink">
                Gross roommate income {formatCurrency(context.grossRoommateIncome)} minus vacancy loss{" "}
                {formatCurrency(context.vacancyLoss)} = effective roommate income{" "}
                {formatCurrency(context.effectiveRoommateIncome)}
              </p>
            </InfoBlock>

            <InfoBlock title="Your net monthly out-of-pocket cost">
              <p>
                This is the number most people care about for house hacking:
              </p>
              <p className="rounded-2xl bg-white px-4 py-3 font-medium text-ink">
                Total ownership cost {formatCurrency(context.totalOwnershipCost)} minus effective
                roommate income {formatCurrency(context.effectiveRoommateIncome)} ={" "}
                {formatCurrency(context.netMonthlyCost)}
              </p>
              <p>
                In plain English, this is the app’s best estimate of what would still come out of{" "}
                <span className="font-semibold text-ink">your</span> pocket each month after roommate
                help.
              </p>
            </InfoBlock>

            <InfoBlock title="Cash to close, closing costs, and reserves">
              <p>
                This app uses a practical estimate for cash needed up front. It is{" "}
                <span className="font-semibold text-ink">not a lender closing disclosure</span> and not
                title-company live data.
              </p>
              <p>
                Right now the estimate is built as:
              </p>
              <p className="rounded-2xl bg-white px-4 py-3 font-medium text-ink">
                Down payment {formatCurrency(context.downPaymentAmount)} + closing costs{" "}
                {formatCurrency(context.closingCosts)} + prepaid reserves{" "}
                {formatCurrency(context.prepaidReserves)} + funding fee{" "}
                {formatCurrency(context.fundingFee)} = estimated cash to close{" "}
                {formatCurrency(context.estimatedCashToClose)}
              </p>
              <p>
                <span className="font-semibold text-ink">Closing costs</span> are currently estimated as
                a percentage of price based on occupancy:
              </p>
              <p>
                Primary residence uses 2.2%, second home uses 2.6%, and investment property uses
                3.1%. Those are built-in planning assumptions, not live fees from a lender.
              </p>
              <p>
                <span className="font-semibold text-ink">Prepaid reserves</span> currently assume three
                months of property taxes plus twelve months of insurance. That is a conservative
                estimate for money that often has to be collected into escrow or paid in advance.
              </p>
              <p>
                <span className="font-semibold text-ink">Funding fee</span> only appears for certain loan
                types like VA or USDA, based on built-in rules in the app.
              </p>
              <p>
                Your current setup is being treated as a{" "}
                <span className="font-semibold text-ink">{occupancyLabel}</span>.
              </p>
            </InfoBlock>

            <InfoBlock title="What this app is good for and what it is not">
              <p>
                This app is great for{" "}
                <span className="font-semibold text-ink">rapid comparison</span> when you are browsing
                listings and want a realistic monthly estimate fast.
              </p>
              <p>
                It is not a replacement for:
              </p>
              <p>
                A lender quote, county tax record, insurance quote, HOA documents, utility history,
                inspection, or title/settlement statement.
              </p>
              <p>
                Best practice: use this app to narrow down houses, then replace the estimates with
                real numbers as you get more serious about a specific property.
              </p>
            </InfoBlock>
          </div>
        </div>
      </div>
    </div>
  );
}
