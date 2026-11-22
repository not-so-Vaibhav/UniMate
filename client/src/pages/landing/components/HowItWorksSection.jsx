import React from 'react';
import Badge from '../../../components/common/Badge';
import { UserCheck, Compass, LayoutDashboard, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Discover UniMate',
    description:
      'Sign in or register with your campus student credentials. One authenticated profile provides least-privilege access across all five campus services.',
    icon: UserCheck,
    detail: 'Zero repetitive logins across different departmental service portals.',
  },
  {
    step: '02',
    title: 'Access the Services',
    description:
      'Browse daily canteen menus, check printing counter parameters, locate academic lecture blocks, or register misplaced belongings from a unified navigation rail.',
    icon: Compass,
    detail: 'Every service presents verified schedules, locations, and pricing transparency.',
  },
  {
    step: '03',
    title: 'Manage in One Place',
    description:
      'Track your orders, view submitted requests, and review query history on your personalized dashboard without visiting physical counters for basic updates.',
    icon: LayoutDashboard,
    detail: 'Clear request statuses and real-time counter updates throughout the semester.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-background border-t border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="neutral" className="text-xs py-1 px-3 mb-3">
            User Journey
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-navy-950 mb-3">
            How UniMate Works
          </h2>
          <p className="text-sm sm:text-base text-slate-text leading-relaxed">
            A structured, frictionless process for navigating everyday campus life.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-surface border border-slate-border rounded-xl p-7 flex flex-col justify-between shadow-2xs hover:border-navy-300 transition-colors"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold font-mono text-navy-800">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-surface-muted text-navy-800 flex items-center justify-center border border-slate-border">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-navy-950 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-text leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-border text-xs text-navy-950 font-medium bg-surface-muted/30 -mx-7 -mb-7 p-4 rounded-b-xl">
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
