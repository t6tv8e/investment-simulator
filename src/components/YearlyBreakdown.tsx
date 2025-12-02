import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type ScenarioProjection,
  type TaxSettings,
  calculateTaxProjection,
  formatCurrency,
  formatPercentage,
} from "@/lib/calculations";

interface YearlyBreakdownProps {
  projection: ScenarioProjection;
  taxSettings?: TaxSettings;
}

export function YearlyBreakdown({ projection, taxSettings }: YearlyBreakdownProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Calculate tax projection if settings provided
  const taxProjection = useMemo(() => {
    if (!taxSettings) return null;
    return calculateTaxProjection(projection, taxSettings);
  }, [projection, taxSettings]);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const getTaxYearData = (year: number) => {
    return taxProjection?.years.find((y) => y.year === year);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-medium">
            Yearly Breakdown
          </CardTitle>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total costs:</span>
              <Badge variant="secondary">
                {formatCurrency(projection.totalCostsPaid)}
              </Badge>
            </div>
            {taxProjection && taxProjection.totalTaxPaid > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total tax:</span>
                <Badge variant="destructive">
                  {formatCurrency(taxProjection.totalTaxPaid)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-16 text-center">Year</TableHead>
                <TableHead className="text-right">Start Value</TableHead>
                <TableHead className="text-right">Gross Return</TableHead>
                <TableHead className="text-right">Total Costs</TableHead>
                <TableHead className="text-right">Net Return</TableHead>
                <TableHead className="text-right">End Value</TableHead>
                <TableHead className="text-right">Exit Cost</TableHead>
                {taxSettings && (
                  <>
                    <TableHead className="text-right text-blue-600">Unrealized Gains</TableHead>
                    <TableHead className="text-right text-blue-600">Tax Due</TableHead>
                  </>
                )}
                <TableHead className="text-right">
                  {taxSettings ? "Net After Tax" : "Value After Exit"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projection.years.map((yearData) => {
                const isExpanded = expandedYears.has(yearData.year);
                const hasMultipleFunds = yearData.funds.length > 1;
                const taxYear = getTaxYearData(yearData.year);
                const isRealizationYear = taxYear?.isRealizationYear ?? false;

                // Calculate value after all deductions
                const valueAfterExit = yearData.valueAfterExit;
                const netAfterTax = taxYear
                  ? valueAfterExit - taxYear.taxDue
                  : valueAfterExit;

                return (
                  <>
                    {/* Main year row */}
                    <TableRow
                      key={yearData.year}
                      className={`${
                        hasMultipleFunds ? "cursor-pointer hover:bg-muted/50" : ""
                      } ${isRealizationYear ? "bg-amber-50/30 dark:bg-amber-950/10" : ""}`}
                      onClick={() => hasMultipleFunds && toggleYear(yearData.year)}
                    >
                      <TableCell className="text-center">
                        {hasMultipleFunds && (
                          <span className="text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 inline" />
                            ) : (
                              <ChevronRight className="h-4 w-4 inline" />
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className="flex items-center justify-center gap-1">
                          {yearData.year}
                          {isRealizationYear && (
                            <span className="text-xs text-amber-600" title="Realization year">
                              💰
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(yearData.totalStartValue)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          yearData.totalGrossReturn >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {yearData.totalGrossReturn >= 0 ? "+" : ""}
                        {formatCurrency(yearData.totalGrossReturn)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-amber-600">
                        -{formatCurrency(yearData.totalCosts.totalCosts)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${
                          yearData.totalNetReturn >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {yearData.totalNetReturn >= 0 ? "+" : ""}
                        {formatCurrency(yearData.totalNetReturn)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {formatCurrency(yearData.totalEndValueAfterCosts)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {yearData.exitCostPct > 0 ? (
                          <>
                            {formatPercentage(yearData.exitCostPct)}
                            <br />
                            <span className="text-xs">
                              ({formatCurrency(yearData.exitCost)})
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      {taxSettings && taxYear && (
                        <>
                          <TableCell className="text-right tabular-nums">
                            {isRealizationYear ? (
                              <span className="text-emerald-600">
                                {formatCurrency(taxYear.realizedGains)}
                                <br />
                                <span className="text-xs text-muted-foreground">
                                  (realized)
                                </span>
                              </span>
                            ) : (
                              <span
                                className={
                                  taxYear.cumulativeUnrealizedGains >= 0
                                    ? "text-blue-600"
                                    : "text-red-500"
                                }
                              >
                                {formatCurrency(taxYear.cumulativeUnrealizedGains)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {isRealizationYear ? (
                              taxYear.taxDue > 0 ? (
                                <span className="text-red-500 font-medium">
                                  -{formatCurrency(taxYear.taxDue)}
                                  <br />
                                  <span className="text-xs font-normal">
                                    (exempt: {formatCurrency(taxYear.exemptionUsed)})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-emerald-600">
                                  €0
                                  <br />
                                  <span className="text-xs">(fully exempt)</span>
                                </span>
                              )
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-right tabular-nums font-semibold">
                        {formatCurrency(netAfterTax)}
                      </TableCell>
                    </TableRow>

                    {/* Expanded fund details */}
                    {isExpanded &&
                      yearData.funds.map((fund) => (
                        <TableRow
                          key={`${yearData.year}-${fund.fundId}`}
                          className="bg-muted/20"
                        >
                          <TableCell></TableCell>
                          <TableCell className="text-xs text-muted-foreground pl-4">
                            └ {fund.fundName}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {formatCurrency(fund.startValue)}
                          </TableCell>
                          <TableCell
                            className={`text-right tabular-nums text-sm ${
                              fund.grossReturn >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {fund.grossReturn >= 0 ? "+" : ""}
                            {formatCurrency(fund.grossReturn)}
                            <br />
                            <span className="text-xs">
                              ({formatPercentage(fund.grossReturnPct)})
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-amber-600">
                            -{formatCurrency(fund.costs.totalCosts)}
                            <br />
                            <span className="text-xs">
                              ({formatPercentage(fund.costsPct.total)})
                            </span>
                          </TableCell>
                          <TableCell
                            className={`text-right tabular-nums text-sm ${
                              fund.netReturn >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {fund.netReturn >= 0 ? "+" : ""}
                            {formatCurrency(fund.netReturn)}
                            <br />
                            <span className="text-xs">
                              ({formatPercentage(fund.netReturnPct)})
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {formatCurrency(fund.endValueAfterCosts)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            -
                          </TableCell>
                          {taxSettings && (
                            <>
                              <TableCell className="text-right text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                -
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-right text-muted-foreground">
                            -
                          </TableCell>
                        </TableRow>
                      ))}

                    {/* Cost breakdown row when expanded */}
                    {isExpanded && (
                      <TableRow className="bg-amber-50/30 dark:bg-amber-950/10">
                        <TableCell></TableCell>
                        <TableCell
                          colSpan={3}
                          className="text-xs text-muted-foreground"
                        >
                          <span className="font-medium">Costs breakdown:</span>
                        </TableCell>
                        <TableCell
                          colSpan={taxSettings ? 7 : 5}
                          className="text-xs text-amber-700 dark:text-amber-400"
                        >
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {yearData.totalCosts.entryFee > 0 && (
                              <span>
                                Entry: {formatCurrency(yearData.totalCosts.entryFee)}
                              </span>
                            )}
                            {yearData.totalCosts.managementFee > 0 && (
                              <span>
                                Management:{" "}
                                {formatCurrency(yearData.totalCosts.managementFee)}
                              </span>
                            )}
                            {yearData.totalCosts.ter > 0 && (
                              <span>TER: {formatCurrency(yearData.totalCosts.ter)}</span>
                            )}
                            {yearData.totalCosts.transactionCost > 0 && (
                              <span>
                                Transaction:{" "}
                                {formatCurrency(yearData.totalCosts.transactionCost)}
                              </span>
                            )}
                            {yearData.totalCosts.performanceFee > 0 && (
                              <span>
                                Performance:{" "}
                                {formatCurrency(yearData.totalCosts.performanceFee)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}

              {/* Summary row */}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell></TableCell>
                <TableCell className="text-center">Total</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(projection.initialInvestment)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-600">
                  -
                </TableCell>
                <TableCell className="text-right tabular-nums text-amber-600">
                  -{formatCurrency(projection.totalCostsPaid)}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    projection.totalReturn >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {projection.totalReturn >= 0 ? "+" : ""}
                  {formatCurrency(projection.totalReturn)}
                  <br />
                  <span className="text-xs font-normal">
                    ({formatPercentage(projection.totalReturnPct)})
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(projection.finalValue)}
                </TableCell>
                <TableCell></TableCell>
                {taxSettings && taxProjection && (
                  <>
                    <TableCell className="text-right tabular-nums text-blue-600">
                      -
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-500">
                      {taxProjection.totalTaxPaid > 0
                        ? `-${formatCurrency(taxProjection.totalTaxPaid)}`
                        : "-"}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(
                    projection.finalValue - (taxProjection?.totalTaxPaid ?? 0)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
