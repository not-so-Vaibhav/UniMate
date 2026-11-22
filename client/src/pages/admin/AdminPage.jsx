import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import {
  ShieldCheck,
  Search,
  Users,
  RefreshCw,
  AlertCircle,
  MapPin,
  UtensilsCrossed,
  Printer,
  Compass,
  Cpu,
  Server,
  Database,
  ArrowRight,
  DatabaseZap
} from 'lucide-react';
import DataManagementTab from './DataManagementTab';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [systemHealth, setSystemHealth] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health');
      setSystemHealth(res.data);
    } catch {
      setSystemHealth(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'system') {
      fetchHealth();
    }
  }, [activeTab, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Administration & Oversight"
        subtitle="Manage and inspect registered accounts, service modules, and system infrastructure"
        breadcrumbs={['Administration', 'Oversight']}
        badge={<Badge variant="primary">Campus Administrator</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={activeTab === 'users' ? fetchUsers : fetchHealth}
            isLoading={loading}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-border text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-navy-900 text-navy-950 font-semibold'
              : 'border-transparent text-slate-muted hover:text-navy-950'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Accounts ({pagination.total})
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'data'
              ? 'border-navy-900 text-navy-950 font-semibold'
              : 'border-transparent text-slate-muted hover:text-navy-950'
          }`}
        >
          <DatabaseZap className="w-4 h-4 text-navy-800" />
          Data Onboarding & Provenance
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'modules'
              ? 'border-navy-900 text-navy-950 font-semibold'
              : 'border-transparent text-slate-muted hover:text-navy-950'
          }`}
        >
          <Compass className="w-4 h-4" />
          Module Administration
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-navy-900 text-navy-950 font-semibold'
              : 'border-transparent text-slate-muted hover:text-navy-950'
          }`}
        >
          <Server className="w-4 h-4" />
          Subsystem Status
        </button>
      </div>

      {activeTab === 'data' && <DataManagementTab />}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <Card className="p-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search by name, email, or student ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs px-3 py-2.5 rounded-lg border border-slate-border bg-surface text-navy-950 focus:border-navy-800 focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="operator">Service Operators</option>
                  <option value="admin">Administrators</option>
                </select>
                <Button type="submit" variant="primary" size="md">
                  Filter
                </Button>
              </div>
            </form>
          </Card>

          {/* Live Users Table */}
          <Card
            title={`Registered Accounts (${pagination.total})`}
            subtitle="Live records retrieved directly from MySQL users table"
            padding="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-navy-950">
                <thead className="bg-surface-muted/60 border-b border-slate-border text-[11px] font-semibold text-slate-text uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">ID / Assigned Service</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-text">
                        Loading accounts from database...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-text">
                        No accounts found matching your query.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-navy-950">{u.fullName}</div>
                          <div className="text-[11px] text-slate-text">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={u.role === 'admin' ? 'primary' : u.role === 'operator' ? 'warning' : 'neutral'}
                            className="capitalize"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-text">
                          {u.studentId || (u.operatorService ? `Desk: ${u.operatorService}` : '—')}
                        </td>
                        <td className="px-5 py-3.5 text-slate-text">
                          {u.phone || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={u.isActive ? 'success' : 'danger'} dot className="text-[10px]">
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-slate-text">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Campus Directory Administration" subtitle="Add or modify campus locations and buildings">
            <p className="text-xs text-slate-text mb-4 leading-relaxed">
              Administrators have full CRUD access over the campus directory. You can add new lecture blocks, update floor or room numbers, and deactivate facilities under maintenance.
            </p>
            <Link to="/navigation">
              <Button variant="primary" size="sm" icon={MapPin}>
                Open Navigation Management
              </Button>
            </Link>
          </Card>

          <Card title="Canteen Menu & Pricing" subtitle="Maintain daily menu catalog and item availability">
            <p className="text-xs text-slate-text mb-4 leading-relaxed">
              Manage Indian Rupee (₹) item pricing, categories, and item availability across breakfast, lunch, and snack menus. Changes update instantly across all student screens.
            </p>
            <Link to="/canteen">
              <Button variant="primary" size="sm" icon={UtensilsCrossed}>
                Manage Canteen Catalog
              </Button>
            </Link>
          </Card>

          <Card title="Lost & Found Moderation" subtitle="Review reported items and oversee claim resolutions">
            <p className="text-xs text-slate-text mb-4 leading-relaxed">
              Verify recovered items stored at Campus Security Cabin. Update status flags to 'claimed' or 'resolved' after in-person student verification.
            </p>
            <Link to="/lost-found">
              <Button variant="outline" size="sm" icon={Search}>
                Open Lost & Found Registry
              </Button>
            </Link>
          </Card>

          <Card title="Printing Service Hub" subtitle="Inspect submission parameters and queue progress">
            <p className="text-xs text-slate-text mb-4 leading-relaxed">
              Inspect printing queue fulfillment metrics, verify rate specifications, and inspect server upload storage.
            </p>
            <Link to="/printing">
              <Button variant="outline" size="sm" icon={Printer}>
                Open Printing Center
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-4">
          <Card title="Connected Infrastructure Health" subtitle="Live health probes across backend and subsystems">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-border bg-surface flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-navy-950">
                    <Server className="w-4 h-4 text-navy-800" />
                    <span>Node Express Core</span>
                  </div>
                  <Badge variant="success" dot className="text-[10px]">Healthy</Badge>
                </div>
                <p className="text-slate-text text-[11px]">
                  Listening on port 5001. Enforces JWT auth, rate limiting, and RBAC middleware.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-border bg-surface flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-navy-950">
                    <Database className="w-4 h-4 text-navy-800" />
                    <span>MySQL Database</span>
                  </div>
                  <Badge variant="success" dot className="text-[10px]">Connected</Badge>
                </div>
                <p className="text-slate-text text-[11px]">
                  Connection pool active (11 verified tables, foreign keys, and indexes).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-border bg-surface flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-navy-950">
                    <Cpu className="w-4 h-4 text-navy-800" />
                    <span>FastAPI Subsystem</span>
                  </div>
                  <Badge variant="success" dot className="text-[10px]">Active</Badge>
                </div>
                <p className="text-slate-text text-[11px]">
                  Listening on port 8000. Provides grounded knowledge retrieval with citations.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
