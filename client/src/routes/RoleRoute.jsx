import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ShieldAlert } from 'lucide-react';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <Card className="text-center p-8">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-state-danger flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-navy-950 mb-1">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-text mb-6 leading-relaxed">
            Your current account role (<strong>{role}</strong>) does not have sufficient privileges
            to access this administrative section.
          </p>
          <Button variant="primary" size="sm" onClick={() => (window.location.href = '/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return children;
}
