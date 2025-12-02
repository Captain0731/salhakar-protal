// App.js
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import GoogleTranslate from "./components/GoogleTranslate";
import PortalLayout from "./components/portal/PortalLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import LegalJudgments from "./pages/LegalJudgments";
import ViewPDF from "./pages/ViewPDF";
import BrowseActs from "./pages/BrowseActs";
import LawLibrary from "./pages/LawLibrary";
import ActDetails from "./pages/ActDetails";
import MappingDetails from "./pages/MappingDetails";
import LawMapping from "./pages/LawMapping";
import LegalTemplate from "./pages/LegalTemplate";
import YoutubeVideoSummary from "./pages/YoutubeVideoSummary";
import LegalChatbot from "./pages/LegalChatbot";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Referral from "./pages/Referral";
import InviteFriends from "./pages/InviteFriends";
import EarnRewards from "./pages/EarnRewards";
import TrackReferrals from "./pages/TrackReferrals";
import OurTeam from "./pages/OurTeam";
import PricingPage from "./pages/PricingPage";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/NotesPage";
import LanguageSelectorDemo from "./pages/LanguageSelectorDemo";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Support from "./pages/Support";
import ProtectedRoute from "./components/ProtectedRoute";

import Chatbot from "./components/Chatbot";
import Footer from "./components/landing/Footer";
import CookieConsentPopup from "./components/CookieConsentPopup";

function AppLayout() {
  const location = useLocation();
  
  // Pages where chatbot should be hidden
  const hideChatbotPaths = [
    '/login',
    '/judgment',
    '/acts',
    '/mapping-details',
    '/law-library',
    '/legal-chatbot',
    '/law-mapping'
  ];
  
  // Pages where footer should be hidden
  const hideFooterPaths = [
    '/',
    '/home',
    '/login',
    '/dashboard',
    '/profile',
    '/judgment-access',
    '/judgment',
    '/acts',
    '/mapping-details',
    '/law-library',
    '/legal-chatbot',
    '/law-mapping'
  ];
  
  const shouldShowChatbot = !hideChatbotPaths.some(path => location.pathname.startsWith(path));
  const shouldShowFooter = !hideFooterPaths.some(path => {
    // Match exact path or paths that start with the excluded path followed by '/'
    return location.pathname === path || location.pathname.startsWith(path + '/');
  });
  
  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", overflowX: "hidden", width: "100%", maxWidth: "100vw", scrollbarWidth: "none", msOverflowStyle: "none" }} className="scrollbar-hide">
      {/* Google Translate Component - Global mount point */}
      <GoogleTranslate />
      {/* Cookie Consent Popup - Shows on first visit */}
      <CookieConsentPopup />
      {/* Chatbot Icon - Fixed position on all pages except specified ones */}
      {shouldShowChatbot && <Chatbot />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PortalLayout>
            <Home />
          </PortalLayout>
        } />
        <Route path="/home" element={
          <PortalLayout>
            <Home />
          </PortalLayout>
        } />
        <Route path="/login" element={<Login />} />
        {/* Signup route removed - redirecting to login */}
        <Route path="/signup" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/support" element={<Support />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/language-demo" element={<LanguageSelectorDemo />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        
        {/* Portal Routes - With Portal Layout */}
        <Route path="/judgment/:id?" element={
          <PortalLayout>
            <ViewPDF />
          </PortalLayout>
        } />
        <Route path="/law-library" element={
          <PortalLayout>
            <LawLibrary />
          </PortalLayout>
        } />
        <Route path="/browse-acts" element={
          <PortalLayout>
            <BrowseActs />
          </PortalLayout>
        } />
        <Route path="/acts/:id" element={
          <PortalLayout>
            <ActDetails />
          </PortalLayout>
        } />
        <Route path="/mapping-details" element={
          <PortalLayout>
            <MappingDetails />
          </PortalLayout>
        } />
        <Route path="/law-mapping" element={
          <PortalLayout>
            <LawMapping />
          </PortalLayout>
        } />
        <Route path="/youtube-summary" element={
          <PortalLayout>
            <YoutubeVideoSummary />
          </PortalLayout>
        } />
        <Route path="/legal-chatbot" element={
          <PortalLayout>
            <LegalChatbot />
          </PortalLayout>
        } />
        <Route path="/profile" element={
          <PortalLayout>
            <Profile />
          </PortalLayout>
        } />
        <Route path="/judgment-access" element={
          <PortalLayout>
            <LegalJudgments />
          </PortalLayout>
        } />
        <Route path="/bookmarks" element={
          <PortalLayout>
            <Bookmarks />
          </PortalLayout>
        } />
        <Route path="/dashboard" element={
          <PortalLayout>
            <Dashboard />
          </PortalLayout>
        } />
        <Route path="/notes/:id" element={
          <PortalLayout>
            <ProtectedRoute><NotesPage /></ProtectedRoute>
          </PortalLayout>
        } />
        <Route path="/chatbot" element={
          <PortalLayout>
            <LegalChatbot />
          </PortalLayout>
        } />
        
      </Routes>
      {/* Footer - Show on all pages except login, signup, dashboard, and profile */}
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
