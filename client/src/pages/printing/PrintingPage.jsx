import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Printer,
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  Loader2,
  Layers,
  FileCheck,
} from 'lucide-react';

export default function PrintingPage() {
  const { user } = useAuth();
  const isPrintOperator =
    user?.role === 'admin' || (user?.role === 'operator' && user?.operator_service === 'printing');

  // Active view: 'submit' | 'my-jobs' | 'operator-queue'
  const [activeView, setActiveView] = useState('submit');

  // Specs
  const [specs, setSpecs] = useState(null);

  // Form states (Student submit)
  const [selectedFile, setSelectedFile] = useState(null);
  const [pagesCount, setPagesCount] = useState(1);
  const [copiesCount, setCopiesCount] = useState(1);
  const [colorMode, setColorMode] = useState('bw');
  const [printType, setPrintType] = useState('double_sided');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitSuccessModal, setSubmitSuccessModal] = useState(null);
  const fileInputRef = useRef(null);

  // Student print requests
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);

  // Operator queue
  const [operatorQueue, setOperatorQueue] = useState([]);
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch specs
  useEffect(() => {
    async function fetchSpecs() {
      try {
        const res = await api.get('/printing/specs');
        if (res.data.success) {
          setSpecs(res.data.data);
        }
      } catch (err) {
        console.error('[Printing] Failed to load specs:', err);
      }
    }
    fetchSpecs();
  }, []);

  // Fetch student requests
  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get('/printing/requests');
      if (res.data.success) {
        setMyRequests(res.data.data.requests || []);
      }
    } catch (err) {
      console.error('[Printing] Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch operator queue
  const fetchOperatorQueue = async () => {
    if (!isPrintOperator) return;
    setLoadingQueue(true);
    try {
      const res = await api.get('/printing/operator/queue', {
        params: { status: operatorFilter },
      });
      if (res.data.success) {
        setOperatorQueue(res.data.data.requests || []);
      }
    } catch (err) {
      console.error('[Printing] Failed to load operator queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
    if (isPrintOperator) {
      fetchOperatorQueue();
    }
  }, [user, isPrintOperator, operatorFilter]);

  // Pricing calculation
  const bwPrice = specs?.pricing?.bw_per_page || 1.0;
  const colorPrice = specs?.pricing?.color_per_page || 5.0;
  const ratePerPage = colorMode === 'color' ? colorPrice : bwPrice;
  const estimatedCost = Number(pagesCount) * Number(copiesCount) * ratePerPage;

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype) && !file.name.match(/\.(pdf|docx|doc|jpg|jpeg|png)$/i)) {
      alert('Unsupported file format. Please select a PDF, DOCX, JPG, or PNG file.');
      return;
    }

    if (file.size > (specs?.maxFileSizeMb || 10) * 1024 * 1024) {
      alert(`File size exceeds maximum allowed limit (${specs?.maxFileSizeMb || 10} MB).`);
      return;
    }

    setSelectedFile(file);
  };

  // Submit print job
  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please attach a document file to print.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentName', selectedFile.name);
      formData.append('pagesCount', pagesCount);
      formData.append('copiesCount', copiesCount);
      formData.append('colorMode', colorMode);
      formData.append('printType', printType);
      if (notes) formData.append('notes', notes);

      const res = await api.post('/printing/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSelectedFile(null);
        setNotes('');
        setSubmitSuccessModal(res.data.data.request);
        fetchMyRequests();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit print request.');
    } finally {
      setUploading(false);
    }
  };

  // Student cancel job
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this print request?')) return;
    try {
      await api.patch(`/printing/requests/${requestId}/cancel`);
      fetchMyRequests();
      if (selectedRequestDetail?.id === requestId) {
        setSelectedRequestDetail(null);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not cancel request.');
    }
  };

  // Secure download
  const handleDownloadFile = async (requestId, fileName) => {
    try {
      const res = await api.get(`/printing/requests/${requestId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download document file.');
    }
  };

  // Operator status advance
  const handleUpdateStatus = async (requestId, newStatus) => {
    setActionLoadingId(requestId);
    try {
      await api.patch(`/printing/operator/requests/${requestId}/status`, { status: newStatus });
      await fetchOperatorQueue();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update print request status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="primary" dot className="capitalize">Submitted</Badge>;
      case 'accepted':
        return <span className="px-2 py-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 rounded-md border border-purple-200">Accepted</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-md border border-amber-200">In Progress</span>;
      case 'ready':
        return <Badge variant="success" dot className="capitalize">Ready for Collection</Badge>;
      case 'collected':
      case 'completed':
        return <Badge variant="neutral" className="capitalize">Completed</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="danger" className="capitalize">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Xerox / Printing Hub"
        subtitle="Submit academic documents, select print specifications, and track order fulfillment"
        breadcrumbs={['Services', 'Printing']}
        badge={<Badge variant="success">Counter Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {isPrintOperator && (
              <div className="flex items-center gap-1.5 p-1 bg-surface-muted rounded-lg border border-slate-border">
                <button
                  onClick={() => setActiveView('submit')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'submit' ? 'bg-white text-navy-950 shadow-2xs' : 'text-slate-text hover:text-navy-950'
                  }`}
                >
                  Submit Job
                </button>
                <button
                  onClick={() => setActiveView('operator-queue')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeView === 'operator-queue' ? 'bg-navy-800 text-white shadow-2xs' : 'text-slate-text hover:text-navy-950'
                  }`}
                >
                  Print Queue ({operatorQueue.filter((r) => ['submitted', 'accepted', 'in_progress'].includes(r.status)).length})
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setActiveView('my-jobs');
                fetchMyRequests();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeView === 'my-jobs'
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-white text-navy-800 border-slate-border hover:bg-slate-50'
              }`}
            >
              My Print Jobs ({myRequests.length})
            </button>
          </div>
        }
      />

      {/* VIEW 1: STUDENT SUBMIT PRINT JOB */}
      {activeView === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Main Submission Form (8 cols) */}
          <div className="lg:col-span-8">
            <Card title="New Print Request" subtitle="Upload file and configure reproduction specifications">
              <form onSubmit={handleSubmitJob} className="space-y-5 text-xs">
                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-semibold text-navy-950 mb-1.5">
                    Select Document File * (PDF, DOCX, JPG, PNG up to 10 MB)
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? 'border-state-success bg-emerald-50/30'
                        : 'border-slate-300 hover:border-navy-400 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileCheck className="w-8 h-8 text-state-success" />
                        <div className="text-left">
                          <span className="font-bold text-sm text-navy-950 block">{selectedFile.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="font-semibold text-navy-950">
                          Click to select a document from your device
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Supported formats: PDF, DOCX, JPG, PNG • Max size: 10 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Print Preferences Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Page Count */}
                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Estimated Page Count *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={pagesCount}
                      onChange={(e) => setPagesCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-border text-navy-950 font-mono text-xs focus:outline-none focus:border-navy-800"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Total pages in document</span>
                  </div>

                  {/* Copies Count */}
                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Number of Copies *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCopiesCount(Math.max(1, copiesCount - 1))}
                        className="p-2 rounded-lg border border-slate-border hover:bg-slate-100 text-slate-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        required
                        value={copiesCount}
                        onChange={(e) => setCopiesCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-border text-center text-navy-950 font-bold text-xs focus:outline-none focus:border-navy-800"
                      />
                      <button
                        type="button"
                        onClick={() => setCopiesCount(copiesCount + 1)}
                        className="p-2 rounded-lg border border-slate-border hover:bg-slate-100 text-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Mode & Print Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Color Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1.5">
                      Color Mode *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setColorMode('bw')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                          colorMode === 'bw'
                            ? 'bg-navy-800 text-white border-navy-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-border hover:bg-slate-50'
                        }`}
                      >
                        Black & White (₹1/pg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setColorMode('color')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                          colorMode === 'color'
                            ? 'bg-navy-800 text-white border-navy-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-border hover:bg-slate-50'
                        }`}
                      >
                        Full Color (₹5/pg)
                      </button>
                    </div>
                  </div>

                  {/* Print Layout */}
                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1.5">
                      Paper Layout *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPrintType('double_sided')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                          printType === 'double_sided'
                            ? 'bg-navy-800 text-white border-navy-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-border hover:bg-slate-50'
                        }`}
                      >
                        Double-sided (Duplex)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintType('single_sided')}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                          printType === 'single_sided'
                            ? 'bg-navy-800 text-white border-navy-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-border hover:bg-slate-50'
                        }`}
                      >
                        Single-sided
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-navy-950 mb-1">
                    Binding & Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-border focus:outline-none focus:border-navy-800"
                    placeholder="e.g. Spiral binding required, staple top-left corner, print page 1-14 only"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Estimated Cost Summary Bar */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Estimated Fulfillment Charge</span>
                    <span className="font-mono font-extrabold text-base text-navy-950">
                      ₹{estimatedCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ({pagesCount} pages × {copiesCount} copies @ ₹{ratePerPage.toFixed(2)}/pg)
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={uploading}
                    disabled={!selectedFile}
                    className="font-semibold shadow-xs"
                  >
                    Submit Print Request
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Information Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card title="Fulfillment Counter Details" subtitle="Campus Xerox & Print Desk">
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                  <div className="text-slate-text">Counter Location</div>
                  <div className="font-semibold text-navy-950 mt-0.5">
                    {specs?.counterLocation || 'East Wing Ground Floor (XRX-01)'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                  <div className="text-slate-text">Operational Hours</div>
                  <div className="font-semibold text-navy-950 mt-0.5">
                    {specs?.serviceHours || '09:00 AM – 06:00 PM (Mon-Sat)'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-muted/50 border border-slate-border">
                  <div className="text-slate-text">Collection Protocol</div>
                  <div className="font-semibold text-navy-950 mt-0.5">
                    Quote Request Number at counter for pickup
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-xl bg-surface-muted/40 border border-slate-border text-xs text-slate-text space-y-2">
              <div className="flex items-center gap-2 font-semibold text-navy-950">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Document Privacy & Security</span>
              </div>
              <p className="leading-relaxed">
                Files are stored in private server storage with cryptographic sanitization. Only you and authorized print desk operators have access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENT MY PRINT JOBS */}
      {activeView === 'my-jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-950">My Printing Requests</h2>
            <Button variant="outline" size="sm" onClick={() => setActiveView('submit')}>
              + New Print Request
            </Button>
          </div>

          {loadingRequests ? (
            <div className="py-16 text-center text-xs text-slate-text flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
              <span>Loading your print requests...</span>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8">
              <Printer className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-navy-950 mb-1">No Print Jobs Submitted</h3>
              <p className="text-xs text-slate-text max-w-sm mx-auto mb-4">
                Submit academic assignments, lab manuals, or course materials to print ahead of time!
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveView('submit')}>
                Submit a Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-slate-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-navy-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-navy-950">
                        {req.request_number}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="font-semibold text-xs text-navy-950 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent" />
                      <span>{req.document_name}</span>
                    </div>

                    <div className="text-xs text-slate-text flex flex-wrap gap-2 pt-0.5">
                      <span>{req.pages_count} Pages</span>
                      <span>•</span>
                      <span>{req.copies_count} Copy</span>
                      <span>•</span>
                      <span className="capitalize">{req.color_mode === 'bw' ? 'B&W' : 'Color'}</span>
                      <span>•</span>
                      <span className="capitalize">{req.print_type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownloadFile(req.id, req.document_name)}
                    >
                      Download
                    </Button>

                    {req.status === 'submitted' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelRequest(req.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: OPERATOR PRINT QUEUE */}
      {activeView === 'operator-queue' && isPrintOperator && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="text-base font-bold text-navy-950">Xerox Desk Print Queue</h2>
              <p className="text-xs text-slate-text">Download student documents and update print fulfillment status</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['all', 'submitted', 'accepted', 'in_progress', 'ready', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOperatorFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors capitalize ${
                    operatorFilter === st
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-slate-600 border-slate-border hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingQueue ? (
            <div className="py-16 text-center text-xs text-slate-text flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-800" />
              <span>Fetching print queue...</span>
            </div>
          ) : operatorQueue.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-border rounded-xl p-8">
              <Printer className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-navy-950 mb-1">Queue is Clear</h3>
              <p className="text-xs text-slate-text">No print requests matching status '{operatorFilter}'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operatorQueue.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-slate-border rounded-xl p-5 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-sm text-navy-950">
                        {req.request_number}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="text-xs text-slate-text mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>Student: <strong className="text-navy-900">{req.student_name}</strong> ({req.student_id})</span>
                      <span className="font-mono">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Document details */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-navy-950 truncate max-w-[200px]">
                          {req.document_name}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                          onClick={() => handleDownloadFile(req.id, req.document_name)}
                        >
                          Download File
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div>Pages: <strong>{req.pages_count}</strong></div>
                        <div>Copies: <strong>{req.copies_count}</strong></div>
                        <div>Color: <strong className="capitalize">{req.color_mode}</strong></div>
                        <div>Layout: <strong className="capitalize">{req.print_type.replace('_', ' ')}</strong></div>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-2 rounded bg-amber-50 text-[11px] text-amber-800 border border-amber-200 mb-3">
                        <strong>Student Note:</strong> {req.notes}
                      </div>
                    )}
                  </div>

                  {/* Operator Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {req.status === 'submitted' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 justify-center"
                          isLoading={actionLoadingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'accepted')}
                        >
                          Accept & Queue
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center bg-amber-600 hover:bg-amber-700"
                        isLoading={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                      >
                        Start Printing
                      </Button>
                    )}

                    {req.status === 'in_progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center bg-emerald-700 hover:bg-emerald-800"
                        isLoading={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'ready')}
                      >
                        Mark Ready for Collection
                      </Button>
                    )}

                    {req.status === 'ready' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center"
                        isLoading={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'completed')}
                      >
                        Handover & Complete
                      </Button>
                    )}

                    {['completed', 'collected', 'cancelled', 'rejected'].includes(req.status) && (
                      <span className="text-[11px] text-slate-400 italic">Terminal status reached</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={Boolean(submitSuccessModal)}
        onClose={() => setSubmitSuccessModal(null)}
        title="Print Request Submitted"
        size="sm"
      >
        {submitSuccessModal && (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-state-success flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] text-slate-text uppercase font-semibold">Print Job Token</span>
              <div className="font-mono text-2xl font-extrabold text-navy-950 mt-1">
                {submitSuccessModal.request_number}
              </div>
              <p className="text-xs text-slate-text mt-1 truncate">
                Document: <strong className="text-navy-950">{submitSuccessModal.document_name}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-text bg-slate-50 p-3 rounded-lg border border-slate-100 text-left leading-relaxed">
              Your document has been transferred to private storage and queued for the Xerox operator.
              You will be notified when it is marked <strong>Ready for Collection</strong>.
            </p>

            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                setSubmitSuccessModal(null);
                setActiveView('my-jobs');
              }}
            >
              Track Request Status
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
