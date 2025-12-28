import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BarChart3,
  Users,
  TrendingUp,
  CheckCircle,
  Smartphone,
  Lock,
  Clock,
  Globe,
  Star,
  MessageCircle,
  ChevronRight,
  GraduationCap,
  ChevronDown,
  Zap,
  Building2,
  UserCheck,
  FileText,
  Menu,
  X,
  Shield,
  Cloud,
  Database
} from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import schoolHero from '../assets/schoolhero.jpg';
import school2 from '../assets/school2.jpg';
import dashboard from '../assets/platform images/dashboard.png';
import dashboard2 from '../assets/platform images/dashboard2.png';
import studentList from '../assets/platform images/studentlistpgae.png';
import reportCard from '../assets/platform images/reportcardgeneratorpage.png';
import cbtDashboard from '../assets/platform images/cbtdashboard.png';
import questionBank from '../assets/platform images/questionbank.png';
import SEO from './SEO';
import PaystackLogo from './PaystackLogo';
import GoogleCloudLogo from './GoogleCloudLogo';

export default function LandingPage() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
      `}</style>

      <SEO
        title="SchoolHub - Complete School Management System | Report Cards, Attendance, Analytics & More"
        description="All-in-one school management platform for Nigerian schools. Generate report cards, track attendance, manage teachers & students, view analytics, handle subscriptions, CBT exams, and school accounting. Trusted by 100+ schools."
        keywords="school management system Nigeria, report card generator, student management system, school software Nigeria, attendance tracking system, teacher management, school analytics dashboard, school accounting software, fee management system, CBT exam software, grade management system, student report card generator, school administration software, education management system, school ERP software, student information system, school portal Nigeria, online report card, school fee payment, student attendance tracker"
        url="/"
      />
      <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={schoolLogo}
                alt="SchoolHub Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold" style={{color: '#1791C8'}}>
                SchoolHub
              </h1>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                to="/about"
                className="text-gray-700 hover:text-[#1791C8] transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-[#1791C8] transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-[#1791C8] transition-colors font-medium"
              >
                Contact
              </Link>
              <Link
                to="/faq"
                className="text-gray-700 hover:text-[#1791C8] transition-colors font-medium"
              >
                FAQ
              </Link>

              {/* Login Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  onMouseEnter={() => setShowLoginDropdown(true)}
                  className="flex items-center gap-1 px-4 py-2.5 text-gray-700 hover:text-[#1791C8] transition-colors font-medium"
                >
                  Login
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showLoginDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                    onMouseLeave={() => setShowLoginDropdown(false)}
                  >
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      School Login
                    </Link>
                    <Link
                      to="/teacher/login"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      Teacher Login
                    </Link>
                    <Link
                      to="/student/login"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      Student Portal
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/register"
                className="px-6 py-2.5 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                style={{backgroundColor: '#1791C8'}}
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#1791C8] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 animate-fade-in">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/about"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/pricing"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/faq"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>

                {/* Mobile Login Dropdown */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Login</p>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    School Login
                  </Link>
                  <Link
                    to="/teacher/login"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Teacher Login
                  </Link>
                  <Link
                    to="/student/login"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#1791C8] transition-colors font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Student Portal
                  </Link>
                </div>

                <Link
                  to="/register"
                  className="mx-4 px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-center"
                  style={{backgroundColor: '#1791C8'}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24" style={{background: 'linear-gradient(135deg, #E8F4FD 0%, #F0F9FF 50%, #EFF6FF 100%)'}}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm" style={{background: 'linear-gradient(135deg, #CCE7F7 0%, #B3DCF2 100%)', color: '#1791C8'}}>
                <GraduationCap className="w-5 h-5 animate-bounce" />
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
                  All-in-One School Management Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Manage Your School
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Smarter & Faster
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                Transform your school administration with our powerful platform. Generate report cards, manage students, track attendance, and so much more - all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/register"
                  className="group relative px-10 py-5 text-white rounded-2xl font-bold text-lg text-center overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  style={{background: 'linear-gradient(135deg, #1791C8 0%, #1478A6 100%)'}}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Free Trial
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>

                <a
                  href="https://wa.me/2347010123061?text=Hi%2C%20I%27d%20like%20to%20see%20a%20demo%20of%20SchoolHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-10 py-5 bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-800 rounded-2xl transition-all font-bold text-lg hover:border-blue-500 hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
                >
                  <span className="flex items-center justify-center gap-2">
                    Watch Demo
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </span>
                </a>
              </div>

              <div className="flex items-center gap-10 pt-6">
                <div className="text-center">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">100+</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Schools Using</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">10K+</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Students Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent flex items-center justify-center gap-1">
                    4.9
                    <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">User Rating</div>
                </div>
              </div>
            </div>

            <div className="relative lg:pl-10">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
                <img
                  src={schoolHero}
                  alt="Nigerian students in classroom learning"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20"></div>
              </div>

              {/* Floating elements with enhanced animations */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-pulse shadow-xl"></div>
              <div className="absolute top-1/2 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full animate-ping opacity-75"></div>

              {/* Floating card with stats */}
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-2xl p-6 backdrop-blur-lg bg-white/90 transform hover:scale-110 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1791C8 0%, #1478A6 100%)'}}>
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-600 font-semibold">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-sm font-bold text-blue-700 mb-3">
              <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
              TRUSTED BY SCHOOLS ACROSS NIGERIA
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap mt-6">
              {[
                { count: '100+', label: 'Active Schools', icon: Building2, color: 'from-blue-500 to-cyan-500' },
                { count: '10,000+', label: 'Students', icon: Users, color: 'from-purple-500 to-pink-500' },
                { count: '500+', label: 'Teachers', icon: UserCheck, color: 'from-green-500 to-emerald-500' },
                { count: '20K+', label: 'Report Cards', icon: FileText, color: 'from-orange-500 to-amber-500' }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{stat.count}</div>
                      <div className="text-xs text-gray-600 font-semibold">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Screenshots Section */}
      <section className="relative py-24 overflow-hidden" style={{background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'}}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg">
              <Smartphone className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white uppercase tracking-wide">Platform Preview</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="text-gray-900">See SchoolHub </span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                in Action
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Experience our beautifully designed, intuitive interface that makes
              <span className="text-blue-600 font-bold"> school management effortless</span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                { icon: Zap, text: 'Lightning Fast', color: 'text-yellow-600' },
                { icon: Star, text: 'Beautiful UI', color: 'text-purple-600' },
                { icon: Smartphone, text: 'Mobile Ready', color: 'text-blue-600' },
                { icon: Lock, text: 'Secure', color: 'text-green-600' }
              ].map((pill, index) => {
                const IconComponent = pill.icon;
                return (
                  <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg hover:scale-105 transition-all">
                    <IconComponent className={`w-5 h-5 ${pill.color}`} />
                    <span className="text-sm font-semibold text-gray-700">{pill.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Dashboard Screenshot with Browser Mockup */}
          <div className="mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-800 transform hover:scale-[1.02] transition-all duration-500">
              {/* Browser Header */}
              <div className="bg-gray-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-600 rounded-md px-4 py-1.5 text-xs text-gray-300 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>app.schoolhub.ng/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <div className="relative">
                <img
                  src={dashboard}
                  alt="SchoolHub Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900">Comprehensive Dashboard</h3>
                  <p className="text-sm text-gray-600">Get a complete overview of your school at a glance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Screenshots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: reportCard,
                title: 'Report Card Generator',
                description: 'Create professional report cards in minutes'
              },
              {
                image: studentList,
                title: 'Student Management',
                description: 'Manage all student records effortlessly'
              },
              {
                image: cbtDashboard,
                title: 'CBT Dashboard',
                description: 'Computer-based testing made simple'
              },
              {
                image: questionBank,
                title: 'Question Bank',
                description: 'Build and manage your exam questions'
              },
              {
                image: dashboard2,
                title: 'Analytics & Insights',
                description: 'Track performance with detailed analytics'
              },
              {
                image: dashboard,
                title: 'Real-time Updates',
                description: 'Stay informed with live data updates'
              }
            ].map((screenshot, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden bg-gray-100">
                  <img
                    src={screenshot.image}
                    alt={screenshot.title}
                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {screenshot.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Below Screenshots */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6 text-lg">Ready to experience SchoolHub?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Your Free Trial
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive school management features designed to streamline every aspect of your institution
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: BarChart3,
                title: 'Report Card Generator',
                description: 'Create beautiful, professional report cards in minutes with automatic grading and calculations. Customizable templates with school branding.',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: Users,
                title: 'Student Management',
                description: 'Centralized database for unlimited students. Manage profiles, enrollment, academic records, and track student progress effortlessly.',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: TrendingUp,
                title: 'Performance Analytics',
                description: 'Real-time dashboard with comprehensive analytics. Track academic trends, identify patterns, and make data-driven decisions.',
                gradient: 'from-orange-500 to-orange-600'
              },
              {
                icon: CheckCircle,
                title: 'Attendance Tracking',
                description: 'Monitor student attendance with automated reports, notifications, and detailed attendance history for every student.',
                gradient: 'from-green-500 to-green-600'
              },
              {
                icon: BookOpen,
                title: 'Computer-Based Testing (CBT)',
                description: 'Create and manage online exams, question banks, and automatic grading. Students take exams digitally with instant results.',
                gradient: 'from-indigo-500 to-indigo-600'
              },
              {
                icon: GraduationCap,
                title: 'Teacher Management',
                description: 'Unlimited teacher accounts with role-based permissions. Teachers can manage their classes, mark attendance, and create reports.',
                gradient: 'from-pink-500 to-pink-600'
              },
              {
                icon: Smartphone,
                title: 'Guardian/Parent Portal',
                description: 'Parents can track their children\'s academic progress, view report cards, check attendance, and stay connected with the school.',
                gradient: 'from-yellow-500 to-amber-600'
              },
              {
                icon: Users,
                title: 'Class Management',
                description: 'Organize students into classes and grade levels. Manage class schedules, subjects, and teacher assignments seamlessly.',
                gradient: 'from-red-500 to-red-600'
              },
              {
                icon: Lock,
                title: 'Secure & Reliable',
                description: 'Bank-level 256-bit SSL encryption, daily automatic backups, and cloud storage. Your data is always safe and accessible.',
                gradient: 'from-cyan-500 to-cyan-600'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl" style={{background: `linear-gradient(135deg, ${feature.gradient})`}}></div>

                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>

                    <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Learn more
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Features List */}
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-200 to-pink-200 rounded-full filter blur-3xl opacity-20"></div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-4">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">ALL-INCLUSIVE FEATURES</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                  Complete Feature Set
                </h3>
                <p className="text-xl text-gray-700 font-medium">
                  All features included in every plan - no hidden costs or limitations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Unlimited students',
                  'Unlimited teacher accounts',
                  'Report card generation',
                  'Student management system',
                  'Attendance tracking',
                  'Performance analytics dashboard',
                  'Real-time analytics',
                  'School branding & logo customization',
                  'Grade management',
                  'Class management',
                  'Student profiles & records',
                  'PDF export functionality',
                  'Mobile responsive access',
                  'Cloud storage',
                  'Daily automatic backups',
                  'Email support (24-hour response)',
                  'Subscription management',
                  'Computer-Based Testing (CBT)',
                  'Online exam creation & management',
                  'Question bank management',
                  'Automatic exam grading',
                  'Student exam portal',
                  'Guardian/Parent app access',
                  'Teacher portal',
                  'Student portal',
                  'Multiple user roles & permissions',
                  'School profile management',
                  'Bulk student import',
                  'Data export capabilities',
                  '256-bit SSL encryption',
                  'Secure authentication'
                ].map((feature, index) => (
                  <div key={index} className="group flex items-start gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:rotate-12 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl shadow-lg border-2 border-green-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-green-700 uppercase mb-0.5">Now Available</div>
                    <div className="font-bold text-gray-900">School Accounting & Fee Management</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 overflow-hidden" style={{background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'}}>
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-700 uppercase">Quick Setup</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Get Started in <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start managing your school efficiently in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up with your school email and basic information. No credit card required.',
                icon: Users,
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'Add Your Data',
                description: 'Import student records or add them manually. Set up your school structure.',
                icon: BookOpen,
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                step: '03',
                title: 'Start Managing',
                description: 'Generate report cards, track attendance, and manage all school operations.',
                icon: BarChart3,
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="relative group">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <span className="text-white font-extrabold text-lg">{item.step}</span>
                    </div>

                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Arrow connector */}
                  {index < 2 && (
                    <div className="hidden md:flex absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2 z-20">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Your Free Trial
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-gray-500 text-sm">No credit card required • 7-day free trial</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Schools Love SchoolHub
            </h2>
            <p className="text-xl text-gray-600">
              Join hundreds of schools transforming education management
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                {[
                  {
                    title: 'Save Time & Reduce Errors',
                    description: 'Automated calculations and grading eliminate manual errors and save hours of work.',
                    icon: Clock
                  },
                  {
                    title: 'Access Anywhere, Anytime',
                    description: 'Cloud-based system accessible from any device with internet connection.',
                    icon: Globe
                  },
                  {
                    title: 'Professional Results',
                    description: 'Generate beautiful, standardized documents that impress parents and authorities.',
                    icon: Star
                  },
                  {
                    title: 'Excellent Support',
                    description: '24/7 customer support to help you whenever you need assistance.',
                    icon: MessageCircle
                  }
                ].map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                        <IconComponent className="w-6 h-6" style={{color: '#1791C8'}} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={school2}
                  alt="Happy Nigerian students and teacher in classroom"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="relative hidden">
              <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xl italic mb-4">
                    "SchoolHub has transformed how we manage our school. What used to take days now takes minutes. Highly recommended!"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?w=100&h=100&fit=crop&auto=compress&cs=tinysrgb"
                      alt="Mrs. Adebayo"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                    />
                    <div>
                      <div className="font-bold">Mrs. Adebayo</div>
                      <div className="text-sm text-blue-100">Principal, Excellence Academy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden" style={{background: 'linear-gradient(135deg, #1791C8 0%, #1478A6 50%, #0D5A7F 100%)'}}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-bold text-white">LIMITED TIME OFFER</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Transform
            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Your School?
            </span>
          </h2>

          <p className="text-2xl mb-10 text-blue-100 font-medium max-w-3xl mx-auto">
            Join 100+ schools already using SchoolHub to streamline their operations and improve student outcomes
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8">
            <Link
              to="/register"
              className="group px-12 py-5 bg-white rounded-2xl hover:bg-gray-50 transition-all font-bold text-xl shadow-2xl transform hover:scale-110 flex items-center gap-3"
              style={{color: '#1791C8'}}
            >
              Get Started Free
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>

            <a
              href="https://wa.me/2347010123061?text=Hi%2C%20I%27d%20like%20to%20see%20a%20demo%20of%20SchoolHub"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-12 py-5 bg-transparent border-3 border-white text-white rounded-2xl hover:bg-white/20 backdrop-blur-sm transition-all font-bold text-xl shadow-xl transform hover:scale-110 flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Watch Demo
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold">7-day free trial</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Cloud Infrastructure Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Enterprise Security</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Data is Secure & Always Accessible
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by Google Cloud with bank-level security. Access your school data anytime, anywhere.
            </p>
          </div>

          {/* Google Cloud Badge */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-12 border-2 border-primary-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <GoogleCloudLogo className="h-16 w-auto flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Powered by Google Cloud</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      Official Partner
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Your school data runs on the same infrastructure that powers Google, YouTube, and Gmail—trusted by billions worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: '256-bit SSL encryption protects all your data',
                color: 'blue'
              },
              {
                icon: Cloud,
                title: 'Cloud Storage',
                description: 'Access your data from anywhere, anytime',
                color: 'green'
              },
              {
                icon: Database,
                title: 'Auto Backups',
                description: 'Daily automatic backups—never lose data',
                color: 'purple'
              },
              {
                icon: Globe,
                title: '99.9% Uptime',
                description: 'Always available when you need it',
                color: 'orange'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  feature.color === 'blue' ? 'bg-blue-100' :
                  feature.color === 'green' ? 'bg-green-100' :
                  feature.color === 'purple' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'blue' ? 'text-blue-600' :
                    feature.color === 'green' ? 'text-green-600' :
                    feature.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust Stats */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '100+', label: 'Schools Trust Us' },
                { value: '10K+', label: 'Students Protected' },
                { value: '99.9%', label: 'Uptime Guarantee' },
                { value: '24/7', label: 'Data Monitoring' }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-primary-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Security Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Secure Payments</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Your Payments Are Safe & Secure
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All transactions on our platform are protected by Paystack's enterprise-grade security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-primary-50 p-6 rounded-xl border border-primary-200">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PCI-DSS Compliant</h3>
              <p className="text-gray-600">
                Payment Card Industry Data Security Standard certified infrastructure ensures your payment data is protected at the highest level.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">256-bit Encryption</h3>
              <p className="text-gray-600">
                All sensitive data is encrypted using bank-level 256-bit SSL encryption during transmission and storage.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted by Thousands</h3>
              <p className="text-gray-600">
                Paystack processes payments for thousands of businesses across Africa with a 99.9% uptime guarantee.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3 mb-4">
              <div className="bg-white px-6 py-3 rounded-lg">
                <PaystackLogo className="w-40 h-auto" />
              </div>
              <h3 className="text-2xl font-bold text-white">Powered by Paystack</h3>
            </div>
            <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
              We partner with Paystack, Africa's leading payment gateway trusted by over 200,000 businesses.
              Your school fees, subscriptions, and all transactions are processed through their secure, reliable infrastructure.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Instant Settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Multiple Payment Methods</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Fraud Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={schoolLogo} 
                  alt="SchoolHub Logo" 
                  className="w-14 h-14 object-contain"
                />
                <span className="text-xl font-bold text-white">SchoolHub</span>
              </div>
              <p className="text-sm">Making school management simple and efficient for everyone.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 SchoolHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
