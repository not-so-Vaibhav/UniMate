import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import api from '../../services/api';
import { MapPin, Search, Building2, Compass, Loader2 } from 'lucide-react';

const FALLBACK_LOCATIONS = [
  {
    name: '[Sample] Main Academic Block - Sector A',
    code: 'MAB-A',
    category: 'academic',
    building: 'Main Academic Building',
    floor: 'Ground Floor',
    description: '[Development Sample Data] Primary lecture halls A1-A10, faculty offices, and academic coordination desk.',
  },
  {
    name: '[Sample] Central Library',
    code: 'LIB-01',
    category: 'facility',
    building: 'Library Complex',
    floor: '1st & 2nd Floors',
    description: '[Development Sample Data] Central campus reading halls, textbook reserve collections, and quiet study carrels.',
  },
  {
    name: '[Sample] Student Activity Center',
    code: 'SAC-01',
    category: 'facility',
    building: 'SAC Building',
    floor: 'Ground Floor',
    description: '[Development Sample Data] Student clubs headquarters, recreational lounge, and indoor badminton arena.',
  },
  {
    name: '[Sample] North Canteen',
    code: 'CNT-NORTH',
    category: 'canteen',
    building: 'Dining Block',
    floor: 'Ground Floor',
    description: '[Development Sample Data] Campus cafeteria providing breakfast, hot lunches, and student meal counters.',
  },
  {
    name: '[Sample] Digital Xerox Center',
    code: 'XRX-01',
    category: 'facility',
    building: 'Main Academic Building',
    floor: 'Ground Floor (East Wing)',
    description: '[Development Sample Data] Document printing, spiral binding, and academic course-pack photocopy counter.',
  },
];

export default function NavigationPage() {
  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'academic', 'facility', 'canteen'];

  useEffect(() => {
    async function fetchLocations() {
      setLoading(true);
      try {
        const res = await api.get('/locations');
        if (res.data.success && res.data.data.locations?.length > 0) {
          setLocations(res.data.data.locations);
        }
      } catch (err) {
        console.warn('[Locations] Using baseline directory:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      loc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <PageHeader
        title="Campus Navigation"
        subtitle="Directory of verified academic halls, facilities, and campus service counters"
        breadcrumbs={['Services', 'Navigation']}
        badge={<Badge variant="success">Directory Active</Badge>}
      />

      {/* Search and Category Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search locations by name, building, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors capitalize whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-surface text-navy-800 border-slate-border hover:bg-surface-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Location Directory Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-text flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-navy-800" />
          <span>Loading verified campus places...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredLocations.map((loc) => (
            <Card key={loc.code} className="hover:border-navy-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant="primary" className="text-[10px] capitalize">
                    {loc.category}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-text">{loc.code}</span>
                </div>
                <h3 className="text-sm font-semibold text-navy-950 mb-1">{loc.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-text mb-3">
                  <Building2 className="w-3.5 h-3.5 text-slate-text" />
                  <span>
                    {loc.building} • {loc.floor}
                  </span>
                </div>
                <p className="text-xs text-slate-text leading-relaxed">{loc.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-border/70 flex items-center justify-between text-[11px] text-slate-text">
                <Badge variant="neutral" className="text-[9px]">
                  Sample Data
                </Badge>
                <span className="text-navy-800 font-medium">Mapped</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Scope Notice for Turn-by-Turn Map */}
      <div className="p-4 rounded-xl bg-surface-muted/60 border border-slate-border flex items-start gap-3 text-xs text-slate-text">
        <Compass className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy-950 font-semibold">Turn-by-Turn Cartography Note:</strong>
          <p className="mt-0.5 leading-relaxed">
            Per PRD Section 6.3 (NAV-05), interactive vector mapping and indoor wayfinding require verified CAD/GIS campus coordinates,
            which will be integrated during the Navigation Enhancement phase.
          </p>
        </div>
      </div>
    </div>
  );
}
