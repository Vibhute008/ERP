'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
}

interface Task {
  id: number;
  name: string;
  assignedTo: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  completed: boolean;
}

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const { projects, tasks, addProject, updateProject, deleteProject, addTask, toggleTaskCompletion } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', status: 'Planning' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    assignedTo: { name: '', avatar: '' },
    dueDate: '',
    completed: false,
    projectId: selectedProject?.id || 0
  });
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    
    const term = searchTerm.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(term) || 
      project.client.toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  // Memoize project tasks with sorting
  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    
    // Sort tasks: incomplete first, then by due date (earliest first), then completed
    return tasks
      .filter(task => task.projectId === selectedProject.id)
      .sort((a, b) => {
        // Completed tasks at the bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        
        // Both completed or both incomplete - sort by due date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, selectedProject]);

  // Handlers wrapped in useCallback
  const handleProjectSelect = useCallback((project: any) => {
    setSelectedProject(project);
  }, []);

  const handleAddProject = useCallback(() => {
    setNewProject({ name: '', client: '', status: 'Planning' });
    setShowAddProjectForm(true);
  }, []);

  const handleSaveProject = useCallback(() => {
    if (newProject.name && newProject.client) {
      addProject(newProject);
      setNewProject({ name: '', client: '', status: 'Planning' });
      setShowAddProjectForm(false);
    } else {
      alert('Please fill in all required fields');
    }
  }, [newProject, addProject]);

  const handleEditProject = useCallback(() => {
    if (selectedProject) {
      setEditingProject(selectedProject);
      setShowEditProjectForm(true);
    }
  }, [selectedProject]);

  const handleUpdateProject = useCallback(() => {
    if (editingProject) {
      updateProject(editingProject);
      setEditingProject(null);
      setShowEditProjectForm(false);
    }
  }, [editingProject, updateProject]);

  const handleDeleteProject = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(projects.find(p => p.id !== id) || null);
      }
    }
  }, [deleteProject, selectedProject, projects]);

  const handleAddTask = useCallback(() => {
    // Validation
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    
    if (!newTask.name.trim()) {
      alert('Please enter a task name');
      return;
    }
    
    if (!newTask.assignedTo.name.trim()) {
      alert('Please enter the assignee name');
      return;
    }
    
    if (!newTask.dueDate) {
      alert('Please select a due date');
      return;
    }
    
    // Add task
    addTask({ 
      ...newTask, 
      completed: false,
      projectId: selectedProject.id
    });
    
    // Reset form
    setNewTask({ 
      name: '', 
      assignedTo: { name: '', avatar: '' }, 
      dueDate: '', 
      completed: false,
      projectId: selectedProject.id
    });
    
    setShowAddTaskForm(false);
  }, [newTask, addTask, selectedProject]);

  const handleToggleTask = useCallback((id: number) => {
    toggleTaskCompletion(id);
  }, [toggleTaskCompletion]);

  // Reset newTask when selectedProject changes
  useEffect(() => {
    setNewTask({
      name: '',
      assignedTo: { name: '', avatar: '' },
      dueDate: '',
      completed: false,
      projectId: selectedProject?.id || 0
    });
  }, [selectedProject]);

  // Helper function to check if a task is overdue
  const isTaskOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    return taskDueDate < today;
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-2">Project Management</h1>
          <p className="text-sm md:text-base text-[#64748B]">Track and manage your projects and tasks</p>
        </div>
        <button
          onClick={handleAddProject}
          className="flex items-center bg-[#2563EB] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg border border-border rounded-xl shadow-sm card">
            {/* Search Bar */}
            <div className="p-5 border-b border-border">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="divide-y divide-border max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedProject && selectedProject.id === project.id ? 'bg-[#EEF4FF]' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#0F172A]">{project.name}</h3>
                        <p className="text-sm text-[#64748B] mt-1">{project.client}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-[#0F172A]">No projects found</h3>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new project'}
                  </p>
                  {!searchTerm && (
                    <div className="mt-4">
                      <button
                        onClick={handleAddProject}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2563EB] hover:bg-[#1E40AF]"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="bg-card-bg border border-border rounded-xl shadow-sm card">
              {/* Project Header */}
              <div className="p-5 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">{selectedProject.name}</h2>
                    <p className="text-[#64748B] mt-1">Client: {selectedProject.client}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditProject}
                      className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF2FF] rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(selectedProject.id)}
                      className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedProject.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                    selectedProject.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    selectedProject.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProject.status}
                  </span>
                </div>
              </div>

              {/* Tasks Section */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F172A]">Tasks</h3>
                    {projectTasks.length > 0 && (
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-[#64748B]">
                          {projectTasks.filter(t => t.completed).length} of {projectTasks.length} completed
                        </span>
                        <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${projectTasks.length > 0 ? (projectTasks.filter(t => t.completed).length / projectTasks.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                      className={`text-xs ${showCompletedTasks ? 'text-[#64748B] hover:text-[#0F172A] bg-gray-100 hover:bg-gray-200' : 'text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200'} px-2 py-1 rounded transition-colors`}
                    >
                      {showCompletedTasks ? 'Hide Completed' : 'Show All'}
                    </button>
                    <button
                      onClick={() => setShowAddTaskForm(true)}
                      className="flex items-center text-sm text-[#2563EB] hover:text-[#1E40AF] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Task
                    </button>
                  </div>
                </div>

                {projectTasks.length > 0 ? (
                  <div className="space-y-3">
                    {projectTasks
                      .filter(task => showCompletedTasks || !task.completed)
                      .map((task: Task) => (
                        <div 
                          key={task.id} 
                          className={`flex items-center p-4 border border-border rounded-xl hover:bg-gray-50 transition-colors shadow-sm ${
                            task.completed 
                              ? 'bg-green-50 border-green-200' 
                              : isTaskOverdue(task.dueDate)
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="h-5 w-5 text-[#2563EB] rounded focus:ring-[#2563EB] border-border cursor-pointer"
                          />
                          <div className="ml-4 flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.completed ? 'line-through text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                              {task.name}
                            </p>
                            <div className="flex flex-wrap items-center mt-2 text-xs text-[#64748B] gap-2">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{task.assignedTo.name}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className={isTaskOverdue(task.dueDate) && !task.completed ? 'text-red-600 font-medium' : ''}>
                                  Due: {task.dueDate}
                                  {isTaskOverdue(task.dueDate) && !task.completed && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                      Overdue
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {task.assignedTo.avatar}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-dashed border-blue-200">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-[#0F172A]">No tasks yet</h3>
                    <p className="mt-2 text-sm text-[#64748B] max-w-xs mx-auto">
                      Get started by creating your first task for this project. Tasks help you track progress and stay organized.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddTaskForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2563EB] hover:bg-[#1E40AF] transition-colors"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card-bg border border-border rounded-xl shadow-sm card h-full flex items-center justify-center">
              <div className="text-center p-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-[#0F172A]">No project selected</h3>
                <p className="mt-1 text-sm text-[#64748B]">Select a project from the list to view details.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProjectForm && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Add New Project</h3>
                <button
                  onClick={() => setShowAddProjectForm(false)}
                  className="text-[#94A3B8] hover:text-[#64748B]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddProjectForm(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748B] bg-white border border-border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectForm && editingProject && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Edit Project</h3>
                <button
                  onClick={() => setShowEditProjectForm(false)}
                  className="text-[#94A3B8] hover:text-[#64748B]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="editProjectName" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editProjectName"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="editClientName" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editClientName"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editingProject.client}
                    onChange={(e) => setEditingProject({...editingProject, client: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Status
                  </label>
                  <select
                    id="editStatus"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditProjectForm(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748B] bg-white border border-border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProject}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  Update Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskForm && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Add New Task</h3>
                <button
                  onClick={() => setShowAddTaskForm(false)}
                  className="text-[#94A3B8] hover:text-[#64748B]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-[#0F172A]">Add New Task</h3>
                  <p className="text-sm text-[#64748B] mt-1">
                    {selectedProject ? `Creating task for "${selectedProject.name}"` : 'Select a project first'}
                  </p>
                </div>
                
                {/* Hidden projectId field */}
                <input
                  type="hidden"
                  value={selectedProject?.id || ''}
                />

                <div>
                  <label htmlFor="taskName" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="taskName"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={newTask.name}
                      onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                      placeholder="Enter task name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="assignedTo"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={newTask.assignedTo.name}
                      onChange={(e) => setNewTask({...newTask, assignedTo: {...newTask.assignedTo, name: e.target.value}})}
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Avatar Initials
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="avatar"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={newTask.assignedTo.avatar}
                      onChange={(e) => setNewTask({...newTask, assignedTo: {...newTask.assignedTo, avatar: e.target.value}})}
                      placeholder="Enter avatar initials (e.g. AJ)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-[#0F172A] mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="dueDate"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddTaskForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-[#64748B] bg-white border border-border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}