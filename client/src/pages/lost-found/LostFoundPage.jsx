import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Search,
  Tag,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Loader2,
  Trash2,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

export default function LostFoundPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Active view: 'browse' | 'report' | 'my-items'
  const [activeView, setActiveView] = useState('browse');

  // Listings data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'lost' | 'found'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Campus locations for location dropdown
  const [locations, setLocations] = useState([]);

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimingItem, setClaimingItem] = useState(null);
  const [verificationProof, setVerificationProof] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Report Form State
  const [reportType, setReportType] = useState('lost');
  const [reportFormData, setReportFormData] = useState({
    title: '',
    category: 'Electronics & Devices',
    description: '',
    location_id: '',
    location_detail: '',
    date_occurred: new Date().toISOString().slice(0, 10),
    contact_info: '',
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Categories list
  const categories = [
    'All',
    'Electronics & Devices',
    'Cards & Student IDs',
    'Books & Materials',
    'Personal Belongings',
    'Valuables',
    'Other',
  ];

  // Fetch listings
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/lost-found', {
        params: {
          item_type: typeFilter !== 'all' ? typeFilter : undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          search: searchQuery || undefined,
          myItemsOnly: activeView === 'my-items' ? 'true' : undefined,
        },
      });
      if (res.data.success) {
        setItems(res.data.data.items || []);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch campus locations for select dropdown
  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.get('/locations');
        if (res.data.success) {
          setLocations(res.data.data.locations || []);
        }
      } catch (err) {
        console.warn('[LostFound] Locations load fallback:', err);
      }
    }
    loadLocations();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter, searchQuery, activeView]);

  // Submit Report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    setReportError('');
    setReportSuccess(false);

    try {
      const res = await api.post('/lost-found', {
        ...reportFormData,
        item_type: reportType,
      });

      if (res.data.success) {
        setReportSuccess(true);
        setReportFormData({
          title: '',
          category: 'Electronics & Devices',
          description: '',
          location_id: '',
          location_detail: '',
          date_occurred: new Date().toISOString().slice(0, 10),
          contact_info: '',
        });
        fetchItems();
      }
    } catch (err) {
      setReportError(err.response?.data?.error?.message || 'Failed to submit report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Submit Claim
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!verificationProof.trim()) return;

    setClaimSubmitting(true);
    try {
      const res = await api.post(`/lost-found/${claimingItem.id}/claim`, {
        verificationProof,
      });
      if (res.data.success) {
        setClaimSuccess(true);
        setVerificationProof('');
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  // Update status (Owner or Admin)
  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      await api.patch(`/lost-found/${itemId}/status`, { status: newStatus });
      fetchItems();
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  // Delete listing
  const handleDeleteListing = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/lost-found/${itemId}`);
      fetchItems();
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete listing.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reported':
        return <Badge variant="primary" dot className="capitalize">Active</Badge>;
      case 'under_review':
        return <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-md border border-amber-200">Under Review</span>;
      case 'claimed':
        return <Badge variant="success" dot className="capitalize">Claimed</Badge>;
      case 'resolved':
        return <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 rounded-md border border-emerald-200">Resolved</span>;
      case 'closed':
        return <Badge variant="neutral" className="capitalize">Closed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Lost & Found Registry"
        subtitle="Campus property reporting, recovery registry, and verified claim protocols"
        breadcrumbs={['Services', 'Lost & Found']}
        badge={<Badge variant="success">Registry Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeView === 'report' ? 'secondary' : 'primary'}
              size="sm"
              icon={Plus}
              onClick={() => {
                setActiveView('report');
                setReportSuccess(false);
              }}
            >
              Report an Item
            </Button>
            <button
              onClick={() => setActiveView(activeView === 'my-items' ? 'browse' : 'my-items')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeView === 'my-items'
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-white text-navy-800 border-slate-border hover:bg-slate-50'
              }`}
            >
              My Reports
            </button>
          </div>
        }
      />

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-border pb-3">
        <button
          onClick={() => setActiveView('browse')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'browse'
              ? 'bg-navy-800 text-white shadow-2xs'
              : 'text-slate-text hover:text-navy-950 hover:bg-surface-muted'
          }`}
        >
          Browse Registry
        </button>
        <button
          onClick={() => {
            setActiveView('report');
            setReportSuccess(false);
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'report'
              ? 'bg-navy-800 text-white shadow-2xs'
              : 'text-slate-text hover:text-navy-950 hover:bg-surface-muted'
          }`}
        >
          Report Lost / Found
        </button>
        <button
          onClick={() => setActiveView('my-items')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'my-items'
              ? 'bg-navy-800 text-white shadow-2xs'
              : 'text-slate-text hover:text-navy-950 hover:bg-surface-muted'
          }`}
        >
          My Reported Items
        </button>
      </div>

      {/* VIEW 1 & 3: BROWSE REGISTRY / MY ITEMS */}
      {(activeView === 'browse' || activeView === 'my-items') && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-border shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Type Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-border">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    typeFilter === 'all' ? 'bg-navy-800 text-white' : 'text-slate-600 hover:text-navy-950'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setTypeFilter('lost')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    typeFilter === 'lost' ? 'bg-red-700 text-white' : 'text-slate-600 hover:text-navy-950'
                  }`}
                >
                  Lost Belongings
                </button>
                <button
                  onClick={() => setTypeFilter('found')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    typeFilter === 'found' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-navy-950'
                  }`}
                >
                  Found Items
                </button>
              </div>

              {/* Search */}
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search item title, description, or found location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-slate-600 border-slate-border hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-text flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
              <span>Querying verified property registry...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8">
              <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-navy-950 mb-1">No Listings Found</h3>
              <p className="text-xs text-slate-text max-w-sm mx-auto mb-4">
                No items match your filter criteria. If you recently misplaced or found property, submit a report to alert campus security.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveView('report')}>
                Submit Property Report
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white border border-slate-border rounded-xl p-5 flex flex-col justify-between shadow-2xs hover:border-navy-300 transition-all cursor-pointer"
                >
                  <div>
                    {/* Item Type & Status Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.item_type === 'lost'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.item_type === 'lost' ? 'Lost Item' : 'Found Item'}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <h3 className="text-sm font-bold text-navy-950 mb-1">{item.title}</h3>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{item.category}</span>
                    </div>

                    <p className="text-xs text-slate-text leading-relaxed line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                        {item.location_name || item.location_detail || 'Campus Grounds'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(item.date_occurred).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Reported by {item.reporter_name}
                      </span>
                      <span className="text-[11px] font-semibold text-navy-800 hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REPORT AN ITEM */}
      {activeView === 'report' && (
        <div className="max-w-2xl mx-auto">
          <Card
            title={reportType === 'lost' ? 'Report a Misplaced / Lost Item' : 'Report a Found Belonging'}
            subtitle="Campus registry listing to assist recovery through verified security desk protocols"
          >
            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-state-success flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950">Property Report Published</h3>
                <p className="text-xs text-slate-text max-w-sm mx-auto leading-relaxed">
                  Your report has been recorded in the central MySQL registry. Students who find or claim this item can reach out via verified security desk verification.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Button variant="primary" size="sm" onClick={() => setActiveView('browse')}>
                    View in Registry
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setReportSuccess(false)}>
                    Submit Another Report
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                {reportError && (
                  <div className="p-3 rounded-lg bg-red-50 text-state-danger border border-red-200">
                    {reportError}
                  </div>
                )}

                {/* Report Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-navy-950 mb-1.5">
                    What are you reporting? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReportType('lost')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                        reportType === 'lost'
                          ? 'bg-red-50 text-red-800 border-red-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-border hover:bg-slate-50'
                      }`}
                    >
                      I Misplaced an Item (Lost)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportType('found')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                        reportType === 'found'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-border hover:bg-slate-50'
                      }`}
                    >
                      I Discovered Belongings (Found)
                    </button>
                  </div>
                </div>

                {/* Item Title */}
                <div>
                  <label className="block text-xs font-semibold text-navy-950 mb-1">
                    Item Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs"
                    placeholder="e.g. Casio fx-991EX Scientific Calculator"
                    value={reportFormData.title}
                    onChange={(e) => setReportFormData({ ...reportFormData, title: e.target.value })}
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">Category *</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs bg-white"
                      value={reportFormData.category}
                      onChange={(e) => setReportFormData({ ...reportFormData, category: e.target.value })}
                    >
                      <option value="Electronics & Devices">Electronics & Devices</option>
                      <option value="Cards & Student IDs">Cards & Student IDs</option>
                      <option value="Books & Materials">Books & Materials</option>
                      <option value="Personal Belongings">Personal Belongings</option>
                      <option value="Valuables">Valuables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Date {reportType === 'lost' ? 'Misplaced' : 'Discovered'} *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs"
                      value={reportFormData.date_occurred}
                      onChange={(e) =>
                        setReportFormData({ ...reportFormData, date_occurred: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Location Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Campus Building / Location
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs bg-white"
                      value={reportFormData.location_id}
                      onChange={(e) =>
                        setReportFormData({ ...reportFormData, location_id: e.target.value })
                      }
                    >
                      <option value="">Select verified location...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.building})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Specific Location Detail
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs"
                      placeholder="e.g. 2nd Floor Reading Table 4, East Wing"
                      value={reportFormData.location_detail}
                      onChange={(e) =>
                        setReportFormData({ ...reportFormData, location_detail: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-semibold text-navy-950 mb-1">
                    Description & Identifying Characteristics *
                  </label>
                  <textarea
                    rows={3}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs"
                    placeholder="Color, brand, stickers, scratches, or distinguishing features..."
                    value={reportFormData.description}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, description: e.target.value })
                    }
                  />
                </div>

                {/* Privacy Contact Info */}
                <div>
                  <label className="block text-xs font-semibold text-navy-950 mb-1">
                    Contact / Handover Instructions (Protected)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs"
                    placeholder="e.g. Handed over to Central Security Desk at MAB Ground Floor"
                    value={reportFormData.contact_info}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, contact_info: e.target.value })
                    }
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Phone numbers are never displayed publicly without student consent.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('browse')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" isLoading={submittingReport}>
                    Publish Report
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Listing Details'}
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-border">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedItem.item_type === 'lost'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {selectedItem.item_type === 'lost' ? 'Lost Property' : 'Found Belongings'}
              </span>
              {getStatusBadge(selectedItem.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <span className="text-slate-text text-[11px] block">Category</span>
                <span className="font-semibold text-navy-950 mt-0.5 block">{selectedItem.category}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                <span className="text-slate-text text-[11px] block">Date Reported</span>
                <span className="font-semibold text-navy-950 mt-0.5 block">
                  {new Date(selectedItem.date_occurred).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
              <span className="text-slate-text text-[11px] block">Location</span>
              <span className="font-semibold text-navy-950 mt-0.5 block">
                {selectedItem.location_name
                  ? `${selectedItem.location_name} (${selectedItem.location_building})`
                  : 'Campus Grounds'}
                {selectedItem.location_detail ? ` • ${selectedItem.location_detail}` : ''}
              </span>
            </div>

            <div>
              <span className="text-slate-text text-[11px] font-semibold block mb-1">
                Description
              </span>
              <p className="text-navy-950 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedItem.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-text text-[11px]">
              <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-950 font-semibold">Contact & Security Handover:</strong>
                <p className="mt-0.5">{selectedItem.contact_info}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div>
                {(selectedItem.isOwner || isAdmin) && (
                  <button
                    onClick={() => handleDeleteListing(selectedItem.id)}
                    className="text-state-danger hover:underline font-medium text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Listing
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Status resolution for owner or admin */}
                {(selectedItem.isOwner || isAdmin) && selectedItem.status === 'reported' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                )}

                {/* Claim button for other students */}
                {!selectedItem.isOwner && selectedItem.status === 'reported' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setClaimingItem(selectedItem);
                      setSelectedItem(null);
                      setClaimModalOpen(true);
                      setClaimSuccess(false);
                    }}
                  >
                    Claim This Item
                  </Button>
                )}

                <Button variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* PRIVACY CLAIM MODAL */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title={`Claim Property • ${claimingItem?.title}`}
        size="md"
      >
        {claimSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-state-success flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-navy-950">Claim Verification Submitted</h3>
            <p className="text-xs text-slate-text leading-relaxed max-w-sm mx-auto">
              Your proof of ownership has been logged. Campus Security at MAB Ground Floor will verify your marks and facilitate property recovery.
            </p>
            <Button variant="primary" size="sm" onClick={() => setClaimModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] leading-relaxed">
              <strong>Ownership Verification Protocol:</strong> To protect student property against wrongful collection,
              please describe unique identifiers, serial numbers, content tags, or distinguishing marks only known to the owner.
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-950 mb-1">
                Proof of Ownership / Identifying Marks *
              </label>
              <textarea
                rows={3}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-border focus:outline-none focus:border-navy-800 text-xs"
                placeholder="e.g. Stickers on back, wallpaper picture, serial number, scratch on top corner..."
                value={verificationProof}
                onChange={(e) => setVerificationProof(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setClaimModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={claimSubmitting}>
                Submit Claim to Security Desk
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
