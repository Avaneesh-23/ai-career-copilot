import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, TrendingUp, Clock, Target, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, lastScore: null });

  useEffect(() => {
    api.get('/copilot/history')
      .then(res => {
        const h = res.data.history || [];
        setStats({
          total: h.length,
          lastScore: h.length > 0 ? h[0].total_score : null,
        });
      })
      .catch(() => {});
  }, []);

  const getScoreColor = (s) => {
    if (s >= 75) return 'text-emerald-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="brutalist-card p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Welcome back!
            </h1>
            <p className="text-textMuted text-lg">{user?.email}</p>
          </div>
          <button
            id="cta-new-analysis"
            onClick={() => navigate('/analysis')}
            className="brutalist-button flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> NEW_ANALYSIS
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutalist-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary bg-black flex items-center justify-center rounded-none">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-mono text-textMuted uppercase">TOTAL_ANALYSES</p>
            <p className="text-2xl font-bold text-white font-mono">{stats.total}</p>
          </div>
        </div>

        <div className="brutalist-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-accent bg-black flex items-center justify-center rounded-none">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-xs font-mono text-textMuted uppercase">LAST_SCORE</p>
            <p className={`text-2xl font-bold font-mono ${stats.lastScore !== null ? getScoreColor(stats.lastScore) : 'text-textMuted'}`}>
              {stats.lastScore !== null ? `${Math.round(stats.lastScore)}%` : '—'}
            </p>
          </div>
        </div>

        <div className="brutalist-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-secondary bg-black flex items-center justify-center rounded-none">
            <Clock className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-mono text-textMuted uppercase">MEMBER_SINCE</p>
            <p className="text-lg font-semibold font-mono text-white">TODAY</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="brutalist-card p-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">QUICK_ACTIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/analysis')}
            className="brutalist-card p-6 text-left hover:border-primary group"
          >
            <PlusCircle className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-white uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">Start New Analysis</h3>
            <p className="text-sm font-mono text-textMuted">Upload your resume and job description for AI-powered analysis</p>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="brutalist-card p-6 text-left hover:border-accent group"
          >
            <Clock className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-bold text-white uppercase tracking-wider mb-1 group-hover:text-accent transition-colors">View Past Analyses</h3>
            <p className="text-sm font-mono text-textMuted">Review your previous career analysis results and track progress</p>
          </button>
        </div>
      </div>
    </div>
  );
}
