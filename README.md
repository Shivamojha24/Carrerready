# 🚀 CareerReady – AI-Powered Placement Skill Matcher & Student Readiness Analyzer

**CareerReady** is an AI-powered student development and placement readiness platform designed to guide college students throughout their entire academic journey, from the first year to the final year.

The platform helps students identify their strengths, improve their technical skills, track academic and personal development, and prepare for future career opportunities.

Using Gemini API integration, CareerReady aims to provide personalized AI guidance, student progress analysis, skill-gap identification, and year-wise learning recommendations.

It also provides dedicated dashboards for students, mentors, and placement departments to manage and monitor student development in one centralized platform.

## 🎯 Project Vision

Our vision is to help students become industry-ready from the beginning of their college journey rather than starting placement preparation only in their final year.

CareerReady bridges the gap between academic learning, industry requirements, and actual job readiness.

## ✨ Key Features

### 👨‍🎓 1. Student Dashboard

- Student registration and secure login.
- Manage personal and academic profiles.
- Add technical skills, certifications, projects, and experience.
- Track academic and skill development progress.
- View placement eligibility and readiness information.
- Access personalized learning and career guidance.

### 🤖 2. AI-Powered Personalized Student Guidance

CareerReady integrates Google's Gemini API to support personalized AI-based guidance.

- Personalized recommendations based on student profiles, skills, interests, and career goals.
- AI-assisted identification of strengths and improvement areas.
- Suggestions for technical skills and career development.
- Learning recommendations based on individual student requirements.
- Guidance for improving industry readiness.
- Support for students throughout all four academic years.

### 📊 3. Year-Wise Student Progress Tracking & Analysis

CareerReady focuses on tracking student development throughout their complete college journey.

**First Year – Foundation Building**
- Track programming fundamentals and basic technical skills.
- Improve communication and problem-solving abilities.
- Set initial academic and career goals.
- Receive guidance on essential technical learning.

**Second Year – Skill Development**
- Track Data Structures and Algorithms (DSA).
- Monitor development and technical skills.
- Track mini-projects and certifications.
- Identify technical skill gaps.

**Third Year – Career Preparation**
- Track advanced technical skills and projects.
- Monitor internship preparation.
- Improve aptitude and problem-solving abilities.
- Receive guidance for industry-specific skills.

**Fourth Year – Placement Readiness**
- Monitor overall placement preparation.
- Identify remaining skill gaps.
- Improve resume and interview preparation.
- Track placement eligibility and job-role matching.

**Progress Analysis Across All Years**
- Semester-wise student progress tracking.
- Year-wise performance analysis.
- Track skills, projects, certifications, and achievements.
- Identify areas where students need improvement.
- Generate personalized recommendations based on student progress.

### 🎯 4. Skill Matching & Placement Readiness

- Compare student skills with job-role requirements.
- Identify missing technical and professional skills.
- Understand placement eligibility.
- Analyze student readiness for different job roles.
- Help students prepare according to industry expectations.

### 🧠 5. AI Readiness & Career Guidance

CareerReady aims to help students understand their readiness for modern and AI-driven industries.

- Identify AI-related skill requirements.
- Guide students toward relevant AI and emerging technologies.
- Recommend learning paths based on career interests.
- Help students understand the skills needed for future job opportunities.

### 👨‍🏫 6. Mentor Dashboard

- View registered students.
- Access individual student profiles.
- Monitor student academic and skill development.
- Verify student information.
- Track semester-wise progress.
- Manage student semester promotion.
- Support students through their academic journey.

### 🏢 7. Placement Department Dashboard

- Manage student placement information.
- Monitor placement eligibility and readiness.
- Access student profiles and progress.
- Track placement-related activities.
- Identify students who require additional preparation.
- Support better placement planning and student development.

### 🔐 8. Authentication & Security

- Secure user authentication.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-Based Access Control (RBAC).
- Protected backend API routes.
- Separate access for Student, Mentor, and Placement roles.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | UI styling |
| JavaScript | Frontend functionality |
| Tailwind CSS | Responsive UI design |
| Chart.js | Student progress visualization |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB Atlas | Cloud database |
| Mongoose | Database management |
| Google Gemini API | AI-powered guidance and analysis |
| JWT | Authentication |
| bcrypt | Password security |
| Git & GitHub | Version control |

## 🏗️ System Architecture

CareerReady uses a full-stack architecture connecting the frontend, backend, database, and AI services.

```text
              CAREERREADY PLATFORM
                       |
          +------------+------------+
          |            |            |
       Student       Mentor      Placement
      Dashboard    Dashboard    Dashboard
          |            |            |
          +------------+------------+
                       |
                Node.js + Express
                    Backend
                       |
          +------------+------------+
          |            |            |
       MongoDB       Gemini       Authentication
       Atlas          API          & RBAC
          |            |
     Student Data   AI Guidance
     & Progress     & Analysis
```

## 📁 Project Structure

```text
CareerReady/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── server.js
│
├── frontend/
│   ├── student/
│   ├── mentor/
│   ├── placement/
│   ├── css/
│   └── js/
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

*Note: This is a representative structure. Actual folder and file names may differ in the repository.*

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shivamojha24/Carrerready.git
```

### 2. Navigate to the Project

```bash
cd Carrerready
```

### 3. Install Dependencies

Install the dependencies from the appropriate package files in your project.

```bash
npm install
```

If your backend has its own `package.json`, navigate to the backend folder and install its dependencies there as well.

### 4. Configure Environment Variables

Create a `.env` file in the backend folder and configure the required credentials.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Use the actual environment variable names expected by your backend code.

**Important:** Never upload your `.env` file, database credentials, JWT secret, or Gemini API key to GitHub.

### 5. Start the Backend

```bash
cd backend
npm run start
```

### 6. Open the Frontend

Open the frontend entry HTML file in your browser or use your configured frontend development server.

## ☁️ Deployment

CareerReady can be deployed using cloud hosting platforms.

| Service | Purpose |
|---|---|
| GitHub | Source code management |
| Render / Railway | Full-stack application hosting |
| MongoDB Atlas | Cloud database |
| Google Gemini API | AI-powered guidance |

The application can be configured to serve the frontend and backend through a single public application URL.

## 🔮 Future Scope

- Advanced AI-based student performance prediction.
- More detailed year-wise student analytics.
- Personalized career roadmaps.
- AI-assisted resume analysis.
- AI-powered mock interviews.
- Company-specific skill matching.
- Learning platform integration.
- Advanced placement analytics for colleges.

## 🎓 Project Impact

CareerReady aims to benefit both students and educational institutions.

**For Students:**
- Understand their current skill level.
- Receive personalized learning guidance.
- Track development from first year to final year.
- Identify weaknesses before placement season.
- Prepare for changing industry requirements.

**For Colleges:**
- Monitor student development across academic years.
- Manage student information centrally.
- Identify students requiring additional training.
- Support mentors in tracking student progress.
- Improve placement preparation and planning.

## 👨‍💻 Developer

**Shivam Ojha**

B.Tech – Computer Science and Engineering  
Lovely Professional University

## 🔗 GitHub Repository

[CareerReady – GitHub Repository](https://github.com/Shivamojha24/Carrerready)

---

### CareerReady

**"From First Year to Final Placement – Your Personalized Journey Towards Being Industry Ready."**
