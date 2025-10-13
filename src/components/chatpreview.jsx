import React from 'react';
import { Badge } from '@/components/ui/badge';

const ChatPreview = ({ chat }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-fast cursor-pointer">
      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-primary-foreground">{chat.avatar}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm truncate">{chat.name}</h4>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{chat.time}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
      </div>
      
      {chat.unread > 0 && (
        <Badge className="bg-primary text-primary-foreground flex-shrink-0 h-5 min-w-5 flex items-center justify-center p-1">
          {chat.unread}
        </Badge>
      )}
    </div>
  );
};

export default ChatPreview;
