import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

const links = [
  { label: 'Quiz', to: '/Quiz' },
  { label: 'Explorer', to: '/Explorer' },
  { label: 'Simulador', to: '/RiskSimulator' },
  { label: 'Ranking', to: '/Ranking' },
  { label: 'Dashboard', to: '/Dashboard' },
  { label: 'Analisador', to: '/TradeAnalyzer' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/Landing" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white tracking-wide">PROPMATCH</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className="px-4 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
              {l.label}
            </Link>
          ))}
          <Link to="/Quiz"
            className="ml-3 px-4 py-1.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all">
            Começar
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-zinc-400 hover:text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-900 bg-zinc-950 px-6 py-4 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
              {l.label}
            </Link>
          ))}
          <Link to="/Quiz" onClick={() => setOpen(false)}
            className="block mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-zinc-950 text-center">
            Começar Quiz
          </Link>
        </div>
      )}
    </nav>
  );
}