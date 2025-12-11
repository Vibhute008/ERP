'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function OutreachMessagingPage() {
  const { isAuthenticated } = useAuth();
  const { leads, addLeadActivity } = useData();
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [messageTemplate, setMessageTemplate] = useState('');

  // Helper function to open WhatsApp chat
  const openWhatsAppChat = (lead: { name: string; phone: string }, message: string) => {
    const phoneNumber = lead.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      console.log(`WhatsApp message initiated for ${lead.name}`);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback: Show manual instructions
      alert(`Please follow these steps to send WhatsApp message to ${lead.name}:
1. Phone number: ${phoneNumber}
2. Message: ${message}

Instructions:
- Copy the phone number above
- Open your phone's WhatsApp app
- Tap the new chat button
- Enter the phone number
- After the chat opens, type or paste the message:
"${message}"`);
      
      // Try to copy phone number to clipboard
      navigator.clipboard.writeText(phoneNumber).catch(clipboardError => {
        console.error('Failed to copy phone number to clipboard:', clipboardError);
      });
    }
  };

  // Memoize filtered leads (in a real app, this would be more complex)
  const availableLeads = useMemo(() => {
    return leads.filter(lead => lead.status !== 'Closed');
  }, [leads]);

  // Handler wrapped in useCallback
  const handleLeadSelection = useCallback((leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId) 
        : [...prev, leadId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedLeads.length === availableLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(availableLeads.map(lead => lead.id));
    }
  }, [selectedLeads.length, availableLeads]);

  const handleSendWhatsApp = useCallback(() => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead');
      return;
    }
    
    if (!messageTemplate.trim()) {
      alert('Please enter a message template');
      return;
    }
    
    // Get selected lead details
    const selectedLeadDetails = leads.filter(lead => selectedLeads.includes(lead.id));
    
    // Separate leads with and without phone numbers
    const leadsWithPhone = selectedLeadDetails.filter(lead => lead.phone);
    const leadsWithoutPhone = selectedLeadDetails.filter(lead => !lead.phone);
    
    // Notify about leads without phone numbers
    if (leadsWithoutPhone.length > 0) {
      const confirmProceed = window.confirm(
        `${leadsWithoutPhone.length} selected lead(s) do not have phone numbers and will be skipped. ` +
        `Do you want to proceed with sending WhatsApp messages to the remaining ${leadsWithPhone.length} lead(s)?`
      );
      
      if (!confirmProceed) {
        return;
      }
    }
    
    if (leadsWithPhone.length === 0) {
      alert('None of the selected leads have phone numbers.');
      return;
    }
    
    // Ask user how they want to send messages
    const sendMethod = window.confirm(
      `You have selected ${leadsWithPhone.length} lead(s) to send WhatsApp messages to.\n\n` +
      `Click OK to open all WhatsApp chats in new tabs simultaneously (recommended for small batches).\n` +
      `Click Cancel to open one chat at a time (recommended for large batches).`
    ) ? 'batch' : 'individual';
    
    let openedCount = 0;
    
    // Process each selected lead with phone number
    leadsWithPhone.forEach((lead, index) => {
      const personalizedMessage = messageTemplate.replace('{{name}}', lead.name);
      
      // Add activity to lead
      const activity = {
        type: 'whatsapp',
        title: 'WhatsApp Message Prepared',
        snippet: `Prepared: ${personalizedMessage.substring(0, 50)}${personalizedMessage.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString()
      };
      
      // Add activity to lead using DataContext function
      addLeadActivity(lead.id, activity);
      
      // Handle sending based on user preference
      if (sendMethod === 'batch') {
        // Batch mode: open all tabs with a small delay to prevent browser blocking
        setTimeout(() => {
          openWhatsAppChat(lead, personalizedMessage);
        }, index * 1000); // 1 second delay between each tab
      } else {
        // Individual mode: open one tab at a time
        if (index === 0) {
          openWhatsAppChat(lead, personalizedMessage);
          openedCount++;
          
          // Set up handler for opening subsequent chats
          const continueSending = () => {
            if (openedCount < leadsWithPhone.length) {
              const nextLead = leadsWithPhone[openedCount];
              const nextMessage = messageTemplate.replace('{{name}}', nextLead.name);
              openWhatsAppChat(nextLead, nextMessage);
              openedCount++;
              
              if (openedCount < leadsWithPhone.length) {
                const continueConfirm = window.confirm(
                  `WhatsApp chat opened for ${nextLead.name}.\n\n` +
                  `Click OK to continue with the next lead (${leadsWithPhone[openedCount].name}).\n` +
                  `Click Cancel to stop sending.`
                );
                
                if (continueConfirm) {
                  setTimeout(continueSending, 500);
                }
              } else {
                alert('All WhatsApp messages have been prepared.');
              }
            }
          };
          
          if (leadsWithPhone.length > 1) {
            const continueConfirm = window.confirm(
              `WhatsApp chat opened for ${lead.name}.\n\n` +
              `Click OK to continue with the next lead (${leadsWithPhone[1].name}).\n` +
              `Click Cancel to stop sending.`
            );
            
            if (continueConfirm) {
              setTimeout(continueSending, 500);
            }
          }
        }
      }
    });
    
    // Show completion message for batch mode
    if (sendMethod === 'batch') {
      setTimeout(() => {
        alert(`${leadsWithPhone.length} WhatsApp messages prepared. Check your browser tabs to send the messages.`);
      }, leadsWithPhone.length * 1000 + 500);
    }
  }, [selectedLeads, messageTemplate, leads, addLeadActivity]);

  const handleSendEmail = useCallback(async () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead');
      return;
    }
    
    if (!messageTemplate.trim()) {
      alert('Please enter a message template');
      return;
    }
    
    // Get selected lead details
    const selectedLeadDetails = leads.filter(lead => selectedLeads.includes(lead.id));
    
    // Process each selected lead
    for (const lead of selectedLeadDetails) {
      const personalizedMessage = messageTemplate.replace('{{name}}', lead.name);
      
      // Add activity to lead
      const activity = {
        type: 'email',
        title: 'Email Prepared',
        snippet: `Prepared: ${personalizedMessage.substring(0, 50)}${personalizedMessage.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString()
      };
      
      // Add activity to lead using DataContext function
      addLeadActivity(lead.id, activity);
      
      // Send email (if email is available)
      if (lead.email) {
        // Prepare email with proper encoding
        const subject = 'Regarding our services';
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(personalizedMessage);
        const mailtoUrl = `mailto:${lead.email}?subject=${encodedSubject}&body=${encodedBody}`;
        
        try {
          // Open email client
          window.open(mailtoUrl, '_blank');
          
          // Show success message
          console.log(`Email prepared for ${lead.name}`);
        } catch (error: unknown) {
          console.error('Error preparing email:', error);
          // Show alert with manual instructions
          alert(`Please follow these steps to send email to ${lead.name}:
1. Email address: ${lead.email}
2. Subject: ${subject}
3. Message: ${personalizedMessage}

Instructions:
- Copy the email address above
- Open your email client or webmail service
- Create a new email
- Paste the email address in the "To" field
- Add the subject
- Type or paste the message in the body
- Send the email`);
        }
      }
    }
    
    // Show completion message
    alert(`Emails prepared for ${selectedLeadDetails.filter(lead => lead.email).length} leads. 
Check your email client to send the emails.`);
  }, [selectedLeads, messageTemplate, leads, addLeadActivity]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-2">Outreach Messaging</h1>
        <p className="text-sm md:text-base text-[#64748B]">Send personalized messages to your leads via WhatsApp or Email</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg border border-border rounded-xl shadow-sm card">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-[#0F172A]">Select Leads</h2>
              <p className="text-sm text-[#64748B] mt-1">Choose which leads to send your message to</p>
            </div>
            
            <div className="p-5">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedLeads.length === availableLeads.length && availableLeads.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#2563EB] rounded focus:ring-[#2563EB] border-border"
                />
                <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-[#0F172A]">
                  Select All ({availableLeads.length} available)
                </label>
              </div>
              
              <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {availableLeads.length > 0 ? (
                  availableLeads.map(lead => (
                    <div key={lead.id} className="flex items-center p-3 rounded-lg border border-border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`lead-${lead.id}`}
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleLeadSelection(lead.id)}
                        className="h-4 w-4 text-[#2563EB] rounded focus:ring-[#2563EB] border-border"
                      />
                      <label htmlFor={`lead-${lead.id}`} className="ml-3 flex-1 min-w-0 cursor-pointer">
                        <p className="text-sm font-medium text-[#0F172A] truncate">{lead.name}</p>
                        <p className="text-xs text-[#64748B] truncate">{lead.email}</p>
                      </label>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'Contacted' ? 'bg-amber-100 text-amber-800' :
                        lead.status === 'Interested' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-[#0F172A]">No available leads</h3>
                    <p className="mt-1 text-sm text-[#64748B]">There are no leads available for outreach.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Composition Panel */}
        <div className="lg:col-span-2">
          <div className="bg-card-bg border border-border rounded-xl shadow-sm card">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-[#0F172A]">Compose Message</h2>
              <p className="text-sm text-[#64748B] mt-1">Create your outreach message template</p>
            </div>
            
            <div className="p-5">
              <div className="mb-6">
                <label htmlFor="messageTemplate" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Message Template
                </label>
                <textarea
                  id="messageTemplate"
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hello {{name}}, I wanted to reach out regarding..."
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                ></textarea>
                <p className="mt-2 text-xs text-[#64748B]">
                  Use {'{{name}}'} to personalize the message with the lead's name
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleSendWhatsApp}
                  disabled={selectedLeads.length === 0 || !messageTemplate.trim()}
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm flex items-center ${
                    selectedLeads.length === 0 || !messageTemplate.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send WhatsApp
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={selectedLeads.length === 0 || !messageTemplate.trim()}
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm flex items-center ${
                    selectedLeads.length === 0 || !messageTemplate.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
