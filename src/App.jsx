import React from 'react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from './components/navbar';
import Home from './pages/home'
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Teams from './pages/teams'
import Projects from './pages/projects'
import Files from './pages/files'
import Chat from './pages/chat'
import Rules from './pages/rules'
import Analytics from './pages/analytics'
import Profile from './pages/profile'
import Settings from './pages/settings'
import Login from './pages/login'
import ProjectDetails from "./pages/projectdetails";
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';
import { ProjectProvider } from './contexts/ProjectContext';

function App() {
  return (
    
    <Router>
      <AuthProvider>
        <ProjectProvider>
        <SocketProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />   
          <Route path="/login" element={<Login />} />   
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} /> 
          <Route path="/teams" element={<Teams />} />
          <Route path="/files" element={<Files />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        </SocketProvider>
        </ProjectProvider>
      </AuthProvider>
    </Router>
    
  );
}

export default App;