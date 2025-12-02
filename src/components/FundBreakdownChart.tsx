import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ScenarioProjection, getChartData, formatCurrency } from "@/lib/calculations";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Color palette for funds
const FUND_COLORS = [
  { border: "hsl(221, 83%, 53%)", bg: "hsla(221, 83%, 53%, 0.1)" },
  { border: "hsl(262, 83%, 58%)", bg: "hsla(262, 83%, 58%, 0.1)" },
  { border: "hsl(25, 95%, 53%)", bg: "hsla(25, 95%, 53%, 0.1)" },
  { border: "hsl(173, 80%, 40%)", bg: "hsla(173, 80%, 40%, 0.1)" },
  { border: "hsl(340, 75%, 55%)", bg: "hsla(340, 75%, 55%, 0.1)" },
];

interface FundBreakdownChartProps {
  projection: ScenarioProjection;
}

export function FundBreakdownChart({ projection }: FundBreakdownChartProps) {
  const chartData = useMemo(() => getChartData(projection), [projection]);

  const data = {
    labels: chartData.labels,
    datasets: chartData.fundValues.map((fund, index) => {
      const colors = FUND_COLORS[index % FUND_COLORS.length];
      return {
        label: fund.fundName,
        data: fund.values,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colors.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "hsl(var(--foreground))",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--card))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          font: {
            size: 11,
          },
        },
        stacked: true,
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          font: {
            size: 11,
          },
          callback: (value: number | string) => {
            const num = typeof value === "string" ? parseFloat(value) : value;
            return `€${(num / 1000).toFixed(0)}k`;
          },
        },
        stacked: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  if (chartData.fundValues.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Fund Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Add funds to see the breakdown chart
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Fund Breakdown</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Individual fund performance over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}


