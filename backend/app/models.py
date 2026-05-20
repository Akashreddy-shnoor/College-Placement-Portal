from sqlalchemy import Column, String, Integer, Text, JSON
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
    suggestions = Column(JSON, default=list) # List of strings containing AI suggestions
    applied_jobs = Column(JSON, default=list) # List of job IDs
    application_status = Column(String, default="None") # None, Applied, Under Review, Shortlisted

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
