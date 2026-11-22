import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Printer, FileText, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

export default function PrintingPage() {
  const specs = [
    { label: 'Supported File Types', value: 'PDF, DOCX, JPG, PNG' },
    { label: 'Maximum File Size', value: '10 MB per document' },
    { label: 'Color Modes', value: 'Black & White / Color' },
    { label: 'Paper & Layout', value: 'A4 Single-sided / Double-sided' },
    { label: 'Fulfillment Desk', value: 'Digital Xerox Center, East Wing' },
    { label: 'Document Privacy', value: 'Restricted to owner and print operator' },
  ];

  return (
    <div>
      <PageHeader
        title="Xerox / Printing"
        subtitle="Document reproduction, digital print requests, and fulfillment specifications"
        breadcrumbs={['Services', 'Printing']}
        badge={<Badge variant="neutral">Service Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Specifications Card */}
        <div className="lg:col-span-2">
          <Card title="Printing Guidelines & Parameters" subtitle="Standard campus printing criteria">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {specs.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-surface-muted/40 border border-slate-border">
                  <div className="text-[11px] text-slate-text font-medium">{item.label}</div>
                  <div className="text-xs font-semibold text-navy-950 mt-1">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-surface border border-slate-border flex items-start gap-3 text-xs text-slate-text">
              <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-950 font-semibold">Document Security Architecture:</strong>
                <p className="mt-0.5 leading-relaxed">
                  Per TRD Section 7, all uploaded files are stored in private access-controlled storage with sanitized filenames.
                  File metadata is registered in the MySQL <code>uploaded_files</code> table with ownership integrity constraints.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Counter Schedule Card */}
        <div className="lg:col-span-1">
          <Card title="Xerox Counter Status" subtitle="Fulfillment location details">
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="text-slate-text">Location</div>
                <div className="font-semibold text-navy-950 mt-0.5">East Wing Ground Floor (XRX-01)</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="text-slate-text">Operating Hours</div>
                <div className="font-semibold text-navy-950 mt-0.5">09:00 AM – 06:00 PM (Mon-Sat)</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="text-slate-text">Assigned Operator</div>
                <div className="font-semibold text-navy-950 mt-0.5">Anita Xerox Desk</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-muted/60 border border-slate-border text-xs text-slate-text leading-relaxed">
        <strong>Workflow Phase Notice:</strong> Interactive file upload drag-and-drop, multi-page calculation, and live job status tracking
        will be delivered in Phase 2. The database schema (<code>print_requests</code> and <code>uploaded_files</code>) and operator role policies are established.
      </div>
    </div>
  );
}
