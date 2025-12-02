import type {
  Fund,
  Scenario,
  ExitCostSchedule,
  TaxSettings,
} from "@/context/SimulationContext";

export type { TaxSettings } from "@/context/SimulationContext";

// Tax constants
const BASE_ANNUAL_EXEMPTION = 10000;
const CARRYOVER_PER_YEAR = 1000;
const MAX_CARRYOVER = 5000;

// Result types
export interface YearlyCosts {
  entryFee: number;
  managementFee: number;
  ter: number;
  transactionCost: number;
  performanceFee: number;
  totalCosts: number;
}

export interface FundYearResult {
  year: number;
  fundId: string;
  fundName: string;
  startValue: number;
  grossReturn: number;
  grossReturnPct: number;
  costs: YearlyCosts;
  costsPct: {
    entryFee: number;
    managementFee: number;
    ter: number;
    transactionCost: number;
    performanceFee: number;
    total: number;
  };
  endValueBeforeCosts: number;
  endValueAfterCosts: number;
  netReturn: number;
  netReturnPct: number;
  exitCost: number;
  exitCostPct: number;
  valueAfterExit: number;
}

export interface ScenarioYearResult {
  year: number;
  funds: FundYearResult[];
  totalStartValue: number;
  totalGrossReturn: number;
  totalCosts: YearlyCosts;
  totalEndValueBeforeCosts: number;
  totalEndValueAfterCosts: number;
  totalNetReturn: number;
  cumulativeValue: number;
  exitCost: number;
  exitCostPct: number;
  valueAfterExit: number;
}

export interface ScenarioProjection {
  scenarioId: string;
  scenarioName: string;
  initialInvestment: number;
  years: ScenarioYearResult[];
  finalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  totalCostsPaid: number;
}

// Tax calculation types
export interface TaxYearResult {
  year: number;
  yearlyGain: number;
  cumulativeUnrealizedGains: number;
  carryoverExemption: number;
  availableExemption: number;
  isRealizationYear: boolean;
  realizedGains: number;
  taxableGains: number;
  taxDue: number;
  exemptionUsed: number;
}

export interface TaxProjection {
  years: TaxYearResult[];
  totalTaxPaid: number;
  totalExemptionUsed: number;
}

// Calculate single fund for a single year
function calculateFundYear(
  fund: Fund,
  year: number,
  startValue: number
): FundYearResult {
  const { costs, yearlyReturnPct, exitCosts } = fund;

  // Entry fee only applies in year 1
  const entryFee = year === 1 ? startValue * (costs.entryFeePct / 100) : 0;
  const valueAfterEntry = startValue - entryFee;

  // Calculate gross return
  const grossReturn = valueAfterEntry * (yearlyReturnPct / 100);
  const endValueBeforeCosts = valueAfterEntry + grossReturn;

  // Calculate ongoing costs (applied to end value before costs)
  const managementFee = endValueBeforeCosts * (costs.managementFeePct / 100);
  const ter = endValueBeforeCosts * (costs.terPct / 100);
  const transactionCost = endValueBeforeCosts * (costs.transactionCostPct / 100);

  // Performance fee only on positive gains
  const performanceFee =
    grossReturn > 0 ? grossReturn * (costs.performanceFeePct / 100) : 0;

  const totalCosts = entryFee + managementFee + ter + transactionCost + performanceFee;
  const endValueAfterCosts = endValueBeforeCosts - managementFee - ter - transactionCost - performanceFee;

  const netReturn = endValueAfterCosts - startValue;
  const netReturnPct = startValue > 0 ? (netReturn / startValue) * 100 : 0;

  // Exit cost calculation for this fund
  const exitCostPct = getExitCostPct(exitCosts, year);
  const exitCost = endValueAfterCosts * (exitCostPct / 100);
  const valueAfterExit = endValueAfterCosts - exitCost;

  return {
    year,
    fundId: fund.id,
    fundName: fund.name,
    startValue,
    grossReturn,
    grossReturnPct: yearlyReturnPct,
    costs: {
      entryFee,
      managementFee,
      ter,
      transactionCost,
      performanceFee,
      totalCosts,
    },
    costsPct: {
      entryFee: costs.entryFeePct,
      managementFee: costs.managementFeePct,
      ter: costs.terPct,
      transactionCost: costs.transactionCostPct,
      performanceFee: costs.performanceFeePct,
      total: startValue > 0 ? (totalCosts / startValue) * 100 : 0,
    },
    endValueBeforeCosts,
    endValueAfterCosts,
    netReturn,
    netReturnPct,
    exitCost,
    exitCostPct,
    valueAfterExit,
  };
}

