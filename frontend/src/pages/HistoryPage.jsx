import React, { useEffect, useState } from 'react';
import { Clock, Target, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/copilot/history')
      .then(res => {
        setHistory(res.data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getScoreColor = (s) => {
    if (s >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 uppercase tracking-widest">
          <Clock className="w-8 h-8 text-accent" />
          ANALYSIS_HISTORY
        </h1>
        <p className="text-textMuted font-mono">Review your past career analysis results.</p>
      </div>

      {history.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <Sparkles className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">NO_ANALYSES_YET</h2>
          <p className="text-textMuted font-mono text-sm mb-6">Start your first career analysis to see results here.</p>
          <a
            href="/analysis"
            className="brutalist-button"
          >
            START_ANALYSIS
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="brutalist-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Score badge */}
              <div className={`flex-shrink-0 w-16 h-16 border-2 flex items-center justify-center bg-black ${getScoreColor(item.total_score)}`}>
                <span className="text-xl font-mono font-bold">{Math.round(item.total_score || 0)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold uppercase tracking-wider text-white text-lg truncate">
                  {item.target_role || 'Career Analysis'}
                </h3>
                <p className="text-sm font-mono text-textMuted flex items-center gap-2 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(item.created_at)}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                <span className={`px-3 py-1.5 font-mono text-sm font-bold uppercase border-2 bg-black ${getScoreColor(item.total_score)}`}>
                  ATS: {Math.round(item.total_score || 0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
