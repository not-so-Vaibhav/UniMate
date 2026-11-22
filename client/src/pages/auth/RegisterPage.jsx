import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Mail, Lock, User, Hash, Phone, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    student_id: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-10 h-10 rounded-xl bg-navy-800 text-white font-bold text-base flex items-center justify-center mx-auto shadow-sm mb-3">
          U
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-navy-950">
          Student Registration
        </h2>
        <p className="mt-1.5 text-xs text-slate-text">
          Create your verified student account for UniMate campus services
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
              label="Full Name"
              name="full_name"
              icon={User}
              placeholder="e.g. Priyanshu Roy"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Campus Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="name@campus.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Student ID / Roll No."
              name="student_id"
              icon={Hash}
              placeholder="e.g. STU-2026-1044"
              value={formData.student_id}
              onChange={handleChange}
              required
            />

            <Input
              label="Contact Phone"
              name="phone"
              type="tel"
              icon={Phone}
              placeholder="+91 98765 00000"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Create Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              helperText="Must be at least 8 characters long."
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Complete Registration
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs text-slate-text">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-navy-800 hover:text-navy-950 underline underline-offset-2">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
