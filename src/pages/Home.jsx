import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  BookOpen, 
  Map, 
  Youtube, 
  LayoutDashboard,
  Mic,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import Stats from '../components/landing/Stats';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    {
      id: 'judgments',
      title: 'Legal Judgment',
      icon: FileText,
      path: '/judgment-access'
    },
    {
      id: 'library',
      title: 'Law Library',
      icon: BookOpen,
      path: '/law-library'
    },
    {
      id: 'mapping',
      title: 'Law Mapping',
      icon: Map,
      path: '/law-mapping'
    },
    {
      id: 'templates',
      title: 'Legal Templates',
      icon: FileText,
      path: '/legal-template'
    },
    {
      id: 'youtube',
      title: 'YouTube Summarizer',
      icon: Youtube,
      path: '/youtube-summary'
    },
    {
      id: 'dashboard',
      title: 'Smart Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    }
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/judgment-access?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Main Heading */}
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gray-900"
            style={{ fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
          >
            सलहाकार
          </h1>

          {/* Tagline */}
          <p 
            className="text-base sm:text-lg lg:text-xl text-gray-600 mb-2"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            India's first <span className="font-bold text-gray-900">AI-Powered</span> multilingual legal tech platform.
          </p>

          {/* Orange Line */}
          <div className="w-16 sm:w-20 h-0.5 bg-orange-500 mx-auto mb-8 sm:mb-12"></div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-8 sm:mb-12"
          >
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg border-2 border-gray-200 focus-within:border-blue-500 transition-all">
              <Search className="absolute left-4 sm:left-6 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Judgments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-12 sm:pl-16 pr-20 sm:pr-24 py-4 sm:py-5 text-base sm:text-lg rounded-2xl focus:outline-none"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
              <button
                className="absolute right-2 sm:right-3 w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                aria-label="Voice search"
              >
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </motion.div>

        </motion.div>
      </div>
      
      {/* Stats Section */}
      <Stats />
    </div>
  );
};

export default Home;
