import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CtaSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="py-12 sm:py-16 bg-background border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-navy-800 text-white p-7 sm:p-10 text-center relative overflow-hidden shadow-md">
          <div className="max-w-xl mx-auto relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 block">
              Integrated Campus Experience
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              Make Your Campus Life Simpler.
            </h2>

            <p className="text-xs sm:text-sm text-navy-100/90 leading-relaxed mb-6">
              Everything essential to your everyday university routine, unified in one dependable portal.
              Sign in with your student credentials to get started.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-navy-950 hover:bg-slate-100 transition-colors shadow-sm focus:outline-none"
                  >
                    <span>Open Dashboard ({user?.fullName?.split(' ')[0]})</span>
                    <ArrowRight className="w-4 h-4 text-navy-950" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-navy-950 hover:bg-slate-100 transition-colors shadow-sm focus:outline-none"
                    >
                      <span>Get Started as Student</span>
                      <ArrowRight className="w-4 h-4 text-navy-950" />
                    </button>
                  </Link>
                  <Link to="/login">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-transparent text-white border border-white/40 hover:bg-white/10 transition-colors focus:outline-none"
                    >
                      <span>Sign In to Account</span>
                    </button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-navy-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-accent" /> Free student access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-accent" /> Institutional data privacy
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-accent" /> Verified campus status
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
