import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Heart, CheckCircle, TrendingUp, ChevronDown, Shield, Cloud, Lock, Database, Globe, Smartphone, Menu, X } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';
import GoogleCloudLogo from '../components/GoogleCloudLogo';

export default function About() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <SEO
        title="About Us - SchoolHub | Leading School Management Platform in Nigeria"
        description="Learn about SchoolHub's mission to transform education management in Nigeria. We help 500+ schools manage students, generate report cards, track attendance, and streamline operations."
        keywords="about schoolhub, school management company Nigeria, education technology Nigeria, school software provider, educational institutions management"
        url="/about"
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
            <div className="flex justify-between items-center h-20">
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
              <div className="lg:hidden py-4 border-t border-gray-200">
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
        <section className="py-20" style={{backgroundColor: '#E8F4FD'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Transforming School Management
                <span className="block mt-2" style={{color: '#1791C8'}}>
                  Across Nigeria
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                We're on a mission to empower educational institutions with modern technology,
                making school administration effortless and efficient for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    SchoolHub was born out of a simple observation: school administrators in Nigeria
                    were spending countless hours on manual paperwork, from generating report cards
                    to tracking student attendance.
                  </p>
                  <p>
                    We knew there had to be a better way. In 2024, we set out to build a comprehensive
                    school management platform that would automate these tedious tasks and give educators
                    more time to focus on what matters most - teaching and nurturing students.
                  </p>
                  <p>
                    Today, SchoolHub serves over 100 schools across Nigeria, managing more than 10,000
                    students and helping educators save thousands of hours every month. But we're just
                    getting started.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop"
                  alt="Students and teachers"
                  className="rounded-2xl shadow-2xl w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: 'Our Mission',
                  description: 'To empower every educational institution in Nigeria with technology that simplifies administration, enhances efficiency, and improves educational outcomes.',
                  color: '#1791C8'
                },
                {
                  icon: Award,
                  title: 'Our Vision',
                  description: 'To become the leading school management platform in Africa, setting the standard for excellence in educational technology and innovation.',
                  color: '#667eea'
                },
                {
                  icon: Heart,
                  title: 'Our Values',
                  description: 'Excellence, Innovation, Integrity, Customer Success, and Continuous Improvement drive everything we do at SchoolHub.',
                  color: '#f56565'
                }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{backgroundColor: `${item.color}20`}}>
                      <IconComponent className="w-8 h-8" style={{color: item.color}} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Impact in Numbers
              </h2>
              <p className="text-xl text-gray-600">
                Trusted by schools across Nigeria
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: '100+', label: 'Schools Using SchoolHub', icon: Users },
                { number: '10K+', label: 'Students Managed', icon: TrendingUp },
                { number: '500+', label: 'Teachers Empowered', icon: Award },
                { number: '20K+', label: 'Report Cards Generated', icon: CheckCircle }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#CCE7F7'}}>
                      <IconComponent className="w-10 h-10" style={{color: '#1791C8'}} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security & Infrastructure */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{backgroundColor: '#CCE7F7'}}>
                <Shield className="w-10 h-10" style={{color: '#1791C8'}} />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Enterprise-Grade Security & Infrastructure
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your school's data is our top priority. We've partnered with Google Cloud to ensure
                your information is secure, accessible, and always available.
              </p>
            </div>

            {/* Google Cloud Partnership Banner */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-2" style={{borderColor: '#1791C8'}}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <GoogleCloudLogo className="h-16 w-auto flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">Powered by Google Cloud</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        Trusted Partner
                      </span>
                    </div>
                    <p className="text-gray-600">
                      SchoolHub runs on Google Cloud Platform, the same infrastructure trusted by millions worldwide.
                      This partnership ensures world-class reliability, security, and performance for your school.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Bank-Level Security',
                  description: 'Your data is protected with 256-bit SSL encryption, the same security standard used by banks and financial institutions worldwide.',
                  color: '#1791C8'
                },
                {
                  icon: Cloud,
                  title: 'Cloud Storage & Backup',
                  description: 'All school data is securely stored in the cloud with automatic daily backups. Your information is safe from hardware failures and disasters.',
                  color: '#34A853'
                },
                {
                  icon: Globe,
                  title: 'Access Anywhere, Anytime',
                  description: 'Access your school data from any device, anywhere in the world. Whether you\'re at school, home, or on the go, your data is always available.',
                  color: '#4285F4'
                },
                {
                  icon: Lock,
                  title: 'Data Privacy & Compliance',
                  description: 'We comply with international data protection standards. Your school data is never shared with third parties and remains completely private.',
                  color: '#EA4335'
                },
                {
                  icon: Database,
                  title: 'Redundant Storage',
                  description: 'Your data is stored in multiple secure locations across Google Cloud\'s global infrastructure, ensuring it\'s never lost.',
                  color: '#FBBC04'
                },
                {
                  icon: Smartphone,
                  title: 'Multi-Device Sync',
                  description: 'Seamlessly access and manage your school data across desktop, tablet, and mobile devices with real-time synchronization.',
                  color: '#1791C8'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{backgroundColor: `${feature.color}15`}}>
                    <feature.icon className="w-7 h-7" style={{color: feature.color}} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Security Stats */}
            <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '99.9%', label: 'Uptime Guarantee', sublabel: 'Always accessible' },
                  { value: '256-bit', label: 'SSL Encryption', sublabel: 'Bank-level security' },
                  { value: '24/7', label: 'Monitoring', sublabel: 'Continuous protection' },
                  { value: 'Daily', label: 'Automatic Backups', sublabel: 'Never lose data' }
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold mb-2" style={{color: '#1791C8'}}>{stat.value}</div>
                    <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-500">{stat.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">
                  Trusted by 100+ Schools • Secured by Google Cloud • 10,000+ Students Protected
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20" style={{backgroundColor: '#E8F4FD'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Schools Choose SchoolHub
              </h2>
              <p className="text-xl text-gray-600">
                Built specifically for Nigerian educational institutions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                'Easy to use - no technical expertise required',
                'Affordable pricing designed for Nigerian schools',
                'Powered by Google Cloud infrastructure',
                'Local customer support in Nigeria',
                'Regular updates and new features',
                'Bank-level security with 256-bit encryption',
                'Access from anywhere, on any device',
                'Automatic daily backups - never lose data',
                'Comprehensive training and onboarding',
                '99.9% uptime guarantee',
                'Dedicated account managers',
                'Your data stored in multiple secure locations'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-6 rounded-xl shadow-sm">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#1791C8'}} />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" style={{backgroundColor: '#1791C8'}}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-xl mb-8" style={{color: '#CCE7F7'}}>
              Start your journey with SchoolHub today and transform your school management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-white rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-xl"
                style={{color: '#1791C8'}}
              >
                Get Started Free
              </Link>
              <Link
                to="/contact"
                className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all font-bold text-lg"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
