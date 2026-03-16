import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, LayoutDashboard, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AttemptCard from '../components/dashboard/AttemptCard';
import NewAttemptModal from '../components/dashboard/NewAttemptModal';
import AgentChat from '../components/dashboard/AgentChat';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['attempts'],
    queryFn: () => base44.entities.TradeAttempt.list('-created_date'),
  });

  const handleDelete = async (id) => {
    await base44.entities.TradeAttempt.delete(id);
    queryClient.invalidateQueries({ queryKey: ['attempts'] });
  };

  const active = attempts.filter(a => a.status === 'ativa');
  const history = attempts.filter(a => a.status !== 'ativa');

  // Summary stats
  const totalAttempts = attempts.length;
  const approved = attempts.filter(a => a.status === 'aprovada').length;
  const failed = attempts.filter(a => a.status === 'reprovada').length;
  const approvalRate = totalAttempts > 0 ? Math.round((approved / totalAttempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-900 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/Landing" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <Button size="sm" onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs">
            <Plus className="w-4 h-4 mr-1" /> Nova tentativa
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Meu Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Suas tentativas</h1>
          <p className="mt-2 text-zinc-400">Monitore seu progresso e receba alertas antes de violar qualquer regra.</p>
        </motion.div>

        {/* Stats summary */}
        {totalAttempts > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalAttempts}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Total</div>
            </div>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{approved}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Aprovadas</div>
            </div>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 text-center">
              <div className={`text-2xl font-bold ${approvalRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{approvalRate}%</div>
              <div className="text-xs text-zinc-500 mt-0.5">Taxa de aprovação</div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : attempts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma tentativa registrada</h3>
            <p className="text-zinc-500 mb-6 text-sm max-w-sm mx-auto">
              Registre sua tentativa ativa em uma prop firm e receba alertas preventivos em tempo real.
            </p>
            <Button onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl px-8">
              <Plus className="w-4 h-4 mr-2" /> Registrar Primeira Tentativa
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Active attempts */}
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Tentativas Ativas ({active.length})
                </h2>
                <div className="space-y-4">
                  {active.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <AttemptCard
                        attempt={a}
                        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['attempts'] })}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-500" /> Histórico ({history.length})
                </h2>
                <div className="space-y-4 opacity-70">
                  {history.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <AttemptCard
                        attempt={a}
                        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['attempts'] })}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <NewAttemptModal
          onClose={() => setShowModal(false)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['attempts'] })}
        />
      )}
    </div>
  );
}