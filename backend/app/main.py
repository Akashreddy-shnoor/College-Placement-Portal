from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import os
import urllib.parse
import uuid
import httpx
import cloudinary
import cloudinary.uploader

from .database import engine, Base, get_db
from . import models, schemas, crud, parser

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

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

def auto_migrate(db: Session):
    # Add new columns gracefully
    new_columns = [
        "roll_number VARCHAR DEFAULT ''", "phone_number VARCHAR DEFAULT ''", 
        "department VARCHAR DEFAULT ''", "passout_year VARCHAR DEFAULT ''", 
        "dob VARCHAR DEFAULT ''", "profile_picture VARCHAR DEFAULT ''", 
        "cgpa VARCHAR DEFAULT ''", "academic_10th VARCHAR DEFAULT ''", 
        "academic_inter VARCHAR DEFAULT ''", "current_cgpa VARCHAR DEFAULT ''", 
        "backlogs INTEGER DEFAULT 0", "semester_details JSON DEFAULT '[]'", 
        "projects JSON DEFAULT '[]'", "certifications JSON DEFAULT '[]'", 
        "internships JSON DEFAULT '[]'",
        "resume_url VARCHAR DEFAULT ''"
    ]
    for col in new_columns:
        try:
            db.execute(text(f"ALTER TABLE students ADD COLUMN {col}"))
            db.commit()
        except Exception:
            db.rollback()
            
    new_job_columns = [
        "min_cgpa VARCHAR DEFAULT '0.0'",
        "allowed_branches VARCHAR DEFAULT ''",
        "passout_year VARCHAR DEFAULT ''",
        "deadline VARCHAR DEFAULT ''",
        "backlogs VARCHAR DEFAULT 'No Backlogs'",
        "job_type VARCHAR DEFAULT 'Full-time'",
        "status VARCHAR DEFAULT 'Open'"
    ]
    for col in new_job_columns:
        try:
            db.execute(text(f"ALTER TABLE jobs ADD COLUMN {col}"))
            db.commit()
        except Exception:
            db.rollback()

@app.on_event("startup")
def prepopulate_db():
    db = next(get_db())
    auto_migrate(db)
    try:
        # Delete default demo students from database if they exist to keep it clean
        default_usernames = ["student1", "priya", "rahul"]
        db.query(models.Student).filter(models.Student.username.in_(default_usernames)).delete(synchronize_session=False)

        # Prepopulate Default Jobs
        default_jobs = [
            {
                "id": "job_1",
                "title": "Frontend Developer",
                "company": "Microsoft India",
                "location": "Hyderabad (Hybrid)",
                "salary": "₹14,00,000 LPA",
                "requirements": "React JS, JavaScript, CSS3, HTML5",
                "description": "Join our office productivity suite team to craft next-generation responsive experiences.",
                "min_cgpa": "7.0",
                "allowed_branches": "CSE, IT",
                "passout_year": "2024 - 2026",
                "deadline": "30 May 2026",
                "backlogs": "No Backlogs",
                "job_type": "Full-time",
                "status": "Open"
            },
            {
                "id": "job_2",
                "title": "Python Backend Engineer",
                "company": "Google India",
                "location": "Bengaluru (On-site)",
                "salary": "₹18,00,000 LPA",
                "requirements": "Python, Django, PostgreSQL, Docker",
                "description": "Design secure cloud microservices, automate parsing workflows and manage relational datasets.",
                "min_cgpa": "7.5",
                "allowed_branches": "CSE, IT",
                "passout_year": "2024 - 2026",
                "deadline": "25 May 2026",
                "backlogs": "1 Allowed",
                "job_type": "Full-time",
                "status": "Open"
            },
            {
                "id": "job_3",
                "title": "SDE",
                "company": "Shnoor International LLC",
                "location": "Remote",
                "salary": "₹6,00,000 LPA",
                "requirements": "MERN, MongoDB, Express JS, React JS",
                "description": "Build and maintain modern web applications using the MERN stack.",
                "min_cgpa": "6.5",
                "allowed_branches": "CSE, IT, ECE",
                "passout_year": "2024 - 2026",
                "deadline": "20 May 2026",
                "backlogs": "No Backlogs",
                "job_type": "Full-time",
                "status": "Closing Soon"
            }
        ]

        for dj in default_jobs:
            exist = db.query(models.Job).filter(models.Job.id == dj["id"]).first()
            if exist:
                # Update existing seed jobs with new metadata fields
                exist.title = dj["title"]
                exist.company = dj["company"]
                exist.location = dj["location"]
                exist.salary = dj["salary"]
                exist.requirements = dj["requirements"]
                exist.description = dj["description"]
                exist.min_cgpa = dj["min_cgpa"]
                exist.allowed_branches = dj["allowed_branches"]
                exist.passout_year = dj["passout_year"]
                exist.deadline = dj["deadline"]
                exist.backlogs = dj["backlogs"]
                exist.job_type = dj["job_type"]
                exist.status = dj["status"]
            else:
                new_job = models.Job(
                    id=dj["id"],
                    title=dj["title"],
                    company=dj["company"],
                    location=dj["location"],
                    salary=dj["salary"],
                    requirements=dj["requirements"],
                    description=dj["description"],
                    applicants_count=0,
                    min_cgpa=dj["min_cgpa"],
                    allowed_branches=dj["allowed_branches"],
                    passout_year=dj["passout_year"],
                    deadline=dj["deadline"],
                    backlogs=dj["backlogs"],
                    job_type=dj["job_type"],
                    status=dj["status"]
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
def google_login(origin: Optional[str] = None):
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    
    # Store dynamic frontend origin in the state parameter
    state = origin if origin else ""
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": state
    }
    
    auth_url = f"{google_auth_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(auth_url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str, state: Optional[str] = None, db: Session = Depends(get_db)):
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
    if state and (state.startswith("http://") or state.startswith("https://")):
        frontend_url = state if "/login" in state else f"{state.rstrip('/')}/login"

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

