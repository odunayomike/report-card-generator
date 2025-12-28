import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import SEO from '../components/SEO';

export default function FAQ() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account on SchoolHub?',
          answer: 'Click on the "Get Started Free" or "Register" button on our homepage. Fill in your school details, email, and password. You\'ll receive a verification email to activate your account. Once verified, you can start using SchoolHub immediately with our 7-day free trial.'
        },
        {
          question: 'Is there a free trial available?',
          answer: 'Yes! We offer a 7-day free trial for all new schools. No credit card required. You can explore all features of your selected plan during this period. After the trial, you can choose to continue with a paid subscription.'
        },
        {
          question: 'What do I need to get started?',
          answer: 'You only need basic information about your school: school name, address, contact details, and your email. You can add student and teacher information later from your dashboard.'
        },
        {
          question: 'Can I import existing student data?',
          answer: 'Yes, you can bulk import student data using our CSV upload feature. You can also add students manually one at a time. Our support team can help you with the import process if needed.'
        }
      ]
    },
    {
      category: 'Pricing & Billing',
      questions: [
        {
          question: 'How much does SchoolHub cost?',
          answer: 'We have simple, transparent pricing with three flexible plans: Monthly (₦15,000/month), Per Term (₦40,000 for 3 months - save ₦5,000), and Annual (₦150,000/year - save ₦30,000). All plans include unlimited students, unlimited teachers, and all features with no hidden fees.'
        },
        {
          question: 'What payment methods do you accept for school subscriptions?',
          answer: 'We accept all major payment methods including card payments (Visa, Mastercard, Verve), bank transfers, and mobile money through our secure payment partner, Paystack. All payments are PCI-DSS compliant with bank-level 256-bit SSL encryption.'
        },
        {
          question: 'Is there a setup fee or hidden charges?',
          answer: 'No setup fees or hidden charges for school subscriptions! The price you see is what you pay. However, when parents pay school fees through the platform, a ₦200 platform fee is charged per transaction to the parent (not the school).'
        },
        {
          question: 'How does the parent payment platform fee work?',
          answer: 'When parents pay school fees online via our parent app, they pay a ₦200 platform fee per transaction. The school receives 100% of the fee amount. This platform fee helps us maintain secure payment infrastructure and provide ongoing support. If parents pay by bank transfer through Paystack, they only pay ₦200. If they pay by card, Paystack adds their standard 1.5% + ₦100 fee.'
        },
        {
          question: 'Can I change my subscription plan?',
          answer: 'Yes! You can upgrade or switch plans at any time from your account settings. When upgrading mid-cycle, you only pay the prorated difference. Downgrades take effect at the start of your next billing period.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'Yes, we offer a full refund if you\'re not satisfied within the first 7 days of your paid subscription. Contact our support team within this period to process your refund request.'
        },
        {
          question: 'What happens when my free trial ends?',
          answer: 'After your 7-day free trial, you\'ll need to subscribe to a paid plan to continue using SchoolHub. Your data is safely stored for 30 days, giving you time to decide. No credit card is required to start the trial.'
        },
        {
          question: 'What happens if I don\'t renew my subscription?',
          answer: 'If your subscription expires, you\'ll have read-only access to your data for 30 days. You can export all your data during this period. After 30 days, your account will be deactivated, but data remains securely stored for 90 days if you decide to return.'
        },
        {
          question: 'Do you offer discounts for multiple schools?',
          answer: 'Yes! Educational groups managing 3 or more schools qualify for special volume discounts. Contact our sales team for custom pricing tailored to your needs.'
        },
        {
          question: 'Is there a student or teacher limit?',
          answer: 'No limits! All plans include unlimited students and unlimited teacher accounts. Add as many students and teachers as your school needs at no extra cost.'
        }
      ]
    },
    {
      category: 'Parent Fee Payment',
      questions: [
        {
          question: 'How can parents pay school fees online?',
          answer: 'Parents can pay school fees directly through our parent mobile app using Paystack. They can pay with debit/credit cards or bank transfer. All payments are secure and instantly verified.'
        },
        {
          question: 'Are there any additional fees when parents pay online?',
          answer: 'Yes, there is a platform fee of ₦200 per transaction. If parents pay with a card, Paystack charges their standard transaction fee (1.5% + ₦100). Bank transfer payments have no Paystack fees - just the ₦200 platform fee.'
        },
        {
          question: 'Can parents pay in installments?',
          answer: 'Yes! Parents can make partial payments toward any fee. The system tracks all payments and outstanding balances automatically. Schools can set due dates for each installment.'
        },
        {
          question: 'How do parents know their payment was received?',
          answer: 'Parents receive instant payment confirmation with a receipt number. Payments made via card or bank transfer are automatically verified. Schools can also see real-time payment notifications in their dashboard.'
        },
        {
          question: 'What if a parent uploads a fake bank transfer receipt?',
          answer: 'All bank transfer receipts require manual verification by the school before the payment is marked as complete. Only Paystack card/transfer payments are auto-verified. This protects schools from fraudulent receipts.'
        },
        {
          question: 'Can parents view their payment history?',
          answer: 'Yes! Parents can view complete payment history for each child through the mobile app, including receipt numbers, amounts paid, payment methods, and verification status.'
        }
      ]
    },
    {
      category: 'Features & Functionality',
      questions: [
        {
          question: 'Can I generate and print report cards?',
          answer: 'Yes! Our report card generator allows you to create professional report cards with your school branding. You can download them as PDFs and print them directly. The system automatically calculates grades, averages, and positions.'
        },
        {
          question: 'How does attendance tracking work?',
          answer: 'Teachers can mark daily attendance for their classes through the mobile-friendly interface. The system tracks present, absent, and late students. Attendance reports can be viewed by date, class, or individual student.'
        },
        {
          question: 'Can teachers access the system?',
          answer: 'Yes! You can create teacher accounts with limited access. Teachers can mark attendance, add students (if permitted), and view their assigned classes. School administrators have full control over teacher permissions.'
        },
        {
          question: 'Is the CBT (Computer-Based Testing) system available?',
          answer: 'The CBT system is currently available in our Enterprise plan. It allows you to create and conduct online exams, automatically grade objective questions, and generate instant results.'
        },
        {
          question: 'Can I customize report cards with my school logo?',
          answer: 'Yes! Professional and Enterprise plans include school branding features. You can upload your school logo, customize colors, and add your school motto or other details to report cards.'
        }
      ]
    },
    {
      category: 'Technical & Security',
      questions: [
        {
          question: 'Is my school data secure?',
          answer: 'Absolutely. We use bank-level 256-bit SSL encryption to protect all data. Your information is stored on Google Cloud servers with 99.9% uptime guarantee. We perform daily automated backups and comply with international data protection standards.'
        },
        {
          question: 'Where is my school data stored?',
          answer: 'All school data is securely stored on Google Cloud infrastructure. As a Google Cloud partner, we leverage their world-class security, reliability, and global network. Your data is accessible anytime, anywhere with an internet connection.'
        },
        {
          question: 'Can I access SchoolHub on my phone?',
          answer: 'Yes! SchoolHub is fully responsive and works on all devices - smartphones, tablets, and computers. We also have a dedicated Parent Mobile App for iOS and Android where parents can view fees, make payments, and track their children\'s progress.'
        },
        {
          question: 'What if I forget my password?',
          answer: 'Click on "Forgot Password" on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
        },
        {
          question: 'Do you provide data backups?',
          answer: 'Yes, we perform automatic daily backups of all school data on Google Cloud. In the unlikely event of data loss, we can restore your information from our backup systems within hours.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes, you can export student lists, report cards, attendance records, and fee payment history as CSV or PDF files at any time. Your data belongs to you, and you have full access to export it whenever needed.'
        },
        {
          question: 'What happens if there is a server downtime?',
          answer: 'Our Google Cloud infrastructure provides 99.9% uptime guarantee. In the rare case of downtime, our team is immediately notified and works to restore service. All data remains safe and will be accessible once service is restored.'
        }
      ]
    },
    {
      category: 'Support & Training',
      questions: [
        {
          question: 'Do you provide training for new users?',
          answer: 'Yes! All new schools receive onboarding training. We provide video tutorials, documentation, and live support to help you get started. Enterprise plan customers get dedicated training sessions.'
        },
        {
          question: 'What support options are available?',
          answer: 'We offer email support for all plans (response within 24 hours). Professional and Enterprise plans include priority support with faster response times. Enterprise customers also get 24/7 support and a dedicated account manager.'
        },
        {
          question: 'Is customer support available on weekends?',
          answer: 'Email support is available 24/7. Enterprise customers have 24/7 priority support access.'
        },
        {
          question: 'Can you help me migrate from another system?',
          answer: 'Yes! Our support team can assist with data migration from other school management systems. Contact us with details about your current system, and we\'ll create a migration plan for you.'
        }
      ]
    },
    {
      category: 'Account Management',
      questions: [
        {
          question: 'How many user accounts can I create?',
          answer: 'All plans include unlimited teacher accounts and unlimited student accounts! Each school gets one admin account with full system access. You can create as many teacher accounts as needed and assign specific permissions to each teacher.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time with no penalties. Your account remains active until the end of your current billing period. After cancellation, you have 30 days of read-only access to export your data.'
        },
        {
          question: 'How do I add or remove teachers?',
          answer: 'You can add or remove teacher accounts anytime from your admin dashboard under "Teacher Management". Simply enter their email, name, and assign permissions. Teachers receive login credentials via email and can immediately access the system.'
        },
        {
          question: 'Can I have multiple schools on one account?',
          answer: 'Each school requires its own separate account and subscription for data security and organization. However, if you manage multiple schools (3+), contact our sales team for special volume discounts and multi-school management features.'
        },
        {
          question: 'What happens to my data if I cancel?',
          answer: 'Your data remains safe! After cancellation, you have 30 days to export all data (students, grades, reports, payments). Data is then securely archived for 90 days. You can reactivate anytime within 90 days and pick up where you left off.'
        },
        {
          question: 'Can I transfer my account to someone else?',
          answer: 'Yes! You can transfer ownership of your school account to another administrator (like a new principal). Contact our support team to securely transfer account ownership while maintaining all your school data and settings.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and you\'ll receive a password reset link. For security, the link expires after 1 hour. If you need additional help, contact our support team.'
        },
        {
          question: 'Can I change my school information?',
          answer: 'Yes! You can update your school name, address, contact details, logo, and branding from the School Settings page. Changes are reflected immediately across all report cards and documents.'
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const allQuestions = faqCategories.flatMap((cat, catIndex) =>
    cat.questions.map((q, qIndex) => ({
      ...q,
      category: cat.category,
      globalIndex: `${catIndex}-${qIndex}`
    }))
  );

  const filteredCategories = searchTerm
    ? [{
        category: 'Search Results',
        questions: allQuestions.filter(
          q =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }]
    : faqCategories;

  return (
    <>
      <SEO
        title="Frequently Asked Questions (FAQ) - SchoolHub | Get Answers"
        description="Find answers to common questions about SchoolHub school management system. Learn about pricing, features, security, support, report cards, attendance tracking, and more."
        keywords="schoolhub faq, school management questions, schoolhub help, report card software faq, school portal questions, schoolhub support"
        url="/faq"
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{backgroundColor: '#CCE7F7'}}>
                <HelpCircle className="w-10 h-10" style={{color: '#1791C8'}} />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Frequently Asked
                <span className="block mt-2" style={{color: '#1791C8'}}>
                  Questions
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Find quick answers to common questions about SchoolHub.
                Can't find what you're looking for? Contact our support team.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1791C8] focus:outline-none text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredCategories.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{category.category}</h2>
                {category.questions.length === 0 && searchTerm && (
                  <p className="text-gray-600 text-center py-8">
                    No results found for "{searchTerm}". Try different keywords or{' '}
                    <Link to="/contact" className="text-[#1791C8] font-semibold hover:underline">
                      contact support
                    </Link>.
                  </p>
                )}
                <div className="space-y-4">
                  {category.questions.map((item, qIndex) => {
                    const itemIndex = searchTerm ? item.globalIndex : `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === itemIndex;

                    return (
                      <div
                        key={qIndex}
                        className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        <button
                          onClick={() => toggleQuestion(itemIndex)}
                          className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                        >
                          <span className="text-lg font-semibold text-gray-900">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-6 h-6 flex-shrink-0 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                            style={{color: '#1791C8'}}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5">
                            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-20" style={{backgroundColor: '#E8F4FD'}}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here to help. Get in touch and we'll respond as soon as possible.
            </p>
            <div className="flex justify-center">
              <Link
                to="/contact"
                className="px-10 py-4 text-white rounded-xl hover:shadow-lg transition-all font-bold text-lg"
                style={{backgroundColor: '#1791C8'}}
              >
                Contact Support
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
