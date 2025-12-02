import { useMemo } from "react";
import { Receipt } from "lucide-react";
import {
  type TaxSettings as TaxSettingsType,
  useSimulation,
  useSimulationDispatch,
} from "@/context/SimulationContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateScenarioProjection,
  calculateTaxProjection,
  formatCurrency,
  formatPercentage,
  type ScenarioProjection,
} from "@/lib/calculations";
import type { Scenario } from "@/context/SimulationContext";

interface TaxSettingsProps {
  scenarioId: string;
  taxSettings: TaxSettingsType;
  scenario: Scenario;
}

export function TaxSettings({
  scenarioId,
  taxSettings,
  scenario,
}: TaxSettingsProps) {
  const { timeHorizon } = useSimulation();
  const dispatch = useSimulationDispatch();

  // Calculate projections
  const projection = useMemo(
    () => calculateScenarioProjection(scenario, timeHorizon),
    [scenario, timeHorizon]
  );

  const taxProjection = useMemo(
    () => calculateTaxProjection(projection, taxSettings),
    [projection, taxSettings]
  );

  const handleTaxRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    dispatch({
      type: "UPDATE_TAX_RATE",
      payload: { scenarioId, taxRatePct: Math.max(0, Math.min(100, rate)) },
    });
  };

  const toggleRealizationYear = (year: number) => {
    dispatch({
      type: "TOGGLE_REALIZATION_YEAR",
      payload: { scenarioId, year },
    });
  };

  const hasAllocation = projection.initialInvestment > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Capital Gains Tax</h3>
        </div>
        {hasAllocation && taxProjection.totalTaxPaid > 0 && (
          <Badge variant="destructive" className="text-xs">
            Total tax: {formatCurrency(taxProjection.totalTaxPaid)}
          </Badge>
        )}
      </div>

      {/* Tax Rate Input */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="tax-rate" className="text-xs text-muted-foreground whitespace-nowrap">
            Tax Rate
          </Label>
          <div className="relative w-20">
            <Input
              id="tax-rate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={taxSettings.taxRatePct || ""}
              onChange={(e) => handleTaxRateChange(e.target.value)}
              placeholder="30"
              className="pr-6 text-right text-sm h-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Applied to capital gains above the exemption threshold
        </p>
      </div>

      {/* Exemption Info */}
      <div className="rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 p-3">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Belgian exemption rules:</strong> €10,000 annual exemption on capital gains.
          Unused exemption adds €1,000/year carryover (max €5,000). Maximum total exemption: €15,000.
        </p>
      </div>

      {/* Realization Year Selection Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Select years to realize gains (sell)
          </Label>
          <span className="text-xs text-muted-foreground">
            {taxSettings.realizationYears.length} year(s) selected
          </span>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-16 text-center text-xs">Year</TableHead>
                <TableHead className="w-16 text-center text-xs">Sell?</TableHead>
                <TableHead className="text-right text-xs">Unrealized Gains</TableHead>
                <TableHead className="text-right text-xs">Exemption</TableHead>
                <TableHead className="text-right text-xs">Tax Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxProjection.years.map((taxYear) => {
                const isSelected = taxSettings.realizationYears.includes(taxYear.year);
                return (
                  <TableRow
                    key={taxYear.year}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-amber-50/50 dark:bg-amber-950/20"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={() => toggleRealizationYear(taxYear.year)}
                  >
                    <TableCell className="text-center font-medium text-sm">
                      {taxYear.year}
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRealizationYear(taxYear.year)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {hasAllocation ? (
                        <span
                          className={
                            taxYear.cumulativeUnrealizedGains >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }
                        >
                          {taxYear.isRealizationYear
                            ? formatCurrency(taxYear.realizedGains)
                            : formatCurrency(taxYear.cumulativeUnrealizedGains)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatCurrency(taxYear.availableExemption)}
                      {taxYear.carryoverExemption > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{formatCurrency(taxYear.carryoverExemption)})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {taxYear.isRealizationYear && taxYear.taxDue > 0 ? (
                        <span className="text-red-500 font-medium">
                          {formatCurrency(taxYear.taxDue)}
                        </span>
                      ) : taxYear.isRealizationYear ? (
                        <span className="text-emerald-600">€0 (exempt)</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      {hasAllocation && taxSettings.realizationYears.length > 0 && (
        <div className="grid grid-cols-3 gap-3 rounded-md bg-muted/30 p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Exemption Used</p>
            <p className="text-sm font-semibold text-emerald-600">
              {formatCurrency(taxProjection.totalExemptionUsed)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Tax Paid</p>
            <p className="text-sm font-semibold text-red-500">
              {formatCurrency(taxProjection.totalTaxPaid)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Effective Rate</p>
            <p className="text-sm font-semibold">
              {taxProjection.totalExemptionUsed + taxProjection.totalTaxPaid > 0
                ? formatPercentage(
                    (taxProjection.totalTaxPaid /
                      (taxProjection.totalExemptionUsed +
                        taxProjection.years
                          .filter((y) => y.isRealizationYear)
                          .reduce((sum, y) => sum + y.taxableGains, 0))) *
                      100
                  )
                : "0%"}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Click on a year row or checkbox to mark it as a realization year (when you sell investments).
        Tax is calculated only on realized gains above the exemption.
      </p>
    </div>
  );
}


