import { useMemo } from "react";
import { Plus } from "lucide-react";
import { type Scenario, useSimulation, useSimulationDispatch } from "@/context/SimulationContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FundCard } from "./FundCard";
import { AllocationSummary } from "./AllocationSummary";
import { TaxSettings } from "./TaxSettings";
import { GrowthChart } from "./GrowthChart";
import { FundBreakdownChart } from "./FundBreakdownChart";
import { YearlyBreakdown } from "./YearlyBreakdown";
import { calculateScenarioProjection } from "@/lib/calculations";

interface ScenarioPanelProps {
  scenario: Scenario;
}

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
  const { timeHorizon } = useSimulation();
  const dispatch = useSimulationDispatch();

  const projection = useMemo(
    () => calculateScenarioProjection(scenario, timeHorizon),
    [scenario, timeHorizon]
  );

  const updateScenarioName = (name: string) => {
    dispatch({
      type: "UPDATE_SCENARIO",
      payload: { id: scenario.id, updates: { name } },
    });
  };

  const addFund = () => {
    dispatch({
      type: "ADD_FUND",
      payload: { scenarioId: scenario.id },
    });
  };

  const canAddFund = scenario.funds.length < 5;

  return (
    <div className="space-y-6">
      {/* Scenario Name */}
      <div className="flex items-center gap-4">
        <Input
          value={scenario.name}
          onChange={(e) => updateScenarioName(e.target.value)}
          placeholder="Scenario name"
          className="text-xl font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 max-w-md"
        />
      </div>

      {/* Allocation Summary */}
      <AllocationSummary scenarioId={scenario.id} />

      {/* Funds Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Funds ({scenario.funds.length}/5)
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addFund}
            disabled={!canAddFund}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Fund
          </Button>
        </div>

        {scenario.funds.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No funds added yet. Add a fund to start building your portfolio.
            </p>
            <Button variant="outline" onClick={addFund}>
              <Plus className="h-4 w-4 mr-1" />
              Add First Fund
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenario.funds.map((fund) => (
              <FundCard key={fund.id} fund={fund} scenarioId={scenario.id} />
            ))}
          </div>
        )}
      </div>

      {/* Tax Settings */}
      <TaxSettings
        scenarioId={scenario.id}
        taxSettings={scenario.taxSettings}
        scenario={scenario}
      />

      {/* Charts - Only show if there are funds with allocation */}
      {projection.initialInvestment > 0 && (
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Projection Charts
          </h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <GrowthChart projection={projection} />
            <FundBreakdownChart projection={projection} />
          </div>
        </div>
      )}

      {/* Yearly Breakdown Table */}
      {projection.initialInvestment > 0 && (
        <YearlyBreakdown
          projection={projection}
          taxSettings={scenario.taxSettings}
        />
      )}
    </div>
  );
}

