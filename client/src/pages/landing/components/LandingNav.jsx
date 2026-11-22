import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Menu, X, ArrowRight } from 'lucide-react';
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
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Architecture', href: '#architecture' },
  ];

  const handleAnchorClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3'
          : 'bg-white/60 backdrop-blur-xs border-b border-slate-200/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Wordmark - Ultra clean, NO generic pill badges */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-navy-800 text-white font-bold text-base flex items-center justify-center shadow-xs group-hover:bg-navy-900 transition-transform duration-200 group-hover:scale-[1.02]">
              U
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-navy-950 leading-none">
                UniMate
              </span>
              <span className="text-[10px] font-medium text-slate-text tracking-wider uppercase mt-0.5">
                Campus Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-sm font-medium text-slate-text hover:text-navy-950 transition-colors focus:outline-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs (Role & Auth aware) */}
          <div className="hidden md:flex items-center gap-3.5">
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
                  className="text-sm font-medium text-navy-800 hover:text-navy-950 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm hover:shadow-md transition-shadow font-medium px-4"
                  >
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
              className="p-2 rounded-lg text-slate-text hover:text-navy-950 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[65px] bg-navy-950/20 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 right-0 z-50 md:hidden border-b border-slate-200 bg-white px-5 pt-4 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1 mb-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-sm font-medium text-navy-800 hover:text-navy-950 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center" icon={ArrowRight}>
                    Open Dashboard ({user?.fullName})
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="md" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full justify-center">
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
