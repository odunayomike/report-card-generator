import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO Component
 * Comprehensive SEO for all SchoolHub features
 * Manages meta tags, Open Graph, Twitter Cards, and structured data
 */
export default function SEO({
  title = 'SchoolHub - Complete School Management System | Report Cards, Attendance, Analytics & More',
  description = 'All-in-one school management platform for Nigerian schools. Generate report cards, track attendance, manage teachers & students, view analytics, handle subscriptions, CBT exams, and school accounting. Trusted by 150+ schools.',
  keywords = 'school management system Nigeria, report card generator, student management system, school software Nigeria, attendance tracking system, teacher management, school analytics dashboard, school accounting software, fee management system, CBT exam software, grade management system, student report card generator, school administration software, education management system, school ERP software, student information system, school portal Nigeria, online report card, school fee payment, student attendance tracker',
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  author = 'SchoolHub',
  structuredData = null
}) {
  const siteUrl = 'https://schoolhub.tech';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Comprehensive structured data highlighting all features
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SchoolHub - Complete School Management System',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web Browser, Windows, macOS, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '5000',
      priceCurrency: 'NGN',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'SchoolHub'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    },
    description: 'Complete cloud-based school management system with report card generation, student & teacher management, attendance tracking, analytics dashboard, school accounting, fee management, CBT exams, subscription management, and multi-school support for Nigerian educational institutions.',
    featureList: [
      'Digital Report Card Generation & PDF Export',
      'Student Information Management System',
      'Teacher Account & Class Management',
      'Daily Attendance Tracking & Reports',
      'Real-time Analytics Dashboard',
      'School Accounting & Fee Management',
      'Computer-Based Testing (CBT) System',
      'Subscription & Payment Processing',
      'Auto-debit Recurring Payments',
      'Grade & Performance Analytics',
      'Student Profile & History Tracking',
      'Class Performance Comparison',
      'Admission Number Auto-generation',
      'School Branding & Logo Upload',
      'Multi-teacher Access Control',
      'Secure Payment Integration (Paystack)',
      'Mobile Responsive Design',
      'Cloud Storage & Backup'
    ],
    softwareVersion: '2.0',
    screenshot: fullImage,
    url: siteUrl,
    author: {
      '@type': 'Organization',
      name: 'SchoolHub',
      url: siteUrl
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'administrator'
    }
  };

  // Organization structured data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SchoolHub',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Leading school management software provider in Nigeria',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['English']
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SchoolHub - School Management System" />
      <meta property="og:locale" content="en_NG" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@schoolhub" />
      <meta name="twitter:site" content="@schoolhub" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="rating" content="General" />
      <meta name="distribution" content="global" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="schools, educational institutions, administrators, teachers" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="SchoolHub" />

      {/* Geographic Tags - Nigeria Focus */}
      <meta name="geo.region" content="NG" />
      <meta name="geo.placename" content="Nigeria" />
      <meta name="DC.title" content={title} />
      <meta name="DC.description" content={description} />
      <meta name="DC.language" content="en" />

      {/* Additional SEO Tags */}
      <meta property="article:publisher" content={siteUrl} />
      <meta name="application-name" content="SchoolHub" />
      <meta name="msapplication-tooltip" content="Complete School Management System" />
      <meta name="theme-color" content="#667eea" />

      {/* Structured Data / JSON-LD - Application */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>

      {/* Structured Data / JSON-LD - Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>

      {/* Breadcrumb List (if applicable) */}
      {url && url !== '/' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: title.split(' - ')[0] || title,
                item: fullUrl
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string,
  structuredData: PropTypes.object
};
