import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { UtensilsCrossed, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const FALLBACK_MENU = [
  {
    name: '[Sample] Veg Sandwich (Toasted)',
    category: 'breakfast',
    price: 45.0,
    description: '[Development Sample Data] Whole wheat bread with fresh sliced cucumbers, tomatoes, and spiced mint chutney.',
    is_available: true,
  },
  {
    name: '[Sample] Masala Dosa',
    category: 'breakfast',
    price: 60.0,
    description: '[Development Sample Data] Crispy fermented crepe filled with spiced potato masala, served with sambar and coconut chutney.',
    is_available: true,
  },
  {
    name: '[Sample] Paneer Butter Masala Thali',
    category: 'meals',
    price: 120.0,
    description: '[Development Sample Data] Cottage cheese curry, yellow dal tadka, steamed basmati rice, two rotis, fresh salad, and curd.',
    is_available: true,
  },
  {
    name: '[Sample] Cold Coffee',
    category: 'beverages',
    price: 40.0,
    description: '[Development Sample Data] Chilled brewed coffee blended with milk and cocoa powder.',
    is_available: true,
  },
  {
    name: '[Sample] Hot Masala Chai',
    category: 'beverages',
    price: 15.0,
    description: '[Development Sample Data] Freshly brewed spiced milk tea infused with crushed ginger and cardamom.',
    is_available: true,
  },
];

export default function CanteenPage() {
  const [menuItems, setMenuItems] = useState(FALLBACK_MENU);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'breakfast', 'meals', 'beverages'];

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const res = await api.get('/canteen/menu');
        if (res.data.success && res.data.data.menuItems?.length > 0) {
          setMenuItems(res.data.data.menuItems);
        }
      } catch (err) {
        console.warn('[Canteen] Using fallback menu:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const filteredItems = menuItems.filter(
    (item) =>
      activeCategory === 'All' ||
      item.category.toLowerCase() === activeCategory.toLowerCase()
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
      <div className="flex items-center gap-2 mb-6 border-b border-slate-border pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap ${
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
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-text flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-navy-800" />
          <span>Loading menu catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredItems.map((item, idx) => (
            <Card key={idx} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="neutral" className="text-[10px] capitalize">
                    {item.category}
                  </Badge>
                  <span className="text-sm font-bold text-navy-950">₹{Number(item.price).toFixed(2)}</span>
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
      )}

      {/* Scope Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-muted/60 border border-slate-border text-xs text-slate-text leading-relaxed">
        <strong>Pre-ordering Workflow Note:</strong> Per TRD Phase 1 scope boundaries, interactive cart selection, payment token issuance,
        and operator live order queue processing are scheduled for Phase 2. The menu catalog schema and price verification tables are now initialized.
      </div>
    </div>
  );
}
