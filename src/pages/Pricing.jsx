import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, ChevronDown } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';

export default function Pricing() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  return (
    <>
      <SEO
        title="Pricing - SchoolHub | ₦5,000/Month School Management Software Nigeria"
        description="Simple, affordable pricing for Nigerian schools. Only ₦5,000 per month. All features included: report cards, student management, attendance tracking, analytics, and more. 7-day free trial available."
        keywords="schoolhub pricing, school management software cost Nigeria, school software pricing, affordable school management system, school portal pricing Nigeria, report card software cost"
        url="/pricing"
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
                Simple, Transparent
                <span className="block mt-2" style={{color: '#1791C8'}}>
                  Pricing
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                One plan, all features included. No hidden fees, no surprises.
                Everything your school needs to succeed.
              </p>
              <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm">
                <span className="text-sm font-semibold text-gray-700">🎉 7-day free trial • No credit card required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-10 border-4 shadow-2xl" style={{borderColor: '#1791C8'}}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{backgroundColor: '#CCE7F7'}}>
                  <Zap className="w-10 h-10" style={{color: '#1791C8'}} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete School Management</h2>
                <p className="text-xl text-gray-600 mb-8">Everything you need to run your school efficiently</p>

                <div className="mb-8">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold text-gray-900">₦5,000</span>
                    <span className="text-2xl text-gray-600">/ month</span>
                  </div>
                  <p className="text-gray-500 mt-2">Billed monthly • Cancel anytime</p>
                </div>

                <Link
                  to="/register"
                  className="inline-block w-full py-5 text-white rounded-xl hover:shadow-2xl transition-all font-bold text-xl"
                  style={{backgroundColor: '#1791C8'}}
                >
                  Start 7-Day Free Trial
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">All Features Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Unlimited students',
                    'Unlimited teacher accounts',
                    'Report card generation',
                    'Student management',
                    'Attendance tracking',
                    'Performance analytics',
                    'Real-time dashboard',
                    'School branding & logo',
                    'Grade management',
                    'Class management',
                    'Student profiles',
                    'PDF export',
                    'Mobile access',
                    'Cloud storage',
                    'Daily backups',
                    'Email support',
                    'Auto-debit payments',
                    'Subscription management'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-6 h-6 flex-shrink-0 mt-0.5" style={{color: '#1791C8'}} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Coming Soon (At No Extra Cost)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'School accounting',
                    'Fee management',
                    'Computer-Based Testing (CBT)',
                    'Online exams'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-6 h-6 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="text-gray-500">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major payment methods including card payments (Visa, Mastercard, Verve), bank transfers, and mobile money through our secure payment partner, Paystack.'
                },
                {
                  question: 'Is there a free trial?',
                  answer: 'Yes, we offer a 7-day free trial. No credit card required to get started. Experience all features before you pay.'
                },
                {
                  question: 'Are there any setup fees or hidden charges?',
                  answer: 'No! The price you see is what you pay. There are no setup fees, no hidden charges, and no surprise costs. Just ₦5,000 per month.'
                },
                {
                  question: 'What happens after the free trial?',
                  answer: 'After your 7-day trial, you\'ll need to subscribe to continue using SchoolHub. Your data is safely stored for 30 days, giving you time to make a decision.'
                },
                {
                  question: 'Can I cancel my subscription anytime?',
                  answer: 'Yes, you can cancel your subscription at any time. Your account will remain active until the end of your current billing period. You can export your data for 30 days after cancellation.'
                },
                {
                  question: 'Do you offer discounts for annual payments?',
                  answer: 'Yes! Pay annually and get 2 months free (only pay for 10 months). Contact our sales team for annual pricing.'
                },
                {
                  question: 'Is there a student limit?',
                  answer: 'No! Our plan includes unlimited students. Add as many students as your school needs without any extra charges.'
                },
                {
                  question: 'Can I add unlimited teachers?',
                  answer: 'Yes! You can create unlimited teacher accounts at no additional cost. All teachers can access the system based on the permissions you set.'
                },
                {
                  question: 'Is my school data secure?',
                  answer: 'Absolutely. We use bank-level 256-bit SSL encryption to protect all data. Your information is stored on secure cloud servers with daily automatic backups.'
                },
                {
                  question: 'What support do I get?',
                  answer: 'All subscribers get email support with responses within 24 hours, comprehensive documentation, video tutorials, and ongoing platform updates at no extra cost.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link
                to="/contact"
                className="inline-block px-8 py-4 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                style={{backgroundColor: '#1791C8'}}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why SchoolHub is Worth It
              </h2>
              <p className="text-xl text-gray-600">
                See how much time and money you save every month
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold mb-2" style={{color: '#1791C8'}}>40+ Hours</div>
                <div className="text-gray-900 font-semibold mb-2">Time Saved Monthly</div>
                <p className="text-gray-600 text-sm">Automated report cards, attendance tracking, and grade calculations save your staff countless hours</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold mb-2" style={{color: '#1791C8'}}>₦0</div>
                <div className="text-gray-900 font-semibold mb-2">Setup Fees</div>
                <p className="text-gray-600 text-sm">No installation costs, no training fees, no hardware required. Start using SchoolHub immediately</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold mb-2" style={{color: '#1791C8'}}>100%</div>
                <div className="text-gray-900 font-semibold mb-2">Cloud-Based</div>
                <p className="text-gray-600 text-sm">Access from anywhere, automatic updates, and daily backups included at no extra cost</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" style={{backgroundColor: '#1791C8'}}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8" style={{color: '#CCE7F7'}}>
              Join hundreds of schools using SchoolHub. Start your free trial today.
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 bg-white rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-xl"
              style={{color: '#1791C8'}}
            >
              Start 7-Day Free Trial
            </Link>
            <p className="mt-6" style={{color: '#CCE7F7'}}>
              No credit card required • 7-day free trial • Cancel anytime
            </p>
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
