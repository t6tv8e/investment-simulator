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

interface GrowthChartProps {
  projection: ScenarioProjection;
}

export function GrowthChart({ projection }: GrowthChartProps) {
  const chartData = useMemo(() => getChartData(projection), [projection]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Portfolio Value",
        data: chartData.totalValues,
        borderColor: "hsl(142, 76%, 36%)",
        backgroundColor: "hsla(142, 76%, 36%, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "hsl(142, 76%, 36%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(var(--card))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: { parsed: { y: number | null } }) => {
            if (context.parsed.y === null) return "";
            return formatCurrency(context.parsed.y);
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
      },
      y: {
        beginAtZero: false,
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
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const finalValue = chartData.totalValues[chartData.totalValues.length - 1];
  const initialValue = chartData.totalValues[0];
  const totalReturn = finalValue - initialValue;
  const returnPct = initialValue > 0 ? (totalReturn / initialValue) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Portfolio Growth</CardTitle>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-2xl font-bold tabular-nums text-emerald-600">
            {formatCurrency(finalValue)}
          </span>
          <span
            className={`text-sm font-medium ${
              totalReturn >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {totalReturn >= 0 ? "+" : ""}
            {formatCurrency(totalReturn)} ({returnPct.toFixed(1)}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}


