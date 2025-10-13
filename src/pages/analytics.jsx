import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import apiClient from '../utils/api';
import { useToast } from "@/hooks/use-toast";
import { KPICard } from "@/components/analytics/KPICard";
import { FilterBar } from "@/components/analytics/FilterBar";
import { TaskCompletionStatusChart } from "@/components/analytics/TaskCompletionStatusChart";
import { CompletionTrendChart } from "@/components/analytics/CompletionTrendChart";
import { ProjectProgressChart } from "@/components/analytics/ProjectProgressChart";
import { OverdueTasksCard } from "@/components/analytics/OverdueTasksCard";

const Analytics = () => {
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined },
    project: "all",
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjectsForEmployee();
  }, []);

  // Fetch analytics whenever filters change
  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchProjectsForEmployee = async () => {
    try {
      const response = await apiClient.get('/analytics/projects');
      if (response.ok) {
        const projectsData = await response.json();
        console.log('Projects loaded:', projectsData);
        setProjects(projectsData || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.dateRange.from) {
        params.append('dateFrom', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        params.append('dateTo', filters.dateRange.to.toISOString());
      }
      if (filters.project && filters.project !== 'all') {
        params.append('projectId', filters.project);
      }

      console.log('Fetching analytics with params:', params.toString());

      const response = await apiClient.get(`/analytics/employee?${params.toString()}`);

      if (response.ok) {
        const analyticsData = await response.json();
        console.log('Analytics data:', analyticsData);
        setData(analyticsData);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load your analytics",
        variant: "destructive",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-hero p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg text-muted-foreground">Loading your analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Performance
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your productivity and task completion
          </p>
        </div>

        {/* Debug Info */}
        {projects.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-600">
              No projects found. Make sure you have tasks assigned to you in your projects.
            </p>
          </div>
        )}

        {/* Filter Bar */}
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange}
          projects={projects}
          isLoading={loading}
          isEmployee={true}
        />

        {data && data.summary.totalTasks > 0 ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Tasks Completed"
                value={data.kpis.completedTasks}
                change={`${data.kpis.completionRate}% completion rate`}
                trend="up"
                icon={CheckCircle2}
                iconColor="text-success"
                iconBg="bg-success/10"
              />
              <KPICard
                title="In Progress"
                value={data.kpis.inProgressTasks}
                change={`${data.kpis.todoTasks} to do`}
                trend={data.kpis.inProgressTasks > 0 ? "up" : "down"}
                icon={TrendingUp}
                iconColor="text-primary"
                iconBg="bg-primary/10"
              />
              <KPICard
                title="Overdue Tasks"
                value={data.kpis.overdueTasks}
                change={data.kpis.overdueTasks > 0 ? "Requires attention" : "All on track"}
                trend={data.kpis.overdueTasks > 0 ? "up" : "down"}
                icon={AlertCircle}
                iconColor={data.kpis.overdueTasks > 0 ? "text-warning" : "text-success"}
                iconBg={data.kpis.overdueTasks > 0 ? "bg-warning/10" : "bg-success/10"}
              />
              <KPICard
                title="Avg Completion Time"
                value={`${data.kpis.avgCompletionTime} days`}
                change="Per task"
                trend="down"
                icon={Clock}
                iconColor="text-info"
                iconBg="bg-info/10"
              />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TaskCompletionStatusChart data={data.taskCompletionByStatus} />
              <CompletionTrendChart data={data.completionTrend} />
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectProgressChart data={data.projectProgress} />
              <OverdueTasksCard data={data.overdueByProject} />
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground text-lg">
              {projects.length === 0 
                ? "No projects found with your tasks assigned" 
                : "No tasks assigned to you yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
