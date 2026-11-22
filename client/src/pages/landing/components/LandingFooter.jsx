import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const handleAnchorClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-xs text-slate-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-navy-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                U
              </div>
              <span className="font-bold text-base tracking-tight text-navy-950">UniMate</span>
            </div>
            <p className="text-xs text-slate-text leading-relaxed">
              Integrated smart-campus platform consolidating everyday campus services into one dependable experience.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-text pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-state-success" />
              <span>Institutional TRD & PRD Standard</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold text-navy-950 uppercase tracking-wider mb-3.5">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-navy-950 transition-colors">
                  Campus Services
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, '#how-it-works')} className="hover:text-navy-950 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#showcase" onClick={(e) => handleAnchorClick(e, '#showcase')} className="hover:text-navy-950 transition-colors">
                  Product Showcase
                </a>
              </li>
              <li>
                <a href="#architecture" onClick={(e) => handleAnchorClick(e, '#architecture')} className="hover:text-navy-950 transition-colors">
                  System Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Campus Modules */}
          <div>
            <h4 className="text-xs font-semibold text-navy-950 uppercase tracking-wider mb-3.5">
              Campus Services
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/assistant" className="hover:text-navy-950 transition-colors">
                  AI Campus Assistant
                </Link>
              </li>
              <li>
                <Link to="/navigation" className="hover:text-navy-950 transition-colors">
                  Campus Navigation
                </Link>
              </li>
              <li>
                <Link to="/canteen" className="hover:text-navy-950 transition-colors">
                  Canteen Pre-ordering
                </Link>
              </li>
              <li>
                <Link to="/printing" className="hover:text-navy-950 transition-colors">
                  Xerox / Printing
                </Link>
              </li>
              <li>
                <Link to="/lost-found" className="hover:text-navy-950 transition-colors">
                  Lost & Found Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Oversight */}
          <div>
            <h4 className="text-xs font-semibold text-navy-950 uppercase tracking-wider mb-3.5">
              Portal Access
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-navy-950 transition-colors">
                  Student & Staff Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-navy-950 transition-colors">
                  New Student Registration
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-navy-950 transition-colors">
                  Campus Service Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-navy-950 transition-colors">
                  Administrator Oversight
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-text">
          <p>© {currentYear} UniMate Campus Platform. Built on verified university specifications.</p>
          <div className="flex items-center gap-4">
            <span>MySQL 9.5 Verified</span>
            <span>•</span>
            <span>FastAPI Subsystem Active</span>
            <span>•</span>
            <span>React + Vite SPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
