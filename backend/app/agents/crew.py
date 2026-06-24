from crewai import Crew, Process
from app.agents.agents import CopilotAgents
from app.agents.tasks import CopilotTasks

class CareerCopilotCrew:
    def __init__(self, resume_text: str, jd_text: str, target_date: str):
        self.resume_text = resume_text
        self.jd_text = jd_text
        self.target_date = target_date

    def run(self):
        agents = CopilotAgents()
        tasks = CopilotTasks()

        # Instantiate agents
        resume_agent = agents.resume_analyst_agent()
        jd_agent = agents.jd_analyzer_agent()
        ats_agent = agents.ats_scoring_agent()
        gap_agent = agents.skill_gap_agent()
        planner_agent = agents.planner_agent()
        interview_agent = agents.interview_intelligence_agent()

        # Instantiate tasks
        task_resume = tasks.analyze_resume_task(resume_agent, self.resume_text)
        task_jd = tasks.analyze_jd_task(jd_agent, self.jd_text)
        task_ats = tasks.calculate_ats_score_task(ats_agent)
        task_gaps = tasks.analyze_skill_gaps_task(gap_agent)
        task_plan = tasks.generate_learning_plan_task(planner_agent, self.target_date)
        task_interview = tasks.generate_interview_prep_task(interview_agent)

        # Context passing
        task_ats.context = [task_resume, task_jd]
        task_gaps.context = [task_resume, task_jd]
        task_plan.context = [task_gaps, task_jd]
        task_interview.context = [task_gaps, task_jd]

        # Callbacks for progress tracking
        def on_step(agent_output):
            try:
                msg = agent_output.log if hasattr(agent_output, 'log') else str(agent_output)
                print(f"\n[Agent Working] {msg[:100]}...")
            except:
                pass

        def on_task(task_output):
            try:
                print(f"\n[Task Completed] A task just finished successfully!")
            except:
                pass

        # Define crew
        crew = Crew(
            agents=[resume_agent, jd_agent, ats_agent, gap_agent, planner_agent, interview_agent],
            tasks=[task_resume, task_jd, task_ats, task_gaps, task_plan, task_interview],
            process=Process.sequential,
            verbose=True,
            step_callback=on_step,
            task_callback=on_task
        )

        result = crew.kickoff()
        
        # Helper to extract string output safely
        def get_output(task):
            import json
            import re
            
            text = ""
            if hasattr(task, 'output') and task.output:
                if hasattr(task.output, 'raw_output'):
                    text = task.output.raw_output
                else:
                    text = str(task.output)
            if not text:
                return {}
                
            # Try to parse it as JSON
            try:
                return json.loads(text)
            except:
                pass
                
            # Extract from markdown code blocks
            match = re.search(r'```(?:json)?\n(.*?)\n```', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except:
                    pass
            
            # Extract anything between { and }
            match = re.search(r'(\{.*\})', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except:
                    pass

            return {"raw_text": text}

        return {
            "final_result": result.raw if hasattr(result, 'raw') else str(result),
            "resume_parsed": get_output(task_resume),
            "jd_parsed": get_output(task_jd),
            "ats_score": get_output(task_ats),
            "skill_gaps": get_output(task_gaps),
            "learning_plan": get_output(task_plan),
            "interview_prep": get_output(task_interview),
        }
