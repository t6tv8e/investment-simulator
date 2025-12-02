import "./App.css";
import { SimulationProvider } from "./context/SimulationContext";
import { GlobalInputs } from "./components/GlobalInputs";
import { ScenarioTabs } from "./components/ScenarioTabs";

function App() {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Asset Manager Simulation
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Long-term investment scenario planner
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-8">
              {/* Global Settings Card */}
              <section className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-xl shadow-black/5">
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  Investment Parameters
                </h2>
                <GlobalInputs />
              </section>

              {/* Scenarios Section */}
              <section className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-xl shadow-black/5">
                <ScenarioTabs />
              </section>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl mt-12">
            <div className="container mx-auto px-4 py-6">
              <p className="text-center text-sm text-muted-foreground">
                Simulation tool for educational purposes. Past performance does
                not guarantee future results.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
