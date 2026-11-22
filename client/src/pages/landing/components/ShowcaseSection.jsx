import React, { useState } from 'react';
import { LayoutDashboard, MapPin, UtensilsCrossed, ShieldCheck, Check } from 'lucide-react';

const TABS = [
  {
    id: 'dashboard',
    label: 'Student Portal',
    icon: LayoutDashboard,
    image: '/images/02_student_dashboard_desktop.png',
    title: 'Personalized Student Dashboard',
    description:
      'Provides instant access to all campus services, verified personal credentials, system readiness status, and transparent order tracking without fabricated statistics.',
    features: [
      'Personal account snapshot with verified Student ID',
      'One-click launch to all 5 campus service desks',
      'Honest empty states for recent orders and print requests',
      'Real-time backend API and database connectivity verification',
    ],
  },
  {
    id: 'navigation',
    label: 'Campus Directory',
    icon: MapPin,
    image: '/images/04_navigation_desktop.png',
    title: 'Verified Campus Navigation',
    description:
      'Search academic buildings, lecture halls, and department facilities with verified building codes, floor descriptions, and category tags.',
    features: [
      'Instant search filtering across codes, names, and buildings',
      'Category indicators for Academic, Facility, and Dining locations',
      'Clear roadmap notice for Phase 2 vector cartography',
      'Sample development places explicitly labeled',
    ],
  },
  {
    id: 'canteen',
    label: 'Canteen Pre-ordering',
    icon: UtensilsCrossed,
    image: '/images/05_canteen_desktop.png',
    title: 'Daily Menu & Transparent Pricing',
    description:
      'Browse breakfast, meal, and beverage menus from the North Canteen with verified Indian Rupee (₹) pricing and counter availability.',
    features: [
      'Category filtering for Breakfast, Meals, and Beverages',
      'Transparent price listings in ₹ with real-time status',
      'Counter operating schedule (08:00 AM – 08:30 PM)',
      'Pre-order workflow designated for Phase 2 delivery',
    ],
  },
  {
    id: 'admin',
    label: 'Administrative Oversight',
    icon: ShieldCheck,
    image: '/images/08_admin_directory_desktop.png',
    title: 'Role-Based User Directory',
    description:
      'Campus administrators inspect and manage student, service operator, and administrative accounts through a live table populated directly from MySQL.',
    features: [
      'Live query against MySQL users table with pagination',
      'Role filters for Students, Service Operators, and Admins',
      'Strict backend RBAC (Students and Operators receive 403 Forbidden)',
      'Active status indicators and registration timestamps',
    ],
  },
];

export default function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section id="showcase" className="py-20 sm:py-28 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean typography, NO generic pill badges */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Product Showcase
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 mb-4">
            Explore the Real UniMate Interface
          </h2>
          <p className="text-base text-slate-text leading-relaxed">
            Clean typography, restrained palettes, and purposeful interactions.
            Below is the actual running application.
          </p>
        </div>

        {/* Tab Selector - Sleek segmented bar */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                    : 'bg-white text-navy-700 border-slate-200 hover:bg-slate-50 hover:text-navy-950'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-text'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-background border border-slate-200 rounded-2xl p-6 sm:p-9 shadow-xs">
          {/* Details Column */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block mb-2">
                {current.label}
              </span>
              <h3 className="text-2xl font-bold text-navy-950 tracking-tight">
                {current.title}
              </h3>
              <p className="text-sm text-slate-text leading-relaxed mt-2.5">
                {current.description}
              </p>
            </div>

            <div className="space-y-3 pt-5 border-t border-slate-200">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-navy-950">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-state-success flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshot Mockup Column */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="ml-2 text-[10px] font-mono text-slate-500 truncate">
                    UniMate Preview • {current.label}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-state-success" />
              </div>
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-auto object-cover block"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
