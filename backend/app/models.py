from sqlalchemy import Column, String, Integer, Text, JSON
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
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
