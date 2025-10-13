import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

export function FilterBar({ 
  filters, 
  onFilterChange, 
  projects = [], 
  isLoading = false, 
  isEmployee = false 
}) {
  const [localDateRange, setLocalDateRange] = useState({
    from: filters.dateRange.from,
    to: filters.dateRange.to,
  });

 
  const handleDateRangeChange = (range) => {
    const newRange = {
      from: range?.from,
      to: range?.to,
    };
    setLocalDateRange(newRange);
    onFilterChange({
      ...filters,
      dateRange: newRange,
    });
  };

  const handleClearDates = () => {
    setLocalDateRange({ from: undefined, to: undefined });
    onFilterChange({
      ...filters,
      dateRange: { from: undefined, to: undefined },
    });
  };

  const handleProjectChange = (value) => {
    onFilterChange({
      ...filters,
      project: value,
    });
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal h-11 ${
                  !localDateRange.from ? "text-muted-foreground" : ""
                }`}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localDateRange.from ? (
                  localDateRange.to ? (
                    <>
                      {format(localDateRange.from, "MMM dd")} - {format(localDateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(localDateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Pick date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: localDateRange.from,
                  to: localDateRange.to,
                }}
                onSelect={handleDateRangeChange}
                disabled={(date) => date > new Date()}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

       
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Project</label>
          <Select 
            value={filters.project} 
            onValueChange={handleProjectChange} 
            disabled={isLoading || projects.length === 0}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No projects with tasks assigned
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

     
      {(localDateRange.from || localDateRange.to || filters.project !== "all") && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleClearDates();
              handleProjectChange("all");
            }}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
