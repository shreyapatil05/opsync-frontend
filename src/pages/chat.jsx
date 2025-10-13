import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import {
  Send,
  Smile,
  Paperclip,
  Hash,
  MoreVertical,
  Search,
  Users,
  Plus,
  User,
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import apiClient from '../utils/api';
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user, isLoggedIn } = useAuth();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const downloadQueueRef = useRef([]);
  const isDownloadingRef = useRef(false);


  // Debug component
  const SocketDebug = () => (
    <div className="fixed bottom-4 right-4 p-4 bg-background border rounded-lg shadow-lg z-50 text-xs">
      <h4 className="font-bold">Socket Debug</h4>
      <p>User: {user?.id}</p>
      <p>Connected: {isConnected ? '✅' : '❌'}</p>
      <p>Socket: {socket ? '✅' : '❌'}</p>
      <p>Cookies: {document.cookie ? '✅' : '❌'}</p>
    </div>
  );

  // Handle connection status
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log(' Socket connected in Chat component');
      toast({
        title: "Connected",
        description: "You're now connected to chat",
      });
    };

    const handleDisconnect = () => {
      console.log(' Socket disconnected in Chat component');
      toast({
        title: "Disconnected",
        description: "Connection lost. Reconnecting...",
        variant: "destructive",
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, toast]);

 
  useEffect(() => {
    if (location.state?.autoSelectConversationId && conversations.length > 0) {
      const conversationToSelect = conversations.find(
        conv => conv._id === location.state.autoSelectConversationId
      );
      if (conversationToSelect) {
        setSelectedConversation(conversationToSelect);
        fetchMessages(conversationToSelect._id);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, conversations, navigate]);

  // Auto-search users when typing
  useEffect(() => {
    if (userSearchQuery.trim().length >= 2) {
      const delaySearch = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
    }
  }, [userSearchQuery]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  
  useEffect(() => {
    if (!socket || !isConnected) return;

    
    socket.on('new_message', (data) => {
      console.log('📨 New message received:', data);
      if (data.conversation._id === selectedConversation?._id) {
        
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.isOptimistic);
          return [...filtered, data.message];
        });
        
        // Update conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv._id === data.conversation._id 
              ? { ...data.conversation, lastMessage: data.message }
              : conv
          )
        );
      } else {
        // Update unread count for other conversations
        setConversations(prev => 
          prev.map(conv => 
            conv._id === data.conversation._id 
              ? { 
                  ...conv, 
                  lastMessage: data.message,
                  unreadCount: (conv.unreadCount || 0) + 1 
                }
              : conv
          )
        );
      }
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Listen for user online/offline status
    socket.on('user_online', (data) => {
      setConversations(prev => 
        prev.map(conv => {
          if (conv.type === 'direct' && conv.participants.some(p => p._id === data.userId)) {
            return { ...conv, isOnline: true };
          }
          return conv;
        })
      );
    });

    socket.on('user_offline', (data) => {
      setConversations(prev => 
        prev.map(conv => {
          if (conv.type === 'direct' && conv.participants.some(p => p._id === data.userId)) {
            return { ...conv, isOnline: false };
          }
          return conv;
        })
      );
    });

    // Listen for message errors
    socket.on('message_error', (data) => {
      console.error('Message error:', data.error);
      toast({
        title: "Error",
        description: data.error,
        variant: "destructive",
      });
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('message_error');
    };
  }, [socket, isConnected, selectedConversation, toast]);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && socket && isConnected) {
      socket.emit('join_conversation', selectedConversation._id);
      fetchMessages(selectedConversation._id);
      setTypingUsers(new Set());
    }

    return () => {
      if (selectedConversation && socket && isConnected) {
        socket.emit('leave_conversation', selectedConversation._id);
      }
    };
  }, [selectedConversation, socket, isConnected]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/chat/conversations');
      
      if (response && response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
          fetchMessages(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
   
    
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
      if (response && response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response && response.status === 401) {
        console.log("401 in fetchMessages - auth will handle redirect");
        // AuthContext will handle the redirect
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      // Only show toast for non-auth errors
      if (!error.message.includes('Authentication')) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    }
  };


  // 🆕 Update searchUsers to handle 401 properly
  const searchUsers = async () => {
    if (!userSearchQuery.trim() || userSearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    

    try {
      setSearchingUsers(true);
      const response = await apiClient.get(`/chat/users/search?query=${encodeURIComponent(userSearchQuery)}`);
      
      if (response && response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else if (response && response.status === 401) {
        console.log("401 in searchUsers - auth will handle redirect");
        setSearchResults([]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

   
  const startNewChat = async (user) => {
    
    if (!isLoggedIn) return;

    try {
      const response = await apiClient.post('/chat/conversations/direct', {
        userId: user._id
      });

      if (response && response.ok) {
        const newConversation = await response.json();
        setConversations(prev => {
          const exists = prev.find(c => c._id === newConversation._id);
          if (exists) return prev;
          return [newConversation, ...prev];
        });
        setSelectedConversation(newConversation);
        fetchMessages(newConversation._id);
        setIsNewChatOpen(false);
        setUserSearchQuery("");
        setSearchResults([]);
        
        toast({
          title: "Chat started",
          description: `Started conversation with ${user.name}`,
        });
      } else if (response && response.status === 401) {
        console.log("401 in startNewChat - auth will handle redirect");
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
     
      if (!error.message.includes('Authentication')) {
        toast({
          title: "Error",
          description: "Failed to start conversation",
          variant: "destructive",
        });
      }
    }
  };
  


const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

 
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    toast({
      title: "File too large",
      description: "Maximum file size is 50MB",
      variant: "destructive",
    });
    return;
  }

  try {
    setUploadingFile(true);
    
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', selectedConversation._id);

    console.log('📤 Uploading file to Cloudinary:', file.name);
    
    const response = await apiClient.upload('/chat/upload', formData);

    if (response.ok) {
      const fileData = await response.json();
      
      console.log('File uploaded to Cloudinary:', {
        url: fileData.url,
        name: fileData.filename,
        size: fileData.size
      });

      // Determine message type from file
      let messageType = 'file';
      if (fileData.resourceType === 'image') {
        messageType = 'image';
      } else if (fileData.resourceType === 'video') {
        messageType = 'video';
      }

      console.log('📨 Emitting message via socket:', {
        messageType,
        fileName: fileData.filename,
        url: fileData.url
      });

      
      socket.emit('send_message', {
        conversationId: selectedConversation._id,
        messageType: messageType,
        content: null, 
        fileData: {
          url: fileData.url,          
          name: fileData.filename,    
          size: fileData.size,        
          type: fileData.mimetype     
        }
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "File sent",
        description: `${file.name} shared successfully`,
      });
    } else {
      throw new Error('Upload failed with status ' + response.status);
    }
  } catch (error) {
    console.error(' File upload error:', error);
    toast({
      title: "Upload failed",
      description: error.message || "Failed to upload file",
      variant: "destructive",
    });
  } finally {
    setUploadingFile(false);
  }
};

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      toast({
        title: "Empty message",
        description: "Please type a message",
        variant: "destructive",
      });
      return;
    }

    if (!selectedConversation) {
      toast({
        title: "No conversation",
        description: "Please select a conversation first",
        variant: "destructive",
      });
      return;
    }

    if (!socket || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for connection to establish",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      
      
      const optimisticMessage = {
        _id: `optimistic-${Date.now()}`,
        content: messageInput.trim(),
        sender: {
          _id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        conversationId: selectedConversation._id,
        createdAt: new Date().toISOString(),
        messageType: 'text',
        isOptimistic: true
      };

      
      setMessages(prev => [...prev, optimisticMessage]);
      setMessageInput("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('typing_stop', selectedConversation._id);

      
      socket.emit('send_message', {
        conversationId: selectedConversation._id,
        content: messageInput.trim(),
        messageType: 'text'
      });

    } catch (error) {
      console.error(' Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      
      setMessages(prev => prev.filter(msg => msg.isOptimistic));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation || !isConnected) return;

    socket.emit('typing_start', selectedConversation._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', selectedConversation._id);
    }, 1000);
  };

  
const queueDownload = (url, fileName) => {
  downloadQueueRef.current.push({ url, fileName });
  processDownloadQueue();
};


const processDownloadQueue = async () => {
  if (isDownloadingRef.current || downloadQueueRef.current.length === 0) {
    return;
  }

  isDownloadingRef.current = true;

  const { url, fileName } = downloadQueueRef.current.shift();

  try {
   
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Download failed:', response.status);
      toast({
        title: "Download failed",
        description: "Unable to download file",
        variant: "destructive",
      });
      isDownloadingRef.current = false;
      setTimeout(processDownloadQueue, 500);
      return;
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    console.log('Downloaded:', fileName);

    // Wait 2 seconds before next download
    setTimeout(() => {
      isDownloadingRef.current = false;
      processDownloadQueue();
    }, 2000);
  } catch (error) {
    console.error('Download error:', error);
    toast({
      title: "Download error",
      description: error.message,
      variant: "destructive",
    });
    isDownloadingRef.current = false;
    setTimeout(processDownloadQueue, 500);
  }
};


  const getConversationName = (conversation) => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p._id !== user.id);
      return otherParticipant?.name || 'Unknown User';
    }
    return conversation.name;
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p._id !== user.id);
      return otherParticipant?.avatar;
    }
    return null;
  };


const handleAddMember = async (userId) => {
  try {
    const response = await apiClient.post('/teams/add-member', {
      teamId: currentTeam._id,
      userId: userId
    });

    if (response.ok) {
     
      const conversationsResponse = await apiClient.get('/chat/conversations');
      if (conversationsResponse.ok) {
        const updatedConversations = await conversationsResponse.json();
        // Update your conversations state
        setConversations(updatedConversations);
        console.log('Conversations refreshed after adding member');
      }

      toast({
        title: "Success",
        description: "Member added to team",
      });
    }
  } catch (error) {
    console.error('Error adding member:', error);
    toast({
      title: "Error",
      description: "Failed to add member",
      variant: "destructive",
    });
  }
};

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    return conversation.lastMessage.content;
  };

  const getTypingUsersNames = () => {
    if (typingUsers.size === 0) return null;
    
    const typingUserIds = Array.from(typingUsers);
    const typingParticipants = selectedConversation.participants.filter(
      p => typingUserIds.includes(p._id) && p._id !== user.id
    );
    
    if (typingParticipants.length === 0) return null;
    
    const names = typingParticipants.map(p => p.name).join(', ');
    return `${names} ${typingParticipants.length === 1 ? 'is' : 'are'} typing...`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((conv) =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const directConversations = filteredConversations.filter(conv => conv.type === 'direct');
  const groupConversations = filteredConversations.filter(conv => conv.type !== 'direct');

  if (loading) {
    return (
      <div className="h-screen flex bg-background">
        <div className="w-80 border-r border-border flex items-center justify-center">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Debug component */}
      <SocketDebug />

      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "Online" : "Offline"}
              </Badge>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                    <DialogDescription>
                      Search for users to start a new conversation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search users by name or email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                      />
                      <Button onClick={searchUsers} disabled={searchingUsers || userSearchQuery.length < 2}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {searchingUsers && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground ml-2">Searching...</p>
                      </div>
                    )}
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <p className="text-xs text-muted-foreground">
                          Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => startNewChat(user)}
                            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left flex-1">
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <div className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className="text-xs text-muted-foreground">
                                  {user.isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {userSearchQuery && !searchingUsers && searchResults.length === 0 && (
                      <div className="text-center py-6">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Direct Messages */}
            {directConversations.length > 0 && (
              <>
                <div className="mb-3 px-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Direct Messages
                  </h3>
                </div>
                {directConversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      fetchMessages(conv._id);
                    }}
                    className={`w-full p-3 rounded-lg mb-1 transition-colors text-left hover:bg-accent ${
                      selectedConversation?._id === conv._id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getConversationAvatar(conv)} />
                          <AvatarFallback>
                            {getConversationName(conv)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground truncate">
                            {getConversationName(conv)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {getLastMessagePreview(conv)}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="ml-2 h-5 min-w-5 px-1.5">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Group Chats */}
            {groupConversations.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="mb-3 px-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Group Chats
                  </h3>
                </div>
                {groupConversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      fetchMessages(conv._id);
                    }}
                    className={`w-full p-3 rounded-lg mb-1 transition-colors text-left hover:bg-accent ${
                      selectedConversation?._id === conv._id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {conv.type === 'team' ? (
                          <Users className="h-5 w-5 text-primary" />
                        ) : (
                          <Hash className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground truncate">
                            {getConversationName(conv)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {getLastMessagePreview(conv)}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="ml-2 h-5 min-w-5 px-1.5">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {conversations.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a new chat to begin messaging
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.type === "direct" ? (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={getConversationAvatar(selectedConversation)} />
                    <AvatarFallback>
                      {getConversationName(selectedConversation)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    {selectedConversation.type === 'team' ? (
                      <Users className="h-4 w-4 text-primary" />
                    ) : (
                      <Hash className="h-4 w-4 text-primary" />
                    )}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-foreground">
                    {getConversationName(selectedConversation)}
                  </h2>
                  {selectedConversation.type === "direct" && selectedConversation.isOnline && (
                    <p className="text-xs text-muted-foreground">Online</p>
                  )}
                  {selectedConversation.type === "team" && (
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participants.length} members
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                

{messages.map((message) => (
  <div
    key={message._id}
    className={`flex gap-3 ${
      message.sender._id === user.id ? "flex-row-reverse" : ""
    }`}
  >
    {message.sender._id !== user.id && (
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback>
          {message.sender.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
    )}
    <div
      className={`flex flex-col max-w-md ${
        message.sender._id === user.id ? "items-end" : ""
      }`}
    >
      {message.sender._id !== user.id && (
        <span className="text-xs font-semibold text-foreground mb-1">
          {message.sender.name}
        </span>
      )}

      {/* MESSAGE BUBBLE */}
      <div
        className={`rounded-lg px-4 py-2 ${
          message.sender._id === user.id
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        } ${message.isOptimistic ? "opacity-70" : ""}`}
      >
        {/* TEXT MESSAGE */}
        {(!message.messageType || message.messageType === "text") && (
          <p className="text-sm">{message.content}</p>
        )}

        {/* IMAGE MESSAGE */}
        {message.messageType === "image" && message.fileUrl && (
          <div className="space-y-2">
            <img
              src={message.fileUrl}
              alt={message.fileName || "shared image"}
              className="max-w-xs rounded max-h-96 object-cover cursor-pointer hover:opacity-90"
              onClick={() => window.open(message.fileUrl, "_blank")}
              onError={(e) => {
                console.error("Image failed to load:", message.fileUrl);
                e.target.style.display = "none";
              }}
            />
            {message.content && message.content !== message.fileName && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        )}

        {/* VIDEO MESSAGE */}
        {message.messageType === "video" && message.fileUrl && (
          <div className="space-y-2">
            <video
              controls
              className="max-w-xs rounded max-h-96"
              src={message.fileUrl}
              onError={(e) => {
                console.error("Video failed to load:", message.fileUrl);
              }}
            />
            {message.fileSize && (
              <p className="text-xs text-muted-foreground">
                {(message.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            {message.content && message.content !== message.fileName && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        )}

        {/* FILE MESSAGE (PDF, DOC, etc.) */}
        {message.messageType === "file" && message.fileUrl && (
  <div className="space-y-2">
    <button
      onClick={() => queueDownload(message.fileUrl, message.fileName)}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded hover:bg-white/10"
    >
      <Paperclip className="h-5 w-5 flex-shrink-0" />
      <div className="text-left">
        <p className="text-sm font-medium underline break-words">
          {message.fileName || "Download file"}
        </p>
        {message.fileSize && (
          <p className="text-xs opacity-75">
            {(message.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>
    </button>
  </div>
)}

        {/* FALLBACK - If no rendering matched */}
        {!message.fileUrl && !message.content && (
          <p className="text-sm text-red-500">Message failed to load</p>
        )}
      </div>

      {/* TIMESTAMP */}
      <span className="text-xs text-muted-foreground mt-1">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {message.isOptimistic && " (Sending...)"}
      </span>
    </div>
  </div>
))}

{/* TYPING INDICATOR */}
{getTypingUsersNames() && (
  <div className="flex gap-3">
    <Avatar className="h-8 w-8">
      <AvatarFallback>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
          <div
            className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </AvatarFallback>
    </Avatar>
    <div className="bg-muted rounded-lg px-4 py-2">
      <p className="text-sm text-muted-foreground italic">
        {getTypingUsersNames()}
      </p>
    </div>
  </div>
)}

<div ref={messagesEndRef} />

{messages.length === 0 && (
  <div className="text-center py-12">
    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
      No messages yet
    </h3>
    <p className="text-muted-foreground">
      Start the conversation by sending a message
    </p>
  </div>
)}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-2">
                   <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploadingFile}
                    />
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="mb-1"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                    >
                          <Paperclip className="h-5 w-5" />
                    </Button>
                     {uploadingFile && (
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      )}
                  <div className="flex-1 relative">
                    <Input
                      placeholder={!isConnected ? "Connecting..." : "Type a message..."}
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        if (isConnected && selectedConversation) {
                          handleTyping();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="pr-10 resize-none"
                      disabled={sending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending || !isConnected || !selectedConversation}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2">
                    Connection lost. Reconnecting...
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Welcome to Chat
              </h3>
              <p className="text-muted-foreground mb-4">
                Select a conversation or start a new one to begin messaging
              </p>
              <Button onClick={() => setIsNewChatOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;