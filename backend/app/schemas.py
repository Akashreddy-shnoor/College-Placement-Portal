from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, Union

# Helper for Pydantic CamelCase Configurations
class CamelModel(BaseModel):
    class Config:
        populate_by_name = True
        from_attributes = True

# Job Schemas
class JobBase(CamelModel):
    title: str
    company: str
    location: Optional[str] = ""
    salary: Optional[str] = ""
    requirements: str
    description: Optional[str] = ""
    min_cgpa: Optional[str] = Field("0.0", alias="minCgpa")
    allowed_branches: Optional[str] = Field("", alias="allowedBranches")
    passout_year: Optional[str] = Field("", alias="passoutYear")
    deadline: Optional[str] = Field("", alias="deadline")
    backlogs: Optional[str] = Field("No Backlogs", alias="backlogs")
    job_type: Optional[str] = Field("Full-time", alias="jobType")
    status: Optional[str] = Field("Open", alias="status")

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    applicants_count: int = Field(0, alias="applicantsCount")

# Student Schemas
class StudentBase(CamelModel):
    username: str
    name: Optional[str] = ""
    email: str
    
    # Personal Info
    roll_number: Optional[str] = Field("", alias="rollNumber")
    phone_number: Optional[str] = Field("", alias="phoneNumber")
    department: Optional[str] = ""
    passout_year: Optional[str] = Field("", alias="passoutYear")
    dob: Optional[str] = ""
    profile_picture: Optional[str] = Field("", alias="profilePicture")
    
    # Academic Details
    cgpa: Optional[str] = ""
    academic_10th: Optional[str] = Field("", alias="academic10th")
    academic_inter: Optional[str] = Field("", alias="academicInter")
    current_cgpa: Optional[str] = Field("", alias="currentCgpa")
    backlogs: Optional[int] = 0
    semester_details: Optional[List[dict]] = Field(default_factory=list, alias="semesterDetails")

    # Portfolio & Experience
    projects: Optional[List[dict]] = Field(default_factory=list)
    certifications: Optional[List[dict]] = Field(default_factory=list)
    internships: Optional[List[dict]] = Field(default_factory=list)

    skills: Optional[str] = ""

class StudentCreate(StudentBase):
    pass

class StudentUpdate(StudentBase):
    pass

class StudentRegister(StudentBase):
    password: str

class ResumeResponse(CamelModel):
    id: str
    name: str
    url: str = Field("", alias="url")
    uploaded_at: Optional[datetime] = Field(None, alias="uploadedAt")

class StudentResponse(StudentBase):
    id: str
    ats_score: int = Field(0, alias="atsScore")
    resume_name: str = Field("", alias="resumeName")
    resume_url: Optional[str] = Field("", alias="resumeUrl")
    resumes: List[ResumeResponse] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    applied_jobs: List[str] = Field(default_factory=list, alias="appliedJobs")
    application_status: str = Field("None", alias="applicationStatus")

class ApplicationBase(CamelModel):
    student_id: str = Field(..., alias="studentId")
    job_id: str = Field(..., alias="jobId")
    resume_id: str = Field(..., alias="resumeId")
    status: Optional[str] = Field("Applied")

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(CamelModel):
    id: str
    student_id: str = Field(..., alias="studentId")
    job_id: str = Field(..., alias="jobId")
    resume_id: str = Field(..., alias="resumeId")
    resume_name: str = Field("", alias="resumeName")
    resume_url: str = Field("", alias="resumeUrl")
    status: str = Field("Applied")
    student_name: str = Field("", alias="studentName")
    student_email: str = Field("", alias="studentEmail")
    student_cgpa: Optional[str] = Field("", alias="studentCgpa")
    student_department: Optional[str] = Field("", alias="studentDepartment")
    student_roll_number: Optional[str] = Field("", alias="studentRollNumber")
    applied_at: Optional[datetime] = Field(None, alias="appliedAt")

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(CamelModel):
    role: str
    user_data: Optional[Union[dict, StudentResponse]] = Field(None, alias="userData")
