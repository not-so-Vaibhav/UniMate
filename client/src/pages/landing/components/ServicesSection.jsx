import React from 'react';
import {
  Bot,
  MapPin,
  UtensilsCrossed,
  Printer,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean typography, NO generic pill badges */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Core Campus Modules
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 mb-4">
            Five Services. One Connected Portal.
          </h2>
          <p className="text-base text-slate-text leading-relaxed">
            UniMate eliminates disconnected departmental notices, long counter lines, and scattered links
            by consolidating essential student operations under a single, role-aware system.
          </p>
        </div>

        {/* Bento Grid Layout - Each module has unique, bespoke visual micro-UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Assistant (Spans 2 columns on lg for prominent editorial showcase) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-navy-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Phase 2 Integration
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-navy-950 mb-2">
                AI Campus Assistant
              </h3>
              <p className="text-sm text-slate-text leading-relaxed max-w-xl mb-6">
                Answers student queries strictly grounded in verified university circulars, academic regulations,
                and faculty schedules — with zero hallucinated policies or invented dates.
              </p>

              {/* Real Interactive Micro-UI Demo */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span className="font-medium text-navy-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" /> Verified Policy Grounding
                  </span>
                  <span className="font-mono text-[11px]">FastAPI Subsystem</span>
                </div>
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong className="text-navy-900">Student:</strong> "What is the policy for borrowing reference books from the Central Library?"
                </div>
                <div className="text-xs text-navy-950 bg-navy-50/60 p-3 rounded-lg border border-navy-100">
                  <p className="leading-relaxed">
                    Undergraduate students may issue up to 3 books for 14 calendar days. Overnight reference section books require counter permission before 5:00 PM.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
                    Ref: Library Regulation Manual §4.2 • Verified
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-text">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-state-success" /> Uncertainty aware (flags unverified queries)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-state-success" /> Decoupled NLP microservice
              </span>
            </div>
          </div>

          {/* Card 2: Campus Navigation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-navy-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center border border-navy-100">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-state-success uppercase tracking-wider">
                  Directory Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-navy-950 mb-2">
                Campus Navigation
              </h3>
              <p className="text-sm text-slate-text leading-relaxed mb-6">
                Instant search across lecture blocks, administrative counters, seminar halls, and student amenities.
              </p>

              {/* Micro directory list */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-navy-950 block">Aryabhata Block (AB-1)</span>
                    <span className="text-[11px] text-slate-500">Floor 2 • CS Lecture Hall 204</span>
                  </div>
                  <span className="text-[10px] font-medium text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Academic
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-navy-950 block">Administrative Block</span>
                    <span className="text-[11px] text-slate-500">Ground Floor • Academic Section</span>
                  </div>
                  <span className="text-[10px] font-medium text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-text">
              <span>Verified building coordinates</span>
              <span className="font-medium text-navy-800 flex items-center gap-1">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Canteen Pre-ordering */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-navy-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-navy-50 text-accent flex items-center justify-center border border-navy-100">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-state-success uppercase tracking-wider">
                  Menu Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-navy-950 mb-2">
                Canteen Pre-ordering
              </h3>
              <p className="text-sm text-slate-text leading-relaxed mb-6">
                Browse verified daily meal options and transparent Indian Rupee (₹) pricing to prepare orders before lunchtime rush.
              </p>

              {/* Micro Canteen Items */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-navy-950">South Indian Thali</span>
                  <span className="font-mono font-semibold text-navy-900">₹70.00</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-navy-950">Masala Chai</span>
                  <span className="font-mono font-semibold text-navy-900">₹15.00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-text">
              <span>Daily price transparency</span>
              <span className="font-medium text-navy-800 flex items-center gap-1">
                View Menu <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 4: Xerox / Digital Printing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-navy-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center border border-navy-100">
                  <Printer className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-navy-800 uppercase tracking-wider">
                  Service Ready
                </span>
              </div>

              <h3 className="text-xl font-bold text-navy-950 mb-2">
                Xerox / Printing Hub
              </h3>
              <p className="text-sm text-slate-text leading-relaxed mb-6">
                Submit documents digitally, choose exact print parameters (pages, duplex, color), and pick up without waiting.
              </p>

              {/* Micro Print Spec Widget */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-navy-950">
                  <span className="truncate">Syllabus_2026.pdf</span>
                  <span className="text-state-success font-semibold">Ready</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>8 pages • Duplex • B&W</span>
                  <span>Est. ₹8.00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-text">
              <span>PDF & DOCX validated</span>
              <span className="font-medium text-navy-800 flex items-center gap-1">
                Configure <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 5: Lost & Found */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-navy-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-navy-50 text-accent flex items-center justify-center border border-navy-100">
                  <Search className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-navy-800 uppercase tracking-wider">
                  Registry Ready
                </span>
              </div>

              <h3 className="text-xl font-bold text-navy-950 mb-2">
                Lost & Found Registry
              </h3>
              <p className="text-sm text-slate-text leading-relaxed mb-6">
                Report misplaced belongings, discover recovered items across campus, and verify claims through security desks.
              </p>

              {/* Micro Lost & Found Widget */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-navy-950">
                  <span>Student ID Card (CSE)</span>
                  <span className="text-state-success font-semibold text-[11px]">Found</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Location: Library Reading Hall • Security Desk
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-text">
              <span>Zero public phone exposure</span>
              <span className="font-medium text-navy-800 flex items-center gap-1">
                View Registry <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
