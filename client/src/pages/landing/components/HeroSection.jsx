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
  MapPin,
  UtensilsCrossed,
  Printer,
  Sparkles,
  FileText,
  Clock,
} from 'lucide-react';

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-background to-background">
      {/* Subtle Background Mesh Glow (Pure CSS, elegant and non-distracting) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(100, 133, 121, 0.18), rgba(38, 59, 90, 0.08) 60%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Copy */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Subtle Editorial Eyebrow - Clean text, NO generic pill badges */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-accent">
              Smart Campus Infrastructure
            </span>
          </div>

          {/* Headline - High-contrast, editorial typography */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy-950 leading-[1.08] mb-6">
            Your Campus.{' '}
            <span className="block sm:inline text-navy-800">
              One Connected Experience.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-text leading-relaxed max-w-2xl mx-auto mb-9 font-normal">
            From finding your way around campus to ordering meals, accessing printing services, and discovering
            essential campus information — UniMate brings everyday student services together into one dependable platform.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  className="shadow-md shadow-navy-900/10 font-semibold px-6"
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
                  className="shadow-md shadow-navy-900/10 font-semibold px-6"
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
                className="font-medium bg-white/80 hover:bg-white text-navy-800 border-slate-200"
              >
                Explore Services
              </Button>
            </a>
          </div>

          {/* Trust & Architecture Strip - Clean minimalist text row, zero boxes */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-text">
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

        {/* Hero Visual: Premium Live Product Console Showcase */}
        {/* Replaces the cut-off raw screenshot with a bespoke, polished interactive stage */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(23,32,51,0.12)] overflow-hidden">
            {/* Window Chrome Header */}
            <div className="h-11 bg-slate-50/90 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="hidden sm:inline-block ml-3 text-xs font-medium text-slate-500">
                  UniMate Connected Portal
                </span>
              </div>
              <div className="flex items-center gap-2 py-1 px-3.5 rounded-full bg-white text-[11px] font-mono text-slate-600 border border-slate-200 shadow-2xs">
                <Lock className="w-3 h-3 text-state-success" />
                <span>unimate.campus/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-state-success animate-pulse" />
                <span className="text-[11px] font-medium text-state-success hidden sm:inline">
                  Campus API Live
                </span>
              </div>
            </div>

            {/* Live Interactive Product Stage */}
            <div className="p-4 sm:p-7 bg-background/50 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Student Quick Launch & Status (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* User Credential Chip */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-navy-800 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                      AS
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-navy-950">Arjun Sharma</div>
                      <div className="text-[11px] text-slate-text">demo.student@campus.edu</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Role</span>
                      <span className="font-medium text-navy-900">Student</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">ID Number</span>
                      <span className="font-mono text-navy-900">STU-2026-0842</span>
                    </div>
                  </div>
                </div>

                {/* System Readiness Verified Box */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-navy-950 mb-2 flex items-center justify-between">
                    <span>System Infrastructure</span>
                    <span className="text-[10px] text-state-success font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-state-success" /> Active
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-accent" /> MySQL Database
                      </span>
                      <span className="font-mono font-medium text-navy-900">9 Tables Connected</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-navy-700" /> Security Layer
                      </span>
                      <span className="font-mono font-medium text-navy-900">RBAC Enforced</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center & Right: Live Service Widgets (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* AI Assistant Micro Preview Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-navy-950">AI Campus Assistant</span>
                    </div>
                    <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      Verified Policy Grounding
                    </span>
                  </div>

                  {/* Micro conversation snippet */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 flex items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">Q:</span>
                      <span>Where is the academic section for submitting exam revaluation forms?</span>
                    </div>
                    <div className="bg-navy-50/70 p-2.5 rounded-lg border border-navy-100 text-navy-950 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p>
                          Admin Block A, Ground Floor, Counter 4. Timings: 10:00 AM – 04:00 PM on working days.
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Source: Academic Circular #2026/04 • Verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Column Real Service Feeds: Canteen & Xerox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Canteen Pre-Order Widget */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-accent" />
                          <span className="text-xs font-semibold text-navy-950">North Canteen</span>
                        </div>
                        <span className="text-[10px] font-medium text-state-success bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Ready for Pickup
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Masala Dosa + Filter Coffee</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Order #C-042 • Token 18</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Total: ₹75.00</span>
                      <span className="font-medium text-navy-800">Counter 2</span>
                    </div>
                  </div>

                  {/* Xerox Digital Print Widget */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Printer className="w-4 h-4 text-navy-700" />
                          <span className="text-xs font-semibold text-navy-950">Central Xerox</span>
                        </div>
                        <span className="text-[10px] font-medium text-navy-800 bg-navy-50 px-2 py-0.5 rounded-md border border-navy-100">
                          Completed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate">OS_Lab_Assignment_4.pdf</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">14 Pages • Duplex • B&W</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Total: ₹14.00</span>
                      <span className="font-medium text-navy-800">Pickup Counter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Under-mockup caption */}
          <p className="mt-4 text-center text-xs text-slate-text">
            Actual UniMate integrated dashboard experience delivering role-verified campus workflows.
          </p>
        </div>
      </div>
    </section>
  );
}
