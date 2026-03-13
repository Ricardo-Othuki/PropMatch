import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle, TrendingDown, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const phaseLabels = { fase_1: 'Fase 1', fase_2: 'Fase 2', funded: 'Funded' };
const phaseColors = { fase_1: 'bg-blue-500/10 text-blue-400 border-blue-500/20', fase_2: 'bg-purple-500/10 text-purple-400 border-purple-500/20', funded: 'bg-green-500/10 text-green-400 border-green-500/20' };
const statusColors = { ativa: 'text-green-400', aprovada: 'text-amber-400', reprovada: 'text-red-400', pausada: 'text-zinc-500' };

function AlertBadge({ level, msg }) {
  const styles = {
    danger: 'bg-red-500/10 border-red-500/20 text-red-300',
    warning: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
    safe: 'bg-green-500/10 border-green-500/20 text-green-300',
  };
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${styles[level]}`}>
      {level === 'danger' ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : level === 'warning' ? <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
      <span>{msg}</span>
    </div>
  );
}

function generateAlerts(attempt) {
  const alerts = [];
  if (!attempt.current_balance || !attempt.account_size) return alerts;

  const pnl = attempt.current_balance - attempt.account_size;
  const pnlPct = (pnl / attempt.account_size) * 100;
  const drawdownUsed = Math.abs(Math.min(pnlPct, 0));
  const drawdownRemaining = attempt.max_drawdown_percent - drawdownUsed;
  const profitPct = Math.max(0, pnlPct);
  const profitTarget = attempt.profit_target_percent || 6;
  const progressToTarget = (profitPct / profitTarget) * 100;

  // Drawdown alerts
  if (drawdownRemaining <= 0.5) {
    alerts.push({ level: 'danger', msg: `🚨 CRÍTICO: Drawdown restante de apenas ${drawdownRemaining.toFixed(2)}% — PARE de operar!` });
  } else if (drawdownRemaining <= 1.5) {
    alerts.push({ level: 'danger', msg: `⚠️ Drawdown restante muito baixo: ${drawdownRemaining.toFixed(2)}%. Evite trades arriscados hoje.` });
  } else if (drawdownRemaining <= (attempt.max_drawdown_percent * 0.4)) {
    alerts.push({ level: 'warning', msg: `Você usou ${drawdownUsed.toFixed(1)}% de ${attempt.max_drawdown_percent}% de drawdown. Reduza o tamanho das posições.` });
  } else {
    alerts.push({ level: 'safe', msg: `Drawdown seguro. Restam ${drawdownRemaining.toFixed(1)}% de margem (${(attempt.max_drawdown_percent - drawdownUsed).toFixed(1)}% de ${attempt.max_drawdown_percent}%).` });
  }

  // Progress to target
  if (progressToTarget >= 100) {
    alerts.push({ level: 'safe', msg: `✅ Meta atingida! Você lucrou ${profitPct.toFixed(1)}% da conta. Hora de solicitar aprovação.` });
  } else if (progressToTarget >= 80) {
    alerts.push({ level: 'safe', msg: `Quase lá! ${profitPct.toFixed(1)}% de lucro (${progressToTarget.toFixed(0)}% da meta de ${profitTarget}%). Não force.` });
  }

  // Trailing drawdown special warning
  if (attempt.drawdown_type === 'trailing' && profitPct > 0 && drawdownUsed > 0) {
    alerts.push({ level: 'warning', msg: `Trailing DD ativo: seu piso sobe com o lucro. Com ${profitPct.toFixed(1)}% de ganho, seu drawdown efetivo é menor. Cuidado ao reverter posições.` });
  }

  // Days remaining
  if (attempt.min_trading_days && attempt.days_traded !== undefined) {
    const daysRemaining = attempt.min_trading_days - attempt.days_traded;
    if (daysRemaining > 0) {
      alerts.push({ level: 'warning', msg: `Você ainda precisa de ${daysRemaining} dia(s) de operação para atingir o mínimo exigido.` });
    }
  }

  return alerts;
}

export default function AttemptCard({ attempt, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [localBalance, setLocalBalance] = useState(attempt.current_balance || attempt.account_size);
  const [localDays, setLocalDays] = useState(attempt.days_traded || 0);
  const [saving, setSaving] = useState(false);

  const alerts = generateAlerts({ ...attempt, current_balance: localBalance, days_traded: localDays });
  const pnl = localBalance - attempt.account_size;
  const pnlPct = ((localBalance - attempt.account_size) / attempt.account_size) * 100;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.TradeAttempt.update(attempt.id, { current_balance: localBalance, days_traded: localDays });
    onUpdate();
    setEditing(false);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => !editing && setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
            {phaseLabels[attempt.phase]?.replace('Fase ', 'F').replace('Funded', '✓')}
          </div>
          <div>
            <h3 className="font-bold text-white">{attempt.firm_name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={`${phaseColors[attempt.phase]} border text-xs`}>{phaseLabels[attempt.phase]}</Badge>
              <span className={`text-xs font-medium ${statusColors[attempt.status]}`}>{attempt.status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`font-bold text-sm ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
            </div>
            <div className="text-xs text-zinc-600">${localBalance?.toLocaleString()}</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 p-5 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Conta inicial</div>
              <div className="font-bold text-white">${attempt.account_size?.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">P&L atual</div>
              <div className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <div className="text-xs text-zinc-500">Dias operados</div>
              <div className="font-bold text-white">{localDays}/{attempt.min_trading_days || '—'}</div>
            </div>
          </div>

          {/* Editable fields */}
          {editing ? (
            <div className="space-y-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Saldo Atual ($)</label>
                <Input type="number" value={localBalance} onChange={e => setLocalBalance(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-700 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Dias Operados</label>
                <Input type="number" value={localDays} onChange={e => setLocalDays(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-700 text-white rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg">
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-zinc-500">Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Atualizar saldo
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(attempt.id)} className="text-zinc-600 hover:text-red-400 rounded-lg text-xs ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Alerts */}
          <div className="space-y-2">
            {alerts.map((a, i) => <AlertBadge key={i} level={a.level} msg={a.msg} />)}
          </div>
        </div>
      )}
    </div>
  );
}