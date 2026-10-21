# Smart Quiz Backend API

A complete, production-ready RESTful API for the Smart Quiz application built with Node.js, Express, MySQL, JWT authentication, and bcrypt.

---

## 📁 Directory Structure

```
Backend/
│
├── config/
│   ├── db.js                 # MySQL connection pool configuration
│   └── initDb.js             # Automated DB initialization and data seeding
├── controllers/
│   ├── authController.js     # User registration, login, and profile
│   ├── quizController.js     # Quiz CRUD operations
│   ├── questionController.js # Quiz questions management
│   └── submissionController.js# Quiz evaluation, scoring, history, and leaderboards
├── middleware/
│   ├── authMiddleware.js     # JWT token verification & role-based access
│   └── errorMiddleware.js    # 404 handler and central error handler
├── models/
│   ├── schema.sql            # Raw SQL schema definition
│   ├── userModel.js          # User database queries
│   ├── quizModel.js          # Quiz database queries
│   ├── questionModel.js      # Question database queries
│   └── submissionModel.js    # Quiz attempt and answer queries
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── quizRoutes.js         # /api/quizzes routes
│   ├── questionRoutes.js     # /api/questions routes
│   └── submissionRoutes.js   # /api/submissions routes
├── .env                      # Local environment variables
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies and npm scripts
└── server.js                 # Main Express server entry point
```

---

## 🚀 Quick Start Guide

### 1. Configure Environment Variables
Verify or update [.env](file:///c:/Users/CASEXAM/Desktop/smart-quiz/smart-quiz/Backend/.env) with your MySQL credentials:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_quiz

JWT_SECRET=smart_quiz_super_secret_jwt_key_2026
JWT_EXPIRES_IN=24h
```

### 2. Initialize Database & Seed Sample Data
Ensure your local MySQL service is running, then run:
```bash
npm run init-db
```
This automatically:
- Creates the `smart_quiz` database
- Creates all 5 tables (`users`, `quizzes`, `questions`, `submissions`, `submission_answers`)
- Seeds a default admin account (`admin@example.com` / `admin123`)
- Seeds a demo student account (`student@example.com` / `user123`)
- Seeds a sample quiz (*JavaScript & Web Fundamentals*) with questions

*(Optional)* You can also run the SQL script in [models/schema.sql](file:///c:/Users/CASEXAM/Desktop/smart-quiz/smart-quiz/Backend/models/schema.sql) directly in MySQL Workbench or phpMyAdmin.

### 3. Run the Server
- **Development mode** (with auto-reload via nodemon):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

---

## 📡 API Endpoints Overview

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`username`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve authenticated user profile |

### 📝 Quizzes (`/api/quizzes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/quizzes` | Public | List all quizzes (optional filter: `?category=...`) |
| `GET` | `/api/quizzes/:id` | Public | Get quiz by ID with question count |
| `POST` | `/api/quizzes` | Authenticated | Create a new quiz |
| `PUT` | `/api/quizzes/:id` | Creator/Admin | Update an existing quiz |
| `DELETE` | `/api/quizzes/:id` | Creator/Admin | Delete a quiz and all its questions |

### ❓ Questions (`/api/quizzes/:quizId/questions` & `/api/questions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/quizzes/:quizId/questions` | Public | Get questions (answers hidden from test takers) |
| `POST` | `/api/quizzes/:quizId/questions` | Creator/Admin | Add a question with options A, B, C, D and correct_option |
| `DELETE` | `/api/questions/:id` | Creator/Admin | Delete a specific question |

### 🏆 Submissions & Leaderboard (`/api/quizzes/:quizId/...` & `/api/submissions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/quizzes/:quizId/submit` | Authenticated | Submit answers and receive instant graded scorecard |
| `GET` | `/api/quizzes/:quizId/leaderboard` | Public | Get top rankings for a quiz |
| `GET` | `/api/submissions/my-history` | Authenticated | View authenticated user's attempt history |
| `GET` | `/api/submissions/:id` | Authenticated | View detailed scorecard breakdown for an attempt |

---

## 🧪 Example Quiz Submission Payload
`POST /api/quizzes/1/submit`
```json
{
  "answers": [
    { "questionId": 1, "selectedOption": "B" },
    { "questionId": 2, "selectedOption": "A" },
    { "questionId": 3, "selectedOption": "C" }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Quiz submitted and evaluated successfully.",
  "result": {
    "submission_id": 1,
    "quiz_id": 1,
    "quiz_title": "JavaScript & Web Fundamentals",
    "score": 3,
    "total_possible_score": 3,
    "total_questions": 3,
    "percentage": 100,
    "passed": true,
    "breakdown": [
      {
        "question_id": 1,
        "question_text": "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
        "selected_option": "B",
        "correct_option": "B",
        "is_correct": true,
        "points": 1
      }
    ]
  }
}
```
