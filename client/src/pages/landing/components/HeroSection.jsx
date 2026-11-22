import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Lock,
  Compass,
} from 'lucide-react';

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Copy */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="accent" dot className="text-xs py-1 px-3 bg-accent/10 text-accent border-accent/20">
              UniMate Smart Campus Platform
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy-950 leading-[1.15] mb-5">
            Your Campus.{' '}
            <span className="text-navy-800">One Connected Experience.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-text leading-relaxed max-w-2xl mx-auto mb-8">
            From finding your way around campus to ordering meals, accessing printing services and discovering
            essential campus information — UniMate brings everyday campus experiences together in one place.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Open Dashboard ({user?.fullName?.split(' ')[0]})
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Get Started
                </Button>
              </Link>
            )}

            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button variant="outline" size="lg">
                Explore Services
              </Button>
            </a>
          </div>

          {/* Trust & Architecture Strip */}
          <div className="pt-6 border-t border-slate-border/80 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-text">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-state-success" />
              <span>Verified Campus Places</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-navy-700" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-accent" />
              <span>Relational MySQL Backend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-state-success" />
              <span>Zero Fabricated Data</span>
            </div>
          </div>
        </div>

        {/* Browser Frame SaaS Product Mockup */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-border bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
            {/* Window Chrome Header */}
            <div className="h-10 bg-surface-muted/90 border-b border-slate-border px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="w-64 max-w-xs text-center py-1 px-3 rounded-md bg-surface text-[11px] font-mono text-slate-text border border-slate-border truncate">
                https://unimate.campus/dashboard
              </div>
              <div className="w-12 text-right">
                <span className="w-2 h-2 rounded-full bg-state-success inline-block" />
              </div>
            </div>

            {/* Application Screenshot View */}
            <div className="relative bg-background">
              <img
                src="/images/02_student_dashboard_desktop.png"
                alt="UniMate Connected Student Dashboard Application Interface"
                className="w-full h-auto object-cover object-top block"
                loading="eager"
              />
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-text">
            Actual UniMate authenticated dashboard interface displaying real-time system status and campus services
          </p>
        </div>
      </div>
    </section>
  );
}
