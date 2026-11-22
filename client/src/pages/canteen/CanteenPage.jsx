import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { UtensilsCrossed, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const MENU_ITEMS = [
  {
    name: 'Veg Sandwich (Toasted)',
    category: 'Breakfast',
    price: 45.0,
    description: 'Whole wheat bread with fresh sliced cucumbers, tomatoes, and spiced mint chutney.',
    isAvailable: true,
  },
  {
    name: 'Masala Dosa',
    category: 'Breakfast',
    price: 60.0,
    description: 'Crispy fermented crepe filled with spiced potato masala, served with sambar and coconut chutney.',
    isAvailable: true,
  },
  {
    name: 'Paneer Butter Masala Thali',
    category: 'Meals',
    price: 120.0,
    description: 'Cottage cheese curry, yellow dal tadka, steamed basmati rice, two rotis, fresh salad, and curd.',
    isAvailable: true,
  },
  {
    name: 'Cold Coffee',
    category: 'Beverages',
    price: 40.0,
    description: 'Chilled brewed coffee blended with milk and cocoa powder.',
    isAvailable: true,
  },
  {
    name: 'Hot Masala Chai',
    category: 'Beverages',
    price: 15.0,
    description: 'Freshly brewed spiced milk tea infused with crushed ginger and cardamom.',
    isAvailable: true,
  },
];

export default function CanteenPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Breakfast', 'Meals', 'Beverages'];

  const filteredItems = MENU_ITEMS.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <div>
      <PageHeader
        title="Canteen Pre-ordering"
        subtitle="North Canteen daily menu, verified pricing, and meal availability"
        breadcrumbs={['Services', 'Canteen']}
        badge={<Badge variant="neutral">Menu Foundation</Badge>}
      />

      {/* Operational Notice Banner */}
      <div className="mb-6 p-4 rounded-xl bg-surface border border-slate-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-navy-950">Counter Timings: 08:00 AM – 08:30 PM</h3>
            <p className="text-xs text-slate-text">North Canteen Ground Floor • Average counter prep time: 10 mins</p>
          </div>
        </div>
        <Badge variant="success" dot className="self-start sm:self-auto text-[11px]">
          Counter Open
        </Badge>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-border pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeCategory === cat
                ? 'bg-navy-800 text-white shadow-xs'
                : 'text-slate-text hover:text-navy-950 hover:bg-surface-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredItems.map((item, idx) => (
          <Card key={idx} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="neutral" className="text-[10px]">
                  {item.category}
                </Badge>
                <span className="text-sm font-bold text-navy-950">₹{item.price.toFixed(2)}</span>
              </div>
              <h3 className="text-sm font-semibold text-navy-950 mb-1">{item.name}</h3>
              <p className="text-xs text-slate-text leading-relaxed">{item.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-border flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-state-success font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Available
              </span>
              <span className="text-slate-text text-[11px]">Pre-order: Phase 2</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Scope Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-muted/60 border border-slate-border text-xs text-slate-text leading-relaxed">
        <strong>Pre-ordering Workflow Note:</strong> Per TRD Phase 1 scope boundaries, interactive cart selection, payment token issuance,
        and operator live order queue processing are scheduled for Phase 2. The menu catalog schema and price verification tables are now initialized.
      </div>
    </div>
  );
}
