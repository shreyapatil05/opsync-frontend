import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  Search,
  FileText,
  Image as ImageIcon,
  File,
  FolderOpen,
  Loader2,
  Trash2,
  Download,
  Users,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import { useProjects } from '../contexts/ProjectContext';

const Files = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { projects, projectsLoading } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [hoveredFile, setHoveredFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [selectedUploadProject, setSelectedUploadProject] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      if (selectedProject === "all") {
        fetchAllFiles();
      } else {
        fetchFilesByProject(selectedProject);
      }
    } else if (!projectsLoading) {
      setFiles([]);
    }
  }, [projectsLoading, projects, selectedProject]);

  const fetchFilesByProject = async (projectId) => {
  try {
    setLoading(true);
    if (!projectId || projectId === "all") {
      await fetchAllFiles();
      return;
    }
    
    console.log('Fetching files for project:', projectId);
    const response = await apiClient.get(`/files/${projectId}`);
    
    if (response && response.ok) {
      const filesData = await response.json();
      console.log('Files received:', filesData);
      setFiles(filesData || []);
    } else {
      console.error('API Error:', response.status, response.statusText);
      let errorMessage = 'Failed to fetch files';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to load files",
      variant: "destructive",
    });
    setFiles([]);
  } finally {
    setLoading(false);
  }
};

  const fetchAllFiles = async () => {
    if (projects.length === 0) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allFiles = [];

     
      for (const project of projects) {
        try {
          const response = await apiClient.get(`/files/${project._id}`);
          if (response && response.ok) {
            const filesData = await response.json();
            if (filesData && Array.isArray(filesData)) {
              allFiles.push(...filesData);
            }
          }
        } catch (error) {
          console.error(`Error fetching files for project ${project.name}:`, error);
         
        }
      }
      
      setFiles(allFiles);
    } catch (error) {
      console.error('Fetch all files error:', error);
      toast({
        title: "Error",
        description: "Failed to load some files",
        variant: "destructive",
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedUploadFile || !selectedUploadProject) {
      toast({
        title: "Error",
        description: "Please select both file and project",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedUploadFile);
      formData.append('projectId', selectedUploadProject);

      const response = await apiClient.post(
        `/files/${selectedUploadProject}/upload`,
        formData
      );

      if (response && response.ok) {
        const newFile = await response.json();
        
       
        if (selectedProject === "all" || selectedProject === selectedUploadProject) {
          setFiles(prev => [newFile, ...prev]);
        }
        
        setSelectedUploadFile(null);
        setSelectedUploadProject("");
        setUploadDialogOpen(false);
        
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await apiClient.get(`/files/${fileId}/download`);
      
      if (response && response.ok) {
        const data = await response.json();
        if (data.url) {
          
          const link = document.createElement('a');
          link.href = data.url;
          link.download = data.name || fileName;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Download Started",
            description: `Downloading ${fileName}`,
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const response = await apiClient.delete(`/files/${fileId}`);
      if (response && response.ok) {
        setFiles(prev => prev.filter(file => file._id !== fileId));
        toast({
          title: "Success",
          description: "File deleted successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'image' || fileType?.includes('image')) return ImageIcon;
    if (fileType === 'pdf' || fileType?.includes('pdf')) return FileText;
    if (fileType === 'doc' || fileType?.includes('document')) return FileText;
    if (fileType === 'excel' || fileType?.includes('spreadsheet')) return FileText;
    return File;
  };

  const getFileTypeFromName = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'doc';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'excel';
    if (['zip', 'rar', '7z'].includes(extension)) return 'zip';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'aac'].includes(extension)) return 'audio';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedFileType === "all" || 
      getFileTypeFromName(file.name) === selectedFileType;
    
    return matchesSearch && matchesType;
  });

 
  let displayGroups = [];
  if (selectedProject === "all") {
    displayGroups = projects.map((project) => ({
      project: project.name,
      projectId: project._id,
      files: filteredFiles.filter((file) => file.projectId === project._id),
    })).filter(group => group.files.length > 0);
  } else {
    const selProject = projects.find((p) => p._id === selectedProject);
    if (selProject) {
      displayGroups = [{
        project: selProject.name,
        projectId: selProject._id,
        files: filteredFiles,
      }];
    }
  }

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              File Drive
            </h1>
            <p className="text-muted-foreground">
              Manage and organize all your project files
            </p>
          </div>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a new file to your project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select File
                  </label>
                  <Input 
                    type="file" 
                    onChange={(e) => setSelectedUploadFile(e.target.files[0])}
                  />
                  {selectedUploadFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {selectedUploadFile.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Project
                  </label>
                  <Select 
                    value={selectedUploadProject} 
                    onValueChange={setSelectedUploadProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No projects available
                        </SelectItem>
                      ) : (
                        projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {projects.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a project first to upload files
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleFileUpload} 
                  className="w-full"
                  disabled={uploading || !selectedUploadFile || !selectedUploadProject || projects.length === 0}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Project to View Files" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                <SelectTrigger>
                  <SelectValue placeholder="All File Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="doc">Documents</SelectItem>
                  <SelectItem value="excel">Spreadsheets</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="zip">Archives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        
        {projects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No projects found
              </h3>
              <p className="text-muted-foreground mb-4">
                You need to create a project first to upload and manage files
              </p>
              <Button asChild>
                <a href="/projects">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        
        {projects.length > 0 && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading files...</span>
                </div>
              </div>
            ) : displayGroups.length > 0 ? (
              displayGroups.map(({ project, projectId, files: groupFiles }) => (
                <div key={projectId}>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">
                      {project}
                    </h2>
                    <span className="text-muted-foreground">
                      ({groupFiles.length} {groupFiles.length === 1 ? "file" : "files"})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupFiles.map((file) => {
                      const fileType = getFileTypeFromName(file.name);
                      const FileIcon = getFileIcon(fileType);
                      return (
                        <Card
                          key={file._id}
                          className="transition-all hover:shadow-md"
                          onMouseEnter={() => setHoveredFile(file._id)}
                          onMouseLeave={() => setHoveredFile(null)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-3 rounded-lg bg-muted">
                                <FileIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground truncate mb-1">
                                  {file.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={file.uploader?.avatar} />
                                    <AvatarFallback>
                                      {file.uploader?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {file.uploader?.name || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {hoveredFile === file._id && (
                              <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 gap-2"
                                  onClick={() => handleDownload(file._id, file.name)}
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="px-3"
                                  onClick={() => handleDelete(file._id, file.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {files.length === 0 ? "No files found" : "No files match your search"}
                  </h3>
                  <p className="text-muted-foreground">
                    {files.length === 0 
                      ? "Upload your first file to get started" 
                      : "Try adjusting your search or filters"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;