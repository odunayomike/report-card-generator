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
            <a href="#overview" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>Overview</a>
            <a href="#authentication" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>Authentication</a>
            <a href="#endpoints" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>Endpoints</a>
            <a href="#errors" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>Error Codes</a>
            <a href="#examples" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s' }}>Examples</a>
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
              <li>Login using only their email address (passwordless authentication)</li>
              <li>View all their children's information</li>
              <li>Access comprehensive academic analytics for each child</li>
              <li>Track performance history across multiple terms</li>
              <li>Monitor attendance, behavior, and skills development</li>
            </ul>

            <div style={{ backgroundColor: '#fff5f5', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #f56565' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>Important: All API endpoints require session-based authentication using cookies. Make sure to enable credentials/cookies in your HTTP client.</p>
            </div>
          </section>

          {/* Authentication Section */}
          <section id="authentication" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>Authentication</h2>

            <p>The API uses <strong>email-only authentication</strong> with PHP sessions. No password is required.</p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Login Flow</h3>
            <ol style={{ marginLeft: '1.5rem' }}>
              <li>Parent submits email address to <code>/parent/login.php</code></li>
              <li>Server validates email and checks if parent exists</li>
              <li>Server creates PHP session and returns session cookie</li>
              <li>Mobile app stores session cookie for subsequent requests</li>
              <li>All future requests include the session cookie automatically</li>
            </ol>

            <div style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', borderLeft: '4px solid #48bb78' }}>
              <p style={{ margin: 0 }}><strong>Security Note:</strong> Sessions expire after inactivity. Always check session status using <code>/parent/check-session.php</code> before making API calls.</p>
            </div>
          </section>

          {/* Endpoints Section */}
          <section id="endpoints" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>API Endpoints</h2>

            {/* Login Endpoint */}
            <div style={{ marginBottom: '2rem', borderLeft: '4px solid #48bb78', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#48bb78', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>POST</span>
                <code style={{ fontSize: '1.125rem', color: '#2d3748' }}>/parent/login.php</code>
              </div>

              <p style={{ marginBottom: '1rem' }}>Authenticate parent using email address only.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Request Body</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
                <button onClick={() => copyToClipboard('{"email": "parent@example.com"}')} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "email": "parent@example.com"
}`}</code></pre>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Success Response (200)</h4>
              <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
                <button onClick={() => copyToClipboard('{"success": true, "message": "Login successful", "parent": {"id": 1, "email": "parent@example.com", "name": "John Doe", "children_count": 2}}')} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
                <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`{
  "success": true,
  "message": "Login successful",
  "parent": {
    "id": 1,
    "email": "parent@example.com",
    "name": "John Doe",
    "children_count": 2
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
  "authenticated": true,
  "parent": {
    "id": 1,
    "email": "parent@example.com"
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
  "message": "Logged out successfully"
}`}</code></pre>
              </div>
            </div>

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
  "children": [
    {
      "student_id": 123,
      "name": "Jane Doe",
      "class": "JSS 1",
      "admission_no": "2024001",
      "relationship": "mother",
      "is_primary": true,
      "school_name": "ABC Secondary School",
      "photo": "uploads/students/jane.jpg"
    }
  ]
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
  "analytics": {
    "student_info": {
      "name": "Jane Doe",
      "class": "JSS 1",
      "admission_no": "2024001"
    },
    "academic_performance": {
      "average_score": 78.5,
      "total_subjects": 12,
      "subjects_passed": 11,
      "grade_distribution": {...}
    },
    "attendance": {
      "total_days": 180,
      "days_present": 172,
      "attendance_rate": 95.56
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
            </div>
          </section>

          {/* Error Codes Section */}
          <section id="errors" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>HTTP Status Codes</h2>

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
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem', borderBottom: '3px solid #667eea', paddingBottom: '0.5rem' }}>Code Examples</h2>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem' }}>JavaScript/React Native</h3>
            <div style={{ backgroundColor: '#2d3748', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', position: 'relative' }}>
              <button onClick={() => copyToClipboard(`// Login
const response = await fetch('https://schoolhub.tech/backend/routes/parent/login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'parent@example.com' })
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
  body: JSON.stringify({ email: 'parent@example.com' })
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
  -d '{"email": "parent@example.com"}' \\
  -c cookies.txt

curl -X GET https://schoolhub.tech/backend/routes/parent/get-children.php \\
  -b cookies.txt`)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#4a5568', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>Copy</button>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}><code>{`curl -X POST https://schoolhub.tech/backend/routes/parent/login.php \\
  -H "Content-Type: application/json" \\
  -d '{"email": "parent@example.com"}' \\
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