// Calculate exit cost for a specific year
function getExitCostPct(exitCosts: ExitCostSchedule[], year: number): number {
  const schedule = exitCosts.find((ec) => ec.year === year);
  return schedule?.exitFeePct ?? 0;
}

// Calculate full projection for a scenario
export function calculateScenarioProjection(
  scenario: Scenario,
  timeHorizon: number
): ScenarioProjection {
  const { funds, id, name } = scenario;

  // Initial investment is sum of all fund allocations
  const initialInvestment = funds.reduce(
    (sum, fund) => sum + fund.unitPrice * fund.quantity,
    0
  );

  // Track fund values over time
  const fundValues: Map<string, number> = new Map();
  funds.forEach((fund) => {
    fundValues.set(fund.id, fund.unitPrice * fund.quantity);
  });

  const years: ScenarioYearResult[] = [];
  let totalCostsPaid = 0;

  for (let year = 1; year <= timeHorizon; year++) {
    const fundResults: FundYearResult[] = [];
    let yearTotalCosts: YearlyCosts = {
      entryFee: 0,
      managementFee: 0,
      ter: 0,
      transactionCost: 0,
      performanceFee: 0,
      totalCosts: 0,
    };

    for (const fund of funds) {
      const startValue = fundValues.get(fund.id) || 0;
      const result = calculateFundYear(fund, year, startValue);
      fundResults.push(result);

      // Update fund value for next year
      fundValues.set(fund.id, result.endValueAfterCosts);

      // Aggregate costs
      yearTotalCosts.entryFee += result.costs.entryFee;
      yearTotalCosts.managementFee += result.costs.managementFee;
      yearTotalCosts.ter += result.costs.ter;
      yearTotalCosts.transactionCost += result.costs.transactionCost;
      yearTotalCosts.performanceFee += result.costs.performanceFee;
      yearTotalCosts.totalCosts += result.costs.totalCosts;
    }

    totalCostsPaid += yearTotalCosts.totalCosts;

    const totalStartValue = fundResults.reduce((sum, r) => sum + r.startValue, 0);
    const totalGrossReturn = fundResults.reduce((sum, r) => sum + r.grossReturn, 0);
    const totalEndValueBeforeCosts = fundResults.reduce(
      (sum, r) => sum + r.endValueBeforeCosts,
      0
    );
    const totalEndValueAfterCosts = fundResults.reduce(
      (sum, r) => sum + r.endValueAfterCosts,
      0
    );

    // Exit cost calculation - aggregate from all funds
    const exitCost = fundResults.reduce((sum, r) => sum + r.exitCost, 0);
    const valueAfterExit = fundResults.reduce((sum, r) => sum + r.valueAfterExit, 0);
    // Calculate weighted average exit cost percentage
    const exitCostPct = totalEndValueAfterCosts > 0 
      ? (exitCost / totalEndValueAfterCosts) * 100 
      : 0;

    years.push({
      year,
      funds: fundResults,
      totalStartValue,
      totalGrossReturn,
      totalCosts: yearTotalCosts,
      totalEndValueBeforeCosts,
      totalEndValueAfterCosts,
      totalNetReturn: totalEndValueAfterCosts - totalStartValue,
      cumulativeValue: totalEndValueAfterCosts,
      exitCost,
      exitCostPct,
      valueAfterExit,
    });
  }

  const finalValue = years[years.length - 1]?.totalEndValueAfterCosts ?? 0;
  const totalReturn = finalValue - initialInvestment;
  const totalReturnPct =
    initialInvestment > 0 ? (totalReturn / initialInvestment) * 100 : 0;

  return {
    scenarioId: id,
    scenarioName: name,
    initialInvestment,
    years,
    finalValue,
    totalReturn,
    totalReturnPct,
    totalCostsPaid,
  };
}

