import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserIcon from "../components/UserIcon";
import apiService from "../services/api";
import { motion } from "framer-motion";
import { User, Mail, Phone, Briefcase, GraduationCap, MapPin, Building, Key, Edit2, Save, X } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Forgot password flow state
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: hidden, 1: phone, 2: otp, 3: new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [expectedOtp, setExpectedOtp] = useState("");
  const [showNewPasswords, setShowNewPasswords] = useState({
    new: false,
    confirm: false,
  });

  // Form state for editing
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    college: "",
    collegeOther: "",
    passingMonth: "",
    passingYear: "",
    barCouncilId: "",
    city: "",
    cityOther: "",
    registrationNo: "",
    companySize: "",
    designation: "",
  });

  // Static data
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
    "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Other"
  ];
  const colleges = [
    "National Law School of India University, Bangalore",
    "National Academy of Legal Studies and Research, Hyderabad",
    "West Bengal National University of Juridical Sciences, Kolkata",
    "National Law Institute University, Bhopal",
    "Gujarat National Law University, Gandhinagar",
    "Rajiv Gandhi National University of Law, Patiala",
    "Other"
  ];
  const companySizes = ["1-5", "6-20", "21-50", "51-200", "200+"];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Initialize edit data when user data is available
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profession: user.profession || "",
        college: user.college || "",
        collegeOther: user.collegeOther || "",
        passingMonth: user.passingMonth || "",
        passingYear: user.passingYear || "",
        barCouncilId: user.barCouncilId || "",
        city: user.city || "",
        cityOther: user.cityOther || "",
        registrationNo: user.registrationNo || "",
        companySize: user.companySize || "",
        designation: user.designation || "",
      });
    }
  }, [user]);

  // OTP Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };


  const toggleNewPasswordVisibility = (field) => {
    setShowNewPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setMessage("Updating profile...");

    try {
      // Update user data in auth context
      const updatedUserData = {
        ...user,
        ...editData
      };
      login(updatedUserData); // This will update the context and localStorage

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    // Reset edit data to original user data
    setEditData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      profession: user.profession || "",
      college: user.college || "",
      collegeOther: user.collegeOther || "",
      passingMonth: user.passingMonth || "",
      passingYear: user.passingYear || "",
      barCouncilId: user.barCouncilId || "",
      city: user.city || "",
      cityOther: user.cityOther || "",
      registrationNo: user.registrationNo || "",
      companySize: user.companySize || "",
      designation: user.designation || "",
    });
    setIsEditing(false);
    setError("");
  };


  const handleForgotPassword = () => {
    setForgotPasswordStep(1);
    setForgotPasswordData(prev => ({ ...prev, phone: user.phone || "" }));
    setError("");
    setMessage("");
  };

  const handleRequestResetOTP = async () => {
    if (!forgotPasswordData.phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("Sending OTP...");

    try {
      await apiService.sendVerificationCode(forgotPasswordData.phone);
      setOtpSent(true);
      setOtpTimer(60);
      setForgotPasswordStep(2);
      setMessage(`OTP sent successfully to ${apiService.formatPhoneNumber(forgotPasswordData.phone)}!`);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async () => {
    if (!forgotPasswordData.otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiService.verifyPhone(forgotPasswordData.phone, forgotPasswordData.otp);
      if (data.verified) {
        setForgotPasswordStep(3);
        setMessage("OTP verified! Please set your new password.");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotPasswordData.newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (forgotPasswordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("Resetting password...");

    try {
      // In a real app, you would call your API to reset password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage("Password reset successfully!");
      setForgotPasswordStep(0);
      setForgotPasswordData({
        phone: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtpSent(false);
      setOtpTimer(0);
      setExpectedOtp("");
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
    setLoading(false);
  };

  const handleCancelForgotPassword = () => {
    setForgotPasswordStep(0);
    setForgotPasswordData({
      phone: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOtpSent(false);
    setOtpTimer(0);
    setExpectedOtp("");
    setError("");
    setMessage("");
  };

  const resendOTP = () => {
    if (otpTimer === 0) {
      handleRequestResetOTP();
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .opacity-3 {
          opacity: 0.03;
        }
        .opacity-5 {
          opacity: 0.05;
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
      <div className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Modern Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl overflow-hidden mb-6"
          >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-gradient-to-br from-transparent to-blue-50 rounded-bl-full "></div>
          <div className="absolute bottom-0 left-0 w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-gradient-to-tr from-transparent to-orange-50 rounded-tr-full"></div>
          
            {/* Profile Header */}
            <div className="px-6 sm:px-8 py-8 sm:py-10 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-2xl">
                    <UserIcon size="lg" showSelector={false} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left w-full sm:w-auto min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white" style={{ fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                    {user?.name || 'User'}
                  </h1>
                  <p className="text-blue-100 text-base mb-3 break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {user?.email || user?.phone || 'No contact info'}
                  </p>
                  {user?.profession && (
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                      {user.profession}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30 flex items-center gap-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <Edit2 className="w-5 h-5" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center gap-2"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {loading ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30 flex items-center gap-2"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span style={{ fontFamily: 'Roboto, sans-serif' }}>{error}</span>
              </div>
            </motion.div>
          )}
          
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span style={{ fontFamily: 'Roboto, sans-serif' }}>{message}</span>
              </div>
            </motion.div>
          )}

          {/* Profile Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="space-y-6 sm:space-y-8 ">
              {/* Basic Information */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-gray-200 relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-tr from-orange-100 to-transparent rounded-tr-full"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                      Basic Information
                    </h3>
                  </div>
                
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        />
                      ) : (
                        <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email ID
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        />
                      ) : (
                        <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.email || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number
                      </label>
                      <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border-2 border-gray-200 text-gray-600 shadow-sm text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <span className="break-all">{user.phone || 'Not provided'}</span>
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">Cannot be changed</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        Profession
                      </label>
                      <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border-2 border-gray-200 text-gray-600 shadow-sm text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {user.profession || 'Not specified'}
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">Cannot be changed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profession-specific Information */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-gray-200 relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-full"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                      {user.profession} Details
                    </h3>
                  </div>

                {user.profession === "Student" && (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        College
                      </label>
                      {isEditing ? (
                        <select
                          name="college"
                          value={editData.college}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        >
                          <option value="">Select college</option>
                          {colleges.map(college => (
                            <option key={college} value={college}>{college}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.college || 'Not provided'}
                        </p>
                      )}
                    </div>

                    {user.college === "Other" && (
                      <div className="mb-4 sm:mb-6">
                        <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          College Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="collegeOther"
                            value={editData.collegeOther}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          />
                        ) : (
                          <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {user.collegeOther || 'Not provided'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Passing Month
                        </label>
                        {isEditing ? (
                          <select
                            name="passingMonth"
                            value={editData.passingMonth}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          >
                            <option value="">Select month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {user.passingMonth || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Passing Year
                        </label>
                        {isEditing ? (
                          <select
                            name="passingYear"
                            value={editData.passingYear}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          >
                            <option value="">Select year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {user.passingYear || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {user.profession === "Lawyer" && (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        Bar Council ID
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="barCouncilId"
                          value={editData.barCouncilId}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        />
                      ) : (
                        <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.barCouncilId || 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        City
                      </label>
                      {isEditing ? (
                        <select
                          name="city"
                          value={editData.city}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        >
                          <option value="">Select city</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.city || 'Not provided'}
                        </p>
                      )}
                    </div>
                    {user.city === "Other" && (
                      <div className="mb-4 sm:mb-6">
                        <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          City Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="cityOther"
                            value={editData.cityOther}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          />
                        ) : (
                          <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {user.cityOther || 'Not provided'}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {user.profession === "Law Firm" && (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        Registration Number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="registrationNo"
                          value={editData.registrationNo}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        />
                      ) : (
                        <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.registrationNo || 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        Company Size
                      </label>
                      {isEditing ? (
                        <select
                          name="companySize"
                          value={editData.companySize}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        >
                          <option value="">Select company size</option>
                          {companySizes.map(size => (
                            <option key={size} value={size}>{size} employees</option>
                          ))}
                        </select>
                      ) : (
                        <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.companySize ? `${user.companySize} employees` : 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        City
                      </label>
                      {isEditing ? (
                        <select
                          name="city"
                          value={editData.city}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                        >
                          <option value="">Select city</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.city || 'Not provided'}
                        </p>
                      )}
                    </div>
                    {user.city === "Other" && (
                      <div className="mb-4 sm:mb-6">
                        <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          City Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="cityOther"
                            value={editData.cityOther}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          />
                        ) : (
                          <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {user.cityOther || 'Not provided'}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {user.profession === "Other" && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                      Designation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="designation"
                        value={editData.designation}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                        style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                      />
                    ) : (
                      <p className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {user.designation || 'Not provided'}
                      </p>
                    )}
                  </div>
                )}
              </div>
              </div>

              {/* Password Section */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md border border-gray-200 relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                      Password & Security
                    </h3>
                    <p className="text-gray-600 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Manage your password and security settings
                    </p>
                  </div>
                </div>

                {forgotPasswordStep === 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-gradient-to-r from-white to-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm">
                    <div>
                      <p className="text-gray-700 font-semibold text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Password Security
                      </p>
                      <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Last updated: Never (set during signup)
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <button
                        onClick={handleForgotPassword}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Password
                        </span>
                      </button>
                    </div>
                  </div>
              ) : (
                <div className="space-y-4">
                  {/* Step 1: Phone Number */}
                  {forgotPasswordStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Reset Password
                        </h4>
                        <button
                          onClick={handleCancelForgotPassword}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={forgotPasswordData.phone}
                          onChange={handleForgotPasswordChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          placeholder="Enter phone number (e.g., 9313507346)"
                        />
                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Enter your 10-digit mobile number. We'll automatically add the +91 country code for India.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleRequestResetOTP}
                          disabled={loading}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {loading ? "Sending..." : "Send OTP"}
                        </button>
                        <button
                          onClick={handleCancelForgotPassword}
                          className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: OTP Verification */}
                  {forgotPasswordStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Verify OTP
                        </h4>
                        <button
                          onClick={handleCancelForgotPassword}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Enter 6-digit OTP *
                        </label>
                        <input
                          type="text"
                          name="otp"
                          value={forgotPasswordData.otp}
                          onChange={handleForgotPasswordChange}
                          maxLength="6"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-center text-2xl tracking-widest"
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                          placeholder="000000"
                        />
                        <p className="text-sm mt-2" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                          OTP sent to {forgotPasswordData.phone.replace(/(\d{2})\d{5}(\d{4})/, '$1*****$2')}
                        </p>
                        {otpTimer > 0 && (
                          <p className="text-sm mt-1" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                            Resend in {otpTimer}s
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerifyResetOTP}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Verify OTP
                        </button>
                        {otpTimer === 0 && (
                          <button
                            onClick={resendOTP}
                            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            Resend OTP
                          </button>
                        )}
                        <button
                          onClick={handleCancelForgotPassword}
                          className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: New Password */}
                  {forgotPasswordStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Set New Password
                        </h4>
                        <button
                          onClick={handleCancelForgotPassword}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={forgotPasswordData.newPassword}
                            onChange={handleForgotPasswordChange}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => toggleNewPasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPasswords.new ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Password must be at least 8 characters long
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={forgotPasswordData.confirmPassword}
                            onChange={handleForgotPasswordChange}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => toggleNewPasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleResetPassword}
                          disabled={loading}
                          className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {loading ? "Resetting..." : "Reset Password"}
                        </button>
                        <button
                          onClick={handleCancelForgotPassword}
                          className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
