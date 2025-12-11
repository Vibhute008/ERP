'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import CustomAlert from '@/components/CustomAlert';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to create a date object with no time component
const createDateWithoutTime = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Helper function to get day name from date string
const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Helper function to format date for display
const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function MeetingSchedulingPage() {
  const { isAuthenticated } = useAuth();
  const { leads, meetings, addMeeting, updateMeeting, deleteMeeting } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(() => createDateWithoutTime(new Date()));
  const [meetingForm, setMeetingForm] = useState({
    leadName: '',
    date: formatDate(createDateWithoutTime(new Date())),
    time: '',
    meetingType: '',
    description: ''
  });
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Today');
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error' | 'warning' | 'info', message: string} | null>(null);

  // Memoize filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((meeting: any) => {
        if (activeTab === 'Today') {
          return meeting.date === formatDate(selectedDate) && meeting.status === 'Upcoming';
        }
        if (activeTab === 'Upcoming') {
          // Exclude today's meetings from upcoming meetings
          return meeting.status === 'Upcoming' && meeting.date !== formatDate(new Date());
        }
        return meeting.status === activeTab;
      })
      .sort((a: any, b: any) => {
        // Sort by date first, then by time
        if (activeTab === 'Today') {
          // For today's meetings, sort by time
          return a.time.localeCompare(b.time);
        }
        // For other tabs, sort by date and time
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });
  }, [meetings, activeTab, selectedDate]);

  // Memoize unique lead names
  const leadOptions = useMemo(() => {
    return [...new Set(leads.map(lead => lead.name))];
  }, [leads]);

  // Memoize meeting types
  const meetingTypes = useMemo(() => {
    return [...new Set(meetings.map(meeting => meeting.type))];
  }, [meetings]);

  // Handlers wrapped in useCallback
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(createDateWithoutTime(date));
    setMeetingForm(prev => ({
      ...prev,
      date: formatDate(date)
    }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMeetingForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingForm.leadName || !meetingForm.date || !meetingForm.time || !meetingForm.meetingType) {
      setAlertMessage({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }
    
    const meetingData = {
      leadName: meetingForm.leadName,
      date: meetingForm.date,
      time: meetingForm.time,
      type: meetingForm.meetingType,  // Map meetingType to type
      description: meetingForm.description,
      status: 'Upcoming'
    };
    
    if (editingMeeting) {
      updateMeeting({ ...meetingData, id: editingMeeting.id });
      setAlertMessage({
        type: 'success',
        message: 'Meeting updated successfully!'
      });
    } else {
      addMeeting(meetingData);
      setAlertMessage({
        type: 'success',
        message: 'Meeting scheduled successfully!'
      });
    }
    
    // Reset form
    setMeetingForm({
      leadName: '',
      date: formatDate(createDateWithoutTime(new Date())),
      time: '',
      meetingType: '',
      description: ''
    });
    setEditingMeeting(null);
    setShowSchedulePanel(false); // Hide schedule panel after submitting
  }, [meetingForm, editingMeeting, addMeeting, updateMeeting]);

  const handleEdit = useCallback((meeting: any) => {
    setEditingMeeting(meeting);
    setMeetingForm({
      leadName: meeting.leadName,
      date: meeting.date,
      time: meeting.time,
      meetingType: meeting.type,
      description: meeting.description || ''
    });
    setShowSchedulePanel(true); // Show schedule panel when editing
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      deleteMeeting(id);
      setAlertMessage({
        type: 'success',
        message: 'Meeting deleted successfully!'
      });
    }
  }, [deleteMeeting]);

  const handleCancel = useCallback(() => {
    setMeetingForm({
      leadName: '',
      date: formatDate(createDateWithoutTime(new Date())),
      time: '',
      meetingType: '',
      description: ''
    });
    setEditingMeeting(null);
    setShowSchedulePanel(false); // Hide schedule panel when canceling
  }, []);

  // Auto-hide alerts after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Alert Message */}
      {alertMessage && (
        <div className="mb-6">
          <CustomAlert 
            type={alertMessage.type} 
            message={alertMessage.message} 
            onClose={() => setAlertMessage(null)} 
          />
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Meeting Scheduler</h1>
          <p className="text-sm text-text-secondary mt-1">Organize and manage your meetings</p>
        </div>
        <button
          onClick={() => setShowSchedulePanel(true)}
          className="flex items-center bg-accent-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg border border-border rounded-xl p-5 shadow-sm card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  className="p-2 rounded-lg hover:bg-hover-bg"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDateChange(new Date())}
                  className="px-3 py-1 text-sm font-medium text-accent-primary hover:bg-active-bg rounded-lg"
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  className="p-2 rounded-lg hover:bg-hover-bg"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-text-secondary py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-10"></div>;
                }
                
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const hasMeetings = meetings.some(meeting => 
                  meeting.date === formatDate(date) && meeting.status === 'Upcoming'
                );
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateChange(date)}
                    className={`h-10 rounded-lg text-sm transition-colors relative flex items-center justify-center ${
                      isToday 
                        ? 'bg-accent-primary text-white font-medium' 
                        : isSelected 
                          ? 'bg-active-bg text-accent-primary font-medium' 
                          : 'hover:bg-hover-bg'
                    }`}
                  >
                    {date.getDate()}
                    {hasMeetings && !isToday && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Either Schedule Form or Meetings List */}
        <div className="lg:col-span-2">
          <div className="bg-card-bg border border-border rounded-xl shadow-sm card">
            {showSchedulePanel ? (
              /* Schedule Meeting Form in Large Panel */
              <>
                <div className="border-b border-border">
                  <div className="flex justify-between items-center px-6 py-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="text-text-tertiary hover:text-text-secondary"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="leadName" className="block text-sm font-medium text-text-primary mb-1">
                          Lead Name <span className="text-error">*</span>
                        </label>
                        <select
                          id="leadName"
                          name="leadName"
                          value={meetingForm.leadName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          required
                        >
                          <option value="">Select a lead</option>
                          {leadOptions.map(lead => (
                            <option key={lead} value={lead}>{lead}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-text-primary mb-1">
                            Date <span className="text-error">*</span>
                          </label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={meetingForm.date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-sm font-medium text-text-primary mb-1">
                            Time <span className="text-error">*</span>
                          </label>
                          <input
                            type="time"
                            id="time"
                            name="time"
                            value={meetingForm.time}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="meetingType" className="block text-sm font-medium text-text-primary mb-1">
                          Meeting Type <span className="text-error">*</span>
                        </label>
                        <select
                          id="meetingType"
                          name="meetingType"
                          value={meetingForm.meetingType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          required
                        >
                          <option value="">Select meeting type</option>
                          {meetingTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          <option value="Demo">Demo</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Initial Call">Initial Call</option>
                          <option value="Consultation">Consultation</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={meetingForm.description}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Enter meeting description..."
                        ></textarea>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border rounded-lg hover:bg-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-colors shadow-sm"
                      >
                        {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              /* Meetings List Panel */
              <>
                {/* Tab Headers */}
                <div className="border-b border-border">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {['Today', 'Upcoming', 'Past'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                          activeTab === tab
                            ? 'border-accent-primary text-accent-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {activeTab} Meetings
                    </h3>
                    <div className="text-sm text-text-secondary">
                      {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'}
                    </div>
                  </div>

                  {filteredMeetings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Lead
                            </th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="relative px-5 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card-bg divide-y divide-border">
                          {filteredMeetings.map((meeting: any) => (
                            <tr key={meeting.id} className="hover:bg-hover-bg">
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-text-primary">{meeting.leadName}</div>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="text-sm text-text-secondary">
                                  {activeTab === 'Today' 
                                    ? meeting.time 
                                    : `${getDayName(meeting.date)}, ${formatDisplayDate(meeting.date)}`}
                                </div>
                                {activeTab !== 'Today' && (
                                  <div className="text-xs text-text-tertiary">{meeting.time}</div>
                                )}
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                  meeting.status === 'Upcoming' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {meeting.type}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-sm text-text-secondary max-w-xs truncate">
                                  {meeting.description || 'No description'}
                                </div>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(meeting)}
                                  className="text-accent-primary hover:text-accent-hover mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(meeting.id)}
                                  className="text-error hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-text-primary">No {activeTab.toLowerCase()} meetings</h3>
                      <p className="mt-1 text-sm text-text-secondary">
                        {activeTab === 'Today' 
                          ? 'No meetings scheduled for today.' 
                          : `No ${activeTab.toLowerCase()} meetings found.`}
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowSchedulePanel(true)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Schedule Meeting
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}