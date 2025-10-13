import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

const TaskCard = ({ task }) => {
  const priorityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-amber-500 text-white',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="hover-scale transition-smooth cursor-pointer shadow-card hover:shadow-elegant border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <Badge className={`${priorityColors[task.priority]} text-xs px-2 py-0.5`}>
            {task.priority}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate">{task.assignee}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
