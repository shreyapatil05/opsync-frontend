// src/components/automation/ruleData.js

// Imports for Lucide icon components (used by RuleCard for dynamic display)
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, UserPlus, DollarSign, Bell, UserCheck, FileText, ArrowUpCircle, Mail, TrendingUp } from "lucide-react";

// List of possible trigger options (for display/lookup, even though input is free-form now)
export const TRIGGER_OPTIONS = [
    { value: "task_delayed", label: "When a task is delayed", icon: AlertCircle },
    { value: "high_priority_task", label: "When high priority task created", icon: AlertTriangle },
    { value: "task_completed", label: "When a task is completed", icon: CheckCircle2 },
    { value: "task_overdue", label: "When task is overdue by 24h", icon: Clock },
    { value: "new_member", label: "When new member joins team", icon: UserPlus },
    { value: "budget_threshold", label: "When project exceeds 80% budget", icon: DollarSign },
];

// List of possible action options (used in CreateRuleDialog and RuleCard)
export const ACTION_OPTIONS = [
    { value: "notify_manager", label: "Notify Assignee/Manager", icon: Bell },
    { value: "assign_team_lead", label: "Assign to Team Lead", icon: UserCheck },
    { value: "send_report", label: "Send Completion Report", icon: FileText },
    { value: "escalate_senior", label: "Escalate to Senior Manager", icon: ArrowUpCircle },
    { value: "send_welcome_email", label: "Send Welcome Email", icon: Mail },
    { value: "notify_finance", label: "Notify Finance Team", icon: TrendingUp },
];

// Utility function used by RuleCard to match string value (from DB) to action/icon object (for display)
export const getRuleDataByValue = (options, value) => {
  return options.find(option => option.value === value);
};
