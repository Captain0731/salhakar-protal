import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  FileText,
  BookOpen,
  Map,
  Youtube,
  User,
  LayoutDashboard,
  LogOut,
  X,
  StickyNote,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import UserIcon from '../UserIcon';

const Sidebar = ({ isOpen, onClose, isMobile, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [judgmentsOpen, setJudgmentsOpen] = useState(false);
  const [lawLibraryOpen, setLawLibraryOpen] = useState(false);
  const [lawMappingOpen, setLawMappingOpen] = useState(false);

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      exact: true
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      hasDropdown: true,
      children: [
        {
          id: 'notes',
          label: 'Notes',
          icon: StickyNote,
          path: '/dashboard?tab=notes'
        },
        {
          id: 'bookmarks',
          label: 'Bookmarks',
          icon: Bookmark,
          path: '/dashboard?tab=bookmarks'
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: Calendar,
          path: '/dashboard?tab=calendar'
        }
      ]
    },
    {
      id: 'judgments',
      label: 'Legal Judgment',
      icon: FileText,
      path: '/judgment-access',
      hasDropdown: true,
      children: [
        {
          id: 'high-court',
          label: 'High Courts Judgment',
          icon: FileText,
          path: '/judgment-access?courtType=highcourt'
        },
        {
          id: 'supreme-court',
          label: 'Supreme Court Judgments',
          icon: FileText,
          path: '/judgment-access?courtType=supremecourt'
        }
      ]
    },
    {
      id: 'library',
      label: 'Law Library',
      icon: BookOpen,
      path: '/law-library',
      hasDropdown: true,
      children: [
        {
          id: 'central-acts',
          label: 'Central Acts',
          icon: BookOpen,
          path: '/law-library?section=central'
        },
        {
          id: 'state-acts',
          label: 'State Acts',
          icon: BookOpen,
          path: '/law-library?section=state'
        }
      ]
    },
    {
      id: 'mapping',
      label: 'Law Mapping',
      icon: Map,
      path: '/law-mapping',
      hasDropdown: true,
      children: [
        {
          id: 'ipc-bns',
          label: 'IPC ↔ BNS',
          icon: Map,
          path: '/law-mapping?type=bns_ipc'
        },
        {
          id: 'iea-bsa',
          label: 'IEA ↔ BSA',
          icon: Map,
          path: '/law-mapping?type=bsa_iea'
        },
        {
          id: 'crpc-bnss',
          label: 'CrPC ↔ BNSS',
          icon: Map,
          path: '/law-mapping?type=bnss_crpc'
        }
      ]
    },
    {
      id: 'youtube',
      label: 'YouTube Summarizer',
      icon: Youtube,
      path: '/youtube-summary'
    }
  ];

  const bottomMenuItems = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: User,
      path: '/profile'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    // Handle dashboard tab paths
    if (path.includes('?tab=')) {
      const [basePath, queryString] = path.split('?');
      const params = new URLSearchParams(queryString);
      const tab = params.get('tab');
      
      if (location.pathname === basePath) {
        const currentParams = new URLSearchParams(location.search);
        const currentTab = currentParams.get('tab');
        return currentTab === tab;
      }
    }
    // Handle judgment courtType paths
    if (path.includes('?courtType=')) {
      const [basePath, queryString] = path.split('?');
      const params = new URLSearchParams(queryString);
      const courtType = params.get('courtType');
      
      if (location.pathname === basePath) {
        const currentParams = new URLSearchParams(location.search);
        const currentCourtType = currentParams.get('courtType');
        return currentCourtType === courtType;
      }
    }
    // Handle law library section paths
    if (path.includes('?section=')) {
      const [basePath, queryString] = path.split('?');
      const params = new URLSearchParams(queryString);
      const section = params.get('section');
      
      if (location.pathname === basePath) {
        const currentParams = new URLSearchParams(location.search);
        const currentSection = currentParams.get('section');
        return currentSection === section;
      }
    }
    // Handle law mapping type paths
    if (path.includes('?type=')) {
      const [basePath, queryString] = path.split('?');
      const params = new URLSearchParams(queryString);
      const type = params.get('type');
      
      if (location.pathname === basePath) {
        const currentParams = new URLSearchParams(location.search);
        const currentType = currentParams.get('type');
        return currentType === type;
      }
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    if (isMobile) {
      onClose();
    }
  };

  // Auto-open dashboard dropdown when on dashboard with notes, bookmarks, or calendar tab
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab === 'notes' || tab === 'bookmarks' || tab === 'calendar') {
        setDashboardOpen(true);
      } else {
        setDashboardOpen(false);
      }
    } else {
      setDashboardOpen(false);
    }
  }, [location.pathname, location.search]);

  // Auto-open judgments dropdown when on judgment-access page with courtType
  useEffect(() => {
    if (location.pathname === '/judgment-access') {
      const params = new URLSearchParams(location.search);
      const courtType = params.get('courtType');
      if (courtType === 'highcourt' || courtType === 'supremecourt') {
        setJudgmentsOpen(true);
      } else {
        setJudgmentsOpen(false);
      }
    } else {
      setJudgmentsOpen(false);
    }
  }, [location.pathname, location.search]);

  // Auto-open law library dropdown when on law-library page with section
  useEffect(() => {
    if (location.pathname === '/law-library') {
      const params = new URLSearchParams(location.search);
      const section = params.get('section');
      if (section === 'central' || section === 'state') {
        setLawLibraryOpen(true);
      } else {
        setLawLibraryOpen(false);
      }
    } else {
      setLawLibraryOpen(false);
    }
  }, [location.pathname, location.search]);

  // Auto-open law mapping dropdown when on law-mapping page with type
  useEffect(() => {
    if (location.pathname === '/law-mapping') {
      const params = new URLSearchParams(location.search);
      const type = params.get('type');
      if (type === 'bns_ipc' || type === 'bsa_iea' || type === 'bnss_crpc') {
        setLawMappingOpen(true);
      } else {
        setLawMappingOpen(false);
      }
    } else {
      setLawMappingOpen(false);
    }
  }, [location.pathname, location.search]);

  // Close all dropdowns when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setDashboardOpen(false);
      setJudgmentsOpen(false);
      setLawLibraryOpen(false);
      setLawMappingOpen(false);
    }
  }, [isCollapsed]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-2xl z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64 sm:w-64'}
          flex flex-col
          overflow-y-auto
        `}
        style={{
          borderRight: '2px solid #E5E7EB',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Sidebar Header */}
         <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-gray-100 relative">
           {!isCollapsed && (
             <div
               className="flex items-center cursor-pointer group flex-1"
               onClick={() => handleNavigation('/')}
             >
               <img
                 src="/logo4.png"
                 alt="सलहाकार Logo"
                 className="h-12 sm:h-14 lg:h-16 w-auto object-contain transition-transform group-hover:scale-110 mx-auto"
                 onError={(e) => {
                   if (e.target.src.includes('logo4.png')) {
                     e.target.src = '/logo.png';
                   }
                 }}
               />
             </div>
           )}
           {isCollapsed && (
             <div
               className="flex items-center cursor-pointer group w-full justify-center"
               onClick={() => handleNavigation('/')}
             >
               <img
                 src="/logo4.png"
                 alt="सलहाकार Logo"
                 className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
                 onError={(e) => {
                   if (e.target.src.includes('logo4.png')) {
                     e.target.src = '/logo.png';
                   }
                 }}
               />
             </div>
           )}
           <div className="flex items-center gap-2">
             {!isMobile && (
               <button
                 onClick={onToggleCollapse}
                 className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                 aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
               >
                 <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} style={{ color: '#1E65AD' }} />
               </button>
             )}
             {isMobile && (
               <button
                 onClick={onClose}
                 className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                 aria-label="Close sidebar"
               >
                 <X className="w-6 h-6" style={{ color: '#1E65AD' }} />
               </button>
             )}
           </div>
         </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-3 sm:py-4 overflow-y-auto">
          <div className="px-2 sm:px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasDropdown = item.hasDropdown;
              const active = item.path ? isActive(item.path, item.exact) : false;
              
              // Check if dashboard is open (either manually opened or on dashboard with a tab)
              const isDashboardOpen = item.id === 'dashboard' && (
                dashboardOpen || 
                (location.pathname === '/dashboard' && 
                 (location.search.includes('tab=notes') || 
                  location.search.includes('tab=bookmarks') || 
                  location.search.includes('tab=calendar')))
              );

              // Check if judgments is open (either manually opened or on judgment-access page)
              const isJudgmentsOpen = item.id === 'judgments' && (
                judgmentsOpen || 
                (location.pathname === '/judgment-access' && 
                 (location.search.includes('courtType=highcourt') || 
                  location.search.includes('courtType=supremecourt')))
              );

              // Check if law library is open (either manually opened or on law-library page with section)
              const isLawLibraryOpen = item.id === 'library' && (
                lawLibraryOpen || 
                (location.pathname === '/law-library' && 
                 (location.search.includes('section=central') || 
                  location.search.includes('section=state')))
              );

              // Check if law mapping is open (either manually opened or on law-mapping page with type)
              const isLawMappingOpen = item.id === 'mapping' && (
                lawMappingOpen || 
                (location.pathname === '/law-mapping' && 
                 (location.search.includes('type=bns_ipc') || 
                  location.search.includes('type=bsa_iea') || 
                  location.search.includes('type=bnss_crpc')))
              );

              if (hasDropdown) {
                return (
                  <div key={item.id} className="mb-1">
                    <button
                      onClick={() => {
                        if (isCollapsed) {
                          // When collapsed, just navigate to the main path
                          handleNavigation(item.path);
                        } else {
                          // When expanded, toggle dropdown
                          if (item.id === 'dashboard') {
                            if (isDashboardOpen) {
                              setDashboardOpen(false);
                            } else {
                              setDashboardOpen(true);
                            }
                            handleNavigation(item.path);
                          } else if (item.id === 'judgments') {
                            if (isJudgmentsOpen) {
                              setJudgmentsOpen(false);
                            } else {
                              setJudgmentsOpen(true);
                            }
                            handleNavigation(item.path);
                          } else if (item.id === 'library') {
                            if (isLawLibraryOpen) {
                              setLawLibraryOpen(false);
                            } else {
                              setLawLibraryOpen(true);
                            }
                            handleNavigation(item.path);
                          } else if (item.id === 'mapping') {
                            if (isLawMappingOpen) {
                              setLawMappingOpen(false);
                            } else {
                              setLawMappingOpen(true);
                            }
                            handleNavigation(item.path);
                          }
                        }
                      }}
                      className={`
                        w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                        transition-all duration-200
                        ${active || isDashboardOpen || isJudgmentsOpen || isLawLibraryOpen || isLawMappingOpen
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'hover:bg-gray-50 text-gray-700'
                        }
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span
                            className="font-semibold text-sm sm:text-base"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        (isDashboardOpen || isJudgmentsOpen || isLawLibraryOpen || isLawMappingOpen) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )
                      )}
                    </button>
                    {!isCollapsed && (isDashboardOpen || isJudgmentsOpen || isLawLibraryOpen || isLawMappingOpen) && item.children && (
                      <div className="mt-1 ml-4 space-y-1 border-l-2 border-blue-100 pl-3">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.path);
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleNavigation(child.path)}
                              className={`
                                w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg
                                transition-all duration-200
                                ${childActive 
                                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                                  : 'hover:bg-gray-50 text-gray-600'
                                }
                              `}
                            >
                              <ChildIcon className="w-4 h-4 flex-shrink-0" />
                              <span
                                className="font-medium text-xs sm:text-sm whitespace-nowrap truncate"
                                style={{ fontFamily: 'Roboto, sans-serif' }}
                              >
                                {child.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : ''} gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                    transition-all duration-200
                    ${active 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span
                      className="font-semibold text-sm sm:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section - Profile, Dashboard, Logout */}
        <div className="border-t-2 border-gray-100 p-3 sm:p-4 space-y-2 flex-shrink-0">
          {/* Bottom Menu Items */}
          {isAuthenticated && (
            <div className="space-y-1">
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center ${isCollapsed ? 'justify-center' : ''} gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                      transition-all duration-200
                      ${active 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span
                        className="font-semibold text-sm sm:text-base"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Logout Button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200 mt-2`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && (
                <span className="font-semibold text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Logout
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleNavigation('/login')}
              className={`w-full ${isCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'} rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg`}
              style={{
                backgroundColor: '#1E65AD',
                color: '#FFFFFF',
                fontFamily: 'Roboto, sans-serif'
              }}
              title={isCollapsed ? 'Login' : ''}
            >
              {isCollapsed ? <User className="w-5 h-5" /> : 'Login'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

