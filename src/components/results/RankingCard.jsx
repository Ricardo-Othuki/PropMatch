import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const positionStyles = {
  0: { badge: 'bg-amber-500 text-zinc-950', border: 'border-amber-500/40', bg: 'bg-zinc-900/80' },
  1: { badge: 'bg-zinc-400 text-zinc-950', border: 'border-zinc-400/30', bg: 'bg-zinc-900/80' },
  2: { badge: 'bg-amber-700 text-white', border: 'border-amber-700/30', bg: 'bg-zinc-900/80' },
};

const drawdownLabels = { trailing: 'Trailing', eod: 'End of Day', static: 'Estático' };
const difficultyLabels = { facil: 'Fácil', moderada: 'Moderada', dificil: 'Difícil', muito_dificil: 'Muito Difícil' };
const difficultyColors = { facil: 'text-green-400', moderada: 'text-amber-400', dificil: 'text-red-400', muito_dificil: 'text-red-500' };
const payoutLabels = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal', sob_demanda: 'Sob Demanda' };

function ApprovalBar({ probability }) {
  const color = probability >= 65 ? 'bg-green-500' : probability >= 45 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = probability >= 65 ? 'text-green-400' : probability >= 45 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-500 flex items-center gap-1">
          <Percent className="w-3 h-3" /> Prob. de aprovação
        </span>
        <span className={`text-sm font-bold ${textColor}`}>{probability}%</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function RankingCard({ match, position, delay }) {
  const [expanded, setExpanded] = React.useState(position === 0);
  const style = positionStyles[position] || { badge: 'bg-zinc-700 text-white', border: 'border-zinc-700/30', bg: 'bg-zinc-900/80' };
  const { firm, score, reasons, warnings, approvalProbability } = match;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`rounded-2xl border ${style.border} ${style.bg} backdrop-blur-sm overflow-hidden ${position === 0 ? 'shadow-lg shadow-amber-500/5' : ''}`}
    >
      {/* Header */}
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${style.badge} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
              {position === 0 ? <Trophy className="w-5 h-5" /> : `${position + 1}º`}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{firm.name}</h3>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-amber-400 font-medium">{firm.payout_split}% payout</span>
                <span className="text-zinc-700">·</span>
                <span className="text-sm text-zinc-400">{drawdownLabels[firm.drawdown_type]}</span>
                <span className="text-zinc-700">·</span>
                <span className={`text-sm font-medium ${difficultyColors[firm.estimated_difficulty]}`}>
                  {difficultyLabels[firm.estimated_difficulty]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 text-amber-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">{score}</span>
              </div>
              <span className="text-xs text-zinc-600">match</span>
            </div>
            {expanded ? <ChevronUp className="w-5 h-5 text-zinc-600" /> : <ChevronDown className="w-5 h-5 text-zinc-600" />}
          </div>
        </div>

        {/* Approval probability bar always visible */}
        <ApprovalBar probability={approvalProbability} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-zinc-800 px-5 pb-5"
        >
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Drawdown</div>
              <div className="text-lg font-bold text-white">{firm.max_drawdown_percent}%</div>
              <div className="text-xs text-zinc-500">{drawdownLabels[firm.drawdown_type]}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Meta</div>
              <div className="text-lg font-bold text-white">{firm.profit_target_percent}%</div>
              <div className="text-xs text-zinc-500">{firm.evaluation_phases} fase(s)</div>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Payout</div>
              <div className="text-lg font-bold text-amber-400">{firm.payout_split}%</div>
              <div className="text-xs text-zinc-500">{payoutLabels[firm.payout_frequency]}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Dias Mín.</div>
              <div className="text-lg font-bold text-white">{firm.min_trading_days || 0}</div>
              <div className="text-xs text-zinc-500">Max {firm.max_contracts} ctrs</div>
            </div>
          </div>

          {/* Why it matches */}
          {reasons.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> Por que combina com você
              </h4>
              <div className="flex flex-wrap gap-2">
                {reasons.map((r, i) => (
                  <Badge key={i} className="bg-amber-500/10 text-amber-300 border-amber-500/20 border text-xs">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Atenção
              </h4>
              <div className="flex flex-wrap gap-2">
                {warnings.map((w, i) => (
                  <Badge key={i} variant="outline" className="text-orange-300 border-orange-500/20 text-xs">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-5">
            <a href={firm.affiliate_url || firm.website_url || '#'} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl">
                Conhecer Mesa <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}