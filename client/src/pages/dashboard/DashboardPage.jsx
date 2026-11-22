import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  User,
  ArrowRight,
  ClipboardList,
  Clock,
  Sparkles,
  Server,
  Database,
  Lock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();

  const services = [
    {
      title: 'AI Campus Assistant',
      description: 'Find verified campus information, faculty contacts, and institutional policies.',
      icon: Bot,
      path: '/assistant',
      tag: 'Phase 2',
      tagVariant: 'neutral',
    },
    {
      title: 'Campus Navigation',
      description: 'Search academic buildings, lecture halls, administrative offices, and facilities.',
      icon: MapPin,
      path: '/navigation',
      tag: 'Directory Active',
      tagVariant: 'success',
    },
    {
      title: 'Canteen Pre-ordering',
      description: 'Browse daily menu items, view verified pricing, and pre-order meals.',
      icon: UtensilsCrossed,
      path: '/canteen',
      tag: 'Menu Ready',
      tagVariant: 'neutral',
    },
    {
      title: 'Xerox / Printing',
      description: 'Submit documents, configure print specifications, and track order fulfillment.',
      icon: Printer,
      path: '/printing',
      tag: 'Service Ready',
      tagVariant: 'neutral',
    },
    {
      title: 'Lost & Found',
      description: 'Report misplaced belongings or browse found property reported across campus.',
      icon: Search,
      path: '/lost-found',
      tag: 'Registry Ready',
      tagVariant: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-navy-800 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-navy-200">
              UniMate Smart Campus
            </span>
            <span className="text-navy-400">•</span>
            <Badge variant="accent" className="text-[11px] bg-white/10 text-white border-white/20">
              Phase 1 Infrastructure
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-navy-100 leading-relaxed">
            {role === 'admin'
              ? 'Campus platform administration and user directory oversight.'
              : role === 'operator'
              ? `Service desk active for ${user?.operatorService || 'general'} operations.`
              : 'Access all integrated campus services from your personal dashboard.'}
          </p>
        </div>
      </div>

      {/* Account Snapshot & Core Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Summary Card */}
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
          <Card title="System Readiness" subtitle="Phase 1 Verification">
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Server className="w-4 h-4 text-slate-text" />
                  <span>Express API</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Active (Port 5001)</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Database className="w-4 h-4 text-slate-text" />
                  <span>MySQL Database</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Connected (9 Tables)</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-slate-border">
                <div className="flex items-center gap-2 text-navy-950 font-medium">
                  <Lock className="w-4 h-4 text-slate-text" />
                  <span>RBAC & Ownership</span>
                </div>
                <Badge variant="success" dot className="text-[10px]">Enforced</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Five Services Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Campus Services"
            subtitle="Explore available and foundational service modules"
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

          {/* Role-Specific Work / Activity Area */}
          {role === 'admin' ? (
            <Card title="Platform Administration" subtitle="High-level user and configuration management">
              <div className="p-4 rounded-lg bg-surface-muted/40 border border-slate-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-navy-950">Campus User Management</h4>
                  <p className="text-xs text-slate-text mt-0.5">
                    Review and verify registered student, operator, and administrator accounts.
                  </p>
                </div>
                <Link to="/admin">
                  <Button variant="primary" size="sm" icon={ShieldCheck}>
                    Open User Directory
                  </Button>
                </Link>
              </div>
            </Card>
          ) : role === 'operator' ? (
            <Card title="Operator Work Queue" subtitle={`Assigned Service: ${user?.operatorService || 'General Desk'}`}>
              <EmptyState
                icon={ClipboardList}
                title="Service Queue Ready"
                description={`You are authenticated as ${user?.fullName}. Incoming orders or print requests will appear in this queue as workflows are enabled in subsequent phases.`}
              />
            </Card>
          ) : (
            <Card title="Recent Activity" subtitle="Your campus orders, prints, and reports">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EmptyState
                  icon={UtensilsCrossed}
                  title="No Active Canteen Orders"
                  description="When you place a meal pre-order, you will be able to monitor preparation status and pickup tokens here."
                />
                <EmptyState
                  icon={Printer}
                  title="No Active Print Requests"
                  description="Submitted Xerox or print jobs and real-time counter fulfillment statuses will be tracked here."
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
