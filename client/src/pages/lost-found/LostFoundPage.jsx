import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Search, Shield, Tag, HelpCircle, AlertCircle } from 'lucide-react';

export default function LostFoundPage() {
  const categories = [
    { name: 'Electronics & Devices', examples: 'Laptops, calculators, smartphones, flash drives, earphones' },
    { name: 'Cards & Student IDs', examples: 'Campus ID cards, library passes, hostel entry tags, wallets' },
    { name: 'Books & Course Materials', examples: 'Textbooks, lab manuals, project binders, stationery' },
    { name: 'Bags & Personal Belongings', examples: 'Backpacks, water bottles, umbrellas, keychains' },
  ];

  const protocols = [
    { title: 'Privacy Protection', desc: 'Personal contact information and phone numbers are never displayed publicly without student consent.' },
    { title: 'Verification Standard', desc: 'Claimants must verify distinguishing marks, serial identifiers, or proof of ownership prior to retrieval.' },
    { title: 'Central Security Handover', desc: 'Found high-value valuables (IDs, wallets, electronics) should be submitted to Campus Security at MAB Ground Floor.' },
  ];

  return (
    <div>
      <PageHeader
        title="Lost & Found"
        subtitle="Campus property reporting, recovery registry, and verified claim protocols"
        breadcrumbs={['Services', 'Lost & Found']}
        badge={<Badge variant="neutral">Registry Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Registry Categories */}
        <Card title="Property Categories" subtitle="Supported item classifications in the UniMate registry">
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-surface-muted/40 border border-slate-border">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-3.5 h-3.5 text-navy-800" />
                  <h4 className="text-xs font-semibold text-navy-950">{cat.name}</h4>
                </div>
                <p className="text-xs text-slate-text pl-5.5">{cat.examples}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Verification Protocols */}
        <Card title="Campus Recovery Protocols" subtitle="Security and ownership verification policy">
          <div className="space-y-3.5">
            {protocols.map((proto, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-border">
                <h4 className="text-xs font-semibold text-navy-950 mb-0.5">{proto.title}</h4>
                <p className="text-xs text-slate-text leading-relaxed">{proto.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Scope Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-muted/60 border border-slate-border text-xs text-slate-text leading-relaxed">
        <strong>Reporting Workflow Phase Notice:</strong> Interactive report submission (Lost item filing / Found item posting)
        and filtered status updates will be implemented in Phase 2. The database table (<code>lost_found_items</code>) and category indexes are fully initialized.
      </div>
    </div>
  );
}
