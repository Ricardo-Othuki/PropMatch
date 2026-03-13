import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const positionStyles = {
  0: { badge: 'bg-amber-500 text-zinc-950', border: 'border-amber-500/40', glow: 'shadow-amber-500/10' },
  1: { badge: 'bg-zinc-400 text-zinc-950', border: 'border-zinc-400/30', glow: '' },
  2: { badge: 'bg-amber-700 text-white', border: 'border-amber-700/30', glow: '' },
};

const drawdownLabels = { trailing: 'Trailing', eod: 'End of Day', static: 'Estático' };
const difficultyLabels = { facil: 'Fácil', moderada: 'Moderada', dificil: 'Difícil', muito_dificil: 'Muito Difícil' };
const difficultyColors = { facil: 'text-green-400', moderada: 'text-amber-400', dificil: 'text-red-400', muito_dificil: 'text-red-500' };
const payoutLabels = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal', sob_demanda: 'Sob Demanda' };

export default function RankingCard({ match, position, delay }) {
  const [expanded, setExpanded] = React.useState(position === 0);
  const style = positionStyles[position] || { badge: 'bg-zinc-700 text-white', border: 'border-zinc-700/30', glow: '' };
  const { firm, score, reasons, warnings } = match;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      className={`rounded-2xl border ${style.border} bg-zinc-900/80 backdrop-blur-sm overflow-hidden ${style.glow} ${position === 0 ? 'shadow-lg' : ''}`}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${style.badge} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
            {position === 0 ? <Trophy className="w-5 h-5" /> : `${position + 1}º`}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{firm.name}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-amber-400 font-medium">{firm.payout_split}% payout</span>
              <span className="text-zinc-600">·</span>
              <span className="text-sm text-zinc-400">{drawdownLabels[firm.drawdown_type]}</span>
              <span className="text-zinc-600">·</span>
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
            <span className="text-xs text-zinc-500">pontos</span>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-zinc-800 px-5 pb-5"
        >
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Drawdown Máx</div>
              <div className="text-lg font-bold text-white">{firm.max_drawdown_percent}%</div>
              <div className="text-xs text-zinc-500">{drawdownLabels[firm.drawdown_type]}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Meta de Lucro</div>
              <div className="text-lg font-bold text-white">{firm.profit_target_percent}%</div>
              <div className="text-xs text-zinc-500">{firm.evaluation_phases} fase(s)</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Payout</div>
              <div className="text-lg font-bold text-amber-400">{firm.payout_split}%</div>
              <div className="text-xs text-zinc-500">{payoutLabels[firm.payout_frequency]}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Dias Mínimos</div>
              <div className="text-lg font-bold text-white">{firm.min_trading_days || 0}</div>
              <div className="text-xs text-zinc-500">Max {firm.max_contracts} contratos</div>
            </div>
          </div>

          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Por que combina com você
              </h4>
              <div className="flex flex-wrap gap-2">
                {reasons.map((r, i) => (
                  <Badge key={i} className="bg-amber-500/10 text-amber-300 border-amber-500/20 border">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" /> Pontos de atenção
              </h4>
              <div className="flex flex-wrap gap-2">
                {warnings.map((w, i) => (
                  <Badge key={i} variant="outline" className="text-orange-300 border-orange-500/20">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-5 flex gap-3">
            {firm.affiliate_url ? (
              <a href={firm.affiliate_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl">
                  Conhecer Mesa <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            ) : (
              <a href={firm.website_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl">
                  Visitar Site <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}