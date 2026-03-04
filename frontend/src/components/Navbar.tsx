// Copyright (c) 2026 AlgoSort. All Rights Reserved.
// Unauthorized copying, redistribution, or modification prohibited.
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const linkBase = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const active = "bg-brand text-white shadow-lg shadow-brand/20";
  const inactive = "text-[var(--fg)] hover:bg-[var(--panel)] hover:text-brand";

  const MobileMenuIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );

  return (
    <>
      <header className="border-b border-slate-200/50 sticky top-0 bg-[var(--bg)]/80 backdrop-blur-md z-[110] transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 z-[120]">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-white font-bold text-lg shadow-lg shadow-brand/20">
              A
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              AlgoSort
            </span>
          </Link>

          {/* Desktop Search - Hidden on mobile, visible on md+ */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <GlobalSearch />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/tutorials"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Tutorials
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Problems
            </NavLink>
            <NavLink
              to="/math"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Math
            </NavLink>

            <div className="w-px h-6 bg-slate-200/50 mx-2" />

            <ThemeToggle />
          </nav>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--panel)] text-[var(--fg)] z-[120]"
            aria-label="Toggle menu"
          >
            {isOpen ? <CloseIcon /> : <MobileMenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Content - Moved outside header to avoid stacking context issues */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-transform duration-300 ease-in-out flex flex-col pt-24 px-6 pb-8 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--bg)",
        }}
      >
        <div className="space-y-6 flex-1 overflow-y-auto w-full">
          {/* Mobile Search */}
          <div className="mb-6 w-full block">
             <GlobalSearch />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 w-full">
            <NavLink
              to="/tutorials"
              className={({ isActive }) =>
                `p-4 rounded-xl text-lg font-medium transition-all block w-full ${
                  isActive
                    ? "bg-brand/10 text-brand border border-brand/20"
                    : "text-[var(--fg)] hover:bg-[var(--panel)]"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Tutorials
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `p-4 rounded-xl text-lg font-medium transition-all block w-full ${
                  isActive
                    ? "bg-brand/10 text-brand border border-brand/20"
                    : "text-[var(--fg)] hover:bg-[var(--panel)]"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Problems
            </NavLink>
            <NavLink
              to="/math"
              className={({ isActive }) =>
                `p-4 rounded-xl text-lg font-medium transition-all block w-full ${
                  isActive
                    ? "bg-brand/10 text-brand border border-brand/20"
                    : "text-[var(--fg)] hover:bg-[var(--panel)]"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Math
            </NavLink>
          </nav>
        </div>

        {/* Separate Theme Section */}
        <div className="mt-auto border-t border-[var(--panel)] pt-6 w-full">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel)]">
            <span className="font-medium text-[var(--fg)]">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
