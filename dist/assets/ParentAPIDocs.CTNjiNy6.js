import{r as o,j as e,H as i}from"./index.UZcXu8dh.js";const d=()=>{o.useEffect(()=>{if(window.location.hash){const t=document.querySelector(window.location.hash);t&&t.scrollIntoView({behavior:"smooth"})}},[]);const r=t=>{navigator.clipboard.writeText(t)};return e.jsxs(e.Fragment,{children:[e.jsxs(i,{children:[e.jsx("title",{children:"Parent Mobile API Documentation - SchoolHub"}),e.jsx("meta",{name:"description",content:"Complete API documentation for the SchoolHub Parent Mobile Application"})]}),e.jsxs("div",{style:{fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',color:"#2d3748",lineHeight:"1.6",margin:0,padding:0,backgroundColor:"#f7fafc"},children:[e.jsxs("header",{style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",color:"white",padding:"3rem 1rem",textAlign:"center",boxShadow:"0 4px 6px rgba(0,0,0,0.1)"},children:[e.jsx("h1",{style:{fontSize:"2.5rem",fontWeight:"bold",margin:"0 0 0.5rem 0"},children:"Parent Mobile API"}),e.jsx("p",{style:{fontSize:"1.125rem",opacity:.9,margin:0},children:"Complete API Documentation for SchoolHub Parent Application"}),e.jsx("div",{style:{marginTop:"1rem"},children:e.jsx("span",{style:{backgroundColor:"rgba(255,255,255,0.2)",padding:"0.25rem 0.75rem",borderRadius:"1rem",fontSize:"0.875rem"},children:"Version 1.0"})})]}),e.jsx("nav",{style:{backgroundColor:"white",boxShadow:"0 2px 4px rgba(0,0,0,0.1)",position:"sticky",top:0,zIndex:100},children:e.jsxs("div",{style:{maxWidth:"1200px",margin:"0 auto",padding:"1rem",display:"flex",gap:"1.5rem",flexWrap:"wrap",justifyContent:"center"},children:[e.jsx("a",{href:"#overview",style:{color:"#667eea",textDecoration:"none",fontWeight:"500",transition:"color 0.3s"},children:"📖 Overview"}),e.jsx("a",{href:"#auth-endpoints",style:{color:"#667eea",textDecoration:"none",fontWeight:"500",transition:"color 0.3s"},children:"🔐 Authentication"}),e.jsx("a",{href:"#parent-endpoints",style:{color:"#667eea",textDecoration:"none",fontWeight:"500",transition:"color 0.3s"},children:"👨‍👩‍👧 Parent & Children"}),e.jsx("a",{href:"#accounting-endpoints",style:{color:"#ed8936",textDecoration:"none",fontWeight:"600",transition:"color 0.3s"},children:"💰 Accounting & Payments"}),e.jsx("a",{href:"#notification-endpoints",style:{color:"#667eea",textDecoration:"none",fontWeight:"500",transition:"color 0.3s"},children:"🔔 Notifications"}),e.jsx("a",{href:"#errors",style:{color:"#667eea",textDecoration:"none",fontWeight:"500",transition:"color 0.3s"},children:"⚠️ Error Codes"}),e.jsx("a",{href:"#examples",style:{color:"#667eea",textDecoration:"none",fontWeight:"500",transition:"color 0.3s"},children:"📝 Code Examples"})]})}),e.jsxs("main",{style:{maxWidth:"1200px",margin:"2rem auto",padding:"0 1rem"},children:[e.jsxs("section",{id:"overview",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1rem",borderBottom:"3px solid #667eea",paddingBottom:"0.5rem"},children:"Overview"}),e.jsx("div",{style:{backgroundColor:"#edf2f7",padding:"1rem",borderRadius:"0.5rem",marginBottom:"1.5rem",borderLeft:"4px solid #667eea"},children:e.jsxs("p",{style:{margin:0,fontSize:"1rem"},children:[e.jsx("strong",{children:"Base URL:"})," ",e.jsx("code",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"0.25rem 0.5rem",borderRadius:"0.25rem",fontSize:"0.875rem"},children:"https://schoolhub.tech/backend/routes"})]})}),e.jsx("p",{style:{marginBottom:"1rem"},children:"The Parent Mobile API allows parents and guardians to:"}),e.jsxs("ul",{style:{marginLeft:"1.5rem",marginBottom:"1rem"},children:[e.jsx("li",{children:"Login securely using their email address and password"}),e.jsx("li",{children:"View all their children's information"}),e.jsx("li",{children:"Access comprehensive academic analytics for each child"}),e.jsx("li",{children:"Track performance history across multiple terms"}),e.jsx("li",{children:"Monitor attendance, behavior, and skills development"})]}),e.jsx("div",{style:{backgroundColor:"#fff5f5",padding:"1rem",borderRadius:"0.5rem",borderLeft:"4px solid #f56565"},children:e.jsx("p",{style:{margin:0,fontWeight:"500"},children:"Important: All API endpoints require session-based authentication using cookies. Make sure to enable credentials/cookies in your HTTP client."})})]}),e.jsxs("section",{id:"auth-endpoints",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1rem",borderBottom:"3px solid #667eea",paddingBottom:"0.5rem"},children:"🔐 Authentication Endpoints"}),e.jsxs("p",{style:{marginBottom:"1.5rem"},children:["The API uses ",e.jsx("strong",{children:"email and password authentication"})," with PHP sessions for secure access."]}),e.jsx("div",{style:{backgroundColor:"#f0fff4",padding:"1rem",borderRadius:"0.5rem",marginBottom:"2rem",borderLeft:"4px solid #48bb78"},children:e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Security Note:"})," Sessions expire after inactivity. Always check session status using ",e.jsx("code",{children:"/parent/check-session.php"})," before making API calls."]})}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #48bb78",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#48bb78",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"POST"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/parent/login.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Authenticate parent using email address and password."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Request Body"}),e.jsxs("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",position:"relative"},children:[e.jsx("button",{onClick:()=>r('{"email": "parent@example.com", "password": "your_password"}'),style:{position:"absolute",top:"0.5rem",right:"0.5rem",backgroundColor:"#4a5568",color:"white",border:"none",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",cursor:"pointer",fontSize:"0.75rem"},children:"Copy"}),e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
  "email": "parent@example.com",
  "password": "your_password"
}`})})]}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsxs("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",position:"relative"},children:[e.jsx("button",{onClick:()=>r(`{
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
}`),style:{position:"absolute",top:"0.5rem",right:"0.5rem",backgroundColor:"#4a5568",color:"white",border:"none",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",cursor:"pointer",fontSize:"0.75rem"},children:"Copy"}),e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
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
}`})})]})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #4299e1",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/parent/check-session.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Verify if the parent's session is still active."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto"},children:e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
  "success": true,
  "authenticated": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "parent@example.com",
    "phone": "08012345678",
    "children_count": 2
  }
}`})})})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #f56565",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#f56565",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"POST"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/parent/logout.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"End the parent's session."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto"},children:e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
  "success": true,
  "message": "Logout successful"
}`})})})]})]}),e.jsxs("section",{id:"parent-endpoints",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1.5rem",borderBottom:"3px solid #667eea",paddingBottom:"0.5rem"},children:"👨‍👩‍👧 Parent & Children Endpoints"}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #4299e1",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/parent/get-children.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Get list of all children associated with the logged-in parent."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto"},children:e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
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
}`})})})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #4299e1",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/parent/get-child-analytics.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Get comprehensive analytics for a specific child."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Query Parameters"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Parameter"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"student_id"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"integer"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Required. The student ID"})]})})]}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto"},children:e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
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
}`})})})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #4299e1",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/parent/get-child-history.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Get performance history across multiple terms for a child."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Query Parameters"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Parameter"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"admission_no"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"string"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Required. The student's admission number"})]})})]}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto"},children:e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`{
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
}`})})})]})]}),e.jsxs("section",{id:"accounting-endpoints",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1.5rem",borderBottom:"3px solid #ed8936",paddingBottom:"0.5rem"},children:"💰 Accounting & Payment Endpoints"}),e.jsx("div",{style:{backgroundColor:"#fffaf0",padding:"1rem",borderRadius:"0.5rem",marginBottom:"2rem",borderLeft:"4px solid #ed8936"},children:e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Important:"})," These endpoints handle fee management and payment processing. Bank transfer payments require verification by school admin, while Paystack payments are auto-verified. All payment endpoints are located at ",e.jsx("code",{children:"/backend/routes/accounting/parent/"})]})}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #ed8936",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/accounting/parent/get-fees.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Get all outstanding fees for a specific child (pending, partial, paid, overdue)."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Query Parameters"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Parameter"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"student_id"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"integer"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Required. The student's ID"})]})})]}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
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
}`})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #ed8936",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/accounting/parent/get-bank-accounts.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Get school's bank account details for making bank transfers."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Query Parameters"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Parameter"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"student_id"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"integer"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Required. The student's ID"})]})})]}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
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
}`})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #ed8936",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#48bb78",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"POST"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/accounting/parent/submit-payment.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Submit payment proof for bank transfer with receipt upload."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Request Body (Bank Transfer)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
  "student_id": 123,
  "student_fee_id": 45,
  "amount": 30000.00,
  "payment_method": "bank_transfer",
  "payment_date": "2024-01-20",
  "transfer_receipt_image": "data:image/jpeg;base64,...",
  "bank_name": "First Bank",
  "account_number": "1234567890",
  "notes": "Payment for tuition"
}`}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (201)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
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
}`}),e.jsx("div",{style:{backgroundColor:"#fffbeb",padding:"1rem",borderRadius:"0.5rem",marginTop:"1rem",borderLeft:"4px solid #f59e0b"},children:e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Note:"}),' Bank transfer payments are marked as "pending" and require school verification. Paystack payments are auto-verified.']})})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #ed8936",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#4299e1",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"GET"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/accounting/parent/get-payment-history.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Get all payment records for a child with verification status."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Query Parameters"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Parameter"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"student_id"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"integer"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Required. The student's ID"})]})})]}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
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
}`}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Verification Status Values"}),e.jsxs("ul",{style:{marginLeft:"1.5rem",marginBottom:"1rem"},children:[e.jsxs("li",{children:[e.jsx("code",{children:"pending"})," - Awaiting school verification (bank transfers)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"verified"})," - Payment confirmed"]}),e.jsxs("li",{children:[e.jsx("code",{children:"rejected"})," - Payment rejected by school"]})]})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #ed8936",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#48bb78",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"POST"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/accounting/parent/initialize-paystack-payment.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Initialize Paystack online payment and get authorization URL. Includes ₦200 platform fee + Paystack transaction charges (paid by parent)."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Request Body"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
  "student_id": 123,
  "student_fee_id": 45,
  "amount": 30000.00,
  "email": "parent@example.com",
  "callback_url": "myapp://payment-callback"
}`}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
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
}`}),e.jsx("div",{style:{backgroundColor:"#fffbeb",padding:"1rem",borderRadius:"0.5rem",marginTop:"1rem",borderLeft:"4px solid #f59e0b"},children:e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Fee Structure:"})," Parent pays: School Fee + ₦200 Platform Fee + Paystack Charges. School receives the fee amount directly via subaccount settlement."]})})]}),e.jsxs("div",{style:{marginBottom:"2rem",borderLeft:"4px solid #ed8936",paddingLeft:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"},children:[e.jsx("span",{style:{backgroundColor:"#48bb78",color:"white",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",fontWeight:"bold",fontSize:"0.875rem"},children:"POST"}),e.jsx("code",{style:{fontSize:"1.125rem",color:"#2d3748"},children:"/accounting/parent/verify-paystack-payment.php"})]}),e.jsx("p",{style:{marginBottom:"1rem"},children:"Verify Paystack payment and record it automatically."}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Request Body"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
  "reference": "FEE_123_45_1705756800"
}`}),e.jsx("h4",{style:{fontSize:"1rem",fontWeight:"600",marginTop:"1rem",marginBottom:"0.5rem"},children:"Success Response (200)"}),e.jsx("pre",{style:{backgroundColor:"#2d3748",color:"#48bb78",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",fontSize:"0.875rem"},children:`{
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
}`}),e.jsx("div",{style:{backgroundColor:"#f0fff4",padding:"1rem",borderRadius:"0.5rem",marginTop:"1rem",borderLeft:"4px solid #48bb78"},children:e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Auto-Verification:"})," Paystack payments are automatically verified and the student's fee status is updated immediately."]})})]})]}),e.jsxs("section",{id:"notification-endpoints",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1.5rem",borderBottom:"3px solid #667eea",paddingBottom:"0.5rem"},children:"🔔 Notifications"}),e.jsx("p",{style:{marginBottom:"2rem",color:"#4a5568"},children:"Stay updated with real-time notifications about report cards, fee payments, attendance alerts, and school announcements. Supports both in-app notifications and push notifications via Firebase Cloud Messaging (FCM)."}),e.jsxs("div",{style:{marginBottom:"3rem"},children:[e.jsxs("h3",{style:{fontSize:"1.5rem",fontWeight:"600",color:"#2d3748",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{backgroundColor:"#667eea",color:"white",padding:"0.25rem 0.5rem",borderRadius:"0.25rem",fontSize:"0.75rem"},children:"GET"}),"Get Notifications"]}),e.jsx("div",{style:{backgroundColor:"#1a202c",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",marginBottom:"1rem",fontFamily:"monospace",fontSize:"0.875rem",overflowX:"auto"},children:"GET /parent/notifications/get"}),e.jsxs("p",{style:{marginBottom:"1rem"},children:[e.jsx("strong",{children:"Description:"})," Fetch all notifications for the authenticated parent. Supports filtering by type, unread status, and pagination."]}),e.jsx("p",{style:{marginBottom:"0.5rem"},children:e.jsx("strong",{children:"Query Parameters:"})}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Parameter"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Required"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"limit"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"integer"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"No"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Number of notifications to return (default: 50)"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"offset"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"integer"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"No"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Number of notifications to skip (default: 0)"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"unread_only"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"boolean"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"No"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Filter to show only unread notifications (true/false)"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"type"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"string"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"No"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Filter by type: report_card, fee_payment, attendance, announcement"})]})]})]}),e.jsx("p",{style:{marginBottom:"0.5rem"},children:e.jsx("strong",{children:"Response:"})}),e.jsx("pre",{style:{backgroundColor:"#1a202c",color:"#68d391",padding:"1rem",borderRadius:"0.5rem",overflowX:"auto",fontSize:"0.875rem"},children:`{
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
}`})]}),e.jsxs("div",{style:{marginBottom:"3rem"},children:[e.jsxs("h3",{style:{fontSize:"1.5rem",fontWeight:"600",color:"#2d3748",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{backgroundColor:"#48bb78",color:"white",padding:"0.25rem 0.5rem",borderRadius:"0.25rem",fontSize:"0.75rem"},children:"POST"}),"Mark Notification(s) as Read"]}),e.jsx("div",{style:{backgroundColor:"#1a202c",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",marginBottom:"1rem",fontFamily:"monospace",fontSize:"0.875rem",overflowX:"auto"},children:"POST /parent/notifications/mark-as-read"}),e.jsxs("p",{style:{marginBottom:"1rem"},children:[e.jsx("strong",{children:"Description:"})," Mark one specific notification or all notifications as read."]}),e.jsx("p",{style:{marginBottom:"0.5rem"},children:e.jsx("strong",{children:"Request Body:"})}),e.jsx("pre",{style:{backgroundColor:"#1a202c",color:"#63b3ed",padding:"1rem",borderRadius:"0.5rem",overflowX:"auto",fontSize:"0.875rem",marginBottom:"1rem"},children:`// Mark single notification
{
  "notification_id": 123
}

// Mark all notifications
{
  "mark_all": true
}`}),e.jsx("p",{style:{marginBottom:"0.5rem"},children:e.jsx("strong",{children:"Response:"})}),e.jsx("pre",{style:{backgroundColor:"#1a202c",color:"#68d391",padding:"1rem",borderRadius:"0.5rem",overflowX:"auto",fontSize:"0.875rem"},children:`{
  "success": true,
  "message": "Notification marked as read"
}`})]}),e.jsxs("div",{style:{marginBottom:"3rem"},children:[e.jsxs("h3",{style:{fontSize:"1.5rem",fontWeight:"600",color:"#2d3748",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{backgroundColor:"#48bb78",color:"white",padding:"0.25rem 0.5rem",borderRadius:"0.25rem",fontSize:"0.75rem"},children:"POST"}),"Register Device for Push Notifications"]}),e.jsx("div",{style:{backgroundColor:"#1a202c",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",marginBottom:"1rem",fontFamily:"monospace",fontSize:"0.875rem",overflowX:"auto"},children:"POST /parent/notifications/register-device"}),e.jsxs("p",{style:{marginBottom:"1rem"},children:[e.jsx("strong",{children:"Description:"})," Register the device's FCM token to receive push notifications. This should be called when the app launches or when permissions are granted."]}),e.jsx("p",{style:{marginBottom:"0.5rem"},children:e.jsx("strong",{children:"Request Body:"})}),e.jsx("pre",{style:{backgroundColor:"#1a202c",color:"#63b3ed",padding:"1rem",borderRadius:"0.5rem",overflowX:"auto",fontSize:"0.875rem",marginBottom:"1rem"},children:`{
  "device_token": "fcm_token_string_from_firebase",
  "device_type": "android",  // or "ios"
  "device_name": "Samsung Galaxy S21"  // optional
}`}),e.jsx("p",{style:{marginBottom:"0.5rem"},children:e.jsx("strong",{children:"Response:"})}),e.jsx("pre",{style:{backgroundColor:"#1a202c",color:"#68d391",padding:"1rem",borderRadius:"0.5rem",overflowX:"auto",fontSize:"0.875rem"},children:`{
  "success": true,
  "message": "Device token registered",
  "token_id": 45
}`}),e.jsx("div",{style:{backgroundColor:"#fef5e7",padding:"1rem",borderRadius:"0.5rem",marginTop:"1rem",borderLeft:"4px solid #f39c12"},children:e.jsxs("p",{style:{margin:0},children:[e.jsx("strong",{children:"Important:"})," Register the device token every time the app launches to ensure the token stays active and updated."]})})]}),e.jsxs("div",{style:{marginBottom:"2rem"},children:[e.jsx("h3",{style:{fontSize:"1.25rem",fontWeight:"600",color:"#2d3748",marginBottom:"1rem"},children:"Notification Types"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Type"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Data Fields"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"report_card"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"New report card published for student"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"report_id, student_id, student_name, term, session"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"fee_payment"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Fee payment reminder or due date alert"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"student_id, fee_amount, fee_name, due_date"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"attendance"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Student attendance alert (absence)"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"student_id, student_name, date, status"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"announcement"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"School-wide announcements"}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Varies based on announcement"})]})]})]})]})]}),e.jsxs("section",{id:"errors",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1.5rem",borderBottom:"3px solid #f56565",paddingBottom:"0.5rem"},children:"⚠️ HTTP Status Codes"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#edf2f7"},children:[e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Code"}),e.jsx("th",{style:{padding:"0.75rem",textAlign:"left",borderBottom:"2px solid #cbd5e0"},children:"Description"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"200"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Success"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"400"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Bad Request - Invalid input"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"401"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Unauthorized - Not logged in or session expired"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"403"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Forbidden - Parent not associated with this student"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"404"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Not Found - Parent or student not found"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:e.jsx("code",{children:"500"})}),e.jsx("td",{style:{padding:"0.75rem",borderBottom:"1px solid #e2e8f0"},children:"Internal Server Error"})]})]})]})]}),e.jsxs("section",{id:"examples",style:{backgroundColor:"white",borderRadius:"0.5rem",padding:"2rem",marginBottom:"2rem",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},children:[e.jsx("h2",{style:{fontSize:"1.875rem",fontWeight:"bold",color:"#1a202c",marginBottom:"1.5rem",borderBottom:"3px solid #48bb78",paddingBottom:"0.5rem"},children:"📝 Code Examples"}),e.jsx("h3",{style:{fontSize:"1.25rem",fontWeight:"600",marginTop:"1.5rem",marginBottom:"1rem"},children:"JavaScript/React Native"}),e.jsxs("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",position:"relative"},children:[e.jsx("button",{onClick:()=>r(`// Login
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
});`),style:{position:"absolute",top:"0.5rem",right:"0.5rem",backgroundColor:"#4a5568",color:"white",border:"none",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",cursor:"pointer",fontSize:"0.75rem"},children:"Copy"}),e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`// Login
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
});`})})]}),e.jsx("h3",{style:{fontSize:"1.25rem",fontWeight:"600",marginTop:"1.5rem",marginBottom:"1rem"},children:"cURL"}),e.jsxs("div",{style:{backgroundColor:"#2d3748",color:"#e2e8f0",padding:"1rem",borderRadius:"0.5rem",overflow:"auto",position:"relative"},children:[e.jsx("button",{onClick:()=>r(`curl -X POST https://schoolhub.tech/backend/routes/parent/login.php \\
  -H "Content-Type: application/json" \\
  -d '{"email": "parent@example.com", "password": "your_password"}' \\
  -c cookies.txt

