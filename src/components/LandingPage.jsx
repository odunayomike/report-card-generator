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
  GraduationCap
} from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img 
                src={schoolLogo} 
                alt="SchoolHub Logo" 
                className="w-20 h-20 object-contain"
              />
              <h1 className="text-2xl font-bold" style={{color: '#1791C8'}}>
                SchoolHub
              </h1>
            </div>
            <div className="flex gap-4">
              <Link
                to="/teacher/login"
                className="px-6 py-2.5 text-gray-700 transition-colors font-medium"
                style={{'&:hover': {color: '#1791C8'}}}
                onMouseEnter={(e) => e.target.style.color = '#1791C8'}
                onMouseLeave={(e) => e.target.style.color = '#374151'}
              >
                Teacher Login
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 text-gray-700 transition-colors font-medium"
                style={{'&:hover': {color: '#1791C8'}}}
                onMouseEnter={(e) => e.target.style.color = '#1791C8'}
                onMouseLeave={(e) => e.target.style.color = '#374151'}
              >
                School Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                style={{backgroundColor: '#1791C8'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1478A6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1791C8'}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20" style={{backgroundColor: '#E8F4FD'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{backgroundColor: '#CCE7F7', color: '#1791C8'}}>
                <GraduationCap className="w-4 h-4" />
                All-in-One School Management Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Manage Your School
                <span className="block" style={{color: '#1791C8'}}>
                  Smarter & Faster
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform your school administration with our powerful platform. Generate report cards, manage students, track attendance, and so much more - all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg text-center"
                  style={{backgroundColor: '#1791C8'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1478A6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1791C8'}
                >
                  Start Free Trial
                </Link>
                <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl transition-all font-semibold text-lg"
                  onMouseEnter={(e) => {e.target.style.borderColor = '#1791C8'; e.target.style.color = '#1791C8';}}
                  onMouseLeave={(e) => {e.target.style.borderColor = '#D1D5DB'; e.target.style.color = '#374151';}}>
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Schools Using</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Students Managed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop"
                  alt="Students in classroom"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 backdrop-blur-[2px]" style={{backgroundColor: 'rgba(23, 145, 200, 0.2)'}}></div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm font-semibold mb-8">TRUSTED BY SCHOOLS ACROSS NIGERIA</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop"
                alt="School"
                className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=100&fit=crop"
                alt="School"
                className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=100&fit=crop"
                alt="School"
                className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=100&fit=crop"
                alt="School"
                className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make school management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Report Card Generator',
                description: 'Create beautiful, professional report cards in minutes with automatic grading and calculations.',
                color: 'bg-blue-500',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
              },
              {
                icon: Users,
                title: 'Student Management',
                description: 'Centralized database for all student information, enrollment, and academic records.',
                color: 'bg-purple-500',
                image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
              },
              {
                icon: TrendingUp,
                title: 'Performance Analytics',
                description: 'Track academic trends, identify patterns, and make data-driven decisions.',
                color: 'bg-orange-500',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
              },
              {
                icon: CheckCircle,
                title: 'Attendance Tracking',
                description: 'Monitor student attendance with automated reports and notifications.',
                color: 'bg-green-500',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop'
              },
              {
                icon: Smartphone,
                title: 'Mobile Access',
                description: 'Access your school data from anywhere, on any device - phone, tablet, or computer.',
                color: 'bg-indigo-500',
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'
              },
              {
                icon: Lock,
                title: 'Secure & Reliable',
                description: 'Bank-level security with automatic backups and data encryption.',
                color: 'bg-pink-500',
                image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-transparent transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className={`absolute top-4 right-4 w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Start managing your school efficiently in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up with your school email and basic information. No credit card required.',
                icon: Users
              },
              {
                step: '02',
                title: 'Add Your Data',
                description: 'Import student records or add them manually. Set up your school structure.',
                icon: BookOpen
              },
              {
                step: '03',
                title: 'Start Managing',
                description: 'Generate report cards, track attendance, and manage all school operations.',
                icon: BarChart3
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{backgroundColor: '#CCE7F7'}}>
                      <IconComponent className="w-8 h-8" style={{color: '#1791C8'}} />
                    </div>
                    <div className="font-bold text-sm mb-2" style={{color: '#1791C8'}}>STEP {item.step}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-8 h-8" style={{color: '#1791C8'}} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop"
                  alt="Happy students and teacher"
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
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
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
      <section className="py-20" style={{backgroundColor: '#1791C8'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl mb-8" style={{color: '#CCE7F7'}}>
            Join hundreds of schools already using SchoolHub to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 bg-white rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-xl"
              style={{color: '#1791C8'}}
            >
              Get Started Free
            </Link>
            <button className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all font-bold text-lg">
              Schedule Demo
            </button>
          </div>
          <p className="mt-6" style={{color: '#CCE7F7'}}>No credit card required • Free 30-day trial • Cancel anytime</p>
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
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
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
  );
}
