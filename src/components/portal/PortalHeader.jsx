import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, Search, Mic } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const PortalHeader = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Home',
      '/dashboard': 'Dashboard',
      '/judgment-access': 'Legal Judgments',
      '/law-library': 'Law Library',
      '/law-mapping': 'Law Mapping',
      '/youtube-summary': 'YouTube Summarizer',
      '/legal-chatbot': 'Legal Chatbot',
      '/bookmarks': 'Bookmarks',
      '/profile': 'Profile'
    };
    return titles[path] || 'Portal';
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to search results or perform search
      navigate(`/judgment-access?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`
        sticky top-0 z-30 bg-white border-b transition-all duration-300
        ${isScrolled ? 'shadow-lg' : 'shadow-sm'}
      `}
      style={{ 
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Mobile: Logo / Desktop: Title */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Logo - Mobile Only, First */}
            <div
              className="flex items-center cursor-pointer group lg:hidden"
              onClick={() => navigate('/')}
            >
              <img
                src="/logo4.png"
                alt="सलहाकार Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-110"
                onError={(e) => {
                  if (e.target.src.includes('logo4.png')) {
                    e.target.src = '/logo.png';
                  }
                }}
              />
            </div>

            {/* Page Title - Desktop Only */}
            <div className="hidden lg:flex items-center gap-3">
              <h1
                className="text-xl font-bold"
                style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
              >
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search judgments, acts, laws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Voice search"
                title="Voice search"
              >
                <Mic className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Right Section - LanguageSelector, Notifications, Grid (Mobile) / Notifications & Language Selector (Desktop) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector - Mobile & Desktop */}
            <div className="flex-shrink-0">
              <LanguageSelector />
            </div>

            {/* Notifications - Mobile & Desktop */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" style={{ color: '#1E65AD' }} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Menu Button (Grid) - Mobile Only, Right Side Last */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" style={{ color: '#1E65AD' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;

