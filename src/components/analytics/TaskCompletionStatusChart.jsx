import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export function TaskCompletionStatusChart({ data = {} }) {
  
  const chartData = [
    {
      status: "Completed",
      count: data.completed || 0,
      fill: "#22c55e",
    },
    {
      status: "In Progress",
      count: data.inProgress || 0,
      fill: "#3b82f6",
    },
    {
      status: "To Do",
      count: data.todo || 0,
      fill: "#f59e0b",
    },
  ];

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="p-6 shadow-card border bg-gradient-card">
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            No task data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card border bg-gradient-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Task Status Overview</h3>
        <p className="text-sm text-muted-foreground">
          Task breakdown by completion status
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="status"
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
          <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
