import React, { createContext, useState, useEffect, useContext, useMemo } from 'react'; 
import apiClient from '../utils/api'; 


const ProjectContext = createContext(undefined); 

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState(null);

    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            setProjectsError(null);
            const response = await apiClient.get('/projects');
            if (response && response.ok) {
                const data = await response.json();
                setProjects(data);
            } else {
                throw new Error('Failed to fetch projects');
            }
        } catch (error) {
            console.error('Project fetch error:', error);
            setProjectsError('Failed to load projects. Please try again.');
        
        } finally {
            setProjectsLoading(false);
        }
    };
    
    
    useEffect(() => {
        fetchProjects();
    }, []); 

   
    const addProject = (newProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };
    
   
    const updateProject = (projectId, updatedData) => {
        setProjects(prev => 
            prev.map(p => p._id === projectId ? { ...p, ...updatedData } : p)
        );
    };
    
   
    const deleteProject = (projectId) => {
        setProjects(prev => prev.filter(p => p._id !== projectId));
    };

    
    const contextValue = useMemo(() => ({
        projects,
        projectsLoading,
        projectsError,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
    }), [projects, projectsLoading, projectsError]); 
    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};
