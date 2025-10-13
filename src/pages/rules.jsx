
import { useState, useEffect } from "react";
import { Plus, Loader2, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { useProjects } from "../contexts/ProjectContext";
import { RuleCard } from "@/components/automation/RuleCard";
import { CreateRuleDialog } from "@/components/automation/CreateRuleDialog";

const Rules = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, projectsLoading } = useProjects();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 ADMIN CHECK - Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/projects');
      toast({
        title: "Access Denied",
        description: "Only administrators can access automation rules.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchRules();
    }
  }, [user]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/rules');
      if (response && response.ok) {
        const data = await response.json();
        setRules(data);
      } else {
        throw new Error("Failed to fetch rules");
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
      toast({
        title: "Error",
        description: "Failed to load rules. Make sure you're an admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id) => {
    const ruleToToggle = rules.find(r => r._id === id);
    if (!ruleToToggle) return;
    
    const newActiveState = !ruleToToggle.isActive;
    setRules(rules.map(rule => 
      rule._id === id ? { ...rule, isActive: newActiveState } : rule
    ));
    
    try {
      await apiClient.put(`/rules/${id}`, { isActive: newActiveState });
      toast({ 
        title: "Success", 
        description: `Rule ${newActiveState ? 'activated' : 'deactivated'}.` 
      });
    } catch (error) {
      // Revert on error
      setRules(rules.map(rule => 
        rule._id === id ? { ...rule, isActive: !newActiveState } : rule
      ));
      toast({ 
        title: "Error", 
        description: "Failed to toggle rule state.", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    
    try {
      await apiClient.delete(`/rules/${id}`);
      setRules(rules.filter(rule => rule._id !== id));
      toast({ 
        title: "Success", 
        description: "Rule deleted successfully." 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete rule.", 
        variant: "destructive" 
      });
    }
  };

  const handleCreateRuleSuccess = () => {
    fetchRules();
    setIsCreateDialogOpen(false);
  };
  
  // 🆕 Show loading while checking admin status
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // 🆕 Show admin-only message if not admin
  if (user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardContent className="pt-12">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin Only</h2>
            <p className="text-muted-foreground mb-6">
              Only administrators can create and manage automation rules.
            </p>
            <Button onClick={() => navigate('/projects')} className="w-full">
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xl">Loading automation rules...</span>
        </div>
      </div>
    );
  }

  const getProjectName = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Rule Automation
              </h1>
              <p className="text-muted-foreground text-lg">
                Automate your workflow with intelligent rules
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Rule
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-1">Total Rules</div>
            <div className="text-3xl font-bold">{rules.length}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-1">Active Rules</div>
            <div className="text-3xl font-bold text-green-600">
              {rules.filter(r => r.isActive).length}
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-1">Projects Monitored</div>
            <div className="text-3xl font-bold">
              {new Set(rules.map(r => r.projectId?._id || r.projectId)).size}
            </div>
          </div>
        </div>

        {/* Rules Grid */}
        {rules.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rules.map((rule) => (
              <RuleCard
                key={rule._id}
                rule={{
                  ...rule,
                  id: rule._id,
                  projectName: getProjectName(rule.projectId?._id || rule.projectId),
                }}
                onToggle={handleToggleRule}
                onDelete={handleDeleteRule}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              No automation rules yet. Start streamlining your workflow!
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Rule
            </Button>
          </div>
        )}
      </div>

      <CreateRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateSuccess={handleCreateRuleSuccess}
        projects={projects}
      />
    </div>
  );
};

export default Rules;