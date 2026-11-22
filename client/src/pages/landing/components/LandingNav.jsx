import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../../components/common/Button';

export default function LandingNav() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Architecture', href: '#architecture' },
  ];

  const handleAnchorClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-surface/90 backdrop-blur-md border-b border-slate-border shadow-xs'
          : 'bg-surface/70 backdrop-blur-xs border-b border-slate-border/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-navy-800 text-white font-bold text-sm flex items-center justify-center shadow-xs group-hover:bg-navy-900 transition-colors">
              U
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-navy-950">UniMate</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-medium uppercase tracking-wider text-slate-text bg-surface-muted px-1.5 py-0.5 rounded border border-slate-border">
                Smart Campus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-xs font-medium text-navy-700 hover:text-navy-950 transition-colors focus:outline-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs (Role/Auth aware) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-text">
                  Signed in as <strong className="text-navy-950 font-semibold">{user?.fullName?.split(' ')[0]}</strong>
                </span>
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" icon={ArrowRight}>
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-navy-800 hover:text-navy-950 px-3 py-1.5 rounded-lg hover:bg-surface-muted transition-colors focus:outline-none"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-text hover:text-navy-950 hover:bg-surface-muted focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-navy-950/20 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-16 left-0 right-0 z-50 md:hidden border-b border-slate-border bg-surface px-4 pt-4 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 mb-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-sm font-medium text-navy-800 hover:text-navy-950 py-2 px-3 rounded-lg hover:bg-surface-muted transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-border flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full" icon={ArrowRight}>
                    Open Dashboard ({user?.fullName})
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full">
                      Get Started as Student
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
