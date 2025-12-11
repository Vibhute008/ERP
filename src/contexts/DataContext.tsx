'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

// Define types for our data
interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastActivity: string;
  notes: string;
  activities?: Activity[];
}

interface Activity {
  id: number;
  type: string;
  title: string;
  snippet: string;
  timestamp: string;
}

interface Meeting {
  id: number;
  leadName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  description?: string;
}

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
  projectId: number; // Add projectId to associate tasks with projects
}

interface DataContextType {
  leads: Lead[];
  meetings: Meeting[];
  projects: Project[];
  tasks: Task[];
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: number) => void;
  addLeadActivity: (leadId: number, activity: Omit<Activity, 'id'>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: number) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: number) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTaskCompletion: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial data - now empty arrays instead of dummy data
const initialLeads: Lead[] = [];

const initialMeetings: Meeting[] = [];

const initialProjects: Project[] = [];

const initialTasks: Task[] = [];

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLeads = localStorage.getItem('leads');
        return savedLeads ? JSON.parse(savedLeads) : initialLeads;
      } catch (error) {
        console.error('Error loading leads from localStorage:', error);
        return initialLeads;
      }
    }
    return initialLeads;
  });
  
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMeetings = localStorage.getItem('meetings');
        return savedMeetings ? JSON.parse(savedMeetings) : initialMeetings;
      } catch (error) {
        console.error('Error loading meetings from localStorage:', error);
        return initialMeetings;
      }
    }
    return initialMeetings;
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('projects');
        return savedProjects ? JSON.parse(savedProjects) : initialProjects;
      } catch (error) {
        console.error('Error loading projects from localStorage:', error);
        return initialProjects;
      }
    }
    return initialProjects;
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : initialTasks;
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        return initialTasks;
      }
    }
    return initialTasks;
  });

  // Debounced save to localStorage to prevent excessive writes
  const debouncedSave = useCallback((key: string, data: any) => {
    clearTimeout((window as any)[`saveTimeout_${key}`]);
    (window as any)[`saveTimeout_${key}`] = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }, 300); // Debounce for 300ms
  }, []);

  // Save data to localStorage whenever it changes (debounced)
  useEffect(() => {
    debouncedSave('leads', leads);
  }, [leads, debouncedSave]);

  useEffect(() => {
    debouncedSave('meetings', meetings);
  }, [meetings, debouncedSave]);

  useEffect(() => {
    debouncedSave('projects', projects);
  }, [projects, debouncedSave]);

  useEffect(() => {
    debouncedSave('tasks', tasks);
  }, [tasks, debouncedSave]);

  // Memoized data operations
  const addLead = useCallback((lead: Omit<Lead, 'id'>) => {
    setLeads(prevLeads => {
      const newLead = {
        ...lead,
        id: prevLeads.length > 0 ? Math.max(...prevLeads.map(l => l.id)) + 1 : 1
      };
      return [...prevLeads, newLead];
    });
  }, []);

  const updateLead = useCallback((updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  }, []);

  const deleteLead = useCallback((id: number) => {
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
  }, []);

  const addLeadActivity = useCallback((leadId: number, activity: Omit<Activity, 'id'>) => {
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id === leadId) {
        const newActivity = {
          ...activity,
          id: lead.activities ? lead.activities.length + 1 : 1
        };
        return {
          ...lead,
          activities: lead.activities ? [...lead.activities, newActivity] : [newActivity]
        };
      }
      return lead;
    }));
  }, []);

  const addMeeting = useCallback((meeting: Omit<Meeting, 'id'>) => {
    setMeetings(prevMeetings => {
      const newMeeting = {
        ...meeting,
        id: prevMeetings.length > 0 ? Math.max(...prevMeetings.map(m => m.id)) + 1 : 1
      };
      return [...prevMeetings, newMeeting];
    });
  }, []);

  const updateMeeting = useCallback((updatedMeeting: Meeting) => {
    setMeetings(prevMeetings => prevMeetings.map(meeting => meeting.id === updatedMeeting.id ? updatedMeeting : meeting));
  }, []);

  const deleteMeeting = useCallback((id: number) => {
    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    setProjects(prevProjects => {
      const newProject = {
        ...project,
        id: prevProjects.length > 0 ? Math.max(...prevProjects.map(p => p.id)) + 1 : 1
      };
      return [...prevProjects, newProject];
    });
  }, []);

  const updateProject = useCallback((updatedProject: Project) => {
    setProjects(prevProjects => prevProjects.map(project => project.id === updatedProject.id ? updatedProject : project));
  }, []);

  const deleteProject = useCallback((id: number) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    setTasks(prevTasks => {
      const newTask = {
        ...task,
        id: prevTasks.length > 0 ? Math.max(...prevTasks.map(t => t.id)) + 1 : 1
      };
      return [...prevTasks, newTask];
    });
  }, []);

  const toggleTaskCompletion = useCallback((id: number) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    leads,
    meetings,
    projects,
    tasks,
    addLead,
    updateLead,
    deleteLead,
    addLeadActivity,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    toggleTaskCompletion
  }), [
    leads,
    meetings,
    projects,
    tasks,
    addLead,
    updateLead,
    deleteLead,
    addLeadActivity,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    toggleTaskCompletion
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}