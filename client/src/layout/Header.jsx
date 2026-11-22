import React from 'react';
import { Menu, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

export default function Header({ onOpenMobile }) {
  const { user, role } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-slate-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-text hover:text-navy-950 hover:bg-surface-muted transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-text">
          <span className="font-medium text-navy-950">Campus Portal</span>
          <span className="text-slate-border">•</span>
          <Badge variant="success" dot className="text-[11px] py-0.5">
            Core Infrastructure Active
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-muted border border-slate-border text-xs text-slate-text">
          <CheckCircle2 className="w-3.5 h-3.5 text-state-success" />
          <span>API & MySQL Online</span>
        </div>

        <div className="h-4 w-px bg-slate-border hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-navy-950 leading-tight">
              {user?.fullName}
            </div>
            <div className="text-[11px] text-slate-text truncate max-w-[150px]">
              {user?.email}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
