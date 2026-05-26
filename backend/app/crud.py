from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
import uuid

# Student CRUD
def get_student(db: Session, student_id: str):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_username(db: Session, username: str):
    return db.query(models.Student).filter(models.Student.username == username.lower()).first()

def get_students(db: Session):
    return db.query(models.Student).all()

def get_student_resumes(db: Session, student_id: str):
    return db.query(models.Resume).filter(models.Resume.student_id == student_id).order_by(models.Resume.uploaded_at.desc()).all()

def get_student_resume(db: Session, student_id: str, resume_id: str):
    return db.query(models.Resume).filter(
        models.Resume.student_id == student_id,
        models.Resume.id == resume_id
    ).first()

def create_student_resume(db: Session, student_id: str, resume_name: str, resume_url: str):
    resume = models.Resume(
        id="res_" + str(uuid.uuid4())[:8],
        student_id=student_id,
        name=resume_name,
        url=resume_url
    )
    db.add(resume)
    student = get_student(db, student_id)
    if student:
        student.resume_name = resume_name
        student.resume_url = resume_url
    db.commit()
    db.refresh(resume)
    if student:
        db.refresh(student)
    return resume

def delete_student_resume(db: Session, student_id: str, resume_id: str = None):
    query = db.query(models.Resume).filter(models.Resume.student_id == student_id)
    if resume_id:
        query = query.filter(models.Resume.id == resume_id)
    resume = query.order_by(models.Resume.uploaded_at.desc()).first()
    if not resume:
        return None

    db.delete(resume)
    db.commit()

    student = get_student(db, student_id)
    remaining = get_student_resumes(db, student_id)
    if student:
        if remaining:
            student.resume_name = remaining[0].name
            student.resume_url = remaining[0].url
        else:
            student.resume_name = ""
            student.resume_url = ""
        db.commit()
        db.refresh(student)

    return resume

def create_student(db: Session, student: schemas.StudentRegister):
    db_student = models.Student(
        id="std_" + str(uuid.uuid4())[:8],
        username=student.username.lower(),
        name=student.name or student.username.capitalize(),
        email=student.email,
        password=student.password,
        skills=student.skills or "",
        ats_score=0,
        resume_name="",
        suggestions=["No resume uploaded yet. Drag & drop a PDF in the Upload Resume tab to start!"],
        applied_jobs=[],
        application_status="None"
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: str, updates: schemas.StudentUpdate):
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
        
    db.commit()
    db.refresh(db_student)
    return db_student

# Job CRUD
def _attach_real_count(db: Session, job: models.Job) -> models.Job:
    """Attach the real applicant count from the applications table."""
    real_count = db.query(func.count(models.Application.id)).filter(
        models.Application.job_id == job.id
    ).scalar() or 0
    job.applicants_count = real_count
    return job

def get_job(db: Session, job_id: str):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job:
        _attach_real_count(db, job)
    return job

def get_jobs(db: Session):
    jobs = db.query(models.Job).all()
    for job in jobs:
        _attach_real_count(db, job)
    return jobs

def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.Job(
        id="job_" + str(uuid.uuid4())[:8],
        title=job.title,
        company=job.company,
        location=job.location,
        salary=job.salary,
        requirements=job.requirements,
        description=job.description,
        applicants_count=0,
        min_cgpa=job.min_cgpa,
        allowed_branches=job.allowed_branches,
        passout_year=job.passout_year,
        deadline=job.deadline,
        backlogs=job.backlogs,
        job_type=job.job_type,
        status=job.status or "Open"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: str, updates: schemas.JobCreate):
    db_job = get_job(db, job_id)
    if not db_job:
        return None
    
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
        
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: str):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if db_job:
        db.delete(db_job)
        db.commit()
        return True
    return False

# Application CRUD
def get_applications_by_job(db: Session, job_id: str):
    return db.query(models.Application).filter(models.Application.job_id == job_id).order_by(models.Application.applied_at.desc()).all()

def create_application(db: Session, student_id: str, job_id: str, resume_id: str):
    db_student = get_student(db, student_id)
    db_job = get_job(db, job_id)
    resume = get_student_resume(db, student_id, resume_id)
    if not db_student or not db_job or not resume:
        return None

    existing = db.query(models.Application).filter(
        models.Application.student_id == student_id,
        models.Application.job_id == job_id
    ).first()
    if existing:
        return db_student

    application = models.Application(
        id="app_" + str(uuid.uuid4())[:8],
        student_id=student_id,
        job_id=job_id,
        resume_id=resume_id,
        resume_url=resume.url,
        status="Applied"
    )
    db.add(application)

    current_applied = list(db_student.applied_jobs or [])
    if job_id not in current_applied:
        current_applied.append(job_id)
        db_student.applied_jobs = current_applied

    # Count is computed dynamically in get_job/get_jobs, no manual increment needed
    if db_student.application_status == "None":
        db_student.application_status = "Applied"

    db.commit()
    db.refresh(db_student)
    db.refresh(db_job)
    return db_student

# Match Application Pipeline
def apply_to_job(db: Session, student_id: str, job_id: str, resume_id: str):
    return create_application(db, student_id, job_id, resume_id)