@app.put("/api/jobs/{job_id}", response_model=schemas.JobResponse)
def update_job(job_id: str, job: schemas.JobCreate, db: Session = Depends(get_db)):
    updated = crud.update_job(db, job_id, job)
    if not updated:
        raise HTTPException(status_code=404, detail="Job opening not found")
    return updated

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

@app.put("/api/students/{student_id}", response_model=schemas.StudentResponse)
def update_student_profile(student_id: str, updates: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = crud.update_student(db, student_id, updates)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

# Shortlist Toggle — per-job
@app.post("/api/students/shortlist/{student_id}", response_model=schemas.StudentResponse)
def shortlist_student(student_id: str, job_id: Optional[str] = None, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if job_id:
        # Per-job shortlist: toggle only the specific Application row
        app_row = db.query(models.Application).filter(
            models.Application.student_id == student_id,
            models.Application.job_id == job_id
        ).first()
        if app_row:
            app_row.status = "Shortlisted" if app_row.status != "Shortlisted" else "Applied"
            db.commit()
    else:
        # Legacy global toggle (used from Students table where no job context)
        new_status = "Shortlisted" if student.application_status != "Shortlisted" else "Under Review"
        student.application_status = new_status
        db.query(models.Application).filter(
            models.Application.student_id == student_id
        ).update({"status": new_status})
        db.commit()

    db.refresh(student)
    return student

# Per-student application statuses (for student dashboard per-job status)
@app.get("/api/students/{student_id}/applications")
def read_student_applications(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    apps = db.query(models.Application).filter(
        models.Application.student_id == student_id
    ).all()
    return [{"jobId": a.job_id, "status": a.status} for a in apps]

# Update application status directly (Applied / Under Review / Shortlisted / Rejected)
@app.patch("/api/applications/{application_id}/status")
def update_application_status(application_id: str, payload: dict, db: Session = Depends(get_db)):
    app_row = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="status field required")
    app_row.status = new_status
    db.commit()
    db.refresh(app_row)
    return {"id": app_row.id, "status": app_row.status}

@app.post("/api/applications/apply", response_model=schemas.StudentResponse)
def apply_job(student_id: str, job_id: str, resume_id: str, db: Session = Depends(get_db)):
    student = crud.apply_to_job(db, student_id, job_id, resume_id)
    if not student:
        raise HTTPException(status_code=404, detail="Invalid Student ID, Job ID, or Resume ID")
    return student

@app.get("/api/jobs/{job_id}/applicants", response_model=List[schemas.ApplicationResponse])
def read_job_applicants(job_id: str, db: Session = Depends(get_db)):
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")
    applications = crud.get_applications_by_job(db, job_id)
    return [
        {
            "id": app.id,
            "studentId": app.student_id,
            "jobId": app.job_id,
            "resumeId": app.resume_id,
            "resumeName": app.resume.name if app.resume else "",
            "resumeUrl": app.resume_url or (app.resume.url if app.resume else ""),
            "status": app.status,
            "studentName": app.student.name if app.student else "",
            "studentEmail": app.student.email if app.student else "",
            "studentCgpa": app.student.cgpa if app.student else "",
            "studentDepartment": app.student.department if app.student else "",
            "studentRollNumber": app.student.roll_number if app.student else "",
            "appliedAt": app.applied_at
        }
        for app in applications
    ]

# Apply with resume upload (allows uploading a resume specifically for this application)
@app.post("/api/applications/apply-with-resume", response_model=schemas.StudentResponse)
async def apply_with_resume(
    student_id: str,
    job_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Read file bytes and upload to Cloudinary
    try:
        file_bytes = await file.read()
        _, ext = os.path.splitext(file.filename)
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            resource_type="raw",
            folder="placement_portal/resumes",
            public_id=f"{student_id}_{uuid.uuid4().hex[:8]}{ext}",
            overwrite=True,
            type="upload",
            access_mode="public"
        )
        resume_cloud_url = upload_result.get("secure_url", "")
    except Exception as e:
        print(f"Cloudinary upload failed during apply: {e}")
        resume_cloud_url = ""

    # Create resume record
    new_resume = crud.create_student_resume(db, student_id, file.filename, resume_cloud_url)

    # Create application using the new resume
    student_after = crud.create_application(db, student_id, job_id, new_resume.id)
    if not student_after:
        raise HTTPException(status_code=404, detail="Invalid Student ID, Job ID, or Resume error")

    return student_after

# Cloudinary PDF Resume Upload
@app.post("/api/students/{student_id}/resume", response_model=schemas.StudentResponse)
async def upload_resume(
    student_id: str, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 1. Read file bytes
    file_bytes = await file.read()

    # 2. Upload resume PDF to Cloudinary for persistent cloud storage
    try:
        _, ext = os.path.splitext(file.filename)
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            resource_type="raw",
            folder="placement_portal/resumes",
            public_id=f"{student_id}_{uuid.uuid4().hex[:8]}{ext}",
            overwrite=True,
            type="upload",
            access_mode="public"
        )
        resume_cloud_url = upload_result.get("secure_url", "")
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        resume_cloud_url = ""

    crud.create_student_resume(db, student_id, file.filename, resume_cloud_url)
    student = crud.get_student(db, student_id)

    # Toggle application pipeline status
    if student.application_status == "None":
        student.application_status = "Applied"
        db.commit()
        db.refresh(student)

    return student

@app.delete("/api/students/{student_id}/resume", response_model=schemas.StudentResponse)
def delete_resume(student_id: str, resume_id: Optional[str] = None, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    deleted = crud.delete_student_resume(db, student_id, resume_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resume not found")

    student = crud.get_student(db, student_id)
    return student

# Proxy endpoint to serve resume files (bypasses Cloudinary 401 on strict accounts)
@app.get("/api/students/{student_id}/resume/view")
async def view_resume(student_id: str, resume_id: Optional[str] = None, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    resume = None
    if resume_id:
        resume = crud.get_student_resume(db, student_id, resume_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
    elif student.resume_url:
        resume = type("R", (), {"name": student.resume_name, "url": student.resume_url})()
    else:
        resume_list = crud.get_student_resumes(db, student_id)
        if resume_list:
            resume = resume_list[0]

    if not resume or not resume.url:
        raise HTTPException(status_code=404, detail="No resume uploaded")

    # Fetch the file from Cloudinary using httpx (server-side, bypasses CORS/auth issues)
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(resume.url)
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Failed to fetch resume from cloud storage")
            
            # Determine content type from filename
            content_type = "application/pdf"
            if resume.name and resume.name.lower().endswith(".docx"):
                content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            
            return StreamingResponse(
                iter([response.content]),
                media_type=content_type,
                headers={
                    "Content-Disposition": f"inline; filename=\"{resume.name or 'resume.pdf'}\"",
                    "Cache-Control": "public, max-age=3600"
                }
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Cloud storage error: {str(e)}")
