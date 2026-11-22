import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { MapPin, Search, Building2, Navigation, Compass } from 'lucide-react';

const VERIFIED_LOCATIONS = [
  {
    name: 'Main Academic Block - Sector A',
    code: 'MAB-A',
    category: 'Academic',
    building: 'Main Academic Building',
    floor: 'Ground Floor',
    description: 'Primary lecture halls A1-A10, faculty offices, and academic coordination desk.',
  },
  {
    name: 'Central Library',
    code: 'LIB-01',
    category: 'Facility',
    building: 'Library Complex',
    floor: '1st & 2nd Floors',
    description: 'Central campus reading halls, textbook reserve collections, and quiet study carrels.',
  },
  {
    name: 'Student Activity Center',
    code: 'SAC-01',
    category: 'Facility',
    building: 'SAC Building',
    floor: 'Ground Floor',
    description: 'Student clubs headquarters, recreational lounge, and indoor badminton arena.',
  },
  {
    name: 'North Canteen',
    code: 'CNT-NORTH',
    category: 'Dining',
    building: 'Dining Block',
    floor: 'Ground Floor',
    description: 'Campus cafeteria providing breakfast, hot lunches, and student meal counters.',
  },
  {
    name: 'Digital Xerox Center',
    code: 'XRX-01',
    category: 'Facility',
    building: 'Main Academic Building',
    floor: 'Ground Floor (East Wing)',
    description: 'Document printing, spiral binding, and academic course-pack photocopy counter.',
  },
];

export default function NavigationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Academic', 'Facility', 'Dining'];

  const filteredLocations = VERIFIED_LOCATIONS.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || loc.category === selectedCategory;
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
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredLocations.map((loc) => (
          <Card key={loc.code} className="hover:border-navy-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <Badge variant="primary" className="text-[10px]">
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
              <span>Verified Campus Place</span>
              <span className="text-navy-800 font-medium">Mapped</span>
            </div>
          </Card>
        ))}
      </div>

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
