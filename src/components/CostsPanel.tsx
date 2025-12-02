import { type FundCosts } from "@/context/SimulationContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CostsPanelProps {
  costs: FundCosts;
  onCostsChange: (costs: Partial<FundCosts>) => void;
}

const costFields: { key: keyof FundCosts; label: string; description: string }[] = [
  {
    key: "entryFeePct",
    label: "Entry Fee",
    description: "One-time fee applied in year 1 (instapkosten)",
  },
  {
    key: "managementFeePct",
    label: "Management Fee",
    description: "Annual management costs (beheerskosten)",
  },
  {
    key: "terPct",
    label: "TER / Ongoing Costs",
    description: "Total Expense Ratio - ongoing annual costs (lopende kosten)",
  },
  {
    key: "transactionCostPct",
    label: "Transaction Costs",
    description: "Annual buying/selling costs within the fund (transactiekosten)",
  },
  {
    key: "performanceFeePct",
    label: "Performance Fee",
    description: "Fee on positive returns only (prestatievergoeding)",
  },
];

export function CostsPanel({ costs, onCostsChange }: CostsPanelProps) {
  const handleChange = (key: keyof FundCosts, value: string) => {
    const numValue = parseFloat(value) || 0;
    onCostsChange({ [key]: Math.max(0, numValue) });
  };

  return (
    <div className="grid gap-4 pt-2">
      {costFields.map(({ key, label, description }) => (
        <div key={key} className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={key}
              className="text-xs font-medium text-muted-foreground"
            >
              {label}
            </Label>
            <div className="relative w-24">
              <Input
                id={key}
                type="number"
                step="0.01"
                min="0"
                value={costs[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="0"
                className="pr-6 text-right text-sm h-8"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/70">{description}</p>
        </div>
      ))}
    </div>
  );
}