// Calculate value if exiting at a specific year
export function calculateExitValue(
  projection: ScenarioProjection,
  exitYear: number
): { value: number; exitCost: number; netValue: number } {
  const yearResult = projection.years.find((y) => y.year === exitYear);
  if (!yearResult) {
    return { value: 0, exitCost: 0, netValue: 0 };
  }
  return {
    value: yearResult.totalEndValueAfterCosts,
    exitCost: yearResult.exitCost,
    netValue: yearResult.valueAfterExit,
  };
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Get chart data for a scenario
export function getChartData(projection: ScenarioProjection): {
  labels: string[];
  totalValues: number[];
  fundValues: { fundId: string; fundName: string; values: number[] }[];
} {
  const labels = ["Start", ...projection.years.map((y) => `Year ${y.year}`)];

  // Total portfolio value over time
  const totalValues = [
    projection.initialInvestment,
    ...projection.years.map((y) => y.cumulativeValue),
  ];

  // Per-fund values over time
  const fundValuesMap: Map<string, number[]> = new Map();
  const fundNames: Map<string, string> = new Map();

  // Initialize with starting values
  for (const yearResult of projection.years) {
    for (const fundResult of yearResult.funds) {
      if (!fundValuesMap.has(fundResult.fundId)) {
        // Find initial value (year 1 start value)
        const year1 = projection.years[0]?.funds.find(
          (f) => f.fundId === fundResult.fundId
        );
        fundValuesMap.set(fundResult.fundId, [year1?.startValue ?? 0]);
        fundNames.set(fundResult.fundId, fundResult.fundName);
      }
    }
  }

  // Add end values for each year
  for (const yearResult of projection.years) {
    for (const fundResult of yearResult.funds) {
      const values = fundValuesMap.get(fundResult.fundId);
      if (values) {
        values.push(fundResult.endValueAfterCosts);
      }
    }
  }

  const fundValues = Array.from(fundValuesMap.entries()).map(([fundId, values]) => ({
    fundId,
    fundName: fundNames.get(fundId) || "Unknown",
    values,
  }));

  return { labels, totalValues, fundValues };
}

// Calculate tax projection with Belgian exemption rules
export function calculateTaxProjection(
  scenarioProjection: ScenarioProjection,
  taxSettings: TaxSettings
): TaxProjection {
  const { years } = scenarioProjection;
  const { taxRatePct, realizationYears } = taxSettings;

  const taxYears: TaxYearResult[] = [];
  let cumulativeUnrealizedGains = 0;
  let carryoverExemption = 0;
  let totalTaxPaid = 0;
  let totalExemptionUsed = 0;

  for (const yearResult of years) {
    const year = yearResult.year;
    const isRealizationYear = realizationYears.includes(year);

    // Calculate this year's gain
    const yearlyGain = yearResult.totalNetReturn;

    // Add yearly gain to cumulative unrealized gains
    cumulativeUnrealizedGains += yearlyGain;

    // Calculate available exemption (base + carryover)
    const availableExemption = BASE_ANNUAL_EXEMPTION + carryoverExemption;

    let realizedGains = 0;
    let taxableGains = 0;
    let taxDue = 0;
    let exemptionUsed = 0;

    if (isRealizationYear && cumulativeUnrealizedGains > 0) {
      // Realize all accumulated gains
      realizedGains = cumulativeUnrealizedGains;

      // Apply exemption
      exemptionUsed = Math.min(realizedGains, availableExemption);
      taxableGains = Math.max(0, realizedGains - availableExemption);

      // Calculate tax
      taxDue = taxableGains * (taxRatePct / 100);
      totalTaxPaid += taxDue;
      totalExemptionUsed += exemptionUsed;

      // Reset unrealized gains after realization
      cumulativeUnrealizedGains = 0;

      // Reset carryover after using exemption
      carryoverExemption = 0;
    } else {
      // No realization - add to carryover (if exemption not used)
      // Only add carryover if we didn't realize this year
      if (!isRealizationYear) {
        carryoverExemption = Math.min(
          carryoverExemption + CARRYOVER_PER_YEAR,
          MAX_CARRYOVER
        );
      }
    }

    taxYears.push({
      year,
      yearlyGain,
      cumulativeUnrealizedGains: isRealizationYear ? 0 : cumulativeUnrealizedGains,
      carryoverExemption,
      availableExemption,
      isRealizationYear,
      realizedGains,
      taxableGains,
      taxDue,
      exemptionUsed,
    });
  }

  return {
    years: taxYears,
    totalTaxPaid,
    totalExemptionUsed,
  };
}

