from crewai import Agent, LLM
from crewai.tools import BaseTool
from app.core.config import settings
from duckduckgo_search import DDGS
import os

import json
from pydantic import BaseModel, Field
from typing import Any

class CustomSearchToolSchema(BaseModel):
    query: Any = Field(default="", description="The search query.")

class CustomSearchTool(BaseTool):
    name: str = "Web Search Tool"
    description: str = "Search the internet for real, working URLs, courses, and resources. Use this to find Udemy, Coursera, or YouTube links."
    args_schema: type[BaseModel] = CustomSearchToolSchema
    
    def _run(self, query: Any) -> str:
        try:
            print(f"\n[Search Tool] Received query: {query}")
            # Extract actual query if wrapped in dict/list
            if isinstance(query, dict):
                if "query" in query:
                    query = query["query"]
                elif "object" in query:
                    query = query["object"]
                else:
                    query = str(query)
            elif isinstance(query, list) and len(query) > 0:
                query = query[0]
            
            if isinstance(query, str):
                try:
                    parsed = json.loads(query)
                    if isinstance(parsed, dict) and "query" in parsed:
                        query = parsed["query"]
                except:
                    pass
            
            query = str(query).strip()
            print(f"[Search Tool] Executing search for: '{query}'")
            results = DDGS().text(query, max_results=3)
            res_str = "\n".join([f"Title: {r['title']}\nLink: {r['href']}" for r in results])
            print(f"[Search Tool] Found {len(results)} results!")
            return res_str
        except Exception as e:
            print(f"[Search Tool] Failed: {e}")
            return f"Search failed: {e}"

search_tool = CustomSearchTool()

# Initialize LLM (supports local Ollama or cloud providers like OpenAI, Gemini, etc.)
llm_model = os.getenv("LLM_MODEL", f"ollama/{settings.OLLAMA_MODEL}")
if llm_model.startswith("ollama/"):
    llm = LLM(model=llm_model, base_url=settings.OLLAMA_BASE_URL, temperature=0.2)
else:
    # Cloud models (e.g. "openai/gpt-4o" or "gemini/gemini-1.5-flash") will automatically use 
    # their respective API keys (e.g., OPENAI_API_KEY, GEMINI_API_KEY) from the environment.
    llm = LLM(model=llm_model, temperature=0.2)

class CopilotAgents:
    def resume_analyst_agent(self):
        return Agent(
            role='Expert Resume Analyst',
            goal='Extract and structure information from the uploaded resume into JSON.',
            backstory='You are an expert HR technologist who reads resumes and structures them into machine-readable formats.',
            verbose=True,
            allow_delegation=False,
            llm=llm
        )
        
    def jd_analyzer_agent(self):
        return Agent(
            role='Job Description Analyzer',
            goal='Extract key requirements, skills, and target roles from the job description.',
            backstory='You are a seasoned technical recruiter who understands exactly what hiring managers are looking for.',
            verbose=True,
            allow_delegation=False,
            llm=llm
        )
        
    def ats_scoring_agent(self):
        return Agent(
            role='ATS Scoring Engine',
            goal='Compute a hybrid ATS score based on semantic similarity, skill match, and experience.',
            backstory='You are a proprietary ATS algorithm designed to fairly evaluate candidates against a job description.',
            verbose=True,
            allow_delegation=False,
            llm=llm
        )
        
    def skill_gap_agent(self):
        return Agent(
            role='Skill Gap Analyzer',
            goal='Identify missing or weak skills by comparing the structured resume and job description.',
            backstory='You are a career coach who pinpoints exact areas of improvement for candidates.',
            verbose=True,
            allow_delegation=False,
            llm=llm
        )
        
    def planner_agent(self):
        return Agent(
            role='Learning Roadmap Planner',
            goal='Generate a deadline-aware learning plan based on skill gaps and target test date.',
            backstory='You are an educational strategist who builds optimized, compressed learning roadmaps.',
            verbose=True,
            allow_delegation=False,
            llm=llm,
            tools=[search_tool]
        )
        
    def interview_intelligence_agent(self):
        return Agent(
            role='Interview Prep Specialist',
            goal='Generate tailored interview questions and suggest RAG-based resources for the user.',
            backstory='You are a top-tier technical interviewer who knows exactly what questions will be asked.',
            verbose=True,
            allow_delegation=False,
            llm=llm,
            tools=[search_tool]
        )
