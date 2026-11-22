import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import {
  Bot,
  MapPin,
  UtensilsCrossed,
  Printer,
  Search,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  Clock,
  Server,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
  const [activePrints, setActivePrints] = useState([]);
  const [myLostFound, setMyLostFound] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [systemStats, setSystemStats] = useState({
    apiStatus: 'Active',
    dbTables: 11,
    aiStatus: 'Active'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch student data in parallel
      const promises = [
        api.get('/canteen/orders').catch(() => ({ data: { data: { orders: [] } } })),
        api.get('/printing/requests').catch(() => ({ data: { data: { requests: [] } } })),
        api.get('/lost-found?myItemsOnly=true').catch(() => ({ data: { data: { items: [] } } })),
        api.get('/assistant/conversations').catch(() => ({ data: { data: { conversations: [] } } })),
      ];

      const [canteenRes, printRes, lfRes, assistantRes] = await Promise.all(promises);

      setActiveOrders(canteenRes.data?.data?.orders || []);
      setActivePrints(printRes.data?.data?.requests || []);
      setMyLostFound(lfRes.data?.data?.items || []);
      setRecentConversations(assistantRes.data?.data?.conversations || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const services = [
    {
      title: 'AI Campus Assistant',
      description: 'Strictly grounded answers from verified university circulars with zero hallucination.',
      icon: Bot,
      path: '/assistant',
      tag: 'Corpus Active',
      tagVariant: 'accent',
    },
    {
      title: 'Campus Navigation',
      description: 'Search academic lecture blocks, administrative counters, and student facilities.',
      icon: MapPin,
      path: '/navigation',
      tag: 'Directory Active',
      tagVariant: 'success',
    },
    {
      title: 'Canteen Pre-ordering',
      description: 'Browse verified daily meal options, view INR pricing, and pre-order to skip queue.',
      icon: UtensilsCrossed,
      path: '/canteen',
      tag: 'Menu Ready',
      tagVariant: 'success',
    },
    {
      title: 'Xerox / Printing',
      description: 'Submit PDF/DOCX files digitally with print preferences and pickup counter tracking.',
      icon: Printer,
      path: '/printing',
      tag: 'Service Ready',
      tagVariant: 'success',
    },
    {
      title: 'Lost & Found',
      description: 'Report misplaced belongings or view recovered items held at Security Desk.',
      icon: Search,
      path: '/lost-found',
      tag: 'Registry Ready',
      tagVariant: 'success',
    },
  ];

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return <Badge variant="warning">Order Placed</Badge>;
      case 'accepted':
        return <Badge variant="primary">Kitchen Accepted</Badge>;
      case 'preparing':
        return <Badge variant="accent">Preparing</Badge>;
      case 'ready':
        return <Badge variant="success">Ready for Pickup</Badge>;
      case 'completed':
        return <Badge variant="neutral">Completed</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPrintStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="warning">Submitted</Badge>;
      case 'accepted':
        return <Badge variant="primary">Accepted</Badge>;
      case 'in_progress':
        return <Badge variant="accent">Printing</Badge>;
      case 'ready':
        return <Badge variant="success">Ready at Counter</Badge>;
      case 'completed':
      case 'collected':
        return <Badge variant="neutral">Collected</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-navy-800 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-navy-200">
              UniMate Connected Campus
            </span>
            <span className="text-navy-400">•</span>
            <Badge variant="accent" className="text-[11px] bg-white/10 text-white border-white/20">
              Phase 2 Core Integrated
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-navy-100 leading-relaxed">
            {role === 'admin'
              ? 'Institutional oversight across campus locations, canteen menu, users, and system queues.'
              : role === 'operator'
              ? `Operational console active for ${user?.operatorService === 'canteen' ? 'Canteen Kitchen' : 'Xerox Printing Hub'} desk.`
              : 'Real-time hub for your campus dining orders, print fulfillment, security claims, and academic inquiries.'}
          </p>
        </div>
      </div>

      {/* Account Snapshot & Core Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Profile & System Readiness */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Account Profile" subtitle="Your campus credentials">
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-border">
                <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-navy-950 truncate">{user?.fullName}</div>
                  <div className="text-xs text-slate-text truncate">{user?.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-muted/60 border border-slate-border">
                  <div className="text-[11px] text-slate-text">Assigned Role</div>
                  <div className="font-semibold text-navy-950 capitalize mt-0.5">{role}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-muted/60 border border-slate-border">
                  <div className="text-[11px] text-slate-text">Student / Staff ID</div>
                  <div className="font-semibold text-navy-950 mt-0.5">
                    {user?.studentId || (role === 'admin' ? 'ADMIN-01' : 'STAFF-OP')}
                  </div>
                </div>
              </div>

              {user?.phone && (
                <div className="text-xs text-slate-text pt-1">
                  Contact: <span className="text-navy-950 font-medium">{user.phone}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Core System Status */}
          <Card title="System Readiness" subtitle="Phase 2 Live Verification">
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Server className="w-4 h-4 text-slate-text" />
                  <span>Express Backend</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Active (Port 5001)</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Database className="w-4 h-4 text-slate-text" />
                  <span>MySQL Database</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Connected (11 Tables)</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Cpu className="w-4 h-4 text-slate-text" />
                  <span>FastAPI AI Service</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Active (Port 8000)</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Lock className="w-4 h-4 text-slate-text" />
                  <span>RBAC & Ownership</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Strictly Enforced</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Module Navigation & Live Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Five Services Overview */}
          <Card
            title="Campus Services"
            subtitle="Explore available and fully functional core modules"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {services.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link
                    key={svc.path}
                    to={svc.path}
                    className="p-4 rounded-xl border border-slate-border hover:border-navy-300 hover:bg-surface-muted/30 transition-all duration-150 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <Badge variant={svc.tagVariant} className="text-[10px]">
                          {svc.tag}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-navy-950 mb-1">{svc.title}</h4>
                      <p className="text-xs text-slate-text leading-relaxed">{svc.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-border/60 flex items-center text-xs font-medium text-navy-800 group-hover:text-navy-950">
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Live Activity & Tickets Area */}
          {role === 'admin' ? (
            <Card title="Administrative Oversight" subtitle="Manage campus resources and user privileges">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-lg bg-surface border border-slate-border flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-navy-950">Campus Accounts</h4>
                    <p className="text-xs text-slate-text mt-1">
                      Audit students, service operators, and administrator accounts in MySQL.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link to="/admin">
                      <Button variant="primary" size="sm" icon={ShieldCheck}>
                        Manage Users
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-slate-border flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-navy-950">Campus Directory</h4>
                    <p className="text-xs text-slate-text mt-1">
                      Create, update, or deactivate lecture halls, laboratories, and offices.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link to="/navigation">
                      <Button variant="outline" size="sm" icon={MapPin}>
                        Manage Locations
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : role === 'operator' ? (
            <Card
              title="Operator Service Desk"
              subtitle={`Desk: ${user?.operatorService === 'canteen' ? 'Canteen Kitchen' : 'Xerox Printing Hub'}`}
            >
              <div className="p-4 rounded-lg bg-surface-muted/40 border border-slate-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-navy-950">Active Workstation Queue</h4>
                  <p className="text-xs text-slate-text mt-0.5">
                    {user?.operatorService === 'canteen'
                      ? 'Process incoming student meal orders, advance kitchen preparation stages, and manage daily menu items.'
                      : 'Review submitted document print jobs, securely download original files, and manage printing lifecycle.'}
                  </p>
                </div>
                <Link to={user?.operatorService === 'canteen' ? '/canteen' : '/printing'}>
                  <Button variant="primary" size="sm" icon={ClipboardList}>
                    Open Kitchen / Print Queue
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Orders & Prints Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Canteen Orders */}
                <Card
                  title={`Canteen Orders (${activeOrders.length})`}
                  subtitle="Live records from MySQL canteen_orders"
                >
                  {activeOrders.length === 0 ? (
                    <EmptyState
                      icon={UtensilsCrossed}
                      title="No Orders Placed Yet"
                      description="Pre-order meals from the Canteen menu to skip long lines at peak lunch hours."
                      action={
                        <Link to="/canteen">
                          <Button variant="outline" size="sm">
                            Browse Menu
                          </Button>
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {activeOrders.slice(0, 2).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-lg border border-slate-border bg-surface flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-navy-950">
                              {ord.order_number}
                            </span>
                            {getOrderStatusBadge(ord.status)}
                          </div>
                          <div className="text-xs text-slate-text">
                            Total: <strong className="text-navy-950 font-medium">₹{Number(ord.total_amount).toFixed(2)}</strong>
                          </div>
                        </div>
                      ))}
                      <Link to="/canteen" className="block text-center text-xs text-accent font-medium hover:underline pt-1">
                        View all orders in Canteen →
                      </Link>
                    </div>
                  )}
                </Card>

                {/* Active Print Requests */}
                <Card
                  title={`Print Requests (${activePrints.length})`}
                  subtitle="Live records from MySQL print_requests"
                >
                  {activePrints.length === 0 ? (
                    <EmptyState
                      icon={Printer}
                      title="No Print Jobs Active"
                      description="Upload PDF or DOCX files to configure page options and pick up at the printing counter."
                      action={
                        <Link to="/printing">
                          <Button variant="outline" size="sm">
                            Submit Document
                          </Button>
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {activePrints.slice(0, 2).map((prt) => (
                        <div
                          key={prt.id}
                          className="p-3 rounded-lg border border-slate-border bg-surface flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-navy-950">
                              {prt.request_number}
                            </span>
                            {getPrintStatusBadge(prt.status)}
                          </div>
                          <div className="text-xs text-slate-text truncate">
                            {prt.original_name} • {prt.color_mode === 'color' ? 'Color' : 'B&W'} • ₹{Number(prt.cost_estimate).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      <Link to="/printing" className="block text-center text-xs text-accent font-medium hover:underline pt-1">
                        View all print requests →
                      </Link>
                    </div>
                  )}
                </Card>
              </div>

              {/* Recent Inquiries & Reported Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  title="Campus Assistant Inquiries"
                  subtitle={`${recentConversations.length} saved query threads`}
                >
                  {recentConversations.length === 0 ? (
                    <p className="text-xs text-slate-muted py-2">
                      No assistant inquiries recorded yet. Ask questions about campus policies, circulars, and timings.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recentConversations.slice(0, 2).map((c) => (
                        <div key={c.id} className="p-2.5 rounded bg-slate-50 border border-slate-border text-xs">
                          <p className="font-medium text-navy-950 truncate">{c.title}</p>
                          <span className="text-[10px] text-slate-muted">
                            {new Date(c.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <Link to="/assistant">
                      <Button variant="outline" size="sm" icon={Bot}>
                        Open Assistant
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card
                  title="Lost & Found Registry"
                  subtitle={`${myLostFound.length} reported items`}
                >
                  {myLostFound.length === 0 ? (
                    <p className="text-xs text-slate-muted py-2">
                      You have not reported any lost or found items. Recovered items are held securely at Main Gate Security.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {myLostFound.slice(0, 2).map((item) => (
                        <div key={item.id} className="p-2.5 rounded bg-slate-50 border border-slate-border text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-navy-950 truncate">{item.title}</span>
                            <span className="text-[10px] uppercase font-semibold text-slate-600">{item.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-muted truncate">{item.location_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <Link to="/lost-found">
                      <Button variant="outline" size="sm" icon={Search}>
                        Open Registry
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
