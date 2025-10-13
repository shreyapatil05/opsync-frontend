import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Loader2, Crown, UserCheck, Search, Filter, SortAsc, Calendar, BarChart3, MoreVertical, Edit, Copy, Archive, Trash2 } from "lucide-react";
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [open, setOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const { projects, projectsLoading, projectsError, addProject, fetchProjects } = useProjects();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectManager: 'none'
  });

  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeamForProject, setSelectedTeamForProject] = useState('none');
  const [selectedAdditionalMembers, setSelectedAdditionalMembers] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  
  // Edit team assignment states
  const [editingProject, setEditingProject] = useState(null);
  const [editTeamId, setEditTeamId] = useState('none');
  const [editAdditionalMembers, setEditAdditionalMembers] = useState([]);
  const [editTeamMembers, setEditTeamMembers] = useState([]);
  const [editAvailableEmployees, setEditAvailableEmployees] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingProjectDetails, setEditingProjectDetails] = useState(null);
  const [updatingProject, setUpdatingProject] = useState(false);
  const [showProjectOptions, setShowProjectOptions] = useState(null);

  // Fetch teams
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch team members when team is selected
  useEffect(() => {
    if (selectedTeamForProject && selectedTeamForProject !== 'none') {
      fetchTeamMembers(selectedTeamForProject);
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeamForProject]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectOptions !== null) {
        const dropdown = event.target.closest('.relative');
        if (!dropdown) {
          setShowProjectOptions(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectOptions]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await apiClient.get('/teams');
      if (response && response.ok) {
        const teamsData = await response.json();
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await apiClient.get(`/teams/${teamId}/members`);
      if (response && response.ok) {
        const members = await response.json();
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setTeamMembers([]);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await apiClient.get('/users');
      if (response && response.ok) {
        const employees = await response.json();
        setAvailableEmployees(employees.filter(emp => emp.role !== 'Admin'));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  // For edit dialog
  const fetchEditDialogData = async (project) => {
    try {
      const response = await apiClient.get('/users');
      if (response && response.ok) {
        const employees = await response.json();
        setEditAvailableEmployees(employees.filter(emp => emp.role !== 'Admin'));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleEditProjectTeam = async (project) => {
    setEditingProject(project);
    setEditTeamId(project.teamId?._id || 'none');
    setEditAdditionalMembers(project.additionalMembers?.map(m => m._id) || []);
    
    if (project.teamId?._id) {
      const response = await apiClient.get(`/teams/${project.teamId._id}/members`);
      if (response && response.ok) {
        const members = await response.json();
        setEditTeamMembers(members);
      }
    }
    
    await fetchEditDialogData(project);
    setIsEditTeamOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingProject(true);
      
      const response = await apiClient.delete(`/projects/${projectToDelete._id}`);
      
      if (response && response.ok) {
        fetchProjects();
        setIsDeleteProjectOpen(false);
        setProjectToDelete(null);
        
        toast({
          title: "Success!",
          description: "Project deleted successfully",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingProject(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProjectDetails({
      ...project,
      name: project.name,
      description: project.description || ''
    });
    setIsEditProjectOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProjectDetails?.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingProject(true);
      
      const response = await apiClient.put(`/projects/${editingProjectDetails._id}`, {
        name: editingProjectDetails.name.trim(),
        description: editingProjectDetails.description.trim()
      });
      
      if (response && response.ok) {
        fetchProjects();
        setIsEditProjectOpen(false);
        setEditingProjectDetails(null);
        
        toast({
          title: "Success!",
          description: "Project updated successfully",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleSaveProjectTeamAssignment = async () => {
    if (!editingProject) return;

    try {
      const response = await apiClient.put(`/projects/${editingProject._id}`, {
        teamId: editTeamId && editTeamId !== 'none' ? editTeamId : null,
        additionalMembers: editAdditionalMembers
      });

      if (response && response.ok) {
        fetchProjects();
        setIsEditTeamOpen(false);
        setEditingProject(null);
        
        toast({
          title: "Success!",
          description: "Project team assignment updated",
        });
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: "Error",
        description: "Failed to update project team assignment",
        variant: "destructive",
      });
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      setCreating(true);
      
      const projectData = {
        name: formData.name,
        description: formData.description,
        teamId: selectedTeamForProject && selectedTeamForProject !== 'none' ? selectedTeamForProject : null,
        projectManager: formData.projectManager && formData.projectManager !== 'none' ? formData.projectManager : null,
        additionalMembers: selectedAdditionalMembers
      };

      const response = await apiClient.post('/projects', projectData);
      
      if (response && response.ok) {
        const newProject = await response.json();
        addProject(newProject);
        setOpen(false);
        resetForm();
        setSelectedAdditionalMembers([]);
        
        toast({
          title: "Success!",
          description: `Project "${newProject.name}" created with ${newProject.assignedMembers?.length || 0} team members`,
        });
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      alert('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      projectManager: 'none'
    });
    setTeamMembers([]);
    setSelectedTeamForProject('none');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "todo":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "todo":
        return "To Do";
      default:
        return status || "Not Started";
    }
  };

  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const filteredProjects = projects.filter(project => {
    let statusMatch = true;
    if (statusFilter !== 'all') {
      statusMatch = project.status === statusFilter;
    }

    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.projectManager?.name?.toLowerCase().includes(query) ||
        project.teamId?.name?.toLowerCase().includes(query);
    }

    return statusMatch && searchMatch;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'progress':
        aValue = calculateProgress(a);
        bValue = calculateProgress(b);
        break;
      case 'status':
        aValue = a.status || 'todo';
        bValue = b.status || 'todo';
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const analytics = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    todo: projects.filter(p => p.status === 'todo').length,
    teamProjects: projects.filter(p => p.teamId).length,
    soloProjects: projects.filter(p => !p.teamId).length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + calculateProgress(p), 0) / projects.length) : 0
  };

  if (projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-xl text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-red-500">{projectsError}</p>
          <Button onClick={fetchProjects}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground">
                {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
          
              {user?.role === 'Admin' && (
                <Dialog open={open} onOpenChange={(isOpen) => {
                  setOpen(isOpen);
                  if (isOpen) {
                    fetchAllEmployees();
                  }
                  if (!isOpen) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-5 w-5" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Create a project and assign a team to it. You can also add individual employees beyond the team.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createProject}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Project Name *</Label>
                          <Input 
                            id="name" 
                            placeholder="Website Redesign" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of the project..."
                            className="resize-none"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="team">Assign Team (Optional)</Label>
                          <Select 
                            value={selectedTeamForProject} 
                            onValueChange={setSelectedTeamForProject}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team to assign" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Team (Solo Project)</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team._id} value={team._id}>
                                  {team.name} ({team.members?.length + 1 || 1} members)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {teamMembers.length > 0 && (
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Team Members ({teamMembers.length}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {teamMembers.map((member) => (
                                  <Badge key={member._id} variant="secondary" className="text-xs">
                                    {member.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {teamMembers.length > 0 && (
                          <div className="grid gap-2">
                            <Label>Add Individual Employees (Beyond Team)</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Click to add more employees" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableEmployees
                                  .filter(emp => !teamMembers.some(tm => tm._id === emp._id))
                                  .filter(emp => !selectedAdditionalMembers.includes(emp._id))
                                  .map((employee) => (
                                    <SelectItem 
                                      key={employee._id} 
                                      value={employee._id}
                                      onSelect={() => setSelectedAdditionalMembers(prev => [...prev, employee._id])}
                                    >
                                      {employee.name} ({employee.email})
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            
                            {selectedAdditionalMembers.length > 0 && (
                              <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Added Employees:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedAdditionalMembers.map((memberId) => {
                                    const employee = availableEmployees.find(e => e._id === memberId);
                                    return (
                                      <div key={memberId} className="flex items-center gap-1 bg-background px-2 py-1 rounded text-xs">
                                        <span>{employee?.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedAdditionalMembers(prev => prev.filter(id => id !== memberId))}
                                          className="text-muted-foreground hover:text-foreground"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedTeamForProject && (
                          <div className="grid gap-2">
                            <Label htmlFor="projectManager">Project Manager (Optional)</Label>
                            <Select 
                              value={formData.projectManager} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, projectManager: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select project manager" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Project Manager</SelectItem>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member._id} value={member._id}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setOpen(false)}
                          disabled={creating}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={creating || !formData.name.trim()}
                        >
                          {creating ? "Creating..." : "Create Project"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Analytics Dashboard */}
          {showAnalytics && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{analytics.inProgress}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{analytics.todo}</div>
                    <div className="text-xs text-muted-foreground">To Do</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.teamProjects}</div>
                    <div className="text-xs text-muted-foreground">Team Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{analytics.soloProjects}</div>
                    <div className="text-xs text-muted-foreground">Solo Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{analytics.avgProgress}%</div>
                    <div className="text-xs text-muted-foreground">Avg Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first project
              </p>
              {user?.role === 'Admin' && (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(project);
              const isAdmin = user?.role === 'Admin';
              
              return (
                <div key={project._id}>
                  {isAdmin ? (
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border-2 animate-fade-in relative group">
                      {/* Three-dot menu - Only for Admin */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setShowProjectOptions(showProjectOptions === project._id ? null : project._id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          
                          {showProjectOptions === project._id && (
                            <div className="absolute top-8 right-0 bg-background border border-border rounded-md shadow-lg z-20 min-w-[160px]">
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors rounded-t-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEditProject(project);
                                  setShowProjectOptions(null);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Edit Project
                              </button>
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEditProjectTeam(project);
                                  setShowProjectOptions(null);
                                }}
                              >
                                <Users className="h-4 w-4" />
                                Manage Team
                              </button>
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setProjectToDelete(project);
                                  setIsDeleteProjectOpen(true);
                                  setShowProjectOptions(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded w-fit">
                              Admin Management
                            </div>
                          </div>
                          <Badge variant="secondary" className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {project.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {project.projectManager && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span>Manager: {project.projectManager.name}</span>
                          </div>
                        )}
                        
                        {project.teamId && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>Team: {project.teamId.name}</span>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{project.tasks?.length || 0} tasks</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <UserCheck className="h-4 w-4" />
                                <span>{project.assignedMembers?.length || 0} members</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProjectTeam(project);
                            }}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Manage Team
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Link to={`/projects/${project._id}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer animate-fade-in">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                            <Badge variant="secondary" className={getStatusColor(project.status)}>
                              {getStatusLabel(project.status)}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {project.description || "No description provided"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {project.projectManager && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Crown className="h-4 w-4 text-yellow-500" />
                              <span>Manager: {project.projectManager.name}</span>
                            </div>
                          )}
                          
                          {project.teamId && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span>Team: {project.teamId.name}</span>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{project.tasks?.length || 0} tasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserCheck className="h-4 w-4" />
                                  <span>{project.assignedMembers?.length || 0} members</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Project Team Dialog */}
        <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Manage Project Team Assignment</DialogTitle>
              <DialogDescription>
                Update the team and members assigned to "{editingProject?.name}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="bg-muted/50 p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">{editingProject?.name}</p>
                  <p className="text-xs text-muted-foreground">{editingProject?.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Current Members: {editingProject?.assignedMembers?.length || 0}</span>
                  </div>
                </div>
              </Card>

              <div className="grid gap-2">
                <Label>Assigned Team</Label>
                <Select 
                  value={editTeamId} 
                  onValueChange={(value) => {
                    setEditTeamId(value);
                    if (value && value !== 'none') {
                      apiClient.get(`/teams/${value}/members`).then(res => {
                        if (res.ok) res.json().then(members => setEditTeamMembers(members));
                      });
                    } else {
                      setEditTeamMembers([]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name} ({team.members?.length + 1 || 1} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editTeamMembers.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Team Members ({editTeamMembers.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editTeamMembers.map((member) => (
                      <Badge 
                        key={member._id} 
                        variant="secondary" 
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      >
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {editTeamMembers.length > 0 && (
                <div className="grid gap-2">
                  <Label>Add Individual Employees (Beyond Team)</Label>
                  <div className="space-y-2">
                    {editAvailableEmployees
                      .filter(emp => !editTeamMembers.some(tm => tm._id === emp._id))
                      .filter(emp => !editAdditionalMembers.includes(emp._id))
                      .map((employee) => (
                        <div
                          key={employee._id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => setEditAdditionalMembers(prev => [...prev, employee._id])}
                        >
                          <div>
                            <p className="text-sm font-medium">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    
                    {editAvailableEmployees.filter(emp => !editTeamMembers.some(tm => tm._id === emp._id)).filter(emp => !editAdditionalMembers.includes(emp._id)).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        All available employees are already assigned
                      </p>
                    )}
                  </div>
                </div>
              )}

              {editAdditionalMembers.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-2">
                    Added Employees ({editAdditionalMembers.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editAdditionalMembers.map((memberId) => {
                      const employee = editAvailableEmployees.find(e => e._id === memberId);
                      return (
                        <div 
                          key={memberId} 
                          className="flex items-center gap-1 bg-background px-2 py-1 rounded text-xs border border-green-200 dark:border-green-800"
                        >
                          <span>{employee?.name}</span>
                          <button
                            onClick={() => setEditAdditionalMembers(prev => prev.filter(id => id !== memberId))}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Card className="bg-muted/50 p-3">
                <p className="text-sm font-medium mb-2">Summary</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Team Members: {editTeamMembers.length}</p>
                  <p>Additional Members: {editAdditionalMembers.length}</p>
                  <p className="font-medium text-foreground">
                    Total: {editTeamMembers.length + editAdditionalMembers.length} members
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEditTeamOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProjectTeamAssignment}
              >
                Save Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone and all project data including tasks will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteProjectOpen(false);
                  setProjectToDelete(null);
                }}
                disabled={deletingProject}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={deletingProject}
              >
                {deletingProject ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-project-name">Project Name *</Label>
                <Input 
                  id="edit-project-name" 
                  placeholder="Project name" 
                  value={editingProjectDetails?.name || ''}
                  onChange={(e) => setEditingProjectDetails(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-project-description">Description</Label>
                <Textarea
                  id="edit-project-description"
                  placeholder="Project description..."
                  className="resize-none"
                  rows={3}
                  value={editingProjectDetails?.description || ''}
                  onChange={(e) => setEditingProjectDetails(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditProjectOpen(false);
                    setEditingProjectDetails(null);
                  }}
                  disabled={updatingProject}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProject}
                  disabled={updatingProject || !editingProjectDetails?.name?.trim()}
                >
                  {updatingProject ? "Updating..." : "Update Project"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Projects;