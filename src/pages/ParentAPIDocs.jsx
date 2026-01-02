import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const ParentAPIDocs = () => {
  useEffect(() => {
    // Scroll to section if hash is present
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Helmet>
        <title>Parent Mobile API Documentation - SchoolHub</title>
        <meta name="description" content="Complete API documentation for the SchoolHub Parent Mobile Application" />
      </Helmet>

      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', color: '#2d3748', lineHeight: '1.6', margin: 0, padding: 0, backgroundColor: '#f7fafc' }}>
        {/* Header */}
        <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '3rem 1rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Parent Mobile API</h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>Complete API Documentation for SchoolHub Parent Application</p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>Version 1.0</span>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#overview" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>📖 Overview</a>
            <a href="#auth-endpoints" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>🔐 Authentication</a>
            <a href="#parent-endpoints" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>👨‍👩‍👧 Parent & Children</a>
            <a href="#accounting-endpoints" style={{ color: '#ed8936', textDecoration: 'none', fontWeight: '600', transition: 'color 0.3s' }}>💰 Accounting & Payments</a>
            <a href="#notification-endpoints" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>🔔 Notifications</a>
            <a href="#errors" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>⚠️ Error Codes</a>
            <a href="#examples" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>📝 Code Examples</a>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
          {/* Overview Section */}
          <section id="overview" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>Overview</h2>

            <div style={{ backgroundColor: '#edf2f7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #667eea' }}>
              <p style={{ margin: 0, fontSize: '1rem' }}><strong>Base URL:</strong> <code style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>https://schoolhub.tech/backend/routes</code></p>
            </div>

            <p style={{ marginBottom: '1rem' }}>The Parent Mobile API allows parents and guardians to:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Login securely using their email address and password</li>
              <li>View all their children's information</li>
              <li>Access comprehensive academic analytics for each child</li>
              <li>Track performance history across multiple terms</li>
              <li>Monitor attendance, behavior, and skills development</li>
            </ul>

            <div style={{ backgroundColor: '#fff5f5', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #f56565' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>Important: All API endpoints require session-based authentication using cookies. Make sure to enable credentials/cookies in your HTTP client.</p>
            </div>
          </section>

          {/* Authentication Endpoints Section */}
          <section id="auth-endpoints" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>🔐 Authentication Endpoints</h2>

            <p style={{ marginBottom: '1.5rem' }}>The API uses <strong>email and password authentication</strong> with PHP sessions for secure access.</p>

            <div style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', borderLeft: '4px solid #48bb78' }}>
              <p style={{ margin: 0 }}><strong>Security Note:</strong> Sessions expire after inactivity. Always check session status using <code>/parent/check-session.php</code> before making API calls.</p>
            </div>

            {/* Login Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #48bb78', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>POST</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/login.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Authenticate parent using email address and password.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Request Body</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
                <button onClick={() => copyToClipboard('{"email": "parent@example.com", "password": "your_password"}')} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "email": "parent@example.com",
  "password": "your_password"
}`}</code></pre>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
                <button onClick={() => copyToClipboard(`{
  "success": true,
  "message": "Login successful",
  "data": {
    "parent": {
      "id": 1,
      "name": "John Doe",
      "email": "parent@example.com",
      "phone": "08012345678",
      "children_count": 2
    },
    "children": [
      {
        "id": 123,
        "name": "Jane Doe",
        "class": "JSS 1",
        "admission_no": "2024001",
        "gender": "Female",
        "photo": "uploads/students/jane.jpg",
        "school_name": "ABC Secondary School",
        "school_id": 5,
        "relationship": "mother",
        "is_primary": true
      }
    ],
    "session_token": "abc123xyz"
  }
}`)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "message": "Login successful",
  "data": {
    "parent": {
      "id": 1,
      "name": "John Doe",
      "email": "parent@example.com",
      "phone": "08012345678",
      "children_count": 2
    },
    "children": [
      {
        "id": 123,
        "name": "Jane Doe",
        "class": "JSS 1",
        "admission_no": "2024001",
        "gender": "Female",
        "photo": "uploads/students/jane.jpg",
        "school_name": "ABC Secondary School",
        "school_id": 5,
        "relationship": "mother",
        "is_primary": true
      }
    ],
    "session_token": "abc123xyz"
  }
}`}</code></pre>
              </div>
            </div>

            {/* Check Session Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #4299e1', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/check-session.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Verify if the parent's session is still active.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "authenticated": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "parent@example.com",
    "phone": "08012345678",
    "children_count": 2
  }
}`}</code></pre>
              </div>
            </div>

            {/* Logout Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #f56565', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#f56565', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>POST</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/logout.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>End the parent's session.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "message": "Logout successful"
}`}</code></pre>
              </div>
            </div>
          </section>

          {/* Parent & Children Endpoints Section */}
          <section id="parent-endpoints" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>👨‍👩‍👧 Parent & Children Endpoints</h2>

            {/* Get Children Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #4299e1', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/get-children.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Get list of all children associated with the logged-in parent.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Jane Doe",
      "class": "JSS 1",
      "session": "2023/2024",
      "term": "First Term",
      "admission_no": "2024001",
      "gender": "Female",
      "photo": "uploads/students/jane.jpg",
      "height": "150cm",
      "weight": "45kg",
      "relationship": "mother",
      "is_primary": true,
      "school": {
        "id": 5,
        "name": "ABC Secondary School",
        "address": "123 Main Street, Lagos",
        "phone": "08012345678",
        "email": "info@abcschool.com",
        "logo": "uploads/schools/abc_logo.png"
      }
    }
  ],
  "count": 1
}`}</code></pre>
              </div>
            </div>

            {/* Get Child Analytics Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #4299e1', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/get-child-analytics.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Get comprehensive analytics for a specific child.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Query Parameters</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Parameter</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>student_id</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>integer</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Required. The student ID</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "data": {
    "student": {
      "id": 123,
      "name": "Jane Doe",
      "class": "JSS 1",
      "session": "2023/2024",
      "term": "First Term",
      "admission_no": "2024001",
      "gender": "Female",
      "photo": "uploads/students/jane.jpg",
      "age": 12,
      "school_name": "ABC Secondary School",
      "school_logo": "uploads/schools/logo.png"
    },
    "academic_performance": {
      "overall": {
        "total_obtained": 847,
        "total_obtainable": 1200,
        "average": 70.58,
        "percentage": 70.58,
        "grade": "B",
        "remark": "VERY GOOD"
      },
      "subjects": [
        {
          "name": "Mathematics",
          "ca": 25,
          "exam": 68,
          "total": 93,
          "grade": "A",
          "remark": "EXCELLENT"
        }
      ],
      "subjects_count": 12,
      "grade_distribution": {
        "A": 3,
        "B": 5,
        "C": 3,
        "D": 1,
        "F": 0
      },
      "strongest_subject": {
        "name": "Mathematics",
        "score": 93
      },
      "weakest_subject": {
        "name": "Physical Education",
        "score": 52
      }
    },
    "attendance": {
      "school_opened": 90,
      "present": 86,
      "absent": 4,
      "attendance_rate": 95.56
    },
    "behavior": {
      "traits": [
        {
          "trait": "Punctuality",
          "rating": 4
        },
        {
          "trait": "Neatness",
          "rating": 5
        }
      ],
      "average_rating": 4.5
    },
    "skills": {
      "psychomotor": [
        {
          "skill": "Handwriting",
          "rating": 4
        },
        {
          "skill": "Sports",
          "rating": 3
        }
      ]
    },
    "remarks": {
      "teacher": {
        "name": "Mr. Johnson",
        "remark": "Jane is a hardworking student."
      },
      "principal": {
        "name": "Dr. Smith",
        "remark": "Keep up the excellent work!"
      },
      "next_term_begins": "2024-01-08"
    },
    "grading_scale": {
      "A": [75, 100],
      "B": [65, 74],
      "C": [55, 64],
      "D": [45, 54],
      "F": [0, 44]
    }
  }
}`}</code></pre>
              </div>
            </div>

            {/* Get Child History Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #4299e1', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/get-child-history.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Get performance history across multiple terms for a child.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Query Parameters</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Parameter</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>admission_no</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>string</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Required. The student's admission number</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "data": {
    "student": {
      "name": "Jane Doe",
      "admission_no": "2024001",
      "current_class": "JSS 1",
      "school_name": "ABC Secondary School"
    },
    "history": [
      {
        "report_id": 145,
        "session": "2023/2024",
        "term": "First Term",
        "class": "JSS 1",
        "average_score": 70.58,
        "grade": "B",
        "total_obtained": 847,
        "subjects_count": 12,
        "attendance_rate": 95.56,
        "date": "2024-01-15 10:30:00"
      },
      {
        "report_id": 123,
        "session": "2022/2023",
        "term": "Third Term",
        "class": "Primary 6",
        "average_score": 68.25,
        "grade": "B",
        "total_obtained": 819,
        "subjects_count": 12,
        "attendance_rate": 92.30,
        "date": "2023-07-20 14:20:00"
      }
    ],
    "trends": {
      "improving": true,
      "declining": false,
      "stable": false,
      "message": "Performance improved by 2.3 points"
    },
    "total_reports": 2
  }
}`}</code></pre>
              </div>
            </div>
          </section>

          {/* Accounting & Payment Endpoints Section */}
          <section id="accounting-endpoints" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #ed8936', paddingBottom: '0.5rem' }}>💰 Accounting & Payment Endpoints</h2>

            <div style={{ backgroundColor: '#fffaf0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', borderLeft: '4px solid #ed8936' }}>
              <p style={{ margin: 0 }}><strong>Important:</strong> These endpoints handle fee management and payment processing. Bank transfer payments require verification by school admin, while Paystack payments are auto-verified. All payment endpoints are located at <code>/backend/routes/accounting/parent/</code></p>
            </div>

            {/* Get Fees Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #ed8936', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/accounting/parent/get-fees.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Get all outstanding fees for a specific child (pending, partial, paid, overdue).</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Query Parameters</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Parameter</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>student_id</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>integer</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Required. The student's ID</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "data": {
    "student": {
      "id": 123,
      "name": "John Doe",
      "class": "JSS 1A",
      "admission_no": "2024001",
      "session": "2023/2024",
      "term": "First Term"
    },
    "fees": [
      {
        "id": 45,
        "category": "Tuition Fee",
        "description": "School tuition for the term",
        "amount_due": 50000.00,
        "amount_paid": 20000.00,
        "balance": 30000.00,
        "due_date": "2024-02-28",
        "status": "partial",
        "session": "2023/2024",
        "term": "First Term",
        "frequency": "termly",
        "is_overdue": false,
        "notes": null
      }
    ],
    "summary": {
      "total_due": 50000.00,
      "total_paid": 20000.00,
      "total_balance": 30000.00,
      "overdue_count": 0,
      "total_fees": 1
    }
  }
}`}
              </pre>
            </div>

            {/* Get Bank Accounts Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #ed8936', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/accounting/parent/get-bank-accounts.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Get school's bank account details for making bank transfers.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Query Parameters</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Parameter</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>student_id</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>integer</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Required. The student's ID</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "data": {
    "school_name": "ABC Secondary School",
    "accounts": [
      {
        "id": 1,
        "bank_name": "First Bank",
        "account_number": "1234567890",
        "account_name": "ABC Secondary School",
        "account_type": "Current",
        "is_primary": true
      }
    ],
    "instruction": "Please make your transfer to any of the accounts below and upload your payment receipt."
  }
}`}
              </pre>
            </div>

            {/* Submit Payment Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #ed8936', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>POST</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/accounting/parent/submit-payment.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Submit payment proof for bank transfer with receipt upload.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Request Body (Bank Transfer)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "student_id": 123,
  "student_fee_id": 45,
  "amount": 30000.00,
  "payment_method": "bank_transfer",
  "payment_date": "2024-01-20",
  "transfer_receipt_image": "data:image/jpeg;base64,...",
  "bank_name": "First Bank",
  "account_number": "1234567890",
  "notes": "Payment for tuition"
}`}
              </pre>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (201)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "message": "Payment submitted successfully. Awaiting verification by school.",
  "data": {
    "payment_id": 89,
    "receipt_no": "RCT/2024/00045",
    "amount": 30000.00,
    "payment_method": "bank_transfer",
    "verification_status": "pending",
    "student_name": "John Doe",
    "fee_category": "Tuition Fee"
  }
}`}
              </pre>

              <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ margin: 0 }}><strong>Note:</strong> Bank transfer payments are marked as "pending" and require school verification. Paystack payments are auto-verified.</p>
              </div>
            </div>

            {/* Get Payment History Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #ed8936', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>GET</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/accounting/parent/get-payment-history.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Get all payment records for a child with verification status.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Query Parameters</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Parameter</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>student_id</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>integer</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Required. The student's ID</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "data": {
    "student_name": "John Doe",
    "payments": [
      {
        "id": 89,
        "receipt_no": "RCT/2024/00045",
        "amount": 30000.00,
        "payment_method": "bank_transfer",
        "payment_date": "2024-01-20",
        "fee_category": "Tuition Fee",
        "session": "2023/2024",
        "term": "First Term",
        "verification_status": "verified",
        "status_text": "Verified",
        "verified_at": "2024-01-21 10:30:00",
        "rejection_reason": null,
        "bank_name": "First Bank",
        "transaction_reference": null,
        "paystack_reference": null,
        "notes": null,
        "submitted_at": "2024-01-20 14:25:00"
      }
    ],
    "summary": {
      "total_payments": 1,
      "total_amount_paid": 30000.00,
      "verified_count": 1,
      "pending_count": 0,
      "rejected_count": 0
    }
  }
}`}
              </pre>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Verification Status Values</h4>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><code>pending</code> - Awaiting school verification (bank transfers)</li>
                <li><code>verified</code> - Payment confirmed</li>
                <li><code>rejected</code> - Payment rejected by school</li>
              </ul>
            </div>

            {/* Initialize Paystack Payment Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #ed8936', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>POST</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/accounting/parent/initialize-paystack-payment.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Initialize Paystack online payment and get authorization URL. Includes ₦200 platform fee + Paystack transaction charges (paid by parent).</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Request Body</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "student_id": 123,
  "student_fee_id": 45,
  "amount": 30000.00,
  "email": "parent@example.com",
  "callback_url": "myapp://payment-callback"
}`}
              </pre>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123xyz",
    "access_code": "abc123xyz",
    "reference": "FEE_123_45_1705756800",
    "amount": 30000.00,
    "fee_category": "Tuition Fee",
    "student_name": "John Doe"
  }
}`}
              </pre>

              <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ margin: 0 }}><strong>Fee Structure:</strong> Parent pays: School Fee + ₦200 Platform Fee + Paystack Charges. School receives the fee amount directly via subaccount settlement.</p>
              </div>
            </div>

            {/* Verify Paystack Payment Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #ed8936', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>POST</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/accounting/parent/verify-paystack-payment.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Verify Paystack payment and record it automatically.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Request Body</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "reference": "FEE_123_45_1705756800"
}`}
              </pre>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <pre style={{ backgroundColor: '#2d3748', color: '#48bb78', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "message": "Payment verified and recorded successfully",
  "data": {
    "payment_id": 92,
    "receipt_no": "RCT/2024/00046",
    "amount": 30000.00,
    "payment_date": "2024-01-20",
    "student_name": "John Doe",
    "paystack_reference": "FEE_123_45_1705756800",
    "verification_status": "verified"
  }
}`}
              </pre>

              <div style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', borderLeft: '4px solid #48bb78' }}>
                <p style={{ margin: 0 }}><strong>Auto-Verification:</strong> Paystack payments are automatically verified and the student's fee status is updated immediately.</p>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section id="notification-endpoints" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>🔔 Notifications</h2>
            <p style={{ marginBottom: '2rem', color: '#4a5568' }}>
              Stay updated with real-time notifications about report cards, fee payments, attendance alerts, and school announcements.
              Supports both in-app notifications and push notifications via Firebase Cloud Messaging (FCM).
            </p>

            {/* Get Notifications */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ backgroundColor: '#667eea', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>GET</span>
                Get Notifications
              </h3>

              <div style={{ backgroundColor: '#1a202c', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
                GET /parent/notifications/get
              </div>

              <p style={{ marginBottom: '1rem' }}><strong>Description:</strong> Fetch all notifications for the authenticated parent. Supports filtering by type, unread status, and pagination.</p>

              <p style={{ marginBottom: '0.5rem' }}><strong>Query Parameters:</strong></p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Parameter</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Required</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>limit</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>integer</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Number of notifications to return (default: 50)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>offset</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>integer</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Number of notifications to skip (default: 0)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>unread_only</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>boolean</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Filter to show only unread notifications (true/false)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>type</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>string</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>No</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Filter by type: report_card, fee_payment, attendance, announcement</td>
                  </tr>
                </tbody>
              </table>

              <p style={{ marginBottom: '0.5rem' }}><strong>Response:</strong></p>
              <pre style={{ backgroundColor: '#1a202c', color: '#68d391', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "report_card",
      "title": "New Report Card Published",
      "message": "A new report card for John Doe (First Term, 2024/2025) is now available.",
      "data": {
        "report_id": 123,
        "student_id": 45,
        "student_name": "John Doe",
        "term": "First Term",
        "session": "2024/2025"
      },
      "is_read": false,
      "read_at": null,
      "created_at": "2024-12-31 10:30:00",
      "student_name": "John Doe",
      "student_admission_no": "STU24001",
      "school_name": "Green Valley School"
    }
  ],
  "unread_count": 5,
  "limit": 50,
  "offset": 0
}`}
              </pre>
            </div>

            {/* Mark as Read */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>POST</span>
                Mark Notification(s) as Read
              </h3>

              <div style={{ backgroundColor: '#1a202c', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
                POST /parent/notifications/mark-as-read
              </div>

              <p style={{ marginBottom: '1rem' }}><strong>Description:</strong> Mark one specific notification or all notifications as read.</p>

              <p style={{ marginBottom: '0.5rem' }}><strong>Request Body:</strong></p>
              <pre style={{ backgroundColor: '#1a202c', color: '#63b3ed', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.875rem', marginBottom: '1rem' }}>
{`// Mark single notification
{
  "notification_id": 123
}

// Mark all notifications
{
  "mark_all": true
}`}
              </pre>

              <p style={{ marginBottom: '0.5rem' }}><strong>Response:</strong></p>
              <pre style={{ backgroundColor: '#1a202c', color: '#68d391', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "message": "Notification marked as read"
}`}
              </pre>
            </div>

            {/* Register Device Token */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>POST</span>
                Register Device for Push Notifications
              </h3>

              <div style={{ backgroundColor: '#1a202c', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
                POST /parent/notifications/register-device
              </div>

              <p style={{ marginBottom: '1rem' }}><strong>Description:</strong> Register the device's FCM token to receive push notifications. This should be called when the app launches or when permissions are granted.</p>

              <p style={{ marginBottom: '0.5rem' }}><strong>Request Body:</strong></p>
              <pre style={{ backgroundColor: '#1a202c', color: '#63b3ed', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.875rem', marginBottom: '1rem' }}>
{`{
  "device_token": "fcm_token_string_from_firebase",
  "device_type": "android",  // or "ios"
  "device_name": "Samsung Galaxy S21"  // optional
}`}
              </pre>

              <p style={{ marginBottom: '0.5rem' }}><strong>Response:</strong></p>
              <pre style={{ backgroundColor: '#1a202c', color: '#68d391', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.875rem' }}>
{`{
  "success": true,
  "message": "Device token registered",
  "token_id": 45
}`}
              </pre>

              <div style={{ backgroundColor: '#fef5e7', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', borderLeft: '4px solid #f39c12' }}>
                <p style={{ margin: 0 }}><strong>Important:</strong> Register the device token every time the app launches to ensure the token stays active and updated.</p>
              </div>
            </div>

            {/* Notification Types */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem' }}>Notification Types</h3>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Data Fields</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>report_card</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>New report card published for student</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>report_id, student_id, student_name, term, session</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>fee_payment</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Fee payment reminder or due date alert</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>student_id, fee_amount, fee_name, due_date</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>attendance</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Student attendance alert (absence)</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>student_id, student_name, date, status</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>announcement</code></td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>School-wide announcements</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Varies based on announcement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Error Codes Section */}
          <section id="errors" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #f56565', paddingBottom: '0.5rem' }}>⚠️ HTTP Status Codes</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#edf2f7' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Code</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>200</code></td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Success</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>400</code></td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Bad Request - Invalid input</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>401</code></td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Unauthorized - Not logged in or session expired</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>403</code></td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Forbidden - Parent not associated with this student</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>404</code></td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Not Found - Parent or student not found</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}><code>500</code></td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Internal Server Error</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Code Examples Section */}
          <section id="examples" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #48bb78', paddingBottom: '0.5rem' }}>📝 Code Examples</h2>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem' }}>JavaScript/React Native</h3>
            <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
              <button onClick={() => copyToClipboard(`// Login
const response = await fetch('https://schoolhub.tech/backend/routes/parent/login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'parent@example.com',
    password: 'your_password'
  })
});

// Get children
const childrenResponse = await fetch('https://schoolhub.tech/backend/routes/parent/get-children.php', {
  credentials: 'include'
});`)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`// Login
const response = await fetch('https://schoolhub.tech/backend/routes/parent/login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'parent@example.com',
    password: 'your_password'
  })
});

// Get children
const childrenResponse = await fetch('https://schoolhub.tech/backend/routes/parent/get-children.php', {
  credentials: 'include'
});`}</code></pre>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem' }}>cURL</h3>
            <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
              <button onClick={() => copyToClipboard(`curl -X POST https://schoolhub.tech/backend/routes/parent/login.php \\
  -H "Content-Type: application/json" \\
  -d '{"email": "parent@example.com", "password": "your_password"}' \\
  -c cookies.txt

curl -X GET https://schoolhub.tech/backend/routes/parent/get-children.php \\
  -b cookies.txt`)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`curl -X POST https://schoolhub.tech/backend/routes/parent/login.php \\
  -H "Content-Type: application/json" \\
  -d '{"email": "parent@example.com", "password": "your_password"}' \\
  -c cookies.txt

curl -X GET https://schoolhub.tech/backend/routes/parent/get-children.php \\
  -b cookies.txt`}</code></pre>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: '#2d3748', color: 'white', padding: '2rem 1rem', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>SchoolHub Parent API Documentation v1.0</p>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>For support, contact: <a href="mailto:support@schoolhub.tech" style={{ color: '#90cdf4' }}>support@schoolhub.tech</a></p>
        </footer>
      </div>
    </>
  );
};

export default ParentAPIDocs;
