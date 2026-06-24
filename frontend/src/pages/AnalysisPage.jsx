import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function AnalysisPage() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUploadAndAnalyze = async () => {
    if (!file || !jd) return alert('Please provide both resume and job description.');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/resume/upload', formData);
      const resumeId = uploadRes.data.resume_id;

      const analyzeRes = await api.post('/copilot/analyze', {
        resume_id: resumeId,
        job_description_text: jd,
        target_role: targetRole,
        target_date: targetDate
      });

      // Navigate to results page with data
      navigate('/results', { state: { results: analyzeRes.data.results } });
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Analysis failed. Please try again.';
      alert(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="brutalist-card p-8">
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
          <Sparkles className="text-primary w-7 h-7" />
          NEW_ANALYSIS
        </h2>
        <p className="text-textMuted mb-8 font-mono text-sm">Upload your resume and paste the job description to get AI-powered career insights.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-wider text-white">UPLOAD_RESUME (PDF)</label>
            <div
              className={`border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                file
                  ? 'border-primary bg-primary/10'
                  : 'border-[#333] hover:border-white'
              }`}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              {file ? (
                <FileText className="w-12 h-12 text-primary mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-textMuted mb-4" />
              )}
              <p className="text-sm text-center text-textMuted">
                {file ? (
                  <span className="text-primary font-medium">{file.name}</span>
                ) : (
                  'Click to select your PDF resume'
                )}
              </p>
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">JOB_DESCRIPTION</label>
              <textarea
                id="jd-input"
                className="w-full bg-black border-2 border-[#333] p-4 focus:outline-none focus:border-primary transition-colors h-36 resize-none font-mono text-sm text-white"
                placeholder="Paste the full job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">TARGET_ROLE</label>
                <input
                  id="target-role-input"
                  type="text"
                  className="w-full bg-black border-2 border-[#333] p-4 focus:outline-none focus:border-primary transition-colors font-mono text-sm text-white"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-white mb-2">INTERVIEW_DATE</label>
                <input
                  id="target-date-input"
                  type="date"
                  className="w-full bg-black border-2 border-[#333] p-4 focus:outline-none focus:border-primary transition-colors font-mono text-sm text-white"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          id="start-analysis-btn"
          onClick={handleUploadAndAnalyze}
          disabled={loading}
          className="mt-8 w-full brutalist-button flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="loading-spinner-sm" />
              RUNNING_ANALYSIS...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> START_ANALYSIS
            </>
          )}
        </button>
      </div>
    </div>
  );
}
