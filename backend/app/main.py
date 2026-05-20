from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import urllib.parse
import uuid
import httpx

from .database import engine, Base, get_db
from . import models, schemas, crud, parser

# Auto-generate PostgreSQL database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="College Placement Portal API", 
    description="AI-Powered ATS resume ranking and candidate analytics backend.",
    version="1.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for developer flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Database Prepopulation Helper
@app.on_event("startup")
def prepopulate_db():
    db = next(get_db())
    try:
        # Prepopulate Default Students
        default_students = [
            {
                "id": "std_1",
                "username": "student1",
                "name": "Akash Reddy",
                "email": "akash.reddy@university.edu",
                "password": "cpp",
                "skills": "React JS, JavaScript, Python, SQL",
                "ats_score": 87,
                "resume_name": "Akash_Reddy_Resume.pdf",
                "suggestions": [
                    "Highlight metrics on React optimization (e.g. 'Optimized render cycles, improving FPS by 18%').",
                    "Add detailed PostgreSQL DB indices configuration to the database experience.",
                    "Complete a cloud certification (e.g. AWS Certified Developer) to match top backend vacancies."
                ]
            },
            {
                "id": "std_2",
                "username": "priya",
                "name": "Priya Sharma",
                "email": "priya.sharma@university.edu",
                "password": "cpp",
                "skills": "React JS, HTML5, JavaScript, CSS3",
                "ats_score": 78,
                "resume_name": "Priya_Sharma_Frontend.pdf",
                "suggestions": [
                    "Integrate structured state-management patterns (Redux/Zustand) in React projects.",
                    "Quantify your accomplishments (e.g. 'Created pixel-perfect views, reducing UI bugs by 35%').",
                    "Demonstrate API fetching and asynchronous data handling footprints."
                ]
            },
            {
                "id": "std_3",
                "username": "rahul",
                "name": "Rahul Verma",
                "email": "rahul.verma@university.edu",
                "password": "cpp",
                "skills": "Python, FastAPI, Django, Docker, PostgreSQL",
                "ats_score": 92,
                "resume_name": "Rahul_Verma_Backend.pdf",
                "suggestions": [
                    "Great database modeling and Docker containerization coverage.",
                    "Add automated unit-testing pipelines details (e.g. pytest, unitest coverages).",
                    "Mention asynchronous queues configurations (e.g. Celery, Redis) to target elite vacancies."
                ]
            }
        ]

        for ds in default_students:
            exist = db.query(models.Student).filter(models.Student.username == ds["username"]).first()
            if not exist:
                new_std = models.Student(
                    id=ds["id"],
                    username=ds["username"],
                    name=ds["name"],
                    email=ds["email"],
                    password=ds.get("password", "cpp"),
                    skills=ds["skills"],
                    ats_score=ds["ats_score"],
                    resume_name=ds["resume_name"],
                    suggestions=ds["suggestions"],
                    applied_jobs=[],
                    application_status="Under Review"
                )
                db.add(new_std)

        # Prepopulate Default Jobs
        default_jobs = [
            {
                "id": "job_1",
                "title": "Frontend Developer",
                "company": "Microsoft India",
                "location": "Hyderabad (Hybrid)",
                "salary": "₹14,00,000 LPA",
                "requirements": "React JS, JavaScript, CSS3, HTML5",
                "description": "Join our office productivity suite team to craft next-generation responsive experiences."
            },
            {
                "id": "job_2",
                "title": "Python Backend Engineer",
                "company": "Google India",
                "location": "Bengaluru (On-site)",
                "salary": "₹18,00,000 LPA",
                "requirements": "Python, Django, PostgreSQL, Docker",
                "description": "Design secure cloud microservices, automate parsing workflows and manage relational datasets."
            }
        ]

        for dj in default_jobs:
            exist = db.query(models.Job).filter(models.Job.id == dj["id"]).first()
            if not exist:
                new_job = models.Job(
                    id=dj["id"],
                    title=dj["title"],
                    company=dj["company"],
                    location=dj["location"],
                    salary=dj["salary"],
                    requirements=dj["requirements"],
                    description=dj["description"],
                    applicants_count=0
                )
                db.add(new_job)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

# --- ROUTES ---

