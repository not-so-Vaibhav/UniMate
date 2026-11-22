import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/common/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CtaSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-xl border border-navy-700/50">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-3 block">
              Integrated Campus Experience
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Make Your Campus Life Simpler.
            </h2>

            <p className="text-sm sm:text-base text-navy-100/90 leading-relaxed max-w-xl mx-auto mb-8 font-normal">
              Everything essential to your everyday university routine, unified in one dependable portal.
              Sign in with your student credentials to get started today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-white text-navy-950 hover:bg-slate-100 font-semibold px-6 shadow-md"
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
                      className="bg-white text-navy-950 hover:bg-slate-100 font-semibold px-6 shadow-md"
                      icon={ArrowRight}
                    >
                      Get Started as Student
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10 px-6"
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
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Verified campus status
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
