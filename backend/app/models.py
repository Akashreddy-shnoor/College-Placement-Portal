from sqlalchemy import Column, String, Integer, Text, JSON, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    
    # Personal Info
    roll_number = Column(String, default="")
    phone_number = Column(String, default="")
    department = Column(String, default="")
    passout_year = Column(String, default="")
    dob = Column(String, default="")
    profile_picture = Column(String, default="")
    
    # Academic Details
    cgpa = Column(String, default="")
    academic_10th = Column(String, default="")
    academic_inter = Column(String, default="")
    current_cgpa = Column(String, default="")
    backlogs = Column(Integer, default=0)
    semester_details = Column(JSON, default=list) # List of dicts

    # Portfolio & Experience
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    internships = Column(JSON, default=list)

    # Core Placement Fields
    ats_score = Column(Integer, default=0)
    skills = Column(Text, default="")
    resume_name = Column(String, default="")
    resume_url = Column(String, default="")  # Cloudinary secure URL for PDF
    suggestions = Column(JSON, default=list) # List of strings containing AI suggestions
    applied_jobs = Column(JSON, default=list) # List of job IDs
    application_status = Column(String, default="None") # None, Applied, Under Review, Shortlisted

    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan", order_by="desc(Resume.uploaded_at)")
    offers = relationship("Offer", back_populates="student", cascade="all, delete-orphan", order_by="desc(Offer.offer_date)")
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="resumes")

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    resume_url = Column(String, nullable=False)
    status = Column(String, default="Applied")
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student")
    resume = relationship("Resume")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="")
    salary = Column(String, default="")
    requirements = Column(Text, default="")
    description = Column(Text, default="")
    applicants_count = Column(Integer, default=0)
    
    # Eligibility & Metadata
    min_cgpa = Column(String, default="0.0")
    allowed_branches = Column(String, default="")
    passout_year = Column(String, default="")
    deadline = Column(String, default="")
    backlogs = Column(String, default="No Backlogs")
    job_type = Column(String, default="Full-time")
    status = Column(String, default="Open")

class Offer(Base):
    __tablename__ = "offers"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="")
    job_role = Column(String, nullable=False)
    package = Column(String, nullable=False)
    offer_date = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="offers")
    job = relationship("Job")
