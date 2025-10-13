import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

export function ProjectProgressChart({ data = [] }) {
  
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Project Progress</h3>
          <p className="text-sm text-muted-foreground">
            Task distribution across projects
          </p>
        </div>
        <div className="h-[320px] flex items-center justify-center text-muted-foreground">
          No project data available
        </div>
      </Card>
    );
  }

  
  const transformedData = data.map(project => ({
    name: project.name,
    completed: project.completed || 0,
    inProgress: project.inProgress || 0,
    todo: project.todo || 0,
  }));

  return (
    <Card className="p-6 shadow-card border bg-gradient-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Project Progress</h3>
        <p className="text-sm text-muted-foreground">
          Task distribution across projects
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
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
          <Bar
            dataKey="completed"
            fill="hsl(var(--success))"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
          <Bar
            dataKey="inProgress"
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
          <Bar
            dataKey="todo"
            fill="hsl(var(--muted))"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}