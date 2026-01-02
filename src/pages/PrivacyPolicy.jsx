import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Lock, Eye, Database, UserCheck, FileText, Menu, X } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <SEO
        title="Privacy Policy - SchoolHub | Data Protection & Security"
        description="SchoolHub Privacy Policy. Learn how we collect, use, protect, and manage your school data. GDPR compliant, bank-level encryption, hosted on Google Cloud."
        keywords="schoolhub privacy policy, data protection, school data security, GDPR compliance, student data privacy"
        url="/privacy-policy"
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <img
                  src={schoolLogo}
                  alt="SchoolHub Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
                <h1 className="text-xl sm:text-2xl font-bold" style={{color: '#1791C8'}}>
                  SchoolHub
                </h1>
              </Link>

              {/* Desktop Navigation */}
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
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

                  {/* Mobile Login Section */}
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

                  {/* Mobile CTA Button */}
                  <Link
                    to="/register"
                    className="mx-4 mt-3 px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-center"
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{backgroundColor: '#CCE7F7'}}>
                <Shield className="w-10 h-10" style={{color: '#1791C8'}} />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-4">
                Your privacy and data security are our top priorities
              </p>
              <p className="text-sm text-gray-500">
                Last Updated: January 2025
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Introduction */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <FileText className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Welcome to SchoolHub. We are committed to protecting your personal information and your right to privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                    school management platform.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By using SchoolHub, you agree to the collection and use of information in accordance with this policy.
                    If you do not agree with our policies and practices, please do not use our services.
                  </p>
                </div>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <Database className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">School Account Information</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-6 space-y-2">
                    <li>School name, address, and contact details</li>
                    <li>Administrator email and password (encrypted)</li>
                    <li>School logo and branding preferences</li>
                    <li>Subscription and billing information</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Student Information</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-6 space-y-2">
                    <li>Names, admission numbers, and class information</li>
                    <li>Academic records, grades, and attendance</li>
                    <li>Parent/guardian contact information</li>
                    <li>Student photos (optional)</li>
                    <li>Health and demographic information (optional)</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Teacher Information</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-6 space-y-2">
                    <li>Names and email addresses</li>
                    <li>Login credentials (encrypted)</li>
                    <li>Role and permission settings</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Parent/Guardian Information</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-6 space-y-2">
                    <li>Names, email addresses, and phone numbers</li>
                    <li>Login credentials (encrypted)</li>
                    <li>Fee payment history and transaction records</li>
                    <li>Bank transfer receipts (if applicable)</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Information</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-6 space-y-2">
                    <li>Payment transaction details (processed securely by Paystack)</li>
                    <li>We DO NOT store credit card numbers or CVV codes</li>
                    <li>Payment receipts and transaction references</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                    <li>IP addresses and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Usage data and analytics</li>
                    <li>Login timestamps and activity logs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <Eye className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We use the information we collect for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                    <li>To provide and maintain our school management services</li>
                    <li>To process student records, grades, and report cards</li>
                    <li>To enable attendance tracking and performance analytics</li>
                    <li>To facilitate parent-teacher-school communication</li>
                    <li>To process fee payments and generate receipts</li>
                    <li>To send important notifications and updates</li>
                    <li>To provide customer support and respond to inquiries</li>
                    <li>To improve our platform and develop new features</li>
                    <li>To detect and prevent fraud or security issues</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <Lock className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We implement industry-leading security measures to protect your information:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li><strong>256-bit SSL Encryption:</strong> All data transmitted is encrypted using bank-level security</li>
                    <li><strong>Google Cloud Infrastructure:</strong> Data stored on secure, GDPR-compliant Google Cloud servers</li>
                    <li><strong>Daily Automated Backups:</strong> Your data is backed up daily to prevent loss</li>
                    <li><strong>Password Protection:</strong> All passwords are hashed using bcrypt encryption</li>
                    <li><strong>PCI-DSS Compliance:</strong> Payment processing meets international security standards</li>
                    <li><strong>Access Controls:</strong> Role-based permissions limit data access</li>
                    <li><strong>Regular Security Audits:</strong> We continuously monitor and improve our security</li>
                    <li><strong>99.9% Uptime Guarantee:</strong> Reliable service with minimal downtime</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    While we use reasonable efforts to protect your information, no method of transmission over the internet
                    or electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <UserCheck className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Share Your Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We do not sell, rent, or trade your personal information. We may share your information only in these limited circumstances:
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">With Service Providers</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-6 space-y-2">
                    <li><strong>Paystack:</strong> For secure payment processing (PCI-DSS compliant)</li>
                    <li><strong>Google Cloud:</strong> For data hosting and infrastructure</li>
                    <li>These providers are bound by confidentiality agreements and use your data only for specified purposes</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">With Your Consent</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We may share information with third parties if you give us explicit consent to do so.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Legal Reasons</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We may disclose information if required by law, court order, or to protect our legal rights,
                    prevent fraud, or protect the safety of our users.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li><strong>Active Subscriptions:</strong> Data is retained for the duration of your subscription</li>
                <li><strong>After Cancellation:</strong> 30 days of read-only access, then 90 days of secure archival</li>
                <li><strong>Academic Records:</strong> May be retained longer for educational compliance requirements</li>
                <li><strong>Payment Records:</strong> Retained for 7 years for tax and accounting purposes</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Export:</strong> Download your data in CSV or PDF format</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
                <li><strong>Withdraw Consent:</strong> Opt-out of non-essential data processing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@schoolhub.tech" className="text-[#1791C8] font-semibold hover:underline">privacy@schoolhub.tech</a>
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-4">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized user experience</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                You can control cookies through your browser settings. Note that disabling cookies may affect functionality.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                SchoolHub is designed for use by educational institutions to manage student information. We collect student data
                only under the direction and consent of schools and parents/guardians.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We do not knowingly collect personal information directly from children under 13 without parental consent.
                Schools are responsible for obtaining appropriate consent from parents/guardians.
              </p>
            </div>

            {/* International Users */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than Nigeria. We ensure that
                all transfers comply with applicable data protection laws and use appropriate safeguards such as
                standard contractual clauses.
              </p>
            </div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Posting the updated policy on our website</li>
                <li>Updating the "Last Updated" date at the top</li>
                <li>Sending email notifications for significant changes</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> <a href="mailto:privacy@schoolhub.tech" className="text-[#1791C8] font-semibold hover:underline">privacy@schoolhub.tech</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@schoolhub.tech" className="text-[#1791C8] font-semibold hover:underline">support@schoolhub.tech</a></p>
                <p><strong>Website:</strong> <Link to="/contact" className="text-[#1791C8] font-semibold hover:underline">Contact Form</Link></p>
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
