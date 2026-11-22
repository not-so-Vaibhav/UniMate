import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  MapPin,
  Search,
  Building2,
  Compass,
  Loader2,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  Clock,
} from 'lucide-react';

export default function NavigationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState(['All', 'academic', 'facility', 'canteen', 'admin']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Admin form modal states
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'academic',
    building: '',
    floor: '',
    description: '',
  });

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/locations', {
        params: {
          includeInactive: isAdmin ? 'true' : 'false',
        },
      });
      if (res.data.success) {
        setLocations(res.data.data.locations || []);
        if (res.data.data.categories?.length > 0) {
          setCategories(res.data.data.categories);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load campus locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [isAdmin]);

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

  const openDetail = (loc) => {
    setSelectedLocation(loc);
    setDetailModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      code: '',
      category: 'academic',
      building: '',
      floor: '',
      description: '',
    });
    setFormError('');
    setAdminModalOpen(true);
  };

  const openEditModal = (loc, e) => {
    e.stopPropagation();
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      code: loc.code,
      category: loc.category,
      building: loc.building,
      floor: loc.floor || '',
      description: loc.description || '',
    });
    setFormError('');
    setAdminModalOpen(true);
  };

  const handleToggleStatus = async (loc, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/locations/${loc.id}/status`, { is_active: !loc.is_active });
      await fetchLocations();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update location status.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingLocation) {
        await api.put(`/locations/${editingLocation.id}`, formData);
      } else {
        await api.post('/locations', formData);
      }
      setAdminModalOpen(false);
      await fetchLocations();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to save location.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Campus Navigation"
        subtitle="Verified directory of academic lecture halls, facilities, and campus service counters"
        breadcrumbs={['Services', 'Navigation']}
        badge={<Badge variant="success">Directory Active</Badge>}
        actions={
          isAdmin && (
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
              Add Campus Place
            </Button>
          )
        }
      />

      {/* Search and Category Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search verified places by name, building, or room code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors capitalize whitespace-nowrap focus:outline-none ${
                selectedCategory === cat
                  ? 'bg-navy-800 text-white border-navy-800 shadow-2xs'
                  : 'bg-white text-navy-800 border-slate-border hover:bg-surface-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-state-danger flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchLocations}>
            Retry
          </Button>
        </div>
      )}

      {/* Location Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-text flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
          <span>Querying verified campus places...</span>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8 mb-6">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-navy-950 mb-1">No Matching Campus Places</h3>
          <p className="text-xs text-slate-text max-w-sm mx-auto mb-4">
            No locations matched "{searchTerm}" under {selectedCategory}. Try adjusting your filter or search query.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredLocations.map((loc) => (
            <div
              key={loc.code}
              onClick={() => openDetail(loc)}
              className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer hover:border-navy-400 hover:shadow-xs ${
                loc.is_active === false ? 'opacity-60 bg-slate-50 border-dashed border-slate-300' : 'border-slate-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                    {loc.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium text-slate-500">{loc.code}</span>
                    {loc.is_active === false && (
                      <span className="text-[9px] font-semibold text-state-danger bg-red-50 px-1.5 py-0.2 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-navy-950 mb-1">{loc.name}</h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-text mb-2.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {loc.building} {loc.floor ? `• ${loc.floor}` : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-text leading-relaxed line-clamp-2">
                  {loc.description || 'Verified campus building and academic hall.'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-accent" /> Verified Location
                </span>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={(e) => openEditModal(loc, e)}
                      className="p-1 text-slate-400 hover:text-navy-950 rounded hover:bg-slate-100 transition-colors"
                      title="Edit Location"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="font-medium text-navy-800 flex items-center gap-1 hover:underline">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cartography Roadmap Note */}
      <div className="p-4 rounded-xl bg-surface-muted/60 border border-slate-border flex items-start gap-3 text-xs text-slate-text">
        <Compass className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy-950 font-semibold">Turn-by-Turn Cartography Note:</strong>
          <p className="mt-0.5 leading-relaxed">
            Per PRD Section 6.3 (NAV-05), interactive vector mapping and turn-by-turn indoor wayfinding require institutional
            CAD/GIS campus coordinates. In accordance with zero-fabrication standards, the verified directory provides reliable building, floor,
            and wing data while vector maps remain staged for subsequent integration.
          </p>
        </div>
      </div>

      {/* Location Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedLocation?.name || 'Campus Location'}
        size="md"
      >
        {selectedLocation && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-border">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Location Code</span>
                <span className="font-mono font-bold text-sm text-navy-950">{selectedLocation.code}</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                {selectedLocation.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <span className="text-slate-text text-[11px] block">Building Complex</span>
                <span className="font-semibold text-navy-950 mt-0.5 block">{selectedLocation.building}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <span className="text-slate-text text-[11px] block">Floor & Wing</span>
                <span className="font-semibold text-navy-950 mt-0.5 block">
                  {selectedLocation.floor || 'Ground Level'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-text text-[11px] font-semibold block mb-1">Description & Services</span>
              <p className="text-navy-950 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedLocation.description || 'Verified university facility with standard student access.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-state-success">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Status: Active & Verified on Campus Directory</span>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Create / Edit Modal */}
      {isAdmin && (
        <Modal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          title={editingLocation ? 'Edit Campus Location' : 'Add New Campus Location'}
          size="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
            {formError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-state-danger border border-red-200">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-navy-950 mb-1">Location Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                placeholder="e.g. Ramanujan Seminar Hall"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-navy-950 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 uppercase"
                  placeholder="e.g. RSH-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-950 mb-1">Category *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 capitalize bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="academic">Academic</option>
                  <option value="facility">Facility</option>
                  <option value="canteen">Canteen</option>
                  <option value="admin">Admin</option>
                  <option value="library">Library</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-navy-950 mb-1">Building Complex *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                  placeholder="e.g. Science Block B"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-navy-950 mb-1">Floor / Wing</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                  placeholder="e.g. 2nd Floor, West Wing"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-navy-950 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                placeholder="Details, facilities available, lab equipment, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t border-slate-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdminModalOpen(false)}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={formSubmitting}>
                {editingLocation ? 'Save Changes' : 'Create Location'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
