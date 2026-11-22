import React from 'react';
import { UserCheck, Compass, LayoutDashboard, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Authenticate Once',
    description:
      'Sign in with your verified campus student or operator credentials. One account unlocks every service with least-privilege security.',
    detail: 'Zero repetitive logins across fragmented departmental portals.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: 'Access Campus Services',
    description:
      'Browse live canteen menus, check printing counter parameters, locate academic lecture blocks, or report lost belongings.',
    detail: 'Transparent schedules, live pricing in INR (₹), and verified locations.',
    icon: Compass,
  },
  {
    step: '03',
    title: 'Track in Real-Time',
    description:
      'Monitor your food orders, track print fulfillment, and review AI queries on your dashboard without waiting in physical queues.',
    detail: 'Real-time status updates from order creation through final pickup.',
    icon: LayoutDashboard,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-background border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean typography, NO generic pill badges */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              User Experience
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 mb-4">
            How UniMate Works
          </h2>
          <p className="text-base text-slate-text leading-relaxed">
            A structured, frictionless process designed for everyday campus life.
          </p>
        </div>

        {/* Connected Horizontal Steps Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-navy-300 transition-all duration-200"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-navy-800 tracking-tight">
                      {item.step}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-slate-50 text-navy-800 flex items-center justify-center border border-slate-200">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-navy-950 mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-text leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs font-medium text-navy-900 bg-slate-50/70 -mx-7 sm:-mx-8 -mb-7 sm:-mb-8 p-4 rounded-b-2xl">
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
