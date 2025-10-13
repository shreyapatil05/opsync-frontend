import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../utils/api";


import { ACTION_OPTIONS } from "./ruleData"; 

export function CreateRuleDialog({
  open,
  onOpenChange,
  onCreateSuccess,
  projects,
}) {
  const [formData, setFormData] = useState({
    name: "",
    condition: "", 
    action: "",
    projectId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => setFormData({ name: "", condition: "", action: "", projectId: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    if (!formData.name.trim() || !formData.condition.trim() || !formData.action || !formData.projectId) {
      toast.error("Please fill out all required fields (Name, Project, Condition, Action).");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
     
      const payload = {
        name: formData.name,
        condition: formData.condition, 
        action: formData.action,
        projectId: formData.projectId,
      };

      const response = await apiClient.post("/rules", payload);
      
      if (response && response.ok) {
        const newRule = await response.json();
        onCreateSuccess(newRule); 
        
        toast.success(`Automation rule "${newRule.name}" created!`);
        onOpenChange(false);
        resetForm();
      } else {
       
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create rule: ${response.status}`);
      }
    } catch (error) {
      console.error("Rule creation error:", error);
     
      toast.error(`Creation Failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Create Automation Rule
          </DialogTitle>
          <DialogDescription>
            Define a JavaScript condition and an action to automate your workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
         
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              placeholder="e.g., Overdue Task Notification"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-11"
              required
            />
          </div>

        
          <div className="space-y-2">
            <Label htmlFor="projectId">Apply to Project</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              required
            >
              <SelectTrigger id="projectId" className="h-11">
                <SelectValue placeholder="Select the project this rule monitors" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projects?.length === 0 && <p className="text-sm text-red-500">No projects available. Create one first.</p>}
          </div>

        
          <div className="space-y-2">
            <Label htmlFor="condition-code">Trigger Condition (JavaScript Code) *</Label>
            <Textarea
              id="condition-code"
              rows={3}
              placeholder="e.g., task.status !== 'done' && new Date(task.dueDate) < new Date()"
              value={formData.condition}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              className="font-mono text-sm bg-muted/50 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              The expression must evaluate to true. Available variable: <code>task</code>
            </p>
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select 
              value={formData.action} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
              required
            >
              <SelectTrigger id="action" className="h-11">
                <SelectValue placeholder="Select an action..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary hover:opacity-90"
              disabled={isSubmitting || projects?.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Rule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
