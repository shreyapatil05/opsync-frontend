import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GripVertical } from "lucide-react";

export const SortableTask = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  // Safe assignee display
  const getAssigneeInitials = () => {
    if (!task.assignee) {
      return "NA";
    }
    
    // If assignee is a populated object
    if (typeof task.assignee === 'object' && task.assignee !== null) {
      const name = task.assignee.name || task.assignee.username || task.assignee.email || '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase() || "U";
    }
    
    // If assignee is a string (fallback)
    if (typeof task.assignee === 'string') {
      return task.assignee.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    return "NA";
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start gap-2">
            <div {...attributes} {...listeners} className="mt-1 cursor-grab">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-medium leading-none text-sm">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 pl-9">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getAssigneeInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};