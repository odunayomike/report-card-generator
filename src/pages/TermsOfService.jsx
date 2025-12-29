import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, FileText, AlertCircle, CheckCircle, XCircle, CreditCard, RefreshCw, Menu, X } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';

export default function TermsOfService() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <SEO
        title="Terms of Service - SchoolHub | User Agreement & Conditions"
        description="SchoolHub Terms of Service. Read our user agreement, subscription terms, acceptable use policy, and service conditions for school management software."
        keywords="schoolhub terms of service, user agreement, terms and conditions, service terms, school software agreement"
        url="/terms-of-service"
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
                <FileText className="w-10 h-10" style={{color: '#1791C8'}} />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-4">
                Please read these terms carefully before using SchoolHub
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you (the "School," "User," or "You")
                and SchoolHub ("we," "us," or "our") regarding your use of our school management platform and services.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing or using SchoolHub, you agree to be bound by these Terms and our Privacy Policy. If you do not
                agree with these Terms, you must not use our services.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> These Terms apply to schools, administrators, teachers, parents, and all users of the SchoolHub platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Eligibility</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use SchoolHub, you must:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Be a registered educational institution or authorized representative</li>
                <li>Be at least 18 years of age</li>
                <li>Have the authority to bind your institution to these Terms</li>
                <li>Provide accurate and complete registration information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>

            {/* Account Registration */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Registration and Security</h2>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Creating an Account</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you register for SchoolHub, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Not create accounts using false or misleading information</li>
                <li>Not create multiple accounts for the same institution</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Account Security</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring teachers and staff have unique login credentials</li>
              </ul>
            </div>

            {/* Subscription and Billing */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <CreditCard className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription and Billing</h2>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Free Trial</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li>7-day free trial available for new schools</li>
                    <li>No credit card required to start trial</li>
                    <li>Full access to all features during trial period</li>
                    <li>One trial per institution</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Subscription Plans</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    SchoolHub offers three subscription plans:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li><strong>Monthly Plan:</strong> ₦15,000/month, billed monthly</li>
                    <li><strong>Per Term Plan:</strong> ₦40,000 for 3 months, billed per term</li>
                    <li><strong>Annual Plan:</strong> ₦150,000/year, billed annually</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Terms</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li>Subscriptions are billed in advance</li>
                    <li>Payments are processed securely through Paystack</li>
                    <li>All prices are in Nigerian Naira (₦)</li>
                    <li>Prices may change with 30 days notice to existing subscribers</li>
                    <li>Failed payments may result in service suspension</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Automatic Renewal</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Your subscription automatically renews at the end of each billing period unless you cancel before the renewal date.
                    You will be charged using your saved payment method.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Refund Policy</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                    <li>Full refund available within 7 days of first paid subscription</li>
                    <li>No refunds for renewals or mid-cycle cancellations</li>
                    <li>Contact support@schoolhub.ng to request a refund</li>
                    <li>Refunds processed within 5-10 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Parent Fee Payments */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Parent Fee Payment Platform</h2>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Platform Fee</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                <li>Parents pay a ₦200 platform fee per transaction</li>
                <li>Platform fee is separate from school subscription costs</li>
                <li>Schools receive 100% of the fee amount paid by parents</li>
                <li>Payment processing fees (Paystack) are additional and vary by payment method</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Methods</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                <li><strong>Card Payments:</strong> Parent pays fee + ₦200 + Paystack fees (1.5% + ₦100)</li>
                <li><strong>Bank Transfer:</strong> Parent pays fee + ₦200 (no Paystack fees)</li>
                <li>All online payments are auto-verified</li>
                <li>Bank transfer receipts require manual school verification</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">School Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Verify bank transfer receipts promptly</li>
                <li>Maintain accurate fee records in the system</li>
                <li>Configure bank account details for parent transfers</li>
                <li>Respond to parent payment inquiries</li>
              </ul>
            </div>

            {/* Cancellation */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <XCircle className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Cancellation and Termination</h2>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Your Right to Cancel</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li>You may cancel your subscription at any time</li>
                    <li>No cancellation fees or penalties</li>
                    <li>Access continues until end of billing period</li>
                    <li>30 days of read-only access after cancellation</li>
                    <li>Data archived for 90 days after cancellation</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Right to Terminate</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We reserve the right to suspend or terminate your account if you:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                    <li>Violate these Terms of Service</li>
                    <li>Engage in fraudulent or illegal activities</li>
                    <li>Fail to pay subscription fees</li>
                    <li>Abuse or misuse our platform</li>
                    <li>Compromise system security</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Acceptable Use Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Use the service for any illegal purposes</li>
                <li>Upload viruses, malware, or malicious code</li>
                <li>Attempt to hack, breach, or compromise system security</li>
                <li>Share or resell access to your account</li>
                <li>Copy, modify, or reverse engineer our software</li>
                <li>Scrape or extract data using automated tools</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload false, misleading, or fraudulent information</li>
                <li>Violate student privacy rights or data protection laws</li>
                <li>Use the platform to spam or send unsolicited messages</li>
              </ul>
            </div>

            {/* Data Ownership */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Ownership and Usage</h2>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Your Data</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You retain all rights to the data you upload to SchoolHub, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                <li>Student records and academic information</li>
                <li>Teacher and staff information</li>
                <li>Parent/guardian contact details</li>
                <li>School branding and logos</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">License to Use</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                By uploading data, you grant us a limited license to store, process, and display your data solely for
                the purpose of providing our services to you.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Export</h3>
              <p className="text-gray-600 leading-relaxed">
                You may export your data at any time in CSV or PDF format. We facilitate data portability and do not
                hold your data hostage.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The SchoolHub platform, including all software, designs, graphics, and content, is owned by SchoolHub
                and protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Copy, reproduce, or distribute our software</li>
                <li>Create derivative works based on our platform</li>
                <li>Remove or modify any copyright notices</li>
                <li>Use our trademarks or branding without permission</li>
              </ul>
            </div>

            {/* Service Availability */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <RefreshCw className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Availability and Support</h2>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Uptime Guarantee</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li>We strive for 99.9% uptime</li>
                    <li>Scheduled maintenance will be announced in advance</li>
                    <li>Emergency maintenance may occur without notice</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Support</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-6">
                    <li>Email support for all subscribers</li>
                    <li>Response within 24 hours (business days)</li>
                    <li>Video tutorials and documentation included</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Updates and Changes</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We regularly update and improve our platform. We reserve the right to add, modify, or remove
                    features at our discretion. Material changes will be communicated to users.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Disclaimers and Limitations</h2>

              <h3 className="text-xl font-bold text-gray-900 mb-3">"AS IS" Service</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                SchoolHub is provided "as is" and "as available" without warranties of any kind, either express or implied.
                We do not guarantee uninterrupted, error-free, or secure service.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Limitation of Liability</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                To the maximum extent permitted by law, SchoolHub shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Loss of data or revenue</li>
                <li>Business interruption</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Damages exceeding the amount paid in the last 12 months</li>
              </ul>
            </div>

            {/* Indemnification */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless SchoolHub from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mt-4">
                <li>Your violation of these Terms</li>
                <li>Your violation of any laws or regulations</li>
                <li>Your violation of third-party rights</li>
                <li>Unauthorized use of your account</li>
              </ul>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Governing Law and Disputes</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved
                through:
              </p>
              <ol className="list-decimal list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Good faith negotiation between parties</li>
                <li>Mediation, if negotiation fails</li>
                <li>Arbitration or courts in Lagos, Nigeria</li>
              </ol>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to These Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may update these Terms from time to time. Changes will be effective:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
                <li>Immediately upon posting for non-material changes</li>
                <li>30 days after notice for material changes</li>
                <li>Continued use after changes constitutes acceptance</li>
              </ul>
            </div>

            {/* Severability */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Severability</h2>
              <p className="text-gray-600 leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions
                shall continue in full force and effect.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#CCE7F7'}}>
                  <CheckCircle className="w-6 h-6" style={{color: '#1791C8'}} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> <a href="mailto:legal@schoolhub.ng" className="text-[#1791C8] font-semibold hover:underline">legal@schoolhub.ng</a></p>
                    <p><strong>Support:</strong> <a href="mailto:support@schoolhub.ng" className="text-[#1791C8] font-semibold hover:underline">support@schoolhub.ng</a></p>
                    <p><strong>Website:</strong> <Link to="/contact" className="text-[#1791C8] font-semibold hover:underline">Contact Form</Link></p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      By using SchoolHub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service
                      and our <Link to="/privacy-policy" className="text-[#1791C8] font-semibold hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>
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
