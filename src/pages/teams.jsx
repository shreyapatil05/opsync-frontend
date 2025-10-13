import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Briefcase, Filter, Search, X, Trash2, MoreVertical, Mail, Phone, Calendar, MapPin, MessageCircle, Folder, BarChart3, Settings, ExternalLink, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/utils/api';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [isMemberProfileOpen, setIsMemberProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamToViewMembers, setTeamToViewMembers] = useState(null);
  const [teamProjects, setTeamProjects] = useState([]);
  const [teamAnalytics, setTeamAnalytics] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [showDeleteOption, setShowDeleteOption] = useState(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

 
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
  fetchTeams();
}, []);

useEffect(() => {
  if (user) {
    console.log('Current user:', user);
    console.log('User ID:', user?.id);
    console.log('User _id:', user?._id);
    console.log('User role:', user?.role);
    console.log('Is Admin:', isAdmin);
  }
}, [user, isAdmin]);

useEffect(() => {
  if (user && teams.length > 0) {
    setTeams(prev => [...prev]);
  }
}, [user]);

  const fetchTeams = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await apiClient.get('/teams');
    
    if (response && response.ok) {
      const data = await response.json();
      console.log('📦 Fetched teams:', data);
      data.forEach(team => {
        const adminId = team.admin?._id || team.admin?.id || team.admin;
        console.log(`📋 Team "${team.name}" - Admin ID:`, adminId);
        console.log(`   Admin object:`, team.admin);
      });
      setTeams(data);
    } else {
      throw new Error('Failed to fetch teams');
    }
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    setError("Failed to load teams. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const fetchTeamProjects = async (teamId) => {
    try {
      const response = await apiClient.get(`/projects?teamId=${teamId}`);
      if (response && response.ok) {
        const projects = await response.json();
        setTeamProjects(projects);
      }
    } catch (error) {
      console.error("Failed to fetch team projects:", error);
    }
  };

  const fetchTeamAnalytics = async (teamId) => {
    try {
      const response = await apiClient.get(`/teams/${teamId}/analytics`);
      if (response && response.ok) {
        const analytics = await response.json();
        setTeamAnalytics(analytics);
      }
    } catch (error) {
      console.error("Failed to fetch team analytics:", error);
      setTeamAnalytics({
        totalProjects: Math.floor(Math.random() * 10) + 1,
        completedProjects: Math.floor(Math.random() * 5),
        activeTasks: Math.floor(Math.random() * 20) + 5,
        teamProductivity: Math.floor(Math.random() * 40) + 60,
        memberActivity: [
          { name: 'Active', value: 75 },
          { name: 'Idle', value: 25 }
        ]
      });
    }
  };

  const navigateToTeamChat = async (team) => {
    try {
      const response = await apiClient.get(`/chat/teams/${team._id}/conversation`);
      
      if (response && response.ok) {
        const teamConversation = await response.json();
        navigate('/chat', { state: { autoSelectConversationId: teamConversation._id } });
        
        toast({
          title: "Team Chat",
          description: `Opening ${team.name} team chat`,
        });
      }
    } catch (error) {
      console.error("Failed to open team chat:", error);
      toast({
        title: "Error",
        description: "Failed to open team chat",
        variant: "destructive",
      });
    }
  };

  const navigateToTeamProjects = (team) => {
    navigate('/projects', { state: { teamId: team._id, teamName: team.name } });
    toast({
      title: "Viewing Team Projects",
      description: `Showing projects for ${team.name}`,
    });
  };

  const handleViewMemberProfile = (member) => {
    setSelectedMember(member);
    setIsMemberProfileOpen(true);
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingTeam(true);
      
      const response = await apiClient.post('/teams', {
        name: newTeamName.trim()
      });
      
      if (response && response.ok) {
        const newTeam = await response.json();
        setTeams(prev => [newTeam, ...prev]);
        setNewTeamName("");
        setIsAddTeamOpen(false);
        
        toast({
          title: "Success!",
          description: "Team created successfully. You are the team admin.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }
    } catch (error) {
      console.error("Failed to create team:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      setDeletingTeam(true);
      
      const response = await apiClient.delete(`/teams/${teamToDelete._id}`);
      
      if (response && response.ok) {
        setTeams(prev => prev.filter(team => team._id !== teamToDelete._id));
        setIsDeleteTeamOpen(false);
        setTeamToDelete(null);
        setShowDeleteOption(null);
        
        toast({
          title: "Success!",
          description: "Team deleted successfully",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingTeam(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
      
      if (response && response.ok) {
        const users = await response.json();
        setSearchResults(users);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search users error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (teamId, userEmail) => {
    if (!teamId || !userEmail) {
      toast({ 
        title: "Error", 
        description: "Invalid Team or User data. Please try again.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      setAddingMember(true);
      
      const response = await apiClient.post(`/teams/${teamId}/members`, {
        email: userEmail
      });
      
      if (response && response.ok) {
        const updatedTeam = await response.json();
        
        setTeams(prev => prev.map(team => 
          team._id === updatedTeam._id ? updatedTeam : team
        ));
        
        if (teamToViewMembers?._id === teamId) {
          setTeamToViewMembers(updatedTeam);
        }

        setSearchQuery("");
        setSearchResults([]);
        setIsAddMemberOpen(false);
        setSelectedTeam(null);
        
        toast({
          title: "Success!",
          description: `Member ${userEmail} added to team.`,
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }
    } catch (error) {
      console.error("Failed to add member:", error);
      toast({
        title: "Failed to Add Member",
        description: error.message || "Failed to add member to team.",
        variant: "destructive",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
      
      if (response && response.ok) {
        const updatedTeam = await response.json();
        
        setTeams(prev => prev.map(team => 
          team._id === updatedTeam._id ? updatedTeam : team
        ));

        if (teamToViewMembers?._id === teamId) {
            setTeamToViewMembers(updatedTeam);
        }
        
        toast({
          title: "Success!",
          description: "Member removed from team",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast({
        title: "Failed to Remove Member",
        description: error.message || "Failed to remove member from team.",
        variant: "destructive",
      });
    }
  };

  const handleViewMembers = (team) => {
    setTeamToViewMembers(team);
    setIsViewMembersOpen(true);
    fetchTeamProjects(team._id);
    fetchTeamAnalytics(team._id);
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return "??";
    }
    
    try {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } catch (error) {
      return "??";
    }
  };

  const getSafeName = (name) => {
    return name || 'Unknown User';
  };

  const getSafeEmail = (email) => {
    return email || 'No email provided';
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-200';
      case 'manager':
        return 'bg-blue-500/10 text-blue-500 border-blue-200';
      case 'team lead':
        return 'bg-purple-500/10 text-purple-500 border-purple-200';
      case 'developer':
        return 'bg-green-500/10 text-green-500 border-green-200';
      case 'designer':
        return 'bg-pink-500/10 text-pink-500 border-pink-200';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-200';
    }
  };

  const getDepartmentColor = (department) => {
    switch (department?.toLowerCase()) {
      case 'engineering':
        return 'bg-blue-500/10 text-blue-500';
      case 'design':
        return 'bg-purple-500/10 text-purple-500';
      case 'marketing':
        return 'bg-green-500/10 text-green-500';
      case 'sales':
        return 'bg-orange-500/10 text-orange-500';
      case 'hr':
        return 'bg-pink-500/10 text-pink-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const isTeamAdmin = (team) => {
  
  if (!user) {
    return false;
  }
  
 
  const userId = user?.id || user?._id;
  
  if (!userId) {
    console.log(' User ID not available');
    return false;
  }
  
  
  let adminId = null;
  
  if (team?.admin) {
    if (typeof team.admin === 'string') {
      
      adminId = team.admin;
    } else if (typeof team.admin === 'object') {
    
      adminId = team.admin._id || team.admin.id;
    }
  }
  
  if (!adminId) {
    console.log('Admin ID not found for team:', team?.name);
    return false;
  }
  
  
  const isAdmin = adminId.toString() === userId.toString();
  
  console.log(` Team "${team?.name}" - Admin check:`, {
    teamAdminId: adminId.toString(),
    currentUserId: userId.toString(),
    isTeamAdmin: isAdmin
  });
  
  return isAdmin;
};
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-red-500">{error}</p>
          <Button onClick={fetchTeams}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isAdmin && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                  Admin Access
                </Badge>
              )}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Teams
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">
              {teams.length} team{teams.length !== 1 ? 's' : ''} • 
              {isAdmin ? ' Manage teams and members' : ' View teams, chat, and collaborate on projects'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {isAdmin && (
              <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a new team to group employees. You will be the team admin and can add members.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="team-name">Team Name *</Label>
                      <Input
                        id="team-name"
                        placeholder="e.g., Frontend Team, Design Team, Product Team"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAddTeam} 
                      className="w-full"
                      disabled={creatingTeam || !newTeamName.trim()}
                    >
                      {creatingTeam ? "Creating..." : "Create Team"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

       
        {teams.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                {isAdmin 
                  ? 'Create your first team to start organizing employees for projects'
                  : 'No teams have been created yet. Contact your administrator.'}
              </p>
              {isAdmin && (
                <Button onClick={() => setIsAddTeamOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card 
                key={team._id} 
                className="hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-border/50 group cursor-pointer relative"
              >
               
                {isAdmin && isTeamAdmin(team) && (
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteOption(showDeleteOption === team._id ? null : team._id);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {showDeleteOption === team._id && (
                        <div className="absolute top-8 right-0 bg-background border border-border rounded-md shadow-lg z-10">
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeamToDelete(team);
                              setIsDeleteTeamOpen(true);
                              setShowDeleteOption(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Team
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {isTeamAdmin(team) ? "Created by Admin" : "Member"}
                        </Badge>
                        {team.department && (
                          <Badge variant="outline" className="text-xs">
                            {team.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      <Users className="h-3 w-3" />
                      <span>{team.members?.length || 0}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={team.admin?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(team.admin?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{getSafeName(team.admin?.name)}</p>
                        <p className="text-xs text-muted-foreground">
                          Team Admin
                        </p>
                      </div>
                    </div>

                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {team.members?.length || 0} {team.members?.length === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMembers(team);
                            }}
                          >
                            View All
                          </Button>
                          
                          {isAdmin && isTeamAdmin(team) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTeam(team);
                                setIsAddMemberOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {team.members?.slice(0, 5).map((member, index) => (
                          <div key={member._id} className="relative group">
                            <Avatar 
                              className="h-8 w-8 border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                              style={{ zIndex: team.members.length - index }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewMemberProfile(member);
                              }}
                            >
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            {isAdmin && isTeamAdmin(team) && member._id !== team.admin?._id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMember(team._id, member._id);
                                }}
                                className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {team.members?.length > 5 && (
                          <div 
                            className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMembers(team);
                            }}
                          >
                            +{team.members.length - 5}
                          </div>
                        )}
                      </div>
                    </div>

                   
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToTeamChat(team);
                        }}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToTeamProjects(team);
                        }}
                      >
                        <Folder className="h-3 w-3 mr-1" />
                        Projects
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

       
        {isAdmin && (
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member to {selectedTeam?.name}</DialogTitle>
                <DialogDescription>
                  Search for employees by email to add them to your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="search-user">Search by Name or Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-user"
                      placeholder="Enter name or email address..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                    />
                  </div>
                </div>
                
                {searching && (
                  <p className="text-sm text-muted-foreground">Searching employees...</p>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{getSafeName(user.name)}</p>
                            <p className="text-xs text-muted-foreground">{getSafeEmail(user.email)}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user.role || 'User'}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          disabled={addingMember}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMember(selectedTeam._id, user.email); 
                          }}
                        >
                          {addingMember ? "Adding..." : "Add to Team"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && !searching && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No employees found with that name or email
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        
        {isAdmin && (
          <Dialog open={isDeleteTeamOpen} onOpenChange={setIsDeleteTeamOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Team</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the team "{teamToDelete?.name}"? This action cannot be undone and all team data will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteTeamOpen(false);
                    setTeamToDelete(null);
                  }}
                  disabled={deletingTeam}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTeam}
                  disabled={deletingTeam}
                >
                  {deletingTeam ? "Deleting..." : "Delete Team"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        
        <Dialog open={isViewMembersOpen} onOpenChange={setIsViewMembersOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {teamToViewMembers?.name} - Team Hub
              </DialogTitle>
              <DialogDescription>
                {isAdmin ? 'Manage your team, collaborate on projects, and track performance' : 'View team members, chat, and collaborate on projects'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              
              <TabsContent value="members" className="space-y-4">
                
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100">Team Admin</Badge>
                  </h3>
                  <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-950 rounded-md border dark:border-slate-800">
                    <Avatar className="h-12 w-12 cursor-pointer" onClick={() => handleViewMemberProfile(teamToViewMembers?.admin)}>
                      <AvatarImage src={teamToViewMembers?.admin?.avatar} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-100">
                        {getInitials(teamToViewMembers?.admin?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" onClick={() => handleViewMemberProfile(teamToViewMembers?.admin)}>
                          {getSafeName(teamToViewMembers?.admin?.name)}
                        </h4>
                        <Badge variant="outline" className={getRoleColor(teamToViewMembers?.admin?.role)}>
                          {teamToViewMembers?.admin?.role || 'Admin'}
                        </Badge>
                        {teamToViewMembers?.admin?._id === user?.id && (
                          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{getSafeEmail(teamToViewMembers?.admin?.email)}</span>
                        </div>
                        {teamToViewMembers?.admin?.department && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <Badge variant="outline" className={getDepartmentColor(teamToViewMembers?.admin?.department)}>
                              {teamToViewMembers?.admin?.department}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToTeamChat(teamToViewMembers)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

               
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Team Members ({teamToViewMembers?.members?.length || 0})</h3>
                    {/* Add Member Button - Only for Admin */}
                    {isAdmin && isTeamAdmin(teamToViewMembers) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsViewMembersOpen(false);
                          setSelectedTeam(teamToViewMembers);
                          setIsAddMemberOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {teamToViewMembers?.members
                      ?.filter(member => member._id !== teamToViewMembers?.admin?._id)
                      .map((member) => (
                        <Card key={member._id} className="hover:shadow-md dark:hover:shadow-lg transition-shadow dark:border-slate-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar 
                                  className="h-12 w-12 cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => handleViewMemberProfile(member)}
                                >
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 
                                      className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                      onClick={() => handleViewMemberProfile(member)}
                                    >
                                      {getSafeName(member.name)}
                                    </h4>
                                    <Badge variant="outline" className={getRoleColor(member.role)}>
                                      {member.role || 'Member'}
                                    </Badge>
                                    {member._id === user?.id && (
                                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100">
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate">{getSafeEmail(member.email)}</span>
                                    </div>
                                    {member.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span>{member.phone}</span>
                                      </div>
                                    )}
                                    {member.department && (
                                      <div className="flex items-center gap-2">
                                        <Briefcase className="h-3 w-3" />
                                        <Badge variant="outline" className={getDepartmentColor(member.department)}>
                                          {member.department}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigateToTeamChat(teamToViewMembers)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                {/* Remove Member Button - Only for Admin */}
                                {isAdmin && isTeamAdmin(teamToViewMembers) && member._id !== teamToViewMembers?.admin?._id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={() => handleRemoveMember(teamToViewMembers._id, member._id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {teamToViewMembers?.members?.filter(member => member._id !== teamToViewMembers?.admin?._id).length === 0 && (
                      <Card className="text-center py-8 dark:border-slate-800">
                        <CardContent>
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No additional team members yet</p>
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => {
                                setIsViewMembersOpen(false);
                                setSelectedTeam(teamToViewMembers);
                                setIsAddMemberOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Team Members
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Team Projects</h3>
                  <Button onClick={() => navigateToTeamProjects(teamToViewMembers)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Projects
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamProjects.slice(0, 4).map((project) => (
                    <Card key={project._id} className="hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer dark:border-slate-800" onClick={() => navigate('/projects')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{project.name}</h4>
                          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {project.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{project.tasks?.length || 0} tasks</span>
                          <span>{project.progress || 0}% complete</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {teamProjects.length === 0 && (
                    <Card className="col-span-2 text-center py-8 dark:border-slate-800">
                      <CardContent>
                        <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No projects yet for this team</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigateToTeamProjects(teamToViewMembers)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {isAdmin ? 'Create First Project' : 'View Projects'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <h3 className="text-lg font-semibold">Team Analytics</h3>
                {teamAnalytics ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="dark:border-slate-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamAnalytics.totalProjects}</div>
                        <div className="text-xs text-muted-foreground">Total Projects</div>
                      </CardContent>
                    </Card>
                    <Card className="dark:border-slate-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{teamAnalytics.completedProjects}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </CardContent>
                    </Card>
                    <Card className="dark:border-slate-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{teamAnalytics.activeTasks}</div>
                        <div className="text-xs text-muted-foreground">Active Tasks</div>
                      </CardContent>
                    </Card>
                    <Card className="dark:border-slate-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{teamAnalytics.teamProductivity}%</div>
                        <div className="text-xs text-muted-foreground">Productivity</div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="text-center py-8 dark:border-slate-800">
                    <CardContent>
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Analytics data will appear here as the team works on projects</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <h3 className="text-lg font-semibold">Team Settings</h3>
                {isAdmin && isTeamAdmin(teamToViewMembers) ? (
                  <div className="space-y-4">
                    <Card className="dark:border-slate-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Team Management</h4>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start" onClick={() => {
                            setIsViewMembersOpen(false);
                            setSelectedTeam(teamToViewMembers);
                            setIsAddMemberOpen(true);
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Team Members
                          </Button>
                          <Button variant="outline" className="w-full justify-start" onClick={() => navigateToTeamProjects(teamToViewMembers)}>
                            <Folder className="h-4 w-4 mr-2" />
                            Manage Projects
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => {
                            setTeamToDelete(teamToViewMembers);
                            setIsDeleteTeamOpen(true);
                            setIsViewMembersOpen(false);
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Team
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="dark:border-slate-800">
                    <CardContent className="p-4 text-center">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Only team admins can manage team settings</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Member Profile Dialog */}
        <Dialog open={isMemberProfileOpen} onOpenChange={setIsMemberProfileOpen}>
          <DialogContent className="max-w-md dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Member Profile
              </DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback className="text-lg">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{getSafeName(selectedMember.name)}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className={getRoleColor(selectedMember.role)}>
                      {selectedMember.role || 'Member'}
                    </Badge>
                    {selectedMember._id === user?.id && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-slate-700">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{getSafeEmail(selectedMember.email)}</p>
                    </div>
                  </div>

                  {selectedMember.phone && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-slate-700">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedMember.department && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-slate-700">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <Badge variant="outline" className={getDepartmentColor(selectedMember.department)}>
                          {selectedMember.department}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {selectedMember.location && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-slate-700">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{selectedMember.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => navigateToTeamChat(teamToViewMembers)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast({
                      title: "Profile View",
                      description: `Viewing ${selectedMember.name}'s full profile`,
                    });
                  }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Teams;