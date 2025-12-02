import {
  useSimulation,
  useTotalAllocated,
  useRemainingCapital,
} from "@/context/SimulationContext";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/calculations";

interface AllocationSummaryProps {
  scenarioId: string;
}

export function AllocationSummary({ scenarioId }: AllocationSummaryProps) {
  const { initialCapital } = useSimulation();
  const allocated = useTotalAllocated(scenarioId);
  const remaining = useRemainingCapital(scenarioId);

  const allocationPct =
    initialCapital > 0 ? (allocated / initialCapital) * 100 : 0;
  const isOverAllocated = remaining < 0;
  const isFullyAllocated = Math.abs(remaining) < 0.01;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Allocation Summary</h3>
        <Badge
          variant={
            isOverAllocated
              ? "destructive"
              : isFullyAllocated
              ? "default"
              : "secondary"
          }
        >
          {allocationPct.toFixed(1)}% allocated
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isOverAllocated
              ? "bg-destructive"
              : isFullyAllocated
              ? "bg-emerald-500"
              : "bg-primary"
          }`}
          style={{ width: `${Math.min(100, allocationPct)}%` }}
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Initial</p>
          <p className="text-sm font-medium tabular-nums">
            {formatCurrency(initialCapital)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Allocated</p>
          <p className="text-sm font-medium tabular-nums">
            {formatCurrency(allocated)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p
            className={`text-sm font-medium tabular-nums ${
              isOverAllocated ? "text-destructive" : ""
            }`}
          >
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {isOverAllocated && (
        <p className="text-xs text-destructive">
          ⚠️ You have allocated more than your initial capital
        </p>
      )}
    </div>
  );
}