@app.post("/api/auth/login", response_model=schemas.LoginResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1. Admin login verification
    if request.username == "college" and request.password == "cpp":
        return schemas.LoginResponse(
            role="admin",
            userData={"name": "System Administrator", "email": "cpp@university.edu"}
        )

    # 2. Student login verification
    student = crud.get_student_by_username(db, request.username)
    if student:
        if student.password == request.password:
            return schemas.LoginResponse(role="student", userData=student)
        else:
            raise HTTPException(status_code=401, detail="Invalid student credentials")
    
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/api/auth/register", response_model=schemas.LoginResponse, status_code=status.HTTP_201_CREATED)
def register(request: schemas.StudentRegister, db: Session = Depends(get_db)):
    # Check if username exists
    existing = crud.get_student_by_username(db, request.username.lower())
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create student profile dynamically
    new_std = crud.create_student(db, request)
    return schemas.LoginResponse(role="student", userData=new_std)

# --- GOOGLE OAUTH 2.0 FLOW ---

@app.get("/api/auth/google")
def google_login():
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    
    auth_url = f"{google_auth_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(auth_url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    token_url = "https://oauth2.googleapis.com/token"
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    
    data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    
    # 1. Exchange authorization code for token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=data)
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve access token from Google.")
        tokens = token_response.json()
        
    access_token = tokens.get("access_token")
    
    # 2. Retrieve user info using token
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        profile_response = await client.get(userinfo_url, headers=headers)
        if profile_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve user profile from Google.")
        profile = profile_response.json()
        
    google_email = profile.get("email")
    google_name = profile.get("name")
    
    # Convert email prefix to a clean username
    username_prefix = google_email.split('@')[0].lower()
    
    # 3. Query DB to check if user already exists
    student = crud.get_student_by_username(db, username_prefix)
    if not student:
        # User doesn't exist, create student row automatically
        student = models.Student(
            id="std_g_" + str(uuid.uuid4())[:8],
            username=username_prefix,
            name=google_name or username_prefix.capitalize(),
            email=google_email,
            password="oauth_google_protected_" + str(uuid.uuid4())[:6],
            skills="React JS, Python, SQL",
            ats_score=0,
            applied_jobs=[],
            application_status="None"
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        
    # 4. Redirect browser back to React login page with profile details
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173/login")
    params = {
        "oauth_success": "true",
        "username": student.username,
        "name": student.name,
        "email": student.email,
        "role": "student"
    }
    
    redirect_destination = f"{frontend_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(redirect_destination)

# Job Feeds & Managers
@app.get("/api/jobs", response_model=List[schemas.JobResponse])
def read_jobs(db: Session = Depends(get_db)):
    return crud.get_jobs(db)

@app.post("/api/jobs", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    return crud.create_job(db, job)

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    success = crud.delete_job(db, job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job opening not found")
    return {"status": "deleted"}

# Student Directory & Search
@app.get("/api/students", response_model=List[schemas.StudentResponse])
def read_students(db: Session = Depends(get_db)):
    return crud.get_students(db)

@app.get("/api/students/{student_id}", response_model=schemas.StudentResponse)
def read_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

# Shortlist Toggles
@app.post("/api/students/shortlist/{student_id}", response_model=schemas.StudentResponse)
def shortlist_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    student.application_status = (
        "Shortlisted" if student.application_status != "Shortlisted" else "Under Review"
    )
    db.commit()
    db.refresh(student)
    return student

# Job Matchmaking Trigger
@app.post("/api/applications/apply", response_model=schemas.StudentResponse)
def apply_job(student_id: str, job_id: str, db: Session = Depends(get_db)):
    student = crud.apply_to_job(db, student_id, job_id)
    if not student:
        raise HTTPException(status_code=404, detail="Invalid Student ID or Job ID")
    return student

# OpenAI PDF Resume Multipart parser Upload
@app.post("/api/students/{student_id}/resume", response_model=schemas.StudentResponse)
async def upload_resume(
    student_id: str, 
    file: UploadFile = File(...), 
    job_id: Optional[str] = Form(None), 
    db: Session = Depends(get_db)
):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 1. Read file bytes
    file_bytes = await file.read()
    
    # 2. Extract PDF text
    raw_text = parser.extract_text_from_pdf(file_bytes)
    if not raw_text or raw_text.strip() == "":
        raise HTTPException(status_code=400, detail="Unable to extract text from PDF resume. Check format.")

    # 3. Retrieve target job requirements or use defaults
    target_reqs = "React JS, JavaScript, Python, SQL, Django, Docker, Node.js"
    if job_id:
        job = crud.get_job(db, job_id)
        if job:
            target_reqs = job.requirements

    # 4. Analyze resume using OpenAI API agent
    ai_results = parser.parse_resume_with_openai(raw_text, target_reqs)

    # 5. Commit parsed details to student's DB record
    student.resume_name = file.filename
    student.ats_score = ai_results.get("ats_score", 70)
    student.skills = ai_results.get("extracted_skills", student.skills)
    student.suggestions = ai_results.get("suggestions", [])
    
    # Dynamically extract and assign candidate name and email if available
    extracted_name = ai_results.get("candidate_name", "")
    if extracted_name and extracted_name != "Candidate" and extracted_name != student.username.capitalize():
        student.name = extracted_name
        
    extracted_email = ai_results.get("candidate_email", "")
    if extracted_email and "@" in extracted_email and extracted_email != "email@university.edu":
        student.email = extracted_email

    # Toggle application pipeline status
    if student.application_status == "None":
        student.application_status = "Applied"

    db.commit()
    db.refresh(student)
    return student
