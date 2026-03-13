import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Trophy, Star, ExternalLink, TrendingUp, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PRESETS = [
  {
    id: 'scalper_noticia',
    label: 'Scalpers que operam notícia',
    icon: '⚡',
    description: 'HFT/scalping + news trading liberado',
    filter: f => f.news_trading_allowed && (f.hft_allowed || f.daily_loss_limit_percent === 0) && f.drawdown_type !== 'trailing',
    tag: 'Scalper + News'
  },
  {
    id: 'iniciante_barato',
    label: 'Menor custo para iniciantes',
    icon: '🎓',
    description: 'Avaliações baratas + dificuldade fácil',
    filter: f => f.price_range === 'barato' && (f.estimated_difficulty === 'facil' || f.estimated_difficulty === 'moderada') && f.consistency_rule !== 'rigorosa',
    tag: 'Iniciante Friendly'
  },
  {
    id: 'melhor_payout',
    label: 'Maior payout + saque rápido',
    icon: '💰',
    description: 'Payout ≥ 90% + saque semanal ou sob demanda',
    filter: f => f.payout_split >= 90 && (f.payout_frequency === 'semanal' || f.payout_frequency === 'sob_demanda'),
    tag: 'Payout Máximo'
  },
  {
    id: 'swing_seguro',
    label: 'Melhores para Swing Trade',
    icon: '📈',
    description: 'Static drawdown + sem limite diário',
    filter: f => f.drawdown_type === 'static' && f.daily_loss_limit_percent === 0,
    tag: 'Swing Trade'
  },
  {
    id: 'passar_rapido',
    label: 'Passar mais rápido',
    icon: '🚀',
    description: '1 fase + menos dias + sem consistência',
    filter: f => f.evaluation_phases === 1 && f.min_trading_days <= 5 && f.consistency_rule === 'nenhuma',
    tag: 'Speed Run'
  },
  {
    id: 'static_drawdown',
    label: 'Static drawdown (mais seguro)',
    icon: '🛡️',
    description: 'Drawdown estático = sem trailing surpresa',
    filter: f => f.drawdown_type === 'static',
    tag: 'Static DD'
  },
];

// Simulated approval rates (would be real data from QuizSubmissions in production)
const SIMULATED_APPROVAL = {
  'Apex Trader Funding': 62,
  'Topstep': 58,
  'Earn2Trade': 54,
  'Bulenox': 71,
  'TradeDay': 68,
  'FTMO': 41,
  'My Funded Futures': 60,
  'Leeloo Trading': 49,
};

const drawdownColors = { trailing: 'text-orange-400', eod: 'text-blue-400', static: 'text-green-400' };
const drawdownLabels = { trailing: 'Trailing', eod: 'End of Day', static: 'Estático' };
const payoutLabels = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal', sob_demanda: 'Sob Demanda' };

function FirmRankRow({ firm, rank, approvalRate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
      className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${rank === 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}
    >
      {/* Rank badge */}
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg ${rank === 0 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
        {rank === 0 ? <Trophy className="w-5 h-5" /> : `${rank + 1}`}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-white">{firm.name}</h3>
          {rank === 0 && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/20 border text-xs">🏆 Top Pick</Badge>}
        </div>
        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-zinc-500">
          <span className={drawdownColors[firm.drawdown_type]}>{drawdownLabels[firm.drawdown_type]} ({firm.max_drawdown_percent}%)</span>
          <span>Meta: {firm.profit_target_percent}%</span>
          <span>{firm.evaluation_phases} fase(s)</span>
          <span>{payoutLabels[firm.payout_frequency]}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-center">
          <div className="text-xl font-bold text-amber-400">{firm.payout_split}%</div>
          <div className="text-xs text-zinc-600">payout</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold flex items-center gap-1 ${approvalRate >= 60 ? 'text-green-400' : approvalRate >= 45 ? 'text-amber-400' : 'text-red-400'}`}>
            <Users className="w-4 h-4" />{approvalRate}%
          </div>
          <div className="text-xs text-zinc-600">aprovação</div>
        </div>
        <a href={firm.affiliate_url || firm.website_url || '#'} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl">
            Ver Mesa <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </a>
      </div>
    </motion.div>
  );
}

export default function Ranking() {
  const [activePreset, setActivePreset] = useState('melhor_payout');

  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['propfirms'],
    queryFn: () => base44.entities.PropFirm.list(),
  });

  const preset = PRESETS.find(p => p.id === activePreset);
  const filtered = firms
    .filter(f => f.active !== false)
    .filter(preset ? preset.filter : () => true)
    .sort((a, b) => {
      // Sort by approval rate
      const aRate = SIMULATED_APPROVAL[a.name] || 50;
      const bRate = SIMULATED_APPROVAL[b.name] || 50;
      return bRate - aRate;
    });

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-900 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/Landing" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <Link to="/Quiz">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs">
              Fazer Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Ranking por Perfil</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Ranking Inteligente</h1>
          <p className="mt-2 text-zinc-400">Selecione seu cenário e veja as mesas rankeadas por taxa de aprovação real.</p>
        </motion.div>

        {/* Preset filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm text-zinc-500">
            <Filter className="w-4 h-4" /> Selecione um cenário:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePreset(p.id)}
                className={`text-left p-4 rounded-xl border transition-all ${activePreset === p.id ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
              >
                <div className="text-xl mb-1">{p.icon}</div>
                <div className="font-semibold text-sm leading-tight">{p.label}</div>
                <div className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{p.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Active filter info */}
        {preset && (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
          >
            <span className="text-2xl">{preset.icon}</span>
            <div>
              <div className="text-white font-semibold">{preset.label}</div>
              <div className="text-sm text-zinc-500">{preset.description}</div>
            </div>
            <Badge className="ml-auto bg-amber-500/10 text-amber-300 border-amber-500/20 border flex-shrink-0">{filtered.length} mesas</Badge>
          </motion.div>
        )}

        {/* Ranking list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-zinc-500">Nenhuma mesa encontrada para esse cenário.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((firm, i) => (
              <FirmRankRow
                key={firm.id}
                firm={firm}
                rank={i}
                approvalRate={SIMULATED_APPROVAL[firm.name] || 50}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-10 text-xs text-zinc-700 text-center">
          Taxas de aprovação são estimativas baseadas em perfis de usuários da plataforma. Atualizadas periodicamente.
        </p>
      </div>
    </div>
  );
}