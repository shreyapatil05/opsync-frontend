import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor,
  iconBg,
}) {
  const isPositive = trend === "up";

  return (
    <Card className="p-6 shadow-card border hover:shadow-lg transition-all duration-300 bg-gradient-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-success" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? "text-success" : "text-success"
              }`}
            >
              {change}
            </span>
            <span className="text-sm text-muted-foreground">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  )}