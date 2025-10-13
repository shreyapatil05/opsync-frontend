import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Users, Calendar, X, Loader2 } from "lucide-react";
import { SortableTask } from "@/components/SortableTask"; // Named import
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  
  const { user } = useAuth();
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignee: 'self', // Default to self-assignment
    priority: 'medium',
    dueDate: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [teamMembers, setTeamMembers] = useState([]);
  const [employeesProgress, setEmployeesProgress] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isRemoveEmployeeOpen, setIsRemoveEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  useEffect(() => {
  if (project?.teamId) {
    fetchTeamMembers();
    fetchEmployeesProgress();
  }
}, [project]);
useEffect(() => {
  // Check if current user is Admin - if so, redirect back to projects
  if (user?.role === 'Admin') {
    toast({
      title: "Access Denied",
      description: "Admins cannot view project details. Only team members can access projects.",
      variant: "destructive",
    });
    navigate('/projects');
    return;
  }
  
  if (id) {
    fetchProjectDetails();
    fetchProjectTasks();
  }
}, [id, user?.role]);

const fetchTeamMembers = async () => {
  try {
    const response = await apiClient.get(`/teams/${project.teamId._id || project.teamId}/members`);
    if (response && response.ok) {
      const members = await response.json();
      setTeamMembers(members);
      
      // Auto-assign to self (default behavior)
      setTaskForm(prev => ({ ...prev, assignee: 'self' }));
    }
  } catch (error) {
    console.error('Failed to fetch team members:', error);
  }
};

const fetchEmployeesProgress = async () => {
  try {
    const response = await apiClient.get(`/projects/${id}/all-employees-progress`);
    if (response && response.ok) {
      const progress = await response.json();
      setEmployeesProgress(progress);
    }
  } catch (error) {
    console.error('Failed to fetch employees progress:', error);
  }
};

// 🆕 Fetch all employees for admin to add to project
const fetchAllEmployees = async () => {
  try {
    setLoadingEmployees(true);
    const response = await apiClient.get('/users');
    if (response && response.ok) {
      const employees = await response.json();
      // Filter out employees already assigned to this project
      const assignedIds = project?.assignedMembers?.map(member => member._id) || [];
      const availableEmployees = employees.filter(emp => !assignedIds.includes(emp._id));
      setAllEmployees(availableEmployees);
    }
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  } finally {
    setLoadingEmployees(false);
  }
};

// 🆕 Add employee to project
const addEmployeeToProject = async (employeeId) => {
  try {
    const response = await apiClient.post(`/projects/${id}/employees`, {
      userId: employeeId
    });
    
    if (response && response.ok) {
      const result = await response.json();
      setProject(result.project);
      setIsAddEmployeeOpen(false);
      fetchEmployeesProgress();
      alert('Employee added to project successfully');
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to add employee');
    }
  } catch (error) {
    console.error('Failed to add employee:', error);
    alert('Failed to add employee to project');
  }
};

