import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Download, 
  Calendar as CalendarIcon, 
  Bookmark, 
  FileText as Note,
  ChevronRight,
  FileText,
  Clock,
  Star,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Plus,
  Eye,
  Share2,
  MoreVertical,
  BookOpen,
  Map
} from 'lucide-react';
import Calendar from '../components/dashboard/Calendar';
import Bookmarks from '../components/dashboard/Bookmarks';
import Notes from '../components/dashboard/Notes';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Get tab from URL query parameter
  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return (tab === 'notes' || tab === 'bookmarks' || tab === 'calendar') ? tab : 'home';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromURL());
  
  // Update activeTab when URL changes
  useEffect(() => {
    const tab = getTabFromURL();
    setActiveTab(tab);
  }, [location.search]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [notesCount, setNotesCount] = useState(0);
  const [notesLoading, setNotesLoading] = useState(false);

  // Clear bookmarks when user changes or logs out
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setBookmarks([]);
      setBookmarksLoading(false);
      return;
    }
  }, [isAuthenticated, user]);

  // Load bookmarks for dashboard
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!isAuthenticated || !user) {
        setBookmarks([]);
        return;
      }
      
      setBookmarksLoading(true);
      try {
        const response = await apiService.getUserBookmarks({ limit: 10 });
        if (response.bookmarks) {
          setBookmarks(response.bookmarks);
        } else {
          setBookmarks([]);
        }
      } catch (err) {
        console.error('Error loading bookmarks for dashboard:', err);
        setBookmarks([]);
      } finally {
        setBookmarksLoading(false);
      }
    };

    if (activeTab === 'home' && isAuthenticated && user) {
      loadBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [isAuthenticated, activeTab, user?.id]); // Add user.id dependency to reload when user changes

  // Load notes count for dashboard
  useEffect(() => {
    const loadNotesCount = async () => {
      if (!isAuthenticated || !user) {
        setNotesCount(0);
        return;
      }
      
      setNotesLoading(true);
      try {
        const response = await apiService.getNotes({ limit: 1 });
        if (response.success && response.data?.pagination) {
          setNotesCount(response.data.pagination.total || 0);
        } else if (Array.isArray(response)) {
          setNotesCount(response.length);
        } else {
          setNotesCount(0);
        }
      } catch (err) {
        console.error('Error loading notes count for dashboard:', err);
        setNotesCount(0);
      } finally {
        setNotesLoading(false);
      }
    };

    if (activeTab === 'home' && isAuthenticated && user) {
      loadNotesCount();
    } else {
      setNotesCount(0);
    }
  }, [isAuthenticated, activeTab, user?.id]);

  // Helper to get bookmark title
  const getBookmarkTitle = (bookmark) => {
    const item = bookmark.item || bookmark;
    if (bookmark.type === 'judgement') {
      return item.title || item.case_title || 'Untitled Judgment';
    } else if (bookmark.type === 'central_act' || bookmark.type === 'state_act') {
      return item.short_title || item.long_title || 'Untitled Act';
    } else if (bookmark.type === 'bns_ipc_mapping' || bookmark.type === 'bsa_iea_mapping') {
      return item.subject || item.title || 'Untitled Mapping';
    }
    return 'Untitled';
  };

  // Helper to get bookmark description
  const getBookmarkDescription = (bookmark) => {
    const item = bookmark.item || bookmark;
    if (bookmark.type === 'judgement') {
      return item.court_name || item.judge || 'Judgment';
    } else if (bookmark.type === 'central_act' || bookmark.type === 'state_act') {
      return item.ministry || item.year || 'Act';
    } else if (bookmark.type === 'bns_ipc_mapping') {
      return `IPC ${item.ipc_section || ''} → BNS ${item.bns_section || ''}`.trim() || 'Mapping';
    } else if (bookmark.type === 'bsa_iea_mapping') {
      return `IEA ${item.iea_section || ''} → BSA ${item.bsa_section || ''}`.trim() || 'Mapping';
    }
    return '';
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Perfect Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                    Dashboard
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Legal research overview
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Access Buttons - Notes, Bookmarks, Calendar */}
            <div className="mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Notes Button */}
                <button
                  onClick={() => {
                    setActiveTab('notes');
                    navigate('/dashboard?tab=notes', { replace: true });
                  }}
                  className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    activeTab === 'notes' 
                      ? 'bg-blue-50 border-blue-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${activeTab === 'notes' ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <Note className={`h-5 w-5 sm:h-6 sm:w-6 ${activeTab === 'notes' ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm sm:text-base font-semibold mb-1" style={{ 
                      color: activeTab === 'notes' ? '#1E65AD' : '#374151',
                      fontFamily: 'Helvetica Hebrew Bold, sans-serif' 
                    }}>
                      Notes
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {notesLoading ? 'Loading...' : `${notesCount} note${notesCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${activeTab === 'notes' ? 'text-blue-600' : 'text-gray-400'}`} />
                </button>

                {/* Bookmarks Button */}
                <button
                  onClick={() => {
                    setActiveTab('bookmarks');
                    navigate('/dashboard?tab=bookmarks', { replace: true });
                  }}
                  className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    activeTab === 'bookmarks' 
                      ? 'bg-orange-50 border-orange-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${activeTab === 'bookmarks' ? 'bg-orange-500' : 'bg-orange-100'}`}>
                    <Bookmark className={`h-5 w-5 sm:h-6 sm:w-6 ${activeTab === 'bookmarks' ? 'text-white' : 'text-orange-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm sm:text-base font-semibold mb-1" style={{ 
                      color: activeTab === 'bookmarks' ? '#CF9B63' : '#374151',
                      fontFamily: 'Helvetica Hebrew Bold, sans-serif' 
                    }}>
                      Bookmarks
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {bookmarksLoading ? 'Loading...' : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${activeTab === 'bookmarks' ? 'text-orange-600' : 'text-gray-400'}`} />
                </button>

                {/* Calendar Button */}
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    navigate('/dashboard?tab=calendar', { replace: true });
                  }}
                  className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    activeTab === 'calendar' 
                      ? 'bg-green-50 border-green-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${activeTab === 'calendar' ? 'bg-green-600' : 'bg-green-100'}`}>
                    <CalendarIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${activeTab === 'calendar' ? 'text-white' : 'text-green-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm sm:text-base font-semibold mb-1" style={{ 
                      color: activeTab === 'calendar' ? '#10B981' : '#374151',
                      fontFamily: 'Helvetica Hebrew Bold, sans-serif' 
                    }}>
                      Calendar
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      View events & schedule
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${activeTab === 'calendar' ? 'text-green-600' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

            {/* Perfect Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Legal Judgment Card */}
              <button
                onClick={() => navigate('/judgment-access')}
                className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Legal Judgment</p>
                    <p className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>16M+</p>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Search judgments</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm flex-shrink-0 ml-2" style={{ backgroundColor: '#1E65AD' }}>
                    <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </button>

              {/* Law Library Card */}
              <button
                onClick={() => navigate('/law-library')}
                className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Law Library</p>
                    <p className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1" style={{ color: '#CF9B63', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>11K+</p>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Browse acts</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm flex-shrink-0 ml-2" style={{ backgroundColor: '#CF9B63' }}>
                    <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </button>

              {/* Law Mapping Card */}
              <button
                onClick={() => navigate('/law-mapping')}
                className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Law Mapping</p>
                    <p className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1" style={{ color: '#8C969F', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>2.5K+</p>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Mapping types</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm flex-shrink-0 ml-2" style={{ backgroundColor: '#8C969F' }}>
                    <Map className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </button>
            </div>

            {/* Professional Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-4">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 sm:p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-semibold" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>Recent Activity</h2>
                    <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  {bookmarksLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Loading bookmarks...</p>
                    </div>
                  ) : bookmarks.length === 0 ? (
                    <div className="text-center py-4">
                      <Bookmark className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>No recent bookmarks</p>
                    </div>
                  ) : (
                    bookmarks.slice(0, 3).map((bookmark) => (
                      <div key={bookmark.id} className="flex items-start space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#CF9B63' }}>
                          <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {getBookmarkTitle(bookmark)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1 line-clamp-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {getBookmarkDescription(bookmark)}
                          </p>
                          <p className="text-xs text-gray-400" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {formatRelativeTime(bookmark.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Popular Resources */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 sm:p-5 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>Popular Resources</h2>
                </div>
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <button 
                    onClick={() => navigate('/judgment-access')}
                    className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="p-2 sm:p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#1E65AD' }}>
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Legal Judgments</p>
                        <p className="text-xs text-gray-500 line-clamp-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Search High Court & Supreme Court judgments</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                  </button>
                  
                  <button 
                    onClick={() => navigate('/law-library')}
                    className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="p-2 sm:p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#CF9B63' }}>
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Law Library</p>
                        <p className="text-xs text-gray-500 line-clamp-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Browse Central & State Acts</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                  </button>
                  
                  <button 
                    onClick={() => navigate('/law-mapping')}
                    className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="p-2 sm:p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#8C969F' }}>
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>Law Mapping</p>
                        <p className="text-xs text-gray-500 line-clamp-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Map IPC-BNS, IEA-BSA, CrPC-BNSS</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return <Calendar />;
      case 'bookmarks':
        return <Bookmarks />;
      case 'notes':
        return <Notes />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: '#F9FAFC' }}>
      {/* Main Content */}
      <div className="w-full">
        {/* Content Area */}
        <main className="w-full" style={{ backgroundColor: '#F9FAFC' }}>
          <div className="w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;