# Campus Placement Portal

This is an AI-powered Campus Placement Portal built using React 19, Vite, and a FastAPI (Python) backend with PostgreSQL.

The portal provides an end-to-end recruitment pipeline, featuring an automated AI-driven ATS resume scorer, a student dashboard, and an administrator dashboard.

## What's Built So Far

* **Authentication & Routing**: Secure Login and Registration flow, including Google OAuth integration. Upon successful login, users are automatically routed to either the **Student Dashboard** or **Admin Dashboard** depending on their role.
* **Landing Page**: Fully responsive landing page with Hero section, Features, Timeline, and quick links.
* **Student Dashboard**: Includes resume upload with AI ATS scoring feedback, profile editing, and job tracking.
* **Admin/Recruiter Dashboard**: Allows admins to view registered students, track job postings, shortlist candidates, and manage the hiring pipeline.
* **Backend Pipeline**: A complete FastAPI backend connecting to a PostgreSQL database, featuring an automated database seeder for initial mockup data, and OpenAI API integration for parsing and scoring PDF resumes.

## Tech Stack

### Frontend
* **React 19** with **Vite**
* **React Router DOM v7** (routing configuration in `src/App.jsx`)
* **Lucide React** (icons)
* **Recharts** (analytics/dashboard charts)
* **CSS** (plain custom CSS using variables defined in `src/index.css`)

### Backend
* **Python 3** with **FastAPI**
* **PostgreSQL** (Relational Database)
* **SQLAlchemy** (ORM)
* **Uvicorn** (ASGI server)
* **OpenAI API** (ATS Resume Parsing)

## How to Run It

You will need two terminal windows to run the full application (one for the frontend, one for the backend).

### 1. Start the Backend (FastAPI)

Ensure you have your PostgreSQL database running.

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*The backend server will run on [http://localhost:8000](http://localhost:8000).*

### 2. Start the Frontend (React + Vite)

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```
*Open the URL shown in your terminal (usually [http://localhost:5173](http://localhost:5173)).*
