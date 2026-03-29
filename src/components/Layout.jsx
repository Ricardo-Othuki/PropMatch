import { Outlet, Link } from 'react-router-dom';
import AgentChat from './dashboard/AgentChat';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-zinc-950/90 backdrop-blur border-b border-zinc-900">
        <Link to="/Landing" className="text-white font-bold tracking-widest text-sm">PROPMATCH</Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/Landing" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Home</Link>
              <Link to="/Explorer" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Explorar</Link>
              <Link to="/Ranking" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Ranking</Link>
              <Link to="/Quiz" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Quiz</Link>
              <Link to="/RiskSimulator" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Simulador</Link>
              <Link to="/Dashboard" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Dashboard</Link>
              <Link to="/TradeAnalyzer" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Analisador</Link>
              <Link to="/Plans" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Planos</Link>
              <Button size="sm" variant="ghost" onClick={() => base44.auth.logout()} className="text-zinc-400 hover:text-white text-xs ml-2">Sair</Button>
            </>
          ) : (
            <>
              <Link to="/Explorer" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Explorar Mesas</Link>
              <Link to="/Ranking" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Ranking</Link>
              <Link to="/Plans" className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">Planos</Link>
              <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs ml-2">Entrar / Cadastrar</Button>
            </>
          )}
        </nav>
      </header>
      <div className="pt-12">
        <Outlet />
      </div>
      {isAuthenticated && <AgentChat />}
    </>
  );
}