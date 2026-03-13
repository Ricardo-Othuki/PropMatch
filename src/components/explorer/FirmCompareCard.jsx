import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const drawdownLabels = { trailing: 'Trailing', eod: 'End of Day', static: 'Estático' };
const drawdownColors = { trailing: 'text-orange-400', eod: 'text-blue-400', static: 'text-green-400' };
const difficultyLabels = { facil: 'Fácil', moderada: 'Moderada', dificil: 'Difícil', muito_dificil: 'Muito Difícil' };
const difficultyColors = { facil: 'bg-green-500/10 text-green-400', moderada: 'bg-amber-500/10 text-amber-400', dificil: 'bg-red-500/10 text-red-400', muito_dificil: 'bg-red-500/10 text-red-500' };
const payoutLabels = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal', sob_demanda: 'Sob Demanda' };
const consistencyLabels = { nenhuma: 'Nenhuma', leve: 'Leve', moderada: 'Moderada', rigorosa: 'Rigorosa' };

function BoolBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-400"><Check className="w-4 h-4" /> Sim</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-red-400"><X className="w-4 h-4" /> Não</span>
  );
}

export default function FirmCompareCard({ firm }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{firm.name}</h3>
          <Badge className={`${difficultyColors[firm.estimated_difficulty]} mt-1`}>
            {difficultyLabels[firm.estimated_difficulty]}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{firm.payout_split}%</div>
          <div className="text-xs text-zinc-500">payout</div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Drawdown</span>
          <span className={`font-medium ${drawdownColors[firm.drawdown_type]}`}>
            {drawdownLabels[firm.drawdown_type]} ({firm.max_drawdown_percent}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Meta de Lucro</span>
          <span className="text-white font-medium">{firm.profit_target_percent}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Perda Diária</span>
          <span className="text-white font-medium">{firm.daily_loss_limit_percent ? `${firm.daily_loss_limit_percent}%` : 'Sem limite'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Dias Mínimos</span>
          <span className="text-white font-medium">{firm.min_trading_days || 'Nenhum'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Fases</span>
          <span className="text-white font-medium">{firm.evaluation_phases}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Saque</span>
          <span className="text-white font-medium">{payoutLabels[firm.payout_frequency]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Consistência</span>
          <span className="text-white font-medium">{consistencyLabels[firm.consistency_rule]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Max Contratos</span>
          <span className="text-white font-medium">{firm.max_contracts}</span>
        </div>

        <div className="border-t border-zinc-800 pt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-500">HFT</span>
            <BoolBadge value={firm.hft_allowed} />
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Notícia</span>
            <BoolBadge value={firm.news_trading_allowed} />
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Copy Trading</span>
            <BoolBadge value={firm.copy_trading_allowed} />
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Escalonamento</span>
            <BoolBadge value={firm.scaling_plan} />
          </div>
        </div>
      </div>

      {/* Highlights */}
      {firm.highlights?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {firm.highlights.map((h, i) => (
            <Badge key={i} className="bg-amber-500/10 text-amber-300 border-amber-500/20 border text-xs">{h}</Badge>
          ))}
        </div>
      )}

      <a href={firm.affiliate_url || firm.website_url} target="_blank" rel="noopener noreferrer" className="block mt-4">
        <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl">
          Visitar Site <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </a>
    </div>
  );
}