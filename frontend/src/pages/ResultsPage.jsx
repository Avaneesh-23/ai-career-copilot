import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, AlertCircle, Calendar, BookOpen, ChevronDown, ChevronRight, ExternalLink, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

/* ─── Safe JSON parser ─── */
const parseJSON = (str) => {
  if (!str) return null;
  if (typeof str === 'object') return str;
  try { return JSON.parse(str); } catch (e) {}
  try {
    const m = str.match(/```json\n([\s\S]*?)\n```/) || str.match(/```\n([\s\S]*?)\n```/);
    if (m) return JSON.parse(m[1]);
    const f = str.indexOf('{'), l = str.lastIndexOf('}');
    if (f !== -1 && l !== -1) return JSON.parse(str.slice(f, l + 1));
  } catch (err) {}
  return null;
};

/* ─── ATS Score Ring ─── */
function ATSScoreCard({ data }) {
  const parsed = parseJSON(data);
  if (!parsed) return <RawBlock content={data} />;

  const score = parsed.total_score || 0;
  const breakdown = parsed.breakdown || {};
  const summary = parsed.summary || '';
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return { stroke: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (s >= 50) return { stroke: '#F59E0B', text: 'text-yellow-400', bg: 'bg-yellow-400' };
    return { stroke: '#EF4444', text: 'text-red-400', bg: 'bg-red-400' };
  };
  const color = getColor(score);

  const breakdownLabels = {
    semantic_similarity: 'Semantic Match',
    skill_match: 'Skill Match',
    experience_relevance: 'Experience',
    structure_quality: 'Structure',
    keyword_density: 'Keywords',
  };

  return (
    <div className="brutalist-card p-8">
      <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" /> ATS_COMPATIBILITY_SCORE
      </h3>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg width="180" height="180" className="score-ring">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={radius} fill="none"
              stroke={color.stroke} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className="score-ring-progress"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-black font-mono tracking-tighter ${color.text}`}>{Math.round(score)}</span>
            <span className="text-xs font-bold text-textMuted uppercase tracking-widest mt-1">/ 100</span>
          </div>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 w-full space-y-4">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1 font-mono uppercase tracking-wider">
                <span className="text-textMuted">{breakdownLabels[key] || key.replace(/_/g, ' ')}</span>
                <span className="text-white font-bold">{Math.round(val)}%</span>
              </div>
              <div className="w-full bg-[#222] h-2.5 overflow-hidden">
                <div
                  className={`h-full ${getColor(val).bg} transition-all duration-1000`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
          {summary && <p className="text-sm text-textMuted mt-4 italic">"{summary}"</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Skill Gaps ─── */
function SkillGapCard({ data }) {
  const parsed = parseJSON(data);
  if (!parsed) return <RawBlock content={data} />;

  const priorityConfig = {
    critical: { label: 'CRITICAL', icon: XCircle, color: 'text-accent', bg: 'bg-black border-accent' },
    important: { label: 'IMPORTANT', icon: AlertTriangle, color: 'text-primary', bg: 'bg-black border-primary' },
    nice_to_have: { label: 'NICE_TO_HAVE', icon: CheckCircle, color: 'text-secondary', bg: 'bg-black border-secondary' },
  };

  return (
    <div className="brutalist-card p-8">
      <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-accent" /> SKILL_GAP_ANALYSIS
      </h3>

      <div className="space-y-6">
        {['critical', 'important', 'nice_to_have'].map((priority) => {
          const items = parsed[priority];
          if (!items || !Array.isArray(items) || items.length === 0) return null;
          const cfg = priorityConfig[priority];
          const Icon = cfg.icon;
          return (
            <div key={priority}>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${cfg.color}`}>
                <Icon className="w-4 h-4" /> {cfg.label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, i) => (
                  <div key={i} className={`p-4 border-2 ${cfg.bg}`}>
                    <p className="font-bold text-white text-sm uppercase tracking-wide">{typeof item === 'string' ? item : item.skill}</p>
                    {item.reason && <p className="text-xs text-textMuted mt-1 font-mono">{item.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {parsed.strengths && parsed.strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-secondary">
              <CheckCircle className="w-4 h-4" /> YOUR_STRENGTHS
            </h4>
            <div className="flex flex-wrap gap-2">
              {parsed.strengths.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-black border-2 border-secondary text-secondary font-mono text-sm font-bold uppercase">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Learning Plan Timeline ─── */
function LearningPlanCard({ data }) {
  const parsed = parseJSON(data);
  if (!parsed) return <RawBlock content={data} />;

  const weeks = parsed.weeks || [];
  const urgencyLevel = parsed.urgency_level || 'NORMAL';
  const daysUntilInterview = parsed.days_until_interview;
  const totalWeeks = parsed.total_weeks || weeks.length;

  const getUrgencyConfig = (level) => {
    const levelLower = (level || '').toLowerCase();
    switch (levelLower) {
      case 'urgent':
        return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: '🚨', label: 'Urgent' };
      case 'high':
        return { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: '⚡', label: 'High Priority' };
      case 'moderate':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '📅', label: 'Moderate' };
      case 'comfortable':
        return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: '🎯', label: 'Comfortable' };
      case 'extended':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🌟', label: 'Extended Timeline' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', icon: '📚', label: 'Normal' };
    }
  };

  const urgencyConfig = getUrgencyConfig(urgencyLevel);

  return (
    <div className="brutalist-card p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-secondary" /> LEARNING_ROADMAP
        </h3>
        <div className="flex items-center gap-3">
          {daysUntilInterview !== undefined && daysUntilInterview !== 'Unknown' && (
            <div className="px-3 py-1.5 bg-black border-2 border-[#333]">
              <span className="text-sm font-mono text-textMuted uppercase font-bold">
                {daysUntilInterview > 0 ? `${daysUntilInterview} DAYS` : daysUntilInterview === 0 ? 'TODAY' : `${Math.abs(daysUntilInterview)} DAYS AGO`}
              </span>
            </div>
          )}
          <div className={`px-3 py-1.5 border-2 ${urgencyConfig.bg} ${urgencyConfig.color} flex items-center gap-1.5 uppercase font-mono font-bold text-sm`}>
            <span>{urgencyConfig.icon}</span>
            <span>{urgencyConfig.label}</span>
          </div>
        </div>
      </div>
      
      {totalWeeks > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-textMuted">Preparation Duration</span>
            <span className="text-white font-medium">{totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'}</span>
          </div>
        </div>
      )}

      <div className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-1 bg-[#333]" />

        <div className="space-y-8">
          {weeks.map((week, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <div className="absolute -left-[18px] top-1 w-4 h-4 bg-primary border-2 border-black" />

              <div className="brutalist-card p-5 ml-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-primary text-black font-mono text-xs font-bold uppercase border-2 border-primary">
                    WK_{week.week || i + 1}
                  </span>
                  <h4 className="font-bold text-white uppercase tracking-wider">{week.title}</h4>
                </div>

                {week.topics && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {week.topics.map((t, j) => (
                      <span key={j} className="px-2 py-1 rounded-lg bg-white/5 text-textMuted text-xs">{t}</span>
                    ))}
                  </div>
                )}

                {week.goal && <p className="text-sm text-textMuted mb-3">🎯 {week.goal}</p>}

                {week.resources && week.resources.length > 0 && (
                  <div className="space-y-2">
                    {week.resources.map((r, k) => (
                      <ResourceLink key={k} resource={r} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Interview Prep Accordion ─── */
function InterviewPrepCard({ data }) {
  const parsed = parseJSON(data);
  if (!parsed) return <RawBlock content={data} />;

  const categories = parsed.categories || [];
  const resources = parsed.resources || [];

  return (
    <div className="brutalist-card p-8">
      <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" /> INTERVIEW_PREP
      </h3>

      <div className="space-y-4">
        {categories.map((cat, i) => (
          <AccordionCategory key={i} category={cat} index={i} />
        ))}
      </div>

      {resources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Prep Resources</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((r, i) => (
              <ResourceLink key={i} resource={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */
function AccordionCategory({ category, index }) {
  const [open, setOpen] = useState(index === 0);
  const questions = category.questions || [];
  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="border-2 border-[#333] overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#111] transition-colors"
      >
        <span className="font-bold uppercase tracking-wide text-white flex items-center gap-2">
          {category.topic}
          <span className="text-xs text-textMuted font-mono">({questions.length})</span>
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-textMuted" /> : <ChevronRight className="w-4 h-4 text-textMuted" />}
      </button>
      {open && (
        <div className="border-t-2 border-[#333] divide-y-2 divide-[#222]">
          {questions.map((q, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-sm font-mono text-textMuted mt-0.5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{q.question}</p>
                  {q.difficulty && (
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[q.difficulty] || 'bg-white/10 text-textMuted'}`}>
                      {q.difficulty}
                    </span>
                  )}
                  {q.hint && (
                    <p className="text-xs text-textMuted mt-2 bg-white/5 rounded-lg p-3 border-l-2 border-primary/40">
                      💡 {q.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceLink({ resource }) {
  const isValid = resource.url && resource.url.startsWith('http') && resource.url !== 'No link found';
  const typeColors = {
    video: 'text-red-400',
    course: 'text-blue-400',
    article: 'text-emerald-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-black border-2 border-[#333] hover:border-white transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate uppercase">{resource.name || 'Resource'}</p>
        {resource.type && (
          <span className={`text-xs font-mono uppercase ${typeColors[resource.type] || 'text-textMuted'}`}>{resource.type}</span>
        )}
      </div>
      {isValid ? (
        <a href={resource.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 flex-shrink-0">
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <span className="text-xs text-textMuted flex-shrink-0">No link</span>
      )}
    </div>
  );
}

function RawBlock({ content }) {
  return (
    <div className="brutalist-card p-6">
      <pre className="text-sm text-secondary whitespace-pre-wrap font-mono bg-black p-4 overflow-x-auto">
        {typeof content === 'object' ? JSON.stringify(content, null, 2) : content}
      </pre>
    </div>
  );
}

/* ─── Main Results Page ─── */
export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Sparkles className="w-12 h-12 text-textMuted mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">NO_RESULTS_FOUND</h2>
        <p className="text-textMuted font-mono mb-6 text-sm">Run a new analysis to see your career blueprint.</p>
        <button
          onClick={() => navigate('/analysis')}
          className="brutalist-button"
        >
          START_ANALYSIS
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/dashboard')} className="p-2 border-2 border-[#333] hover:bg-white hover:text-black transition-colors text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white">CAREER_BLUEPRINT</h1>
          <p className="text-primary font-mono text-sm">AI ANALYSIS_COMPLETE</p>
        </div>
      </div>

      <ATSScoreCard data={results.ats_score} />
      <SkillGapCard data={results.skill_gaps} />
      <LearningPlanCard data={results.learning_plan} />
      <InterviewPrepCard data={results.interview_prep} />
    </div>
  );
}
