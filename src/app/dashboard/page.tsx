'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

// Helper function to format date as MMM DD, YYYY
const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { leads, meetings, projects, tasks } = useData();
  
  // Memoize stats calculations
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(lead => lead.status !== 'Closed').length;
    const closedLeads = leads.filter(lead => lead.status === 'Closed').length;
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => project.status !== 'Completed').length;
    const completedProjects = projects.filter(project => project.status === 'Completed').length;
    
    const meetingsToday = meetings.filter(meeting => 
      meeting.date === formatDate(new Date()) && 
      meeting.status === 'Upcoming'
    ).length;
    
    const totalMeetings = meetings.length;
    const upcomingMeetings = meetings.filter(meeting => meeting.status === 'Upcoming').length;
    const pastMeetings = meetings.filter(meeting => meeting.status === 'Past').length;
    
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
    
    return {
      totalLeads,
      activeLeads,
      closedLeads,
      totalProjects,
      activeProjects,
      completedProjects,
      meetingsToday,
      totalMeetings,
      upcomingMeetings,
      pastMeetings,
      totalTasks,
      pendingTasks,
      completedTasks,
      conversionRate
    };
  }, [leads, meetings, projects, tasks]);
  
  // Memoize today's meetings
  const todaysMeetings = useMemo(() => {
    return meetings.filter(meeting => 
      meeting.date === formatDate(new Date()) && 
      meeting.status === 'Upcoming'
    );
  }, [meetings]);
  
  // Memoize recent leads (last 5)
  const recentLeads = useMemo(() => {
    return [...leads].sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    ).slice(0, 5);
  }, [leads]);
  
  // Memoize upcoming meetings (next 5) excluding today's meetings
  const upcomingMeetingsList = useMemo(() => {
    return [...meetings]
      .filter(meeting => meeting.status === 'Upcoming' && meeting.date !== formatDate(new Date()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [meetings]);
  
  // Memoize recent projects (last 5)
  const recentProjects = useMemo(() => {
    return [...projects].slice(0, 5);
  }, [projects]);
  
  // Memoize pending tasks (last 5)
  const pendingTasksList = useMemo(() => {
    return [...tasks]
      .filter(task => !task.completed)
      .slice(0, 5);
  }, [tasks]);
  
  // Memoize meetings trend data (last 7 days)
  const lineChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + 1 + i);
      const formattedDate = formatDate(date);
      
      const count = meetings.filter(m => m.date === formattedDate).length;
      data.push({ day: days[i], value: count });
    }
    
    return data;
  }, [meetings]);

  // Memoize pie chart data for leads by status
  const pieChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    
    const statuses = Object.keys(statusCounts);
    const totalCount = statuses.reduce((sum, status) => sum + statusCounts[status], 0);
    
    // Colors for different statuses
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return statuses.map((status, index) => ({
      name: status,
      value: statusCounts[status],
      percentage: totalCount > 0 ? Math.round((statusCounts[status] / totalCount) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }, [leads]);

  // Memoize activities generation
  const activities = useMemo(() => {
    const newActivities: any[] = [];

    // Generate lead activities
    leads.forEach((lead) => {
      // Add lead creation activity
      newActivities.push({
        id: 1000 + lead.id,
        type: 'lead',
        title: `Lead '${lead.name}' Added`,
        meta: `by System — ${formatTimeAgo(lead.lastActivity)}`,
        time: new Date(lead.lastActivity).toISOString(),
        icon: '👤'
      });
      
      // Add lead activities if they exist
      if (lead.activities && lead.activities.length > 0) {
        lead.activities.forEach((activity: any, activityIndex) => {
          newActivities.push({
            id: 2000 + lead.id * 100 + activityIndex,
            type: activity.type,
            title: activity.title,
            meta: `by System — ${formatTimeAgo(activity.timestamp)}`,
            time: new Date(activity.timestamp).toISOString(),
            icon: activity.type === 'call' ? '📞' : activity.type === 'email' ? '📧' : '📝'
          });
        });
      }
    });

    // Generate meeting activities
    meetings.forEach((meeting, index) => {
      newActivities.push({
        id: 3000 + index,
        type: 'calendar',
        title: `Meeting scheduled with '${meeting.leadName}'`,
        meta: `by System — ${formatTimeAgo(meeting.date)}`,
        time: new Date(meeting.date).toISOString(),
        icon: '📅'
      });
    });

    // Generate project activities
    projects.forEach((project, index) => {
      newActivities.push({
        id: 4000 + index,
        type: 'task',
        title: `Project '${project.name}' status changed to ${project.status}`,
        meta: `by System — ${formatTimeAgo(new Date().toISOString().split('T')[0])}`,
        time: new Date().toISOString(),
        icon: '📊'
      });
    });

    // Generate task activities
    tasks.forEach((task, index) => {
      if (task.completed) {
        newActivities.push({
          id: 5000 + index,
          type: 'task',
          title: `Task completed: '${task.name}'`,
          meta: `by System — ${formatTimeAgo(new Date().toISOString().split('T')[0])}`,
          time: new Date().toISOString(),
          icon: '✅'
        });
      } else {
        newActivities.push({
          id: 6000 + index,
          type: 'task',
          title: `Task created: '${task.name}'`,
          meta: `by System — ${formatTimeAgo(new Date().toISOString().split('T')[0])}`,
          time: new Date().toISOString(),
          icon: '📌'
        });
      }
    });

    // Sort activities by time (newest first)
    return newActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);
  }, [leads, meetings, projects, tasks]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const {
    totalLeads,
    activeLeads,
    closedLeads,
    totalProjects,
    activeProjects,
    completedProjects,
    meetingsToday,
    totalMeetings,
    upcomingMeetings,
    pastMeetings,
    totalTasks,
    pendingTasks,
    completedTasks,
    conversionRate
  } = stats;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      {/* Page Title Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm md:text-base text-[#64748B] mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        {/* Leads Overview */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Total Leads</h3>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{totalLeads}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex space-x-4">
            <div>
              <p className="text-xs text-text-secondary">Active</p>
              <p className="text-sm font-medium text-text-primary">{activeLeads}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Closed</p>
              <p className="text-sm font-medium text-text-primary">{closedLeads}</p>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Conversion Rate</h3>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{conversionRate}%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-text-secondary">Closed / Total</p>
          </div>
        </div>

        {/* Projects Overview */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Projects</h3>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{totalProjects}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex space-x-4">
            <div>
              <p className="text-xs text-text-secondary">Active</p>
              <p className="text-sm font-medium text-text-primary">{activeProjects}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Completed</p>
              <p className="text-sm font-medium text-text-primary">{completedProjects}</p>
            </div>
          </div>
        </div>

        {/* Meetings Overview */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Meetings</h3>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{totalMeetings}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex space-x-4">
            <div>
              <p className="text-xs text-text-secondary">Upcoming</p>
              <p className="text-sm font-medium text-text-primary">{upcomingMeetings}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Today</p>
              <p className="text-sm font-medium text-text-primary">{meetingsToday}</p>
            </div>
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Tasks</h3>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{totalTasks}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex space-x-4">
            <div>
              <p className="text-xs text-text-secondary">Pending</p>
              <p className="text-sm font-medium text-text-primary">{pendingTasks}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Completed</p>
              <p className="text-sm font-medium text-text-primary">{completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Leads by Status */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Leads Distribution</h3>
          <div className="flex items-center justify-center h-[250px]">
            {pieChartData.length > 0 ? (
              <div className="relative w-48 h-48">
                {/* Pie Chart SVG */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {(() => {
                    let startAngle = 0;
                    return pieChartData.map((segment, index) => {
                      const percentage = segment.percentage;
                      const angle = (percentage / 100) * 360;
                      const endAngle = startAngle + angle;
                      
                      // Convert angles to radians
                      const startAngleRad = (startAngle - 90) * Math.PI / 180;
                      const endAngleRad = (endAngle - 90) * Math.PI / 180;
                      
                      // Calculate coordinates for the arc
                      const x1 = 50 + 40 * Math.cos(startAngleRad);
                      const y1 = 50 + 40 * Math.sin(startAngleRad);
                      const x2 = 50 + 40 * Math.cos(endAngleRad);
                      const y2 = 50 + 40 * Math.sin(endAngleRad);
                      
                      // Determine if it's a large arc
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      // Create the path data
                      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      
                      startAngle = endAngle;
                      
                      return (
                        <path
                          key={index}
                          d={pathData}
                          fill={segment.color}
                          stroke="#FFFFFF"
                          strokeWidth="1"
                          className="transition-all duration-300 hover:opacity-90"
                        />
                      );
                    });
                  })()}
                  {/* Center circle for donut effect */}
                  <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
                </svg>
                
                {/* Legend */}
                <div className="absolute top-0 left-full ml-6">
                  {pieChartData.map((segment, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {segment.name}: {segment.value} ({segment.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-text-secondary">
                <p>No lead data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart - Meetings Trend */}
        <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Meetings Trend (Last 7 Days)</h3>
          <div className="h-[250px] flex items-end gap-2 md:gap-4">
            {lineChartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative flex flex-col items-center group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t transition-all duration-300 hover:opacity-90" 
                    style={{ 
                      height: `${(item.value / Math.max(...lineChartData.map(d => d.value), 1)) * 200}px`
                    }}
                  ></div>
                  <span className="text-xs text-text-secondary mt-2">{item.day}</span>
                  <span className="text-xs font-medium text-text-primary mt-1">{item.value}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {item.day}: {item.value} meetings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Activity Log */}
        <div className="lg:col-span-2 bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="flex-grow overflow-hidden">
            {activities.length > 0 ? (
              <div className="h-full overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {activity.icon}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{activity.meta}</p>
                      </div>
                      <div className="flex-shrink-0 text-xs text-text-tertiary">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-text-primary">No recent activity</h3>
                <p className="mt-1 text-sm text-text-secondary">Activity will appear here when actions are taken.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Summary Lists */}
        <div className="space-y-6">
          {/* Recent Leads */}
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Leads</h3>
            <div className="flex-grow overflow-hidden">
              {recentLeads.length > 0 ? (
                <div className="h-full overflow-y-auto pr-2" style={{ maxHeight: '250px' }}>
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                          <p className="text-xs text-text-secondary">{lead.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'Contacted' ? 'bg-amber-100 text-amber-800' :
                          lead.status === 'Interested' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-text-secondary">No leads found</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Pending Tasks</h3>
            <div className="flex-grow overflow-hidden">
              {pendingTasksList.length > 0 ? (
                <div className="h-full overflow-y-auto pr-2" style={{ maxHeight: '250px' }}>
                  <div className="space-y-3">
                    {pendingTasksList.map((task) => (
                      <div key={task.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{task.name}</p>
                          <p className="text-xs text-text-secondary">Due: {task.dueDate}</p>
                        </div>
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {task.assignedTo.avatar}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-text-secondary">No pending tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Meetings Section */}
      <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm mb-6 card flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Today's Meetings</h3>
          <span className="text-sm text-text-secondary">{todaysMeetings.length} meetings</span>
        </div>
        
        <div className="flex-grow overflow-hidden">
          {todaysMeetings.length > 0 ? (
            <div className="h-full overflow-y-auto pr-2" style={{ maxHeight: '300px' }}>
              <div className="space-y-3">
                {todaysMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{meeting.leadName}</p>
                        <p className="text-xs text-text-secondary">{meeting.type} • {meeting.time}</p>
                      </div>
                    </div>
                    <span className="text-sm text-accent-primary font-medium">Upcoming</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-text-primary">No meetings today</h3>
              <p className="mt-1 text-sm text-text-secondary">You have no meetings scheduled for today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}