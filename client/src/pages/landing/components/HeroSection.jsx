import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/common/Button';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Lock,
  Bot,
  UtensilsCrossed,
  Printer,
} from 'lucide-react';

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative bg-gradient-to-b from-white via-background to-background overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-18 lg:pt-20 lg:pb-20">
      {/* Subtle background ambient mesh */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 pointer-events-none opacity-30 blur-3xl -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(100, 133, 121, 0.22) 0%, rgba(38, 59, 90, 0.08) 60%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Split 2-Column Hero: Headline + CTAs on Left, Product Console on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Subtle Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-accent">
                Smart Campus Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-navy-950 leading-[1.12]">
              Your Campus.{' '}
              <span className="text-navy-800 block sm:inline">
                One Connected Experience.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base text-slate-text leading-relaxed max-w-xl font-normal">
              From finding your way around campus to ordering meals, accessing printing services, and discovering
              essential campus policies — UniMate brings everyday student services together into one dependable platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    className="shadow-sm font-semibold px-6"
                  >
                    Open Dashboard ({user?.fullName?.split(' ')[0]})
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    className="shadow-sm font-semibold px-6"
                  >
                    Get Started as Student
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
                <Button
                  variant="outline"
                  size="lg"
                  className="font-medium bg-white hover:bg-slate-50 text-navy-800 border-slate-200"
                >
                  Explore Services
                </Button>
              </a>
            </div>

            {/* Trust Points */}
            <div className="pt-5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-text">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-state-success flex-shrink-0" />
                <span className="truncate">Verified Directory</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-navy-700 flex-shrink-0" />
                <span className="truncate">RBAC Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span className="truncate">MySQL 9.5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-state-success flex-shrink-0" />
                <span className="truncate">Zero Fake Data</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Campus Console (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              {/* Window Header */}
              <div className="h-10 bg-slate-50 border-b border-slate-200 px-3.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="ml-1.5 font-mono text-slate-500 text-[10px]">unimate.campus</span>
                </div>
                <div className="flex items-center gap-1.5 text-state-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-state-success animate-pulse" />
                  <span>Portal Active</span>
                </div>
              </div>

              {/* Console Body */}
              <div className="p-4 space-y-3 bg-slate-50/50">
                {/* User Session Strip */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-bold text-xs flex items-center justify-center">
                      AS
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-navy-950">Arjun Sharma</div>
                      <div className="text-[10px] text-slate-text font-mono">STU-2026-0842 • Student</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                    B.Tech CS
                  </span>
                </div>

                {/* AI Assistant Micro Card */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-navy-950">
                      <Bot className="w-3.5 h-3.5 text-navy-800" />
                      <span>AI Campus Assistant</span>
                    </div>
                    <span className="text-[10px] text-accent font-medium">Verified Policy</span>
                  </div>
                  <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700">
                    <strong className="text-navy-900">Q:</strong> Where is the exam revaluation counter?
                  </div>
                  <div className="text-[11px] bg-navy-50/70 p-2 rounded-lg border border-navy-100 text-navy-950 space-y-0.5">
                    <p>Admin Block A, Counter 4 (10 AM – 4 PM).</p>
                    <p className="text-[9px] text-slate-500 font-mono">Ref: Academic Circular #2026/04</p>
                  </div>
                </div>

                {/* Service Status Tiles */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Canteen Tile */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-navy-950">
                        <UtensilsCrossed className="w-3 h-3 text-accent" />
                        <span>Canteen</span>
                      </div>
                      <span className="text-[9px] font-medium text-state-success bg-emerald-50 px-1.5 py-0.2 rounded">
                        Ready
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate font-medium">Masala Dosa</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                      <span>Token #18</span>
                      <span>₹75.00</span>
                    </div>
                  </div>

                  {/* Xerox Tile */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-navy-950">
                        <Printer className="w-3 h-3 text-navy-700" />
                        <span>Xerox Hub</span>
                      </div>
                      <span className="text-[9px] font-medium text-navy-800 bg-navy-50 px-1.5 py-0.2 rounded">
                        Done
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate font-medium">OS_Lab_Report.pdf</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                      <span>14 Pgs Duplex</span>
                      <span>₹14.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
