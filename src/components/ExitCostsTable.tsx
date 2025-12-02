import { type ExitCostSchedule, useSimulation, useSimulationDispatch } from "@/context/SimulationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface ExitCostsTableProps {
  scenarioId: string;
  exitCosts: ExitCostSchedule[];
}

export function ExitCostsTable({ scenarioId, exitCosts }: ExitCostsTableProps) {
  const { timeHorizon } = useSimulation();
  const dispatch = useSimulationDispatch();

  const handleExitCostChange = (year: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    dispatch({
      type: "UPDATE_EXIT_COST",
      payload: { scenarioId, year, exitFeePct: Math.max(0, numValue) },
    });
  };

  // Show in groups for better UX
  const yearsPerRow = 5;
  const rows: ExitCostSchedule[][] = [];
  for (let i = 0; i < exitCosts.length; i += yearsPerRow) {
    rows.push(exitCosts.slice(i, i + yearsPerRow));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Exit Costs by Year</h3>
        <span className="text-xs text-muted-foreground">
          (uitstapkosten - % of portfolio value)
        </span>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {Array.from({ length: yearsPerRow }, (_, i) => (
                <TableHead key={i} className="text-center text-xs w-20">
                  Year
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((ec) => (
                  <TableCell key={ec.year} className="p-1">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {ec.year}
                      </span>
                      <div className="relative w-14">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={ec.exitFeePct || ""}
                          onChange={(e) => handleExitCostChange(ec.year, e.target.value)}
                          placeholder="0"
                          className="h-7 text-xs text-center pr-4"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  </TableCell>
                ))}
                {/* Fill empty cells */}
                {row.length < yearsPerRow &&
                  Array.from({ length: yearsPerRow - row.length }, (_, i) => (
                    <TableCell key={`empty-${i}`} className="p-1" />
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Exit costs are deducted if you withdraw at that year. After year {timeHorizon}, 
        the simulation ends. Tip: Set decreasing exit costs (e.g., 3% year 1 → 0% year 5) 
        to model typical fund structures.
      </p>
    </div>
  );
}


