import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ShieldHalf, Menu, X, GitBranch, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/hotspots", label: "Hotspots" },
  { to: "/predict", label: "Predict", ai: true },
  { to: "/docs", label: "Docs" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav
        className={clsx(
          "glass-panel w-full max-w-4xl rounded-2xl px-4 py-2.5 flex items-center justify-between transition-shadow duration-300",
          scrolled ? "shadow-(--shadow-island)" : "shadow-glossy"
        )}
      >
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-linear-to-br from-brand-500 to-mint-400 text-white shadow-glossy">
            <ShieldHalf size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display font-semibold tracking-tight text-ink-900">
            Urban<span className="text-brand-600">Risk</span>
          </span>
        </NavLink>

        <div className="hidden md:flex items-center gap-1 relative">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                clsx(
                  "relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                  isActive ? "text-brand-700" : "text-ink-600 hover:text-ink-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-brand-500/10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {link.label}
                    {link.ai && <Sparkles size={11} className="text-ai-500 relative" />}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="grid place-items-center w-9 h-9 rounded-full text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-colors"
            aria-label="View source on GitHub"
          >
            <GitBranch size={18} />
          </a>
          <NavLink
            to="/docs"
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-linear-to-r from-brand-500 to-brand-600 shadow-glossy hover:shadow-lg transition-shadow"
          >
            API Docs
          </NavLink>
        </div>

        <button
          className="md:hidden grid place-items-center w-9 h-9 rounded-full text-ink-700 hover:bg-ink-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden absolute top-18 w-[calc(100%-2rem)] max-w-4xl glass-panel rounded-2xl shadow-(--shadow-island) p-3 flex flex-col gap-1"
          >
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5",
                    isActive ? "bg-brand-500/10 text-brand-700" : "text-ink-600 hover:bg-ink-100"
                  )
                }
              >
                {link.label}
                {link.ai && <Sparkles size={11} className="text-ai-500" />}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
