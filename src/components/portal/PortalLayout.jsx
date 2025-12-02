import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';

const PortalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen && !isMobile ? (isCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''
        }`}
      >
        {/* Header */}
        <PortalHeader 
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden bg-gray-50">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default PortalLayout;

