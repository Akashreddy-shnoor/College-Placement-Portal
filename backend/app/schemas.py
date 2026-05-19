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
    skills: Optional[str] = ""

class StudentCreate(StudentBase):
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
