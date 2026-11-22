import React from 'react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import {
  Bot,
  MapPin,
  UtensilsCrossed,
  Printer,
  Search,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const SERVICES = [
  {
    id: 'assistant',
    title: 'AI Campus Assistant',
    description:
      'Help students find campus-related information through an AI-powered assistant grounded strictly in verified institutional documents and circulars.',
    icon: Bot,
    badge: 'Phase 2 Foundation',
    badgeVariant: 'neutral',
    highlights: [
      'Grounded in verified circulars and regulations',
      'Uncertainty awareness (never fabricates campus facts)',
      'Decoupled FastAPI backend for heavy NLP',
    ],
  },
  {
    id: 'navigation',
    title: 'Campus Navigation',
    description:
      'Discover campus buildings, academic lecture halls, administrative offices, and student facilities through a verified location directory.',
    icon: MapPin,
    badge: 'Directory Active',
    badgeVariant: 'success',
    highlights: [
      'Search by building name, hall code, or facility type',
      'Verified location metadata (floors and wings)',
      'No fabricated routes or unverified coordinates',
    ],
  },
  {
    id: 'canteen',
    title: 'Canteen Pre-ordering',
    description:
      'Browse verified daily food options and transparent pricing (₹) to prepare meal orders before visiting the cafeteria counter.',
    icon: UtensilsCrossed,
    badge: 'Menu Active',
    badgeVariant: 'success',
    highlights: [
      'Verified Indian Rupee (₹) pricing catalog',
      'Live item availability flags',
      'Dedicated service operator queue interface',
    ],
  },
  {
    id: 'printing',
    title: 'Xerox / Printing',
    description:
      'Submit academic documents, select print specifications, and track order fulfillment securely at the campus printing counter.',
    icon: Printer,
    badge: 'Service Ready',
    badgeVariant: 'neutral',
    highlights: [
      'PDF, DOCX format validation with 10MB limits',
      'Private document storage and access control',
      'Black & white vs color and duplex layout options',
    ],
  },
  {
    id: 'lost-found',
    title: 'Lost & Found',
    description:
      'Report misplaced belongings, discover found items reported across campus, and resolve property claims through verified recovery protocols.',
    icon: Search,
    badge: 'Registry Ready',
    badgeVariant: 'neutral',
    highlights: [
      'Standardized categories (IDs, Electronics, Books)',
      'Privacy protection (no public phone exposure)',
      'Security desk handover verification workflows',
    ],
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-surface border-t border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="primary" className="text-xs py-1 px-3 mb-3">
            Integrated Campus Modules
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-navy-950 mb-3">
            Five Core Services. One Unified Portal.
          </h2>
          <p className="text-sm sm:text-base text-slate-text leading-relaxed">
            UniMate eliminates disconnected departmental demos and fragmented notices by consolidating
            essential student services into a single, role-aware application.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className="group relative bg-surface border border-slate-border rounded-xl p-6 hover:border-navy-400 hover:shadow-[0_4px_20px_rgba(38,59,90,0.08)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-colors duration-200 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={svc.badgeVariant} className="text-[10px]">
                      {svc.badge}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-semibold text-navy-950 mb-2 group-hover:text-navy-800 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-text leading-relaxed mb-5">
                    {svc.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 pt-4 border-t border-slate-border/70">
                    {svc.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-navy-950">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Tag */}
                <div className="mt-6 pt-3 border-t border-slate-border/50 flex items-center justify-between text-[11px] text-slate-text">
                  <span>Core Campus Workflow</span>
                  <span className="font-medium text-navy-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Sixth Feature Card - Integration Architecture */}
          <div className="bg-navy-800 text-white rounded-xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mb-4">
                <span className="font-bold text-base">U</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Built as One Coherent System
              </h3>
              <p className="text-xs sm:text-sm text-navy-100 leading-relaxed mb-6">
                Rather than five independent prototypes, UniMate shares authentication, design tokens,
                and relational integrity under a single architecture.
              </p>
              <div className="space-y-2 text-xs text-navy-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Single Sign-On for all services</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Role-based authorization (Student / Operator / Admin)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Consistent typography and design tokens</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-navy-200">
              Validated against institutional TRD & PRD baseline
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
