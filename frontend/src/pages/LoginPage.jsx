import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
            SYSTEM_LOGIN
          </h1>
        </div>
        <p className="text-textMuted text-center mb-8 text-sm">Sign in to your account</p>

        {error && (
          <div className="bg-accent/20 border-2 border-accent text-accent font-mono text-sm p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input pl-11"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full brutalist-button flex items-center justify-center gap-2"
          >
            {loading ? <div className="loading-spinner-sm" /> : <><ArrowRight className="w-4 h-4" /> INIT_SESSION</>}
          </button>
        </form>

        <p className="text-center text-sm text-textMuted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
