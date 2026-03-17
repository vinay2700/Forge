import os
import json
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FORGE Career Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_INSTRUCTION = (
    "You are FORGE, an elite career intelligence engine specialising in the Indian tech job market in 2026. "
    "You have deep knowledge of: current automation trends affecting Indian IT roles, real hiring patterns across "
    "Bangalore, Hyderabad, Pune, Delhi, Mumbai, Chennai, which specific skills are rising vs declining in Indian "
    "job postings right now, salary benchmarks for Indian tech roles in 2026, and which companies are actively "
    "hiring vs freezing headcount. Your analysis is brutally honest, data-specific, and personalised to the exact "
    "person. Never give generic advice. Every insight must be specific to their role, their skills, their city."
)

USER_PROMPT_TEMPLATE = """Analyse this resume for the Indian job market in 2026:

{resume_text}

Return ONLY a valid JSON object with exactly these fields, no markdown, no explanation, just the JSON:
{{
  "personal": {{
    "name": "extracted from resume",
    "current_role": "their current or most recent job title",
    "city": "extracted or inferred city",
    "experience_years": 0,
    "current_salary_estimate": "estimated current salary in LPA based on role and experience"
  }},
  "risk_metrics": {{
    "overall_risk_score": 0,
    "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "timeline_months": 0,
    "market_demand_score": 0,
    "transferable_skills_count": 0,
    "competing_profiles_estimate": 0,
    "demand_ratio": 0.0
  }},
  "skill_analysis": [
    {{
      "skill": "skill name",
      "demand_score": 0,
      "trend": "RISING|STABLE|DECLINING|DYING",
      "automation_risk": "LOW|MEDIUM|HIGH",
      "weight_in_profile": 0
    }}
  ],
  "task_automation": [
    {{
      "task": "specific task from their experience",
      "automation_probability": 0
    }}
  ],
  "market_insights": [
    {{
      "type": "ALERT|WARNING|POSITIVE",
      "title": "short title",
      "body": "specific insight about their situation"
    }}
  ],
  "pivot_options": [
    {{
      "role": "target role name",
      "match_percentage": 0,
      "salary_increase_percent": 0,
      "time_months": 0,
      "demand_growth": 0,
      "skills_to_learn": ["skill1", "skill2", "skill3"]
    }}
  ],
  "skill_correlation": {{
    "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "matrix": [[1.0, 0.0, 0.0, 0.0, 0.0]]
  }},
  "risk_timeline": {{
    "labels": ["Now", "+3mo", "+6mo", "+9mo", "+12mo", "+18mo", "+24mo"],
    "no_action": [0, 0, 0, 0, 0, 0, 0],
    "with_pivot": [0, 0, 0, 0, 0, 0, 0]
  }},
  "market_volatility": [
    {{
      "role": "role name",
      "direction": "UP|DOWN",
      "magnitude": 0
    }}
  ],
  "summary": "3-4 sentences brutally honest summary of their career situation and what they must do"
}}"""


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyse-resume")
async def analyse_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Step 1 — Extract text from PDF
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        with pdfplumber.open(tmp_path) as pdf:
            text = " ".join(
                page.extract_text() for page in pdf.pages if page.extract_text()
            )

        os.unlink(tmp_path)

        if not text.strip():
            raise HTTPException(
                status_code=400, detail="Could not extract text from PDF"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"PDF extraction failed: {str(e)}"
        )

    # Step 2 — Send to Gemini 2.5 Flash
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured. Add your key to backend/.env",
        )

    try:
        client = genai.Client(api_key=api_key)
        prompt = USER_PROMPT_TEMPLATE.format(resume_text=text)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            ),
        )
        raw_text = response.text
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gemini API call failed: {str(e)}"
        )

    # Step 3 — Parse and return JSON
    try:
        # Strip markdown code fences if present
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            first_newline = cleaned.index("\n")
            cleaned = cleaned[first_newline + 1 :]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        result = json.loads(cleaned)
        return result
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse Gemini response as JSON. Raw response: {raw_text[:2000]}",
        )
