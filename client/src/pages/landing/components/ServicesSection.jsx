import React, { useState } from 'react';
import {
  Bot,
  MapPin,
  UtensilsCrossed,
  Printer,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const MODULES = [
  {
    id: 'assistant',
    title: 'AI Campus Assistant',
    category: 'Information & Policies',
    icon: Bot,
    status: 'Phase 2 Grounding',
    statusVariant: 'accent',
    description:
      'Provides instant, reliable answers to campus queries strictly grounded in verified university circulars, academic calendars, and administrative guidelines — with zero hallucinated dates or invented policies.',
    image: '/images/02_student_dashboard_desktop.png',
    highlights: [
      'Grounded strictly in verified institutional notices and circulars',
      'Uncertainty-aware responses (flags queries lacking official documentation)',
      'Decoupled FastAPI microservice preventing heavy NLP from blocking core APIs',
      'Direct citations provided for academic rules, schedules, and counters',
    ],
    sampleQuery: {
      question: 'Where do I submit the scholarship application for Semester 4?',
      answer: 'Admin Block A, Academic Section (Counter 3). Timings: 10:00 AM – 04:00 PM.',
      ref: 'Ref: Academic Circular #2026/14 • Verified',
    },
  },
  {
    id: 'navigation',
    title: 'Campus Navigation',
    category: 'Directory & Wayfinding',
    icon: MapPin,
    status: 'Directory Active',
    statusVariant: 'success',
    description:
      'Search and locate academic lecture blocks, department wings, faculty rooms, and student facilities with verified floor descriptions and room codes.',
    image: '/images/04_navigation_desktop.png',
    highlights: [
      'Search by building name, hall code, or facility type',
      'Verified location metadata including floors, wings, and nearby landmarks',
      'No fabricated routes or unverified coordinates',
      'Sample development places explicitly labeled in Phase 1 baseline',
    ],
    sampleDirectory: [
      { name: 'Aryabhata Block (AB-1)', detail: 'Floor 2 • CS Lecture Hall 204', tag: 'Academic' },
      { name: 'Administrative Block', detail: 'Ground Floor • Academic Section', tag: 'Admin' },
    ],
  },
  {
    id: 'canteen',
    title: 'Canteen Pre-ordering',
    category: 'Food & Cafeteria',
    icon: UtensilsCrossed,
    status: 'Menu Active',
    statusVariant: 'success',
    description:
      'Browse verified daily breakfast, meal, and beverage menus from campus cafeterias with transparent Indian Rupee (₹) pricing and live counter availability.',
    image: '/images/05_canteen_desktop.png',
    highlights: [
      'Transparent price listings in INR (₹) with real-time item availability',
      'Categorized menus: Breakfast, Full Meals, Quick Bites, and Beverages',
      'Counter operating schedule clearly displayed (08:00 AM – 08:30 PM)',
      'Dedicated service operator queue interface for order fulfillment',
    ],
    sampleItems: [
      { name: 'South Indian Thali', price: '₹70.00' },
      { name: 'Masala Dosa', price: '₹55.00' },
      { name: 'Filter Coffee', price: '₹20.00' },
    ],
  },
  {
    id: 'printing',
    title: 'Xerox / Printing Hub',
    category: 'Academic Documents',
    icon: Printer,
    status: 'Service Ready',
    statusVariant: 'neutral',
    description:
      'Submit academic documents, select print specifications (pages, duplex layout, B&W vs color), and track order fulfillment securely at the campus printing counter.',
    image: '/images/06_printing_desktop.png',
    highlights: [
      'PDF and DOCX format validation with 10MB file size limit',
      'Strict private document storage and student ownership access control',
      'Configurable print specifications: Page range, Duplex, Copies, Color mode',
      'Real-time queue tracking from submission to counter pickup',
    ],
    samplePrint: {
      file: 'Operating_Systems_Lab.pdf',
      spec: '14 Pages • Duplex • B&W • Est. ₹14.00',
      status: 'Ready for Pickup at Central Xerox',
    },
  },
  {
    id: 'lost-found',
    title: 'Lost & Found Registry',
    category: 'Campus Community',
    icon: Search,
    status: 'Registry Ready',
    statusVariant: 'neutral',
    description:
      'Report misplaced belongings, discover recovered items across campus, and resolve property claims through verified security desk handover protocols.',
    image: '/images/07_lost_found_desktop.png',
    highlights: [
      'Standardized item categories: Student IDs, Electronics, Books, Valuables',
      'Privacy protection: No student phone numbers or personal data exposed publicly',
      'Security desk handover verification workflows before item release',
      'Searchable registry filtered by location found and date reported',
    ],
    sampleItem: {
      title: 'Student ID Card (CSE)',
      location: 'Found at Library 2nd Floor Reading Hall',
      status: 'Held at Central Security Desk',
    },
  },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState('assistant');
  const activeModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];
  const Icon = activeModule.icon;

  return (
    <section id="services" className="py-12 sm:py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent block mb-1.5">
            Core Campus Modules
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-navy-950 mb-2.5">
            Five Services. One Connected Portal.
          </h2>
          <p className="text-sm sm:text-base text-slate-text leading-relaxed">
            Consolidating essential student operations into an integrated, role-aware system.
          </p>
        </div>

        {/* Compact Horizontal Module Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 mb-7 overflow-x-auto pb-1 scrollbar-none">
          {MODULES.map((m) => {
            const TabIcon = m.icon;
            const isActive = m.id === activeTab;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-navy-950'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{m.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Showcase Card */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            {/* Left Column: Details & Verified Capabilities (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-navy-800 text-white flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent block">
                      {activeModule.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-navy-950">
                      {activeModule.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-text leading-relaxed">
                  {activeModule.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                {activeModule.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-navy-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-state-success flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Micro Snippet based on active tab */}
              {activeModule.id === 'assistant' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-navy-950">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" /> Grounded Policy Query
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">FastAPI NLP</span>
                  </div>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded text-[11px]">
                    <strong>Q:</strong> {activeModule.sampleQuery.question}
                  </p>
                  <p className="text-navy-950 bg-navy-50/60 p-2 rounded text-[11px]">
                    {activeModule.sampleQuery.answer}
                  </p>
                </div>
              )}

              {activeModule.id === 'navigation' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-navy-950 block">Verified Directory Records</span>
                  {activeModule.sampleDirectory.map((d, i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-medium text-navy-950 block">{d.name}</span>
                        <span className="text-[10px] text-slate-500">{d.detail}</span>
                      </div>
                      <span className="text-[9px] font-medium text-navy-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {d.tag}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeModule.id === 'canteen' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-navy-950">
                    <span>North Canteen Menu Sample</span>
                    <span className="text-state-success text-[10px]">08:00 AM – 08:30 PM</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {activeModule.sampleItems.map((item, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-50 border border-slate-100 text-center text-[11px]">
                        <div className="text-navy-950 font-medium truncate">{item.name}</div>
                        <div className="text-navy-900 font-mono font-semibold text-[10px] mt-0.5">{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModule.id === 'printing' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-navy-950">
                    <span>Print Queue Verification</span>
                    <span className="text-state-success text-[10px]">Valid PDF</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] space-y-0.5">
                    <div className="font-medium text-navy-950">{activeModule.samplePrint.file}</div>
                    <div className="text-[10px] text-slate-500">{activeModule.samplePrint.spec}</div>
                  </div>
                </div>
              )}

              {activeModule.id === 'lost-found' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-navy-950">
                    <span>Security Desk Registry</span>
                    <span className="text-state-success text-[10px]">Claim Ready</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] space-y-0.5">
                    <div className="font-medium text-navy-950">{activeModule.sampleItem.title}</div>
                    <div className="text-[10px] text-slate-500">{activeModule.sampleItem.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Actual Interface Screenshot Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="ml-2 text-[10px] font-mono text-slate-500 truncate">
                      UniMate Application • {activeModule.title}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-state-success" />
                </div>
                <img
                  src={activeModule.image}
                  alt={activeModule.title}
                  className="w-full h-auto object-cover block"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
