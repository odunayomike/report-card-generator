import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Heart, CheckCircle, TrendingUp, ChevronDown } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';

export default function About() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={schoolLogo}
                  alt="SchoolHub Logo"
                  className="w-20 h-20 object-contain"
                />
                <h1 className="text-2xl font-bold" style={{color: '#1791C8'}}>
                  SchoolHub
                </h1>
              </Link>
              <div className="flex items-center gap-6">
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
            </div>
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
                    Today, SchoolHub serves over 500 schools across Nigeria, managing more than 50,000
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
                { number: '500+', label: 'Schools Using SchoolHub', icon: Users },
                { number: '50K+', label: 'Students Managed', icon: TrendingUp },
                { number: '2K+', label: 'Teachers Empowered', icon: Award },
                { number: '100K+', label: 'Report Cards Generated', icon: CheckCircle }
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
                'Reliable cloud-based infrastructure',
                'Local customer support in Nigeria',
                'Regular updates and new features',
                'Secure data storage and backup',
                'Mobile-friendly for on-the-go access',
                'Comprehensive training and onboarding',
                'Dedicated account managers'
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
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
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
