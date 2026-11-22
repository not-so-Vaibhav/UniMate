import React from 'react';
import Badge from '../../../components/common/Badge';
import { Database, Lock, Server, Cpu, CheckCircle2 } from 'lucide-react';

const PILLARS = [
  {
    icon: Database,
    title: 'Relational MySQL Backend',
    description:
      '9 normalized relational tables configured with InnoDB, foreign key constraints, indexes, and repeatable migration & seed scripts.',
    specs: ['Users & Roles', 'Canteen Orders & Menus', 'Print Requests & Files', 'Lost & Found Registry'],
  },
  {
    icon: Lock,
    title: 'Least-Privilege RBAC',
    description:
      'Strict backend authorization enforced on every route. Students cannot access admin endpoints, and operators are restricted to their assigned service.',
    specs: ['Student isolation', 'Cross-operator separation', 'Admin oversight privilege', 'Bcrypt + JWT 24h tokens'],
  },
  {
    icon: Cpu,
    title: 'FastAPI AI Subsystem',
    description:
      'Independent Python 3 + FastAPI microservice dedicated to AI assistant features, preventing heavy NLP tasks from blocking transactional Express APIs.',
    specs: ['Decoupled architecture', 'Health check probe', 'Ready for model grounding', 'Zero fabricated facts mandate'],
  },
  {
    icon: Server,
    title: 'Real-Time Health Monitoring',
    description:
      'The client dynamically verifies backend and MySQL connectivity on mount and every 30 seconds rather than falsely claiming services are online.',
    specs: ['Live MySQL ping', 'FastAPI connectivity check', 'Visual status badge', 'Automatic offline detection'],
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 sm:py-28 bg-background border-t border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="neutral" className="text-xs py-1 px-3 mb-3">
            System Architecture
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-navy-950 mb-3">
            Engineered for Campus Integrity
          </h2>
          <p className="text-sm sm:text-base text-slate-text leading-relaxed">
            Built from the ground up as a production-minded platform, adhering strictly to institutional
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
                className="bg-surface border border-slate-border rounded-xl p-6 sm:p-7 shadow-2xs hover:border-navy-300 transition-colors"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center border border-navy-100 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-navy-950">{p.title}</h3>
                    <span className="text-[11px] text-slate-text font-medium">Core Technical Foundation</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-text leading-relaxed mb-5">
                  {p.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-border">
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
