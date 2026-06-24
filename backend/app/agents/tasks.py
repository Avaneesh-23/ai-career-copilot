from crewai import Task

class CopilotTasks:
    def analyze_resume_task(self, agent, resume_text):
        return Task(
            description=f"""Analyze the following resume text and output a structured JSON.

Resume Text:
{resume_text}

You MUST return ONLY a valid JSON object with these exact keys:
{{
  "skills": ["list of technical and soft skills"],
  "experience": [
    {{"title": "Job Title", "company": "Company Name", "duration": "e.g. 2 years", "highlights": ["key achievements"]}}
  ],
  "education": [
    {{"degree": "Degree Name", "institution": "School Name", "year": "Graduation Year"}}
  ],
  "projects": [
    {{"name": "Project Name", "description": "Brief description", "technologies": ["tech used"]}}
  ]
}}

Return ONLY the JSON. No extra text, no markdown.""",
            expected_output='A valid JSON object with keys: skills, experience, education, projects.',
            agent=agent
        )

    def analyze_jd_task(self, agent, jd_text):
        return Task(
            description=f"""Analyze the job description and extract key requirements.

Job Description:
{jd_text}

You MUST return ONLY a valid JSON object with these exact keys:
{{
  "required_skills": ["list of required technical skills"],
  "preferred_skills": ["list of nice-to-have skills"],
  "experience_level": "e.g. 3-5 years",
  "responsibilities": ["key job responsibilities"],
  "role_title": "The job title"
}}

Return ONLY the JSON. No extra text, no markdown.""",
            expected_output='A valid JSON object with keys: required_skills, preferred_skills, experience_level, responsibilities, role_title.',
            agent=agent
        )

    def calculate_ats_score_task(self, agent):
        return Task(
            description="""Using the parsed resume and parsed JD from previous tasks, calculate a hybrid ATS score (0-100).

Scoring weights:
- 40% semantic_similarity: How well does the resume language match the JD?
- 30% skill_match: What percentage of required skills does the candidate have?
- 15% experience_relevance: How relevant is their experience?
- 10% structure_quality: Is the resume well-organized?
- 5% keyword_density: Are important keywords present?

You MUST return ONLY a valid JSON object with these exact keys:
{
  "total_score": 75,
  "breakdown": {
    "semantic_similarity": 80,
    "skill_match": 70,
    "experience_relevance": 75,
    "structure_quality": 85,
    "keyword_density": 60
  },
  "summary": "Brief 1-2 sentence summary of the score"
}

Return ONLY the JSON. No extra text, no markdown.""",
            expected_output='A valid JSON object with total_score (number), breakdown (object with 5 scores), and summary (string).',
            agent=agent
        )

    def analyze_skill_gaps_task(self, agent):
        return Task(
            description="""Compare the parsed resume and JD to identify skill gaps. Categorize each gap by priority.

You MUST return ONLY a valid JSON object with this exact structure:
{
  "critical": [
    {"skill": "Skill Name", "reason": "Why this is critical to learn"}
  ],
  "important": [
    {"skill": "Skill Name", "reason": "Why this matters"}
  ],
  "nice_to_have": [
    {"skill": "Skill Name", "reason": "Would be a bonus"}
  ],
  "strengths": ["Skills the candidate already excels at"]
}

Return ONLY the JSON. No extra text, no markdown.""",
            expected_output='A valid JSON object with keys: critical, important, nice_to_have (arrays of objects), and strengths (array of strings).',
            agent=agent
        )

    def generate_learning_plan_task(self, agent, target_date):
        from datetime import datetime, date
        
        # Calculate available weeks
        try:
            target_dt = datetime.strptime(target_date, "%Y-%m-%d").date()
            current_dt = date.today()
            days_available = (target_dt - current_dt).days
            
            if days_available <= 0:
                available_weeks = 1  # Minimum 1 week even if date is past
                urgency_note = "URGENT: Target date has passed or is very soon. Focus on critical skills only."
            elif days_available < 7:
                available_weeks = 1
                urgency_note = "URGENT: Less than 1 week available. Focus on essential skills only."
            elif days_available < 14:
                available_weeks = 2
                urgency_note = "HIGH PRIORITY: Less than 2 weeks available. Prioritize critical skills."
            elif days_available < 30:
                available_weeks = 4
                urgency_note = "MODERATE PRIORITY: Less than 1 month available. Balanced approach."
            elif days_available < 60:
                available_weeks = 8
                urgency_note = "NORMAL PRIORITY: About 2 months available. Comprehensive learning plan."
            elif days_available < 90:
                available_weeks = 12
                urgency_note = "COMFORTABLE: About 3 months available. Thorough preparation possible."
            else:
                available_weeks = min(16, days_available // 7)
                urgency_note = "EXTENDED: More than 3 months available. Deep learning approach."
        except:
            available_weeks = 4  # Default to 4 weeks if date parsing fails
            urgency_note = "DEFAULT: Using standard 4-week plan due to date parsing issue."
        
        return Task(
            description=f"""Generate a week-by-week learning roadmap to cover the identified skill gaps before the target date: {target_date}.

CURRENT DATE CALCULATION:
- Target Date: {target_date}
- Available Weeks: {available_weeks}
- Priority Level: {urgency_note}

CRITICAL INSTRUCTIONS:
1. Create exactly {available_weeks} weeks of content
2. Adjust learning intensity based on available time:
   - If URGENT (1-2 weeks): Focus ONLY on critical skills from the skill gaps analysis
   - If MODERATE (3-4 weeks): Cover critical + important skills
   - If COMFORTABLE/EXTENDED (5+ weeks): Include all skills with practice time
3. For urgent timelines, compress topics and focus on high-impact learning

You have a search tool available. You MUST use it to find real course or tutorial URLs.

IMPORTANT RULES FOR RESOURCES:
- You MUST call your search tool for each skill topic (e.g., search "best Python course Udemy 2024")
- Only include URLs that your search tool returned to you
- If the search tool returns no results, write "No link found" as the url value
- NEVER invent or guess a URL

You MUST return ONLY a valid JSON object with this exact structure:
{{
  "weeks": [
    {{
      "week": 1,
      "title": "Week theme",
      "topics": ["Topic 1", "Topic 2"],
      "resources": [
        {{"name": "Resource title", "url": "https://real-url-from-search.com", "type": "course"}}
      ],
      "goal": "What to achieve by end of this week"
    }}
  ],
  "total_weeks": {available_weeks},
  "urgency_level": "{urgency_note.split(':')[0] if ':' in urgency_note else 'NORMAL'}",
  "days_until_interview": {days_available if 'days_available' in locals() else 'Unknown'}
}}

Return ONLY the JSON. No extra text, no markdown.""",
            expected_output=f'A valid JSON object with exactly {available_weeks} weeks array (each having week number, title, topics, resources with real URLs, and goal), total_weeks, urgency_level, and days_until_interview.',
            agent=agent
        )

    def generate_interview_prep_task(self, agent):
        return Task(
            description="""Generate tailored interview questions based on the job description and skill gaps. Group by topic and difficulty.

You have a search tool available. You MUST use it to find real prep resources.

IMPORTANT RULES FOR RESOURCES:
- You MUST call your search tool for prep resources (e.g., search "React interview questions YouTube tutorial")
- Only include URLs that your search tool returned to you
- If the search tool returns no results, write "No link found" as the url value
- NEVER invent or guess a URL

You MUST return ONLY a valid JSON object with this exact structure:
{
  "categories": [
    {
      "topic": "Topic Name",
      "questions": [
        {
          "question": "The interview question?",
          "difficulty": "easy|medium|hard",
          "hint": "Brief hint or approach to answer"
        }
      ]
    }
  ],
  "resources": [
    {"name": "Resource title", "url": "https://real-url-from-search.com", "type": "video|article|course"}
  ]
}

Return ONLY the JSON. No extra text, no markdown.""",
            expected_output='A valid JSON object with categories (array of topic groups with questions) and resources (array with real URLs).',
            agent=agent
        )
