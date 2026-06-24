from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Resume, User
from app.core.security import get_current_user
from app.services.pdf_parser import parse_pdf
import os
import uuid

router = APIRouter()
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    parsed_text = ""
    if file.filename.endswith(".pdf"):
        parsed_text = parse_pdf(content)
    else:
        parsed_text = "DOCX parsing not implemented yet."
        
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        parsed_data={"raw_text": parsed_text}
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return {"message": "Resume uploaded successfully", "resume_id": resume.id}
