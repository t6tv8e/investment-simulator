import { Plus, X } from "lucide-react";
import { useSimulation, useSimulationDispatch } from "@/context/SimulationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScenarioPanel } from "./ScenarioPanel";

export function ScenarioTabs() {
  const { scenarios, activeScenarioId } = useSimulation();
  const dispatch = useSimulationDispatch();

  const canAddScenario = scenarios.length < 3;
  const canRemoveScenario = scenarios.length > 1;

  const addScenario = () => {
    dispatch({ type: "ADD_SCENARIO" });
  };

  const removeScenario = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    if (canRemoveScenario) {
      dispatch({ type: "REMOVE_SCENARIO", payload: scenarioId });
    }
  };

  const setActiveScenario = (scenarioId: string) => {
    dispatch({ type: "SET_ACTIVE_SCENARIO", payload: scenarioId });
  };

  return (
    <Tabs
      value={activeScenarioId || undefined}
      onValueChange={setActiveScenario}
      className="w-full"
    >
      <div className="flex items-center gap-2 border-b pb-2 mb-4 overflow-x-auto">
        <TabsList className="h-10 bg-muted/50">
          {scenarios.map((scenario) => (
            <TabsTrigger
              key={scenario.id}
              value={scenario.id}
              className="relative pr-8 data-[state=active]:bg-background"
            >
              <span className="truncate max-w-[120px]">{scenario.name}</span>
              {canRemoveScenario && (
                <button
                  onClick={(e) => removeScenario(e, scenario.id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                  aria-label={`Remove ${scenario.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {canAddScenario && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addScenario}
            className="h-8 shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Scenario
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          {scenarios.length}/3 scenarios
        </span>
      </div>

      {scenarios.map((scenario) => (
        <TabsContent key={scenario.id} value={scenario.id} className="mt-0">
          <ScenarioPanel scenario={scenario} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

