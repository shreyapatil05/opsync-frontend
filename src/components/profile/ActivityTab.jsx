import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  FileText,
  Users,
} from "lucide-react";

const recentActivity = [
  {
    id: 1,
    type: "login",
    title: "Logged in",
    description: "From San Francisco, CA",
    timestamp: "2 hours ago",
    icon: LogIn,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    type: "task_completed",
    title: "Completed task",
    description: "API Integration - Phase 2",
    timestamp: "5 hours ago",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: 3,
    type: "task_assigned",
    title: "Assigned new task",
    description: "Dashboard Update - Design Review",
    timestamp: "1 day ago",
    icon: FileText,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    id: 4,
    type: "team_joined",
    title: "Joined team",
    description: "Marketing Campaign Team",
    timestamp: "2 days ago",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: 5,
    type: "task_delayed",
    title: "Task delayed",
    description: "Website Launch - Content Update",
    timestamp: "3 days ago",
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const assignedTasks = [
  {
    id: 1,
    title: "Design System Documentation",
    project: "Dashboard Update",
    priority: "high",
    dueDate: "Today",
    status: "in_progress",
  },
  {
    id: 2,
    title: "User Testing Session",
    project: "Mobile App Redesign",
    priority: "medium",
    dueDate: "Tomorrow",
    status: "pending",
  },
  {
    id: 3,
    title: "Sprint Planning Meeting",
    project: "API Integration",
    priority: "medium",
    dueDate: "Dec 22",
    status: "pending",
  },
];

export function ActivityTab() {
  return (
    <div className="space-y-6">
      {/* Last Login Card */}
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Last Login</h4>
            <p className="text-sm text-muted-foreground mb-2">
              December 18, 2024 at 2:34 PM
            </p>
            <p className="text-sm text-muted-foreground">
              Location: San Francisco, CA • Device: Chrome on MacOS
            </p>
          </div>
        </div>
      </Card>

      {/* Current Tasks Card */}
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Assigned Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Your currently active tasks
          </p>
        </div>

        <div className="space-y-3">
          {assignedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <Badge
                    variant={task.priority === "high" ? "destructive" : "secondary"}
                    className={
                      task.priority === "high"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : ""
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.project}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant={task.status === "in_progress" ? "default" : "secondary"}
                  className={
                    task.status === "in_progress"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : ""
                    }
                >
                  {task.status === "in_progress" ? "In Progress" : "Pending"}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {task.dueDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity Card */}
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Your recent actions and events
          </p>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b"
            >
              <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-0.5">{activity.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}