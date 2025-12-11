'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AddNewLeadModal from '@/components/AddNewLeadModal';
import ViewLeadModal from '@/components/ViewLeadModal';
import EditLeadModal from '@/components/EditLeadModal';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    New: 'bg-[#EEF2FF] text-[#2563EB]',
    Contacted: 'bg-[#FFF7ED] text-[#C2410C]',
    Interested: 'bg-[#FFFBEB] text-[#92400E]',
    Closed: 'bg-[#ECFDF5] text-[#059669]'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Pill component for filters
const FilterPill = ({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}) => {
  const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer';
  const activeClasses = 'bg-[#EEF2FF] text-[#2563EB]';
  const inactiveClasses = 'bg-transparent border border-[#EEF2F4] text-[#475569] hover:bg-gray-50';

  return (
    <button
      role="tab"
      aria-pressed={isActive}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default function LeadsPage() {
  const { isAuthenticated } = useAuth();
  const { leads, addLead, updateLead, deleteLead, addLeadActivity } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Memoize filtered and sorted leads
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(term) || 
        lead.email.toLowerCase().includes(term) ||
        lead.phone.includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortBy === 'lastActivity') {
        aValue = new Date(a.lastActivity).getTime();
        bValue = new Date(b.lastActivity).getTime();
      } else {
        aValue = a[sortBy as keyof typeof a];
        bValue = b[sortBy as keyof typeof b];
      }
      
      // Handle undefined/null values
      if ((aValue == null || aValue === '') && (bValue == null || bValue === '')) return 0;
      if (aValue == null || aValue === '') return 1;
      if (bValue == null || bValue === '') return -1;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    return result;
  }, [leads, searchTerm, statusFilter, sortBy, sortOrder]);

  // Memoize unique statuses
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(leads.map(lead => lead.status))];
    // Ensure 'All' is not duplicated if it exists in lead statuses
    const filteredStatuses = statuses.filter(status => status !== 'All');
    return ['All', ...filteredStatuses];
  }, [leads]);

  // Memoize status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: leads.length };
    leads.forEach(lead => {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    });
    return counts;
  }, [leads]);

  // Handlers wrapped in useCallback
  const handleAddLead = useCallback((leadData: any) => {
    addLead(leadData);
    setShowAddModal(false);
  }, [addLead]);

  const handleUpdateLead = useCallback((leadData: any) => {
    updateLead(leadData);
    setShowEditModal(false);
  }, [updateLead]);

  const handleDeleteLead = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead(id);
    }
  }, [deleteLead]);

  const handleViewLead = useCallback((lead: any) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  }, []);

  const handleEditLead = useCallback((lead: any) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  }, []);

  const handleAddActivity = useCallback((leadId: number, activity: any) => {
    addLeadActivity(leadId, activity);
  }, [addLeadActivity]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-2">Leads Management</h1>
          <p className="text-sm md:text-base text-[#64748B]">Manage your sales leads and track their progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-[#2563EB] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#1E40AF] transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Lead
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card-bg border border-border rounded-xl p-5 mb-6 shadow-sm card">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {uniqueStatuses.map((status, index) => (
            <FilterPill
              key={`${status}-${index}`}
              label={`${status} (${statusCounts[status]})`}
              isActive={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            />
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-card-bg border border-border rounded-xl shadow-sm overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-5 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortBy === 'name' && (
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-5 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    <span>Email</span>
                    {sortBy === 'email' && (
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-5 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Phone
                </th>
                <th 
                  scope="col" 
                  className="px-5 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-5 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastActivity')}
                >
                  <div className="flex items-center">
                    <span>Last Activity</span>
                    {sortBy === 'lastActivity' && (
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-5 md:px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border">
              {filteredAndSortedLeads.length > 0 ? (
                filteredAndSortedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-5 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#0F172A]">{lead.name}</div>
                    </td>
                    <td className="px-5 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#64748B]">{lead.email}</div>
                    </td>
                    <td className="px-5 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#64748B]">{lead.phone}</div>
                    </td>
                    <td className="px-5 md:px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 md:px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                      {new Date(lead.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="px-5 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="text-[#2563EB] hover:text-[#1E40AF] mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="text-[#2563EB] hover:text-[#1E40AF] mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 md:px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-[#0F172A]">No leads found</h3>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {searchTerm || statusFilter !== 'All' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'Get started by adding a new lead'}
                      </p>
                      {!searchTerm && statusFilter === 'All' && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2563EB] hover:bg-[#1E40AF] focus:outline-none"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Lead
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddNewLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
        />
      )}

      {showViewModal && selectedLead && (
        <ViewLeadModal
          lead={selectedLead}
          onClose={() => setShowViewModal(false)}
          onAddActivity={handleAddActivity}
        />
      )}

      {showEditModal && selectedLead && (
        <EditLeadModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          leadId={selectedLead.id}
          leads={leads}
          onSave={handleUpdateLead}
        />
      )}
    </div>
  );
}