import React from 'react';
import { Database, Lock, Server, Cpu, CheckCircle2 } from 'lucide-react';

const PILLARS = [
  {
    icon: Database,
    title: 'Relational MySQL Backend',
    tag: 'MySQL 9.5',
    description: '9 normalized tables with InnoDB foreign keys, indexing, and repeatable migrations.',
  },
  {
    icon: Lock,
    title: 'Least-Privilege RBAC',
    tag: 'Bcrypt + JWT',
    description: 'Strict authorization on every route separating students, operators, and administrators.',
  },
  {
    icon: Cpu,
    title: 'FastAPI AI Subsystem',
    tag: 'Python 3.12',
    description: 'Decoupled Python microservice handling NLP without blocking transactional Express APIs.',
  },
  {
    icon: Server,
    title: 'Live Telemetry Checks',
    tag: 'Real-Time Ping',
    description: 'Client actively verifies database and API connectivity with automatic offline detection.',
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-12 sm:py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            Engineered for Campus Integrity
          </h2>
        </div>

        {/* Compact 4-Column Technical Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white text-navy-800 flex items-center justify-center border border-slate-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-[10px] text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-navy-950 mb-1">{p.title}</h3>
                  <p className="text-[11px] text-slate-text leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
