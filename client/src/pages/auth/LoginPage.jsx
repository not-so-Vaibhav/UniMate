import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-10 h-10 rounded-xl bg-navy-800 text-white font-bold text-base flex items-center justify-center mx-auto shadow-sm mb-3">
          U
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-navy-950">
          Sign in to UniMate
        </h2>
        <p className="mt-1.5 text-xs text-slate-text">
          Integrated smart-campus services platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 shadow-[0_2px_8px_rgba(16,24,40,0.06)]">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-state-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email"
              type="email"
              icon={Mail}
              placeholder="student@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          {/* Development Quick-Fill Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-border">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-text uppercase tracking-wider">
                Demo Accounts (Development)
              </span>
              <Badge variant="neutral" className="text-[10px]">
                Pre-seeded
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('demo.student@campus.edu', 'StudentPass123!')}
                className="p-2 text-left rounded-lg border border-slate-border hover:bg-surface-muted transition-colors"
              >
                <div className="font-medium text-navy-950">Demo Student</div>
                <div className="text-[11px] text-slate-text truncate">Arjun Sharma</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('demo.canteen@campus.edu', 'OperatorPass123!')}
                className="p-2 text-left rounded-lg border border-slate-border hover:bg-surface-muted transition-colors"
              >
                <div className="font-medium text-navy-950">Canteen Operator</div>
                <div className="text-[11px] text-slate-text truncate">Ramesh Desk</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('demo.xerox@campus.edu', 'OperatorPass123!')}
                className="p-2 text-left rounded-lg border border-slate-border hover:bg-surface-muted transition-colors"
              >
                <div className="font-medium text-navy-950">Xerox Operator</div>
                <div className="text-[11px] text-slate-text truncate">Anita Desk</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('demo.admin@campus.edu', 'AdminPass123!')}
                className="p-2 text-left rounded-lg border border-slate-border hover:bg-surface-muted transition-colors"
              >
                <div className="font-medium text-navy-950">Campus Admin</div>
                <div className="text-[11px] text-slate-text truncate">Administration</div>
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-5 text-center text-xs text-slate-text">
          New campus student?{' '}
          <Link to="/register" className="font-medium text-navy-800 hover:text-navy-950 underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
