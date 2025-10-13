import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function TaskCompletionChart({ data = [] }) {
  
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Task Completion Trend</h3>
          <p className="text-sm text-muted-foreground">
            Daily task completion trend over time
          </p>
        </div>
        <div className="h-[320px] flex items-center justify-center text-muted-foreground">
          No completion data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card border bg-gradient-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Task Completion Trend</h3>
        <p className="text-sm text-muted-foreground">
          Daily task completion over time
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
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", r: 5 }}
            activeDot={{ r: 7 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
