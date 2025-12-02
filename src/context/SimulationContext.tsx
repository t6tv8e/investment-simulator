import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";

// Types
export interface FundCosts {
  entryFeePct: number;
  managementFeePct: number;
  terPct: number;
  transactionCostPct: number;
  performanceFeePct: number;
}

export interface Fund {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  yearlyReturnPct: number;
  costs: FundCosts;
}

export interface ExitCostSchedule {
  year: number;
  exitFeePct: number;
}

export interface TaxSettings {
  taxRatePct: number;
  realizationYears: number[];
}

export interface Scenario {
  id: string;
  name: string;
  funds: Fund[];
  exitCosts: ExitCostSchedule[];
  taxSettings: TaxSettings;
}

export interface SimulationState {
  initialCapital: number;
  timeHorizon: number;
  scenarios: Scenario[];
  activeScenarioId: string | null;
}

// Action Types
type SimulationAction =
  | { type: "SET_INITIAL_CAPITAL"; payload: number }
  | { type: "SET_TIME_HORIZON"; payload: number }
  | { type: "ADD_SCENARIO" }
  | { type: "REMOVE_SCENARIO"; payload: string }
  | {
      type: "UPDATE_SCENARIO";
      payload: { id: string; updates: Partial<Scenario> };
    }
  | { type: "SET_ACTIVE_SCENARIO"; payload: string }
  | { type: "ADD_FUND"; payload: { scenarioId: string } }
  | { type: "REMOVE_FUND"; payload: { scenarioId: string; fundId: string } }
  | {
      type: "UPDATE_FUND";
      payload: { scenarioId: string; fundId: string; updates: Partial<Fund> };
    }
  | {
      type: "UPDATE_FUND_COSTS";
      payload: {
        scenarioId: string;
        fundId: string;
        costs: Partial<FundCosts>;
      };
    }
  | {
      type: "SET_EXIT_COSTS";
      payload: { scenarioId: string; exitCosts: ExitCostSchedule[] };
    }
  | {
      type: "UPDATE_EXIT_COST";
      payload: { scenarioId: string; year: number; exitFeePct: number };
    }
  | {
      type: "UPDATE_TAX_RATE";
      payload: { scenarioId: string; taxRatePct: number };
    }
  | {
      type: "TOGGLE_REALIZATION_YEAR";
      payload: { scenarioId: string; year: number };
    };

// Helper functions
const generateId = () => crypto.randomUUID();

const createDefaultFund = (): Fund => ({
  id: generateId(),
  name: "New Fund",
  unitPrice: 100,
  quantity: 0,
  yearlyReturnPct: 5,
  costs: {
    entryFeePct: 0,
    managementFeePct: 0,
    terPct: 0,
    transactionCostPct: 0,
    performanceFeePct: 0,
  },
});

const createDefaultScenario = (
  name: string,
  timeHorizon: number
): Scenario => ({
  id: generateId(),
  name,
  funds: [],
  exitCosts: Array.from({ length: timeHorizon }, (_, i) => ({
    year: i + 1,
    exitFeePct: 0,
  })),
  taxSettings: {
    taxRatePct: 30,
    realizationYears: [],
  },
});

// Initial State
const createInitialState = (): SimulationState => {
  const scenario = createDefaultScenario("Realistic Scenario", 10);
  return {
    initialCapital: 120000,
    timeHorizon: 10,
    scenarios: [scenario],
    activeScenarioId: scenario.id,
  };
};

// Reducer
function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case "SET_INITIAL_CAPITAL":
      return { ...state, initialCapital: action.payload };

    case "SET_TIME_HORIZON": {
      const newHorizon = action.payload;
      return {
        ...state,
        timeHorizon: newHorizon,
        scenarios: state.scenarios.map((scenario) => ({
          ...scenario,
          exitCosts: Array.from({ length: newHorizon }, (_, i) => {
            const existing = scenario.exitCosts.find((ec) => ec.year === i + 1);
            return existing || { year: i + 1, exitFeePct: 0 };
          }),
        })),
      };
    }

    case "ADD_SCENARIO": {
      if (state.scenarios.length >= 3) return state;
      const newScenario = createDefaultScenario(
        `Scenario ${state.scenarios.length + 1}`,
        state.timeHorizon
      );
      return {
        ...state,
        scenarios: [...state.scenarios, newScenario],
        activeScenarioId: newScenario.id,
      };
    }

    case "REMOVE_SCENARIO": {
      const filtered = state.scenarios.filter((s) => s.id !== action.payload);
      if (filtered.length === 0) return state;
      return {
        ...state,
        scenarios: filtered,
        activeScenarioId:
          state.activeScenarioId === action.payload
            ? filtered[0].id
            : state.activeScenarioId,
      };
    }

    case "UPDATE_SCENARIO":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };

    case "SET_ACTIVE_SCENARIO":
      return { ...state, activeScenarioId: action.payload };

    case "ADD_FUND": {
      return {
        ...state,
        scenarios: state.scenarios.map((s) => {
          if (s.id !== action.payload.scenarioId) return s;
          if (s.funds.length >= 5) return s;
          return { ...s, funds: [...s.funds, createDefaultFund()] };
        }),
      };
    }

    case "REMOVE_FUND":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.scenarioId
            ? {
                ...s,
                funds: s.funds.filter((f) => f.id !== action.payload.fundId),
              }
            : s
        ),
      };

    case "UPDATE_FUND":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.scenarioId
            ? {
                ...s,
                funds: s.funds.map((f) =>
                  f.id === action.payload.fundId
                    ? { ...f, ...action.payload.updates }
                    : f
                ),
              }
            : s
        ),
      };

    case "UPDATE_FUND_COSTS":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.scenarioId
            ? {
                ...s,
                funds: s.funds.map((f) =>
                  f.id === action.payload.fundId
                    ? { ...f, costs: { ...f.costs, ...action.payload.costs } }
                    : f
                ),
              }
            : s
        ),
      };

    case "SET_EXIT_COSTS":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.scenarioId
            ? { ...s, exitCosts: action.payload.exitCosts }
            : s
        ),
      };

    case "UPDATE_EXIT_COST":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.scenarioId
            ? {
                ...s,
                exitCosts: s.exitCosts.map((ec) =>
                  ec.year === action.payload.year
                    ? { ...ec, exitFeePct: action.payload.exitFeePct }
                    : ec
                ),
              }
            : s
        ),
      };

    case "UPDATE_TAX_RATE":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.scenarioId
            ? {
                ...s,
                taxSettings: {
                  ...s.taxSettings,
                  taxRatePct: action.payload.taxRatePct,
                },
              }
            : s
        ),
      };

    case "TOGGLE_REALIZATION_YEAR":
      return {
        ...state,
        scenarios: state.scenarios.map((s) => {
          if (s.id !== action.payload.scenarioId) return s;
          const year = action.payload.year;
          const isCurrentlySelected =
            s.taxSettings.realizationYears.includes(year);
          return {
            ...s,
            taxSettings: {
              ...s.taxSettings,
              realizationYears: isCurrentlySelected
                ? s.taxSettings.realizationYears.filter((y) => y !== year)
                : [...s.taxSettings.realizationYears, year].sort(
                    (a, b) => a - b
                  ),
            },
          };
        }),
      };

    default:
      return state;
  }
}

// Context
const SimulationContext = createContext<SimulationState | null>(null);
const SimulationDispatchContext =
  createContext<Dispatch<SimulationAction> | null>(null);

// Provider
export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    simulationReducer,
    null,
    createInitialState
  );

  return (
    <SimulationContext.Provider value={state}>
      <SimulationDispatchContext.Provider value={dispatch}>
        {children}
      </SimulationDispatchContext.Provider>
    </SimulationContext.Provider>
  );
}

// Hooks
export function useSimulation(): SimulationState {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}

export function useSimulationDispatch(): Dispatch<SimulationAction> {
  const context = useContext(SimulationDispatchContext);
  if (!context) {
    throw new Error(
      "useSimulationDispatch must be used within a SimulationProvider"
    );
  }
  return context;
}

// Selector hooks
export function useActiveScenario(): Scenario | null {
  const { scenarios, activeScenarioId } = useSimulation();
  return scenarios.find((s) => s.id === activeScenarioId) || null;
}

export function useTotalAllocated(scenarioId: string): number {
  const { scenarios } = useSimulation();
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) return 0;
  return scenario.funds.reduce(
    (sum, fund) => sum + fund.unitPrice * fund.quantity,
    0
  );
}

export function useRemainingCapital(scenarioId: string): number {
  const { initialCapital } = useSimulation();
  const allocated = useTotalAllocated(scenarioId);
  return initialCapital - allocated;
}
