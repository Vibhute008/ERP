'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Derive active item from current pathname
  const getActiveItem = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/leads') return 'Leads';
    if (pathname === '/outreach') return 'Outreach';
    if (pathname === '/meetings') return 'Meetings';
    if (pathname === '/projects') return 'Projects';
    return 'Dashboard'; // default fallback
  };

  // Define navigation items with role-based visibility
  const getAllNavItems = () => {
    const items = [
      { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Founder'] },
      { name: 'Leads', icon: 'leads', path: '/leads', roles: ['Founder', 'Telecaller'] },
      { name: 'Outreach', icon: 'outreach', path: '/outreach', roles: ['Founder', 'Telecaller'] },
      { name: 'Meetings', icon: 'meetings', path: '/meetings', roles: ['Founder', 'Telecaller'] },
      { name: 'Projects', icon: 'projects', path: '/projects', roles: ['Founder', 'Tech Lead'] },
    ];

    // Filter items based on user role
    if (user) {
      return items.filter(item => item.roles.includes(user.role));
    }
    
    // Default to all items if user role is not available
    return items;
  };

  const navItems = getAllNavItems();

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simple icon component placeholders
  const renderIcon = (iconName: string) => {
    // In a real app, you would use actual icons from a library like Lucide or Heroicons
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {iconName === 'dashboard' && (
            <>
              <rect x="3" y="3" width="7" height="9" rx="1"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1"></rect>
            </>
          )}
          {iconName === 'leads' && (
            <>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </>
          )}
          {iconName === 'outreach' && (
            <>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </>
          )}
          {iconName === 'meetings' && (
            <>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
            </>
          )}
          {iconName === 'projects' && (
            <>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </>
          )}
          {iconName === 'tasks' && (
            <>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </>
          )}
          {iconName === 'activity' && (
            <>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </>
          )}
          {iconName === 'settings' && (
            <>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </>
          )}
          {iconName === 'logout' && (
            <>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </>
          )}
          {iconName === 'more' && (
            <>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </>
          )}
          {iconName === 'sun' && (
            <>
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </>
          )}
          {iconName === 'moon' && (
            <>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </>
          )}
        </svg>
      </div>
    );
  };

  const activeItem = getActiveItem();

  return (
    <div className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col pt-[32px] pb-[24px]">
      {/* Top Branding Section */}
      <div className="pl-[24px] pr-[24px]">
        {/* Logo Icon and Brand Name side by side */}
        <div className="flex items-center gap-[12px]">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.10)]">
            <img 
              src="/assets/logo.png" 
              alt="Raulo Enterprises Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-[20px] font-bold text-[#1E293B]">Raulo Ent.</h1>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="mt-[30px] flex flex-col gap-[4px]">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`h-[46px] flex items-center gap-[12px] pl-[18px] rounded-[8px] cursor-pointer transition-all duration-180 ease-in-out ${
              activeItem === item.name
                ? 'bg-[#E0E7FF] text-[#1D4ED8] font-semibold'
                : 'text-[#334155] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className={`${activeItem === item.name ? 'text-[#1D4ED8]' : 'text-[#334155]'}`}>
              {renderIcon(item.icon)}
            </div>
            <span className="text-[15px]">{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Spacer to push bottom section to the bottom */}
      <div className="flex-grow"></div>

      {/* Bottom Section Container */}
      <div className="mt-auto pl-[22px] pr-[16px]">
        {/* Partition Line */}
        <div className="w-full h-px bg-[#E2E8F0] mb-[24px]"></div>
        
        {/* User Profile Block */}
        <div 
          className="flex items-center gap-[12px] w-full h-[64px] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 ease-in-out cursor-pointer p-3 group relative border border-[#E2E8F0] shadow-sm hover:shadow-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {/* Subtle background glow effect on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          
          {/* User Avatar - showing first initial of role with enhanced styling */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-[0px_2px_6px_rgba(0,0,0,0.15)] ring-2 ring-white group-hover:shadow-[0px_4px_12px_rgba(0,0,0,0.2)] group-hover:ring-4 group-hover:ring-blue-100 transition-all duration-300 transform group-hover:scale-105">
            {user ? user.role.charAt(0) : 'U'}
            {/* Online status indicator dot */}
            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-[0px_0px_4px_rgba(34,197,94,0.5)] animate-pulse"></div>
          </div>
          
          {/* User Text Block - showing role instead of name with better layout */}
          <div className="flex flex-col flex-grow min-w-0">
            <div className="text-[16px] font-semibold text-[#1E293B] leading-[20px] truncate">
              {user ? user.role : 'User'}
            </div>
            <div className="text-[13px] text-[#64748B] leading-[18px] overflow-hidden text-ellipsis whitespace-nowrap">
              {user ? user.email : 'user@example.com'}
            </div>
          </div>
          
          {/* More Options Icon with better styling */}
          <div 
            className="text-text-secondary hover:text-text-primary cursor-pointer mr-[2px] relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            ref={menuRef}
          >
            {renderIcon('more')}
            
            {/* Dropdown Menu - Enhanced styling */}
            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-[200px] bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 card transform transition-all duration-200 ease-in-out animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="px-4 py-3 border-b border-[#F1F5F9]">
                  <div className="text-[15px] font-semibold text-[#1E293B] truncate">{user ? user.role : 'User'}</div>
                  <div className="text-[12px] text-[#64748B] truncate mt-1">{user ? user.email : 'user@example.com'}</div>
                </div>
                <div className="py-1">
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    <div className="text-red-600">
                      {renderIcon('logout')}
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;