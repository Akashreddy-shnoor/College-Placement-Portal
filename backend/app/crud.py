from sqlalchemy.orm import Session
from . import models, schemas
import uuid

# Student CRUD
def get_student(db: Session, student_id: str):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_username(db: Session, username: str):
    return db.query(models.Student).filter(models.Student.username == username.lower()).first()

def get_students(db: Session):
    return db.query(models.Student).all()

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

def update_student(db: Session, student: models.Student):
    db.commit()
    db.refresh(student)
    return student

# Job CRUD
def get_job(db: Session, job_id: str):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def get_jobs(db: Session):
    return db.query(models.Job).all()

def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.Job(
        id="job_" + str(uuid.uuid4())[:8],
        title=job.title,
        company=job.company,
        location=job.location,
        salary=job.salary,
        requirements=job.requirements,
        description=job.description,
        applicants_count=0
    )
    db.add(db_job)
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

# Match Application Pipeline
def apply_to_job(db: Session, student_id: str, job_id: str):
    db_student = get_student(db, student_id)
    db_job = get_job(db, job_id)
    
    if db_student and db_job:
        # Check if already applied
        current_applied = list(db_student.applied_jobs or [])
        if job_id not in current_applied:
            current_applied.append(job_id)
            db_student.applied_jobs = current_applied
            
            # Increment job applicant count
            db_job.applicants_count = (db_job.applicants_count or 0) + 1
            
            # Update student application status if not set
            if db_student.application_status == "None":
                db_student.application_status = "Applied"
                
            db.commit()
            db.refresh(db_student)
            db.refresh(db_job)
        return db_student
    return None
