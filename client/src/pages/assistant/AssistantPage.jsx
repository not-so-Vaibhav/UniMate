import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AssistantPage() {
  const plannedCapabilities = [
    {
      title: 'Grounding in Campus Directory',
      description: 'Answers will be grounded strictly in verified university circulars, department contacts, and building schedules.',
    },
    {
      title: 'Uncertainty Awareness',
      description: 'When information is unavailable or unverified, the assistant will explicitly state inability to answer rather than speculating.',
    },
    {
      title: 'Contextual Query History',
      description: 'Students will have private access to their previous query threads without data leakage.',
    },
    {
      title: 'FastAPI Subsystem Separation',
      description: 'Dedicated Python + FastAPI backend keeps heavy NLP computation decoupled from core application transactions.',
    },
  ];

  const sampleTopics = [
    'What are the working hours of the Central Library on weekends?',
    'Where is the Dean of Student Affairs office located in Sector A?',
    'What is the submission deadline for semester re-examinations?',
    'What are the operational timings for the North Canteen counter?',
  ];

  return (
    <div>
      <PageHeader
        title="AI Campus Assistant"
        subtitle="Intelligent campus inquiry assistant grounded in verified university information"
        breadcrumbs={['Services', 'AI Assistant']}
        badge={<Badge variant="neutral">Phase 2 Planned</Badge>}
      />

      {/* Architectural Status Banner */}
      <div className="mb-6 p-5 rounded-xl bg-surface border border-slate-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-navy-950">
                  AI Service Subsystem Foundation (Python + FastAPI)
                </h3>
                <Badge variant="success" dot className="text-[10px]">
                  Infrastructure Ready
                </Badge>
              </div>
              <p className="text-xs text-slate-text mt-1 max-w-2xl leading-relaxed">
                The standalone FastAPI service architecture has been established. In accordance with Phase 1
                scope boundaries, live model prompt orchestration and knowledge base indexing will be integrated in Phase 2.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grounding Principles */}
        <Card title="Design & Grounding Standards" subtitle="TRD & PRD architectural requirements">
          <div className="space-y-4">
            {plannedCapabilities.map((cap, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-surface-muted/40 border border-slate-border">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-navy-950">{cap.title}</h4>
                  <p className="text-xs text-slate-text mt-0.5 leading-relaxed">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Representative Sample Inquiries */}
        <Card title="Target Campus Inquiries" subtitle="Representative questions targeted for Phase 2 evaluation">
          <p className="text-xs text-slate-text mb-4 leading-relaxed">
            Per PRD Section 6.2, responses will be strictly grounded against verified campus documents to prevent hallucinations:
          </p>
          <div className="space-y-2.5">
            {sampleTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-border text-xs text-navy-950 bg-surface flex items-center justify-between"
              >
                <span>"{topic}"</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-text flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-lg bg-surface-muted/60 text-xs text-slate-text border border-slate-border">
            <strong>Scope Notice:</strong> Active conversational chat is scheduled for delivery in Phase 2 following knowledge corpus ingestion.
          </div>
        </Card>
      </div>
    </div>
  );
}
