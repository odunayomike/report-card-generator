import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Send, Clock, CheckCircle, ChevronDown, AlertCircle, Menu, X } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';
import { submitContactForm } from '../services/api';

export default function Contact() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await submitContactForm(formData);

      if (response.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          school: '',
          subject: '',
          message: ''
        });
        setTimeout(() => setSubmitted(false), 10000);
      } else {
        setError(response.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again or email us directly at support@schoolhub.tech');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <SEO
        title="Contact Us - SchoolHub | Get in Touch with Our Support Team"
        description="Contact SchoolHub for support, sales inquiries, or general questions. We're here to help Nigerian schools streamline their management operations. Email, phone, and live support available."
        keywords="contact schoolhub, schoolhub support, school management support Nigeria, schoolhub customer service, school software help"
        url="/contact"
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
                Get in Touch
                <span className="block mt-2" style={{color: '#1791C8'}}>
                  We're Here to Help
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Have questions about SchoolHub? Our team is ready to assist you with
                any inquiries about our platform, pricing, or technical support.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-16">
              {[
                {
                  icon: Mail,
                  title: 'Email Us',
                  info: 'support@schoolhub.tech',
                  subinfo: 'sales@schoolhub.tech',
                  color: '#1791C8'
                },
                {
                  icon: Phone,
                  title: 'Call Us',
                  info: '+234 701 012 3061',
                  subinfo: 'Mon-Fri, 8am-6pm WAT',
                  color: '#667eea'
                }
              ].map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-8 text-center hover:shadow-xl transition-all">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl flex items-center justify-center" style={{backgroundColor: `${method.color}20`}}>
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" style={{color: method.color}} />
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{method.title}</h3>
                    <p className="text-gray-900 font-semibold mb-1 text-xs sm:text-base">{method.info}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{method.subinfo}</p>
                  </div>
                );
              })}
            </div>

            {/* Contact Form and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">Thank you! We'll get back to you within 24 hours. A confirmation email has been sent to your inbox.</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1791C8] focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1791C8] focus:outline-none transition-colors"
                      placeholder="john@school.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1791C8] focus:outline-none transition-colors"
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1791C8] focus:outline-none transition-colors"
                      placeholder="Your School Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1791C8] focus:outline-none transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1791C8] focus:outline-none transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-8 py-4 text-white rounded-lg hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: '#1791C8'}}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Additional Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    We're Here to Help
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Our dedicated support team is committed to ensuring your success with SchoolHub.
                    Whether you're a new user exploring our platform or an existing customer needing
                    assistance, we're here for you.
                  </p>
                </div>

                {/* Support Hours */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6" style={{color: '#1791C8'}} />
                    <h3 className="text-xl font-bold text-gray-900">Support Hours</h3>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold" style={{color: '#1791C8'}}>24/7</p>
                    <p className="text-gray-600 mt-2">Available around the clock</p>
                  </div>
                </div>

                {/* FAQ Link */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Looking for Quick Answers?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Check out our FAQ page for answers to common questions about SchoolHub.
                  </p>
                  <Link
                    to="/faq"
                    className="inline-flex items-center gap-2 text-[#1791C8] font-semibold hover:underline"
                  >
                    Visit FAQ Page
                    <span>→</span>
                  </Link>
                </div>
              </div>
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