curl -X GET https://schoolhub.tech/backend/routes/parent/get-children.php \\
  -b cookies.txt`),style:{position:"absolute",top:"0.5rem",right:"0.5rem",backgroundColor:"#4a5568",color:"white",border:"none",padding:"0.25rem 0.75rem",borderRadius:"0.25rem",cursor:"pointer",fontSize:"0.75rem"},children:"Copy"}),e.jsx("pre",{style:{margin:0,fontSize:"0.875rem"},children:e.jsx("code",{children:`curl -X POST https://schoolhub.tech/backend/routes/parent/login.php \\
  -H "Content-Type: application/json" \\
  -d '{"email": "parent@example.com", "password": "your_password"}' \\
  -c cookies.txt

curl -X GET https://schoolhub.tech/backend/routes/parent/get-children.php \\
  -b cookies.txt`})})]})]})]}),e.jsxs("footer",{style:{backgroundColor:"#2d3748",color:"white",padding:"2rem 1rem",textAlign:"center"},children:[e.jsx("p",{style:{margin:"0 0 0.5rem 0"},children:"SchoolHub Parent API Documentation v1.0"}),e.jsxs("p",{style:{margin:0,fontSize:"0.875rem",opacity:.8},children:["For support, contact: ",e.jsx("a",{href:"mailto:support@schoolhub.tech",style:{color:"#90cdf4"},children:"support@schoolhub.tech"})]})]})]})]})};export{d as default};
