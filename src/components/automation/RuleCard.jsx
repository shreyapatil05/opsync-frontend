import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Zap, PlayCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";

// You should get these from a centralized location, like a new ruleData.js file.
const TRIGGER_OPTIONS = [
    { value: "task_delayed", label: "When a task is delayed", icon: "AlertCircle" },
    { value: "high_priority_task", label: "When high priority task created", icon: "AlertTriangle" },
    { value: "task_completed", label: "When a task is completed", icon: "CheckCircle2" },
    { value: "task_overdue", label: "When task is overdue by 24h", icon: "Clock" },
    { value: "new_member", label: "When new member joins team", icon: "UserPlus" },
    { value: "budget_threshold", label: "When project exceeds 80% budget", icon: "DollarSign" },
];

const ACTION_OPTIONS = [
    { value: "notify_manager", label: "Notify Manager", icon: "Bell" },
    { value: "assign_team_lead", label: "Assign to Team Lead", icon: "UserCheck" },
    { value: "send_report", label: "Send completion report", icon: "FileText" },
    { value: "escalate_senior", label: "Escalate to Senior Manager", icon: "ArrowUpCircle" },
    { value: "send_welcome_email", label: "Send welcome email & resources", icon: "Mail" },
    { value: "notify_finance", label: "Notify Finance Team", icon: "TrendingUp" },
];

export function RuleCard({ rule, onToggle, onDelete }) {
    // Look up the full trigger and action objects based on the string values from the backend
    const triggerData = TRIGGER_OPTIONS.find(option => option.value === rule.trigger);
    const actionData = ACTION_OPTIONS.find(option => option.value === rule.action);

    // Safely get the icon component, with a fallback
    const TriggerIcon = LucideIcons[triggerData?.icon] || Zap;
    const ActionIcon = LucideIcons[actionData?.icon] || PlayCircle;

    return (
        <div
            className={`group relative bg-gradient-card rounded-xl p-6 shadow-card border transition-all duration-300 hover:shadow-lg ${
                rule.isActive ? "border-primary/20" : "border-border"
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{rule.name}</h3>
                    <Badge
                        variant={rule.isActive ? "default" : "secondary"}
                        className={
                            rule.isActive
                                ? "bg-success text-success-foreground"
                                : "bg-muted text-muted-foreground"
                        }
                    >
                        {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => onToggle(rule.id)}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDelete(rule.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Rule Flow */}
            <div className="flex items-center gap-4">
                {/* Trigger */}
                <div className="flex-1 bg-card rounded-lg p-4 border shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                            <TriggerIcon className="h-5 w-5 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Trigger
                            </div>
                            {/* Use the label from the looked-up data */}
                            <div className="text-sm font-medium leading-tight">
                                {triggerData?.label || "Unknown Trigger"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                </div>

                {/* Action */}
                <div className="flex-1 bg-card rounded-lg p-4 border shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ActionIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Action
                            </div>
                            {/* Use the label from the looked-up data */}
                            <div className="text-sm font-medium leading-tight">
                                {actionData?.label || "Unknown Action"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Created {new Date(rule.createdAt).toLocaleDateString()}</span>
                {rule.isActive && (
                    <span className="flex items-center gap-1 text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                        Running
                    </span>
                )}
            </div>
        </div>
    );
}