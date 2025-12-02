import { useSimulation, useSimulationDispatch } from "@/context/SimulationContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/calculations";

export function GlobalInputs() {
  const { initialCapital, timeHorizon } = useSimulation();
  const dispatch = useSimulationDispatch();

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^\d.-]/g, "")) || 0;
    dispatch({ type: "SET_INITIAL_CAPITAL", payload: Math.max(0, value) });
  };

  const handleHorizonChange = (value: number[]) => {
    dispatch({ type: "SET_TIME_HORIZON", payload: value[0] });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="capital" className="text-sm font-medium text-muted-foreground">
          Initial Capital
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            €
          </span>
          <Input
            id="capital"
            type="text"
            inputMode="numeric"
            value={initialCapital.toLocaleString("nl-BE")}
            onChange={handleCapitalChange}
            className="pl-8 text-lg font-semibold"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(initialCapital)}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">
            Time Horizon
          </Label>
          <span className="text-lg font-semibold tabular-nums">
            {timeHorizon} years
          </span>
        </div>
        <Slider
          value={[timeHorizon]}
          onValueChange={handleHorizonChange}
          min={5}
          max={30}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 years</span>
          <span>30 years</span>
        </div>
      </div>
    </div>
  );
}

