
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

export function TeamPerformanceChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Team Performance</h3>
          <p className="text-sm text-muted-foreground">
            Team efficiency breakdown
          </p>
        </div>
        <div className="h-[320px] flex items-center justify-center text-muted-foreground">
          No team data available
        </div>
      </Card>
    );
  }

  
  const chartData = data.map(team => ({
    name: team.name,
    value: parseInt(team.efficiency) || 0,
  }));

  return (
    <Card className="p-6 shadow-card border bg-gradient-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">Team Performance</h3>
        <p className="text-sm text-muted-foreground">
          Team efficiency breakdown
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}


