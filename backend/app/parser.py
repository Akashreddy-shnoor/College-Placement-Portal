import io
import os
import json
import re
from pypdf import PdfReader
from openai import OpenAI
from dotenv import load_dotenv

# Load environmental configs
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Reads characters stream from PDF upload bytes via pypdf."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def parse_resume_with_openai(resume_text: str, job_requirements: str) -> dict:
    """Calls OpenAI chat completions API to evaluate ATS matching."""
    
    # 1. Automatic mock fallback if API key is not configured
    if not OPENAI_API_KEY or OPENAI_API_KEY.strip() == "" or OPENAI_API_KEY == "your_openai_api_key_here":
        print("WARNING: OPENAI_API_KEY not set. Using local mock parsing engine...")
        return run_local_mock_parser(resume_text, job_requirements)

    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        prompt = f"""
You are an expert ATS (Applicant Tracking System) reviewer.
Analyze the following resume text against the requirements of the job opening.
Job Requirements: {job_requirements}

Resume Text:
{resume_text}

Perform the following tasks:
1. Extract the candidate's name (try to find it at the top of the resume). If not found, use "Candidate".
2. Extract the candidate's email. If not found, use "email@university.edu".
3. Evaluate technical skills alignment. Calculate a compatibility ATS Score between 0 and 100.
4. Extract core technical skills present in the resume as a comma-separated list.
5. Provide exactly 3 highly actionable, bulleted suggestions on how the candidate can optimize their resume for this job.

Your response must be a single JSON object. Ensure the format matches this JSON schema exactly:
{{
  "ats_score": 85,
  "candidate_name": "Akash Reddy",
  "candidate_email": "akash.reddy@email.com",
  "extracted_skills": "React JS, JavaScript, SQL, Node.js",
  "suggestions": [
    "Quantify your experience in React JS (e.g., 'Optimized frontend rendering by 20%').",
    "Add more details about database indexing and performance tuning with SQL.",
    "List relevant cloud certifications to stand out to Microsoft recruiters."
  ]
}}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a professional recruiting parser returning strict JSON output."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        raw_content = response.choices[0].message.content
        parsed_result = json.loads(raw_content)
        return parsed_result

    except Exception as e:
        print(f"OpenAI Error: {e}. Falling back to mock engine...")
        return run_local_mock_parser(resume_text, job_requirements)

def run_local_mock_parser(resume_text: str, job_requirements: str) -> dict:
    """Fallback local matcher analyzing basic keyword alignments."""
    
    # Try basic regex to extract email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text)
    email = email_match.group(0) if email_match else "student@university.edu"
    
    # Try basic regex to extract name (assumes first non-empty lines might hold it)
    lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
    name = "Akash Reddy" # Default fallback
    if lines:
        for line in lines[:3]:
            # Simple check to avoid email or phone line as name
            if "@" not in line and not any(c.isdigit() for c in line) and len(line) < 30:
                name = line
                break

    # Calculate mock score based on requirements keyword overlapping
    req_words = set(re.findall(r'\w+', job_requirements.lower()))
    resume_words = set(re.findall(r'\w+', resume_text.lower()))
    
    match_count = len(req_words.intersection(resume_words))
    
    # Calculate a realistic score between 65 and 95
    base_score = 65
    if len(req_words) > 0:
        base_score += min(30, int((match_count / len(req_words)) * 30))
    
    # Extract skills
    common_skills = ["react", "node", "python", "fastapi", "django", "postgresql", "docker", "aws", "javascript", "java", "sql", "git"]
    extracted = []
    for skill in common_skills:
        if re.search(rf'\b{skill}\b', resume_text.lower()):
            extracted.append(skill.upper() if skill != "javascript" else "JavaScript")
            
    extracted_str = ", ".join(extracted) if extracted else "Python, SQL, JavaScript"

    return {
        "ats_score": base_score,
        "candidate_name": name,
        "candidate_email": email,
        "extracted_skills": extracted_str,
        "suggestions": [
            "Quantify your tech achievements with metrics (e.g. 'Reduced response latency by 25%').",
            f"Increase keyword density of matching job requirements: '{job_requirements.split(',')[0]}'.",
            "Consider adding an certifications segment highlighting cloud technologies."
        ]
    }
