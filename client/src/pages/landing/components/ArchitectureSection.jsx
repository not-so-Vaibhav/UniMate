import React from 'react';
import { Database, Lock, Server, Cpu, CheckCircle2 } from 'lucide-react';

const PILLARS = [
  {
    icon: Database,
    title: 'Relational MySQL Backend',
    tag: 'MySQL 9.5',
    description:
      '9 normalized relational tables configured with InnoDB, foreign key constraints, indexes, and repeatable migration & seed scripts.',
    specs: ['Users & Roles', 'Canteen Orders & Menus', 'Print Requests & Files', 'Lost & Found Registry'],
  },
  {
    icon: Lock,
    title: 'Least-Privilege RBAC',
    tag: 'Bcrypt + JWT',
    description:
      'Strict backend authorization enforced on every route. Students cannot access admin endpoints, and operators are restricted to their assigned service.',
    specs: ['Student isolation', 'Cross-operator separation', 'Admin oversight privilege', '24h signed session tokens'],
  },
  {
    icon: Cpu,
    title: 'FastAPI AI Subsystem',
    tag: 'Python 3.12',
    description:
      'Independent Python 3 + FastAPI microservice dedicated to AI assistant features, preventing heavy NLP tasks from blocking transactional Express APIs.',
    specs: ['Decoupled architecture', 'Health check probe', 'Ready for model grounding', 'Zero fabricated facts mandate'],
  },
  {
    icon: Server,
    title: 'Real-Time Health Monitoring',
    tag: 'Live Telemetry',
    description:
      'The client dynamically verifies backend and MySQL connectivity on mount and every 30 seconds rather than falsely claiming services are online.',
    specs: ['Live MySQL ping', 'FastAPI connectivity check', 'Visual status badge', 'Automatic offline detection'],
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 sm:py-28 bg-background border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean typography, NO generic pill badges */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              System Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 mb-4">
            Engineered for Campus Integrity
          </h2>
          <p className="text-base text-slate-text leading-relaxed">
            Built from the ground up as a production-grade platform, adhering strictly to institutional
            data isolation, relational integrity, and verified privacy standards.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-navy-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center border border-navy-100 flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-navy-950">{p.title}</h3>
                        <span className="text-[11px] text-slate-400 font-medium">Core Engineering Standard</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-navy-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      {p.tag}
                    </span>
                  </div>

                  <p className="text-sm text-slate-text leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
                  {p.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-navy-950">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
