from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user")
    job_descriptions = relationship("JobDescription", back_populates="user")
    ats_results = relationship("ATSResult", back_populates="user")
    learning_plans = relationship("LearningPlan", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    parsed_data = Column(JSON) # JSON structured from LLM
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    target_role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="job_descriptions")

class ATSResult(Base):
    __tablename__ = "ats_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    job_id = Column(Integer, ForeignKey("job_descriptions.id"))
    
    total_score = Column(Float)
    semantic_score = Column(Float)
    skill_match_score = Column(Float)
    experience_score = Column(Float)
    structure_score = Column(Float)
    keyword_score = Column(Float)
    
    skill_gaps = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ats_results")

class LearningPlan(Base):
    __tablename__ = "learning_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ats_result_id = Column(Integer, ForeignKey("ats_results.id"))
    target_date = Column(DateTime)
    plan_data = Column(JSON) # Day-wise or week-wise roadmap
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="learning_plans")
