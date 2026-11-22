import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-12 h-12 rounded-xl bg-surface-muted border border-slate-border text-navy-800 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-navy-950 mb-1">Page Not Found</h1>
        <p className="text-xs text-slate-text mb-6 leading-relaxed">
          The requested campus portal page could not be found or has been relocated.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="sm">
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
