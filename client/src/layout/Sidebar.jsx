import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  MapPin,
  UtensilsCrossed,
  Printer,
  Search,
  ShieldCheck,
  LogOut,
  X,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

export default function Sidebar({ onCloseMobile }) {
  const { user, role, logout } = useAuth();

  const navItems = [
    {
      section: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
  ];

  // Operator-specific service queue item
  if (role === 'operator') {
    const isCanteen = user?.operatorService === 'canteen';
    navItems.push({
      section: 'Operator Service Queue',
      items: [
        {
          label: isCanteen ? 'Canteen Desk' : 'Xerox Desk',
          path: isCanteen ? '/canteen' : '/printing',
          icon: isCanteen ? UtensilsCrossed : Printer,
          badge: 'Desk Active',
        },
      ],
    });
  }

  // Core Campus Services
  navItems.push({
    section: 'Campus Services',
    items: [
      { label: 'AI Campus Assistant', path: '/assistant', icon: Bot, badge: 'Phase 2' },
      { label: 'Campus Navigation', path: '/navigation', icon: MapPin },
      { label: 'Canteen', path: '/canteen', icon: UtensilsCrossed },
      { label: 'Xerox / Printing', path: '/printing', icon: Printer },
      { label: 'Lost & Found', path: '/lost-found', icon: Search },
    ],
  });

  // Administration section for Admin role only
  if (role === 'admin') {
    navItems.push({
      section: 'Administration',
      items: [
        { label: 'User Directory', path: '/admin', icon: ShieldCheck },
      ],
    });
  }

  const roleLabel =
    role === 'admin'
      ? 'Campus Admin'
      : role === 'operator'
      ? user?.operatorService === 'canteen'
        ? 'Canteen Operator'
        : user?.operatorService === 'printing'
        ? 'Xerox Operator'
        : 'Service Operator'
      : 'Student';

  return (
    <aside className="w-64 h-full bg-surface border-r border-slate-border flex flex-col justify-between select-none">
      {/* Top Header & Branding */}
      <div>
        <div className="h-16 px-5 border-b border-slate-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              U
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-navy-950">UniMate</span>
              <span className="block text-[10px] text-slate-text font-normal uppercase tracking-wider">
                Smart Campus
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-text hover:text-navy-950 hover:bg-surface-muted focus:outline-none"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold text-slate-text uppercase tracking-wider">
                {group.section}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 ${
                            isActive
                              ? 'bg-navy-800 text-white font-semibold shadow-xs'
                              : 'text-navy-700 hover:bg-surface-muted hover:text-navy-950'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-text'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-surface-muted text-slate-text border border-slate-border'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-border bg-surface-muted/30">
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-slate-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-navy-100 border border-navy-200 flex items-center justify-center text-navy-800 font-semibold text-xs flex-shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-navy-950 truncate">
                {user?.fullName || 'User'}
              </div>
              <Badge
                variant={role === 'admin' ? 'primary' : role === 'operator' ? 'warning' : 'neutral'}
                className="text-[10px] px-1.5 py-0 mt-0.5"
              >
                {roleLabel}
              </Badge>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-text hover:text-state-danger hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
