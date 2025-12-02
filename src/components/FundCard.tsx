import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { type Fund, useSimulationDispatch } from "@/context/SimulationContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CostsPanel } from "./CostsPanel";
import { formatCurrency } from "@/lib/calculations";

interface FundCardProps {
  fund: Fund;
  scenarioId: string;
}

export function FundCard({ fund, scenarioId }: FundCardProps) {
  const [costsOpen, setCostsOpen] = useState(false);
  const dispatch = useSimulationDispatch();

  const allocation = fund.unitPrice * fund.quantity;
  const totalCostPct =
    fund.costs.entryFeePct +
    fund.costs.managementFeePct +
    fund.costs.terPct +
    fund.costs.transactionCostPct +
    fund.costs.performanceFeePct;

  const updateFund = (updates: Partial<Fund>) => {
    dispatch({
      type: "UPDATE_FUND",
      payload: { scenarioId, fundId: fund.id, updates },
    });
  };

  const updateCosts = (costs: Partial<Fund["costs"]>) => {
    dispatch({
      type: "UPDATE_FUND_COSTS",
      payload: { scenarioId, fundId: fund.id, costs },
    });
  };

  const removeFund = () => {
    dispatch({
      type: "REMOVE_FUND",
      payload: { scenarioId, fundId: fund.id },
    });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Input
            value={fund.name}
            onChange={(e) => updateFund({ name: e.target.value })}
            placeholder="Fund name"
            className="text-base font-semibold h-9 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFund}
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unit Price and Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Unit Price</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                €
              </span>
              <Input
                type="number"
                value={fund.unitPrice || ""}
                onChange={(e) =>
                  updateFund({ unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })
                }
                placeholder="100"
                className="pl-6 text-sm h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quantity</Label>
            <Input
              type="number"
              value={fund.quantity || ""}
              onChange={(e) =>
                updateFund({ quantity: Math.max(0, parseInt(e.target.value) || 0) })
              }
              placeholder="0"
              className="text-sm h-9"
            />
          </div>
        </div>

        {/* Allocation Display */}
        <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">Allocation</span>
          <span className="font-semibold tabular-nums">{formatCurrency(allocation)}</span>
        </div>

        {/* Yearly Return */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Expected Yearly Return
          </Label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              value={fund.yearlyReturnPct ?? ""}
              onChange={(e) =>
                updateFund({ yearlyReturnPct: parseFloat(e.target.value) || 0 })
              }
              placeholder="5"
              className={`pr-6 text-sm h-9 ${
                fund.yearlyReturnPct < 0 ? "text-red-500" : "text-emerald-600"
              }`}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>

        {/* Costs Section */}
        <Collapsible open={costsOpen} onOpenChange={setCostsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-9 px-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">Costs</span>
                {totalCostPct > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalCostPct.toFixed(2)}%
                  </Badge>
                )}
              </span>
              {costsOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CostsPanel costs={fund.costs} onCostsChange={updateCosts} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