// 🆕 Remove employee from project
const removeEmployeeFromProject = async (employeeId) => {
  try {
    const response = await apiClient.delete(`/projects/${id}/employees/${employeeId}`);
    
    if (response && response.ok) {
      const result = await response.json();
      setProject(result.project);
      setIsRemoveEmployeeOpen(false);
      setSelectedEmployee(null);
      fetchEmployeesProgress();
      alert('Employee removed from project successfully');
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to remove employee');
    }
  } catch (error) {
    console.error('Failed to remove employee:', error);
    alert('Failed to remove employee from project');
  }
};

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectTasks();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/projects/${id}`);
      
      if (response && response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      } else {
        throw new Error('Failed to fetch project details');
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError("Failed to load project details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await apiClient.get(`/projects/${id}/tasks`);
      
      if (response && response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find((t) => t._id === active.id);
    const overStatus = over.id;

    if (activeTask && activeTask.status !== overStatus) {
      try {
        console.log(`Moving task from ${activeTask.status} to ${overStatus}`);
        
        // Update task status in backend
        const response = await apiClient.put(`/projects/${id}/tasks/${activeTask._id}`, {
          status: overStatus
        });

        if (response && response.ok) {
          // Update local state
          setTasks((tasks) =>
            tasks.map((task) =>
              task._id === active.id ? { ...task, status: overStatus } : task
            )
          );
          
          // Update project progress
          updateProjectProgress();
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to update task: ${errorText}`);
        }
      } catch (error) {
        console.error("Failed to update task:", error);
        alert(`Failed to update task status: ${error.message}`);
      }
    }

    setActiveId(null);
  };

  const updateProjectProgress = async () => {
    try {
      const response = await apiClient.get(`/projects/${id}/tasks`);
      
      if (response && response.ok) {
        const updatedTasks = await response.json();
        const totalTasks = updatedTasks.length;
        const completedTasks = updatedTasks.filter(task => task.status === 'done').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        console.log(`Progress update: ${completedTasks}/${totalTasks} = ${progress}%`);

        // Update project progress in backend
        await apiClient.put(`/projects/${id}`, {
          progress: progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'todo'
        });

        // Update local project state
        setProject(prev => prev ? {
          ...prev,
          progress: progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'todo'
        } : null);
        
        // Refresh employee progress
        fetchEmployeesProgress();
      }
    } catch (error) {
      console.error("Failed to update project progress:", error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      alert('Task title is required');
      return;
    }

    try {
      setCreatingTask(true);
      
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        assignee: taskForm.assignee === 'self' ? user.id : (taskForm.assignee === 'unassigned' ? null : taskForm.assignee),
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null
      };

      console.log("Sending task data:", taskData);

      const response = await apiClient.post(`/projects/${id}/tasks`, taskData);
      
      if (response && response.ok) {
        const newTask = await response.json();
        console.log("Task created successfully:", newTask);
        setTasks(prev => [...prev, newTask]);
        setAddTaskOpen(false);
        resetTaskForm();
        updateProjectProgress();
      } else {
        // Get detailed error from response
        const errorText = await response.text();
        console.error("Server response error:", errorText);
        throw new Error(`Failed to create task: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      alert(`Failed to create task: ${error.message}`);
    } finally {
      setCreatingTask(false);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      assignee: 'self', // Default to self-assignment
      priority: 'medium',
      dueDate: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
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
      case "done":
        return "Done";
      case "in-progress":
        return "In Progress";
      case "todo":
        return "To Do";
      default:
        return status || "Not Started";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-amber-500/10 text-amber-500";
      case "low":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  const navigateToProjectChat = async (project) => {
  try {
    
    const response = await apiClient.post('/chat/conversations', {
      participants: [], 
      type: 'group',
      name: project.name,
      projectId: project._id
    });
    
    if (response && response.ok) {
      const projectConversation = await response.json();
      navigate('/chat', { state: { autoSelectConversationId: projectConversation._id } });
    }
  } catch (error) {
    console.error("Failed to open project chat:", error);
    toast({
      title: "Error",
      description: "Failed to open project chat",
      variant: "destructive",
    });
  }
};

  const activeTask = tasks.find((t) => t._id === activeId);

  const columns = [
    { id: "todo", title: "To Do", color: "border-amber-500" },
    { id: "in-progress", title: "In Progress", color: "border-blue-500" },
    { id: "done", title: "Done", color: "border-green-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-red-500">{error}</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Project not found</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        
        <div className="space-y-4">
          <Link to="/projects">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <Button 
  variant="outline" 
  onClick={() => navigateToProjectChat(project)}
  className="gap-2"
>
  <MessageCircle className="h-4 w-4" />
  Project Chat
</Button>
          
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground">
                {project.description || "No description provided"}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Badge variant="secondary" className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-20 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <span>{project.progress || 0}% Complete</span>
                </div>
                {project.teamId && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {project.teamId.name || 'Team Project'}
                    </span>
                  </div>
                )}
               
                {project.createdBy?._id === user?.id && (
                  <Badge variant="outline" className="text-xs">
                    Creator
                  </Badge>
                )}
                {project.projectManager?._id === user?.id && (
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
                    Manager
                  </Badge>
                )}
                {user?.role === 'Admin' && (
                  <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        
        {employeesProgress.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Team Progress
              </CardTitle>
              <CardDescription>
                Individual progress tracking for team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employeesProgress.map((employee) => (
                  <Card key={employee.user._id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.user.avatar} />
                        <AvatarFallback>
                          {employee.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{employee.user.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{employee.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${employee.progress}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="text-center">
                          <div className="font-medium text-green-600">{employee.completedTasks}</div>
                          <div>Done</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{employee.inProgressTasks}</div>
                          <div>Active</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-amber-600">{employee.todoTasks}</div>
                          <div>Todo</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

       
        {user?.role === 'Admin' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Project Team Management
              </CardTitle>
              <CardDescription>
                Add or remove employees from this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
               
                <div>
                  <h4 className="text-sm font-medium mb-3">Current Team Members</h4>
                  {project?.assignedMembers?.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {project.assignedMembers.map((member) => (
                        <Card key={member._id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedEmployee(member);
                                setIsRemoveEmployeeOpen(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No team members assigned yet</p>
                  )}
                </div>

               
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {project?.assignedMembers?.length || 0} team member{(project?.assignedMembers?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      fetchAllEmployees();
                      setIsAddEmployeeOpen(true);
                    }}
                    disabled={loadingEmployees}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

       
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <Card
                key={column.id}
                className={`border-t-4 ${column.color} animate-fade-in`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{column.title}</CardTitle>
                    <Badge variant="secondary" className="bg-muted">
                      {getTasksByStatus(column.id).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <SortableContext
                    items={getTasksByStatus(column.id).map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                    id={column.id}
                  >
                    <div className="space-y-3 min-h-[400px]">
                      {getTasksByStatus(column.id).map((task) => (
                        <SortableTask 
                          key={task._id} 
                          task={{
                            ...task,
                            id: task._id 
                          }} 
                        />
                      ))}
                      
                      <Dialog open={addTaskOpen} onOpenChange={(isOpen) => {
                        setAddTaskOpen(isOpen);
                        if (!isOpen) resetTaskForm();
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full border-2 border-dashed hover:border-primary hover:bg-primary/5"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                          <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>
                              Add a new task to this project. Click create when you're done.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={createTask}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="title">Task Title *</Label>
                                <Input 
                                  id="title" 
                                  placeholder="Design homepage mockup" 
                                  value={taskForm.title}
                                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  placeholder="Brief description of the task..."
                                  className="resize-none"
                                  rows={3}
                                  value={taskForm.description}
                                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                              </div>
                                <div className="grid gap-2">
                                     <Label htmlFor="assignee">Assign To</Label>
                                     <Select 
                                       value={taskForm.assignee} 
                                       onValueChange={(value) => setTaskForm(prev => ({ ...prev, assignee: value }))}
                                     >
                                       <SelectTrigger>
                                         <SelectValue placeholder="Select assignee" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="self">You (Self-assign)</SelectItem>
                                          <SelectItem value="unassigned">Unassigned</SelectItem>
                                          {teamMembers.map((member) => (
                                              <SelectItem key={member._id} value={member._id}>
                                                  {member.name} {member._id === user.id ? '(You)' : ''}
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                     </Select>
                            </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="status">Status</Label>
                                  <Select 
                                    value={taskForm.status} 
                                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, status: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="todo">To Do</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="priority">Priority</Label>
                                  <Select 
                                    value={taskForm.priority} 
                                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input 
                                  id="dueDate"
                                  type="date"
                                  value={taskForm.dueDate}
                                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setAddTaskOpen(false)}
                                disabled={creatingTask}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                variant="default" 
                                disabled={creatingTask || !taskForm.title.trim()}
                              >
                                {creatingTask ? "Creating..." : "Create Task"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-50">
                <SortableTask task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

       
        <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee to Project</DialogTitle>
              <DialogDescription>
                Select an employee to add to this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading employees...</span>
                </div>
              ) : allEmployees.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allEmployees.map((employee) => (
                    <div
                      key={employee._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => addEmployeeToProject(employee._id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>
                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{employee.role}</p>
                        </div>
                      </div>
                      <Button size="sm">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available employees to add
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

      
        <Dialog open={isRemoveEmployeeOpen} onOpenChange={setIsRemoveEmployeeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Employee from Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedEmployee?.name} from this project? 
                This will also unassign them from any tasks in this project.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRemoveEmployeeOpen(false);
                  setSelectedEmployee(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedEmployee && removeEmployeeFromProject(selectedEmployee._id)}
              >
                Remove Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectDetails;