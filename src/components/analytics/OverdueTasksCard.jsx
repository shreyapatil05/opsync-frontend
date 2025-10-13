import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function OverdueTasksCard({ data = {} }) {
  const overdueItems = Object.entries(data);

  return (
    <Card className="p-6 shadow-card border bg-gradient-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Overdue Tasks
        </h3>
        <p className="text-sm text-muted-foreground">
          Tasks past due date by project
        </p>
      </div>
      {overdueItems.length > 0 ? (
        <div className="space-y-3">
          {overdueItems.map(([project, count]) => (
            <div
              key={project}
              className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
            >
              <span className="font-medium text-foreground">{project}</span>
              <span className="px-3 py-1 rounded-full bg-warning/20 text-warning font-semibold text-sm">
                {count} overdue
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No overdue tasks - you're all set!</p>
        </div>
      )}
    </Card>
  );
}

