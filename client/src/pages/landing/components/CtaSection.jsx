import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/common/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CtaSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="py-20 sm:py-24 bg-surface border-t border-slate-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-navy-800 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-md">
          {/* Subtle Accent Glow effect strictly using CSS & brand colors */}
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-200 mb-3 block">
              Integrated Smart Campus Platform
            </span>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Make Your Campus Experience Simpler.
            </h2>

            <p className="text-xs sm:text-base text-navy-100 leading-relaxed max-w-xl mx-auto mb-8">
              Everything essential to your everyday campus experience, brought together with UniMate.
              Sign in with your student credentials to get started today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-white text-navy-900 hover:bg-navy-50 font-semibold"
                    icon={ArrowRight}
                  >
                    Open Dashboard ({user?.fullName?.split(' ')[0]})
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-white text-navy-900 hover:bg-navy-50 font-semibold"
                      icon={ArrowRight}
                    >
                      Get Started as Student
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Sign In to Account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-navy-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Free student access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Institutional data privacy
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Verified service status
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
