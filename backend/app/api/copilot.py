from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import Resume, JobDescription, ATSResult, LearningPlan, User
from app.core.security import get_current_user
from app.agents.crew import CareerCopilotCrew
import json

router = APIRouter()

class AnalyzeRequest(BaseModel):
    resume_id: int
    job_description_text: str
    target_role: str
    target_date: str

@router.post("/analyze")
def run_copilot_analysis(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch Resume
    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Save JD
    jd = JobDescription(
        user_id=current_user.id,
        content=request.job_description_text,
        target_role=request.target_role
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)
    
    resume_text = resume.parsed_data.get("raw_text", "")
    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text is empty")
        
    # Run CrewAI Multi-Agent Pipeline
    try:
        crew = CareerCopilotCrew(
            resume_text=resume_text,
            jd_text=request.job_description_text,
            target_date=request.target_date
        )
        crew_results = crew.run()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing failed: {str(e)}")
        
    # Parse and save results
    ats_score_raw = crew_results["ats_score"]
    if isinstance(ats_score_raw, dict):
        ats_score_json = ats_score_raw
    else:
        try:
            ats_score_json = json.loads(ats_score_raw)
        except:
            ats_score_json = {"total_score": 0}
        
    ats_result = ATSResult(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=jd.id,
        total_score=ats_score_json.get("total_score", 0),
        skill_gaps={"raw": crew_results["skill_gaps"]},
    )
    db.add(ats_result)
    db.commit()
    db.refresh(ats_result)
    
    # Save Learning Plan
    learning_plan = LearningPlan(
        user_id=current_user.id,
        ats_result_id=ats_result.id,
        plan_data={"raw": crew_results["learning_plan"]}
    )
    db.add(learning_plan)
    db.commit()
    
    # Update resume parsed data
    resume_parsed_raw = crew_results["resume_parsed"]
    try:
        if isinstance(resume_parsed_raw, dict):
            resume.parsed_data = resume_parsed_raw
        else:
            resume.parsed_data = json.loads(resume_parsed_raw)
        db.commit()
    except:
        pass
        
    return {
        "message": "Analysis complete",
        "ats_result_id": ats_result.id,
        "results": crew_results
    }

@router.get("/history")
def get_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return all past analyses for the logged-in user."""
    ats_results = (
        db.query(ATSResult)
        .filter(ATSResult.user_id == current_user.id)
        .order_by(ATSResult.created_at.desc())
        .all()
    )
    
    history = []
    for r in ats_results:
        jd = db.query(JobDescription).filter(JobDescription.id == r.job_id).first()
        history.append({
            "id": r.id,
            "total_score": r.total_score,
            "target_role": jd.target_role if jd else "N/A",
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "skill_gaps": r.skill_gaps,
        })
    
    return {"history": history}
