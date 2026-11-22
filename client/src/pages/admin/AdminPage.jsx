import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { ShieldCheck, Search, Users, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

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

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div>
      <PageHeader
        title="User Directory & Oversight"
        subtitle="Manage and inspect registered student, operator, and administrator accounts"
        breadcrumbs={['Administration', 'User Directory']}
        badge={<Badge variant="primary">Campus Admin Only</Badge>}
        action={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchUsers} isLoading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-state-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="mb-6 p-4">
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
  );
}
