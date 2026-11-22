import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Plus,
  Eye,
  RefreshCw,
  Archive,
  Search,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function DataManagementTab() {
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form states for onboarding
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('library');
  const [formSource, setFormSource] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formClassification, setFormClassification] = useState('PENDING_VERIFICATION');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDocuments();
  }, [classificationFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/knowledge/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load data stats:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (classificationFilter !== 'ALL') params.classification = classificationFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/knowledge/documents', { params });
      if (res.data?.success) {
        setDocuments(res.data.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to fetch knowledge documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (docId, action) => {
    try {
      setError(null);
      const res = await api.patch(`/knowledge/documents/${docId}/verify`, {
        action,
        notes: `Admin ${action} via Data Management Console`
      });
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        fetchStats();
        fetchDocuments();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Verification action failed:', err);
      setError(err.response?.data?.error?.message || 'Verification update failed.');
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSource.trim() || !formSummary.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const pointsArray = formKeyPoints
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      const res = await api.post('/knowledge/documents', {
        title: formTitle.trim(),
        category: formCategory,
        source_reference: formSource.trim(),
        summary: formSummary.trim(),
        key_points: pointsArray,
        classification: formClassification,
      });

      if (res.data?.success) {
        setSuccessMsg('Document successfully onboarded and indexed.');
        setShowOnboardModal(false);
        // Reset form
        setFormTitle('');
        setFormSource('');
        setFormSummary('');
        setFormKeyPoints('');
        fetchStats();
        fetchDocuments();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Document onboarding failed:', err);
      setError(err.response?.data?.error?.message || 'Failed to onboard document.');
    } finally {
      setSubmitting(false);
    }
  };

  const getClassificationBadge = (classification) => {
    switch (classification) {
      case 'OFFICIAL_VERIFIED':
        return <Badge variant="success" dot className="text-[10px]">Official Verified</Badge>;
      case 'PENDING_VERIFICATION':
        return <Badge variant="warning" dot className="text-[10px]">Pending Verification</Badge>;
      case 'DEVELOPMENT_SAMPLE':
        return <Badge variant="neutral" className="text-[10px]">Development Sample</Badge>;
      case 'RETIRED':
        return <Badge variant="danger" className="text-[10px]">Retired</Badge>;
      default:
        return <Badge variant="neutral">{classification}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-medium text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 font-medium text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Real Database Provenance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Knowledge Base Corpus" subtitle="Official circulars & manuals">
          <div className="space-y-2 mt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Official Verified:</span>
              <span className="font-semibold text-emerald-700">{stats?.documents?.OFFICIAL_VERIFIED || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Pending Verification:</span>
              <span className="font-semibold text-amber-700">{stats?.documents?.PENDING_VERIFICATION || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Development Samples:</span>
              <span className="font-semibold text-slate-700">{stats?.documents?.DEVELOPMENT_SAMPLE || 0}</span>
            </div>
            <div className="pt-2 border-t border-slate-border flex items-center justify-between font-semibold text-navy-950">
              <span>Total Documents:</span>
              <span>{stats?.documents?.TOTAL || 0}</span>
            </div>
          </div>
        </Card>

        <Card title="Campus Locations" subtitle="Directory provenance tracking">
          <div className="space-y-2 mt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Official Verified:</span>
              <span className="font-semibold text-emerald-700">{stats?.locations?.OFFICIAL_VERIFIED || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Pending Verification:</span>
              <span className="font-semibold text-amber-700">{stats?.locations?.PENDING_VERIFICATION || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Development Samples:</span>
              <span className="font-semibold text-slate-700">{stats?.locations?.DEVELOPMENT_SAMPLE || 0}</span>
            </div>
            <div className="pt-2 border-t border-slate-border flex items-center justify-between font-semibold text-navy-950">
              <span>Total Locations:</span>
              <span>{stats?.locations?.TOTAL || 0}</span>
            </div>
          </div>
        </Card>

        <Card title="Canteen Menu Catalog" subtitle="Item pricing provenance">
          <div className="space-y-2 mt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Official Verified:</span>
              <span className="font-semibold text-emerald-700">{stats?.menuItems?.OFFICIAL_VERIFIED || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Pending Verification:</span>
              <span className="font-semibold text-amber-700">{stats?.menuItems?.PENDING_VERIFICATION || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-text">Development Samples:</span>
              <span className="font-semibold text-slate-700">{stats?.menuItems?.DEVELOPMENT_SAMPLE || 0}</span>
            </div>
            <div className="pt-2 border-t border-slate-border flex items-center justify-between font-semibold text-navy-950">
              <span>Total Menu Items:</span>
              <span>{stats?.menuItems?.TOTAL || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Control Bar: Filters & Onboard Action */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-border bg-surface text-navy-950 focus:outline-none focus:ring-1 focus:ring-navy-900"
            >
              <option value="ALL">All Classifications</option>
              <option value="OFFICIAL_VERIFIED">Official Verified</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="DEVELOPMENT_SAMPLE">Development Sample</option>
              <option value="RETIRED">Retired</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                fetchStats();
                fetchDocuments();
              }}
              isLoading={loading}
            >
              Refresh
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowOnboardModal(true)}
          >
            Onboard Institutional Document
          </Button>
        </div>
      </Card>

      {/* Documents Table */}
      <Card
        title={`Knowledge Documents (${documents.length})`}
        subtitle="Approved documents are indexed into the active campus AI knowledge base"
        padding="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-navy-950">
            <thead className="bg-surface-muted/60 border-b border-slate-border text-[11px] font-semibold text-slate-text uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Document Title & Summary</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Source Reference</th>
                <th className="px-5 py-3">Provenance Status</th>
                <th className="px-5 py-3">Version</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-text">
                    Loading knowledge documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-text">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-semibold text-navy-950 truncate">{doc.title}</div>
                      <div className="text-[11px] text-slate-text truncate mt-0.5">{doc.summary}</div>
                    </td>
                    <td className="px-5 py-3.5 capitalize font-medium text-slate-700">
                      {doc.category}
                    </td>
                    <td className="px-5 py-3.5 text-slate-text font-mono text-[11px]">
                      {doc.source_reference}
                    </td>
                    <td className="px-5 py-3.5">
                      {getClassificationBadge(doc.classification)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-text">
                      v{doc.version}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1 text-slate-text hover:text-navy-900 rounded hover:bg-slate-100"
                        title="Preview Document Details"
                      >
                        <Eye className="w-3.5 h-3.5 inline" />
                      </button>

                      {doc.classification === 'PENDING_VERIFICATION' && (
                        <>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleVerifyAction(doc.id, 'approve')}
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleVerifyAction(doc.id, 'reject')}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {doc.classification === 'OFFICIAL_VERIFIED' && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleVerifyAction(doc.id, 'retire')}
                          className="text-slate-600 hover:bg-slate-50"
                        >
                          Retire
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-border shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-border">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent block">
                  Document Inspection (v{previewDoc.version})
                </span>
                <h3 className="text-sm font-bold text-navy-950 mt-0.5">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-muted hover:text-navy-950 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-navy-950 block">Official Source Reference:</span>
                <span className="text-slate-text font-mono text-[11px] bg-slate-50 p-1.5 rounded block mt-1 border border-slate-border">
                  {previewDoc.source_reference}
                </span>
              </div>

              <div>
                <span className="font-semibold text-navy-950 block">Policy Summary / Text:</span>
                <p className="text-slate-text mt-1 leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-border">
                  {previewDoc.summary}
                </p>
              </div>

              {previewDoc.key_points && previewDoc.key_points.length > 0 && (
                <div>
                  <span className="font-semibold text-navy-950 block mb-1">Key Operational Rules:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-text">
                    {previewDoc.key_points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-slate-border flex items-center justify-between text-[11px] text-slate-muted">
                <span>Category: <strong className="capitalize text-navy-950">{previewDoc.category}</strong></span>
                <span>Provenance: {getClassificationBadge(previewDoc.classification)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Document Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-border shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-border">
              <div>
                <h3 className="text-sm font-bold text-navy-950">Onboard Institutional Document</h3>
                <p className="text-xs text-slate-muted mt-0.5">
                  Submit university circular or regulation document for AI assistant grounding
                </p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-muted hover:text-navy-950 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-navy-950 font-medium mb-1">Document Title *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Hostel Gate Timings & Safety Guidelines"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-950 font-medium mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-border bg-surface text-navy-950"
                  >
                    <option value="library">Library</option>
                    <option value="academics">Academics & Exams</option>
                    <option value="hostel">Hostel & Residential</option>
                    <option value="canteen">Canteen & Hospitality</option>
                    <option value="printing">Xerox & Printing</option>
                    <option value="lost_found">Lost & Found / Security</option>
                    <option value="health">Health & Medical</option>
                    <option value="administration">Administration / DoSA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-navy-950 font-medium mb-1">Initial Classification</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-border bg-surface text-navy-950"
                  >
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="OFFICIAL_VERIFIED">Official Verified (Direct Publish)</option>
                    <option value="DEVELOPMENT_SAMPLE">Development Sample</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-navy-950 font-medium mb-1">Official Source Reference *</label>
                <Input
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. Academic Circular 2026/05 §3.1"
                  required
                />
              </div>

              <div>
                <label className="block text-navy-950 font-medium mb-1">Summary / Policy Text *</label>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Enter the official text excerpt..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-surface text-navy-950 focus:outline-none focus:ring-1 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-navy-950 font-medium mb-1">Key Operational Rules (One per line)</label>
                <textarea
                  rows={3}
                  value={formKeyPoints}
                  onChange={(e) => setFormKeyPoints(e.target.value)}
                  placeholder="Rule 1: Gate curfew is 10:00 PM\nRule 2: Late entry requires Warden alert"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-surface text-navy-950 focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-border flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowOnboardModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
                  Save & Index
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
