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

class StudentResponse(StudentBase):
    id: str
    ats_score: int = Field(0, alias="atsScore")
    resume_name: str = Field("", alias="resumeName")
    suggestions: List[str] = Field(default_factory=list)
    applied_jobs: List[str] = Field(default_factory=list, alias="appliedJobs")
    application_status: str = Field("None", alias="applicationStatus")

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(CamelModel):
    role: str
    user_data: Optional[Union[dict, StudentResponse]] = Field(None, alias="userData")
