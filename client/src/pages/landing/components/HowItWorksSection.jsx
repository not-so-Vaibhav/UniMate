import React from 'react';
import { UserCheck, Compass, LayoutDashboard, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Authenticate Once',
    description: 'Sign in with your student credentials. One account unlocks every campus service with strict least-privilege security.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: 'Access Campus Services',
    description: 'Browse live canteen menus, configure digital printing, locate academic lecture blocks, or report lost belongings.',
    icon: Compass,
  },
  {
    step: '03',
    title: 'Track in Real-Time',
    description: 'Monitor your meal orders and print fulfillment live on your dashboard without waiting in physical counter queues.',
    icon: LayoutDashboard,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-background border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            User Experience
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            How UniMate Works
          </h2>
        </div>

        {/* Compact Connected 3-Step Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-navy-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold font-mono text-navy-800">
                      {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-navy-800 flex items-center justify-center border border-slate-200">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-navy-950 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-text leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
