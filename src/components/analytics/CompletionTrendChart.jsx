
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function CompletionTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Completion Trend</h3>
          <p className="text-sm text-muted-foreground">
            Daily completion trend over time
          </p>
        </div>
        <div className="h-[320px] flex items-center justify-center text-muted-foreground">
          No trend data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card border bg-gradient-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Completion Trend</h3>
        <p className="text-sm text-muted-foreground">
          Daily task completions over time
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}