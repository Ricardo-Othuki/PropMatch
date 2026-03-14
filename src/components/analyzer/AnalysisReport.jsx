import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, CheckCircle, Info } from 'lucide-react';
import { compareWithFirm } from './tradeAnalysisEngine';

const typeStyles = {
  violation: 'bg-red-500/10 border-red-500/20 text-red-300',
  warning: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
  pass: 'bg-green-500/10 border-green-500/20 text-green-300',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
};
const typeIcons = {
  violation: AlertTriangle,
  warning: AlertTriangle,
  pass: CheckCircle,
  info: Info,
};

function StatBadge({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/40">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function FeedbackItem({ item, index }) {
  const Icon = typeIcons[item.type] || Info;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${typeStyles[item.type]}`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <div className="font-semibold text-sm">{item.icon} {item.title}</div>
        <div className="text-xs opacity-80 mt-0.5 leading-relaxed">{item.detail}</div>
        {item.days?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.days.map(d => <span key={d} className="text-xs bg-black/20 rounded px-1.5 py-0.5">{d}</span>)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm">
      <div className="text-zinc-400 text-xs">{label}</div>
      <div className={`font-bold ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {val >= 0 ? '+' : ''}${val.toFixed(0)}
      </div>
    </div>
  );
};

export default function AnalysisReport({ analysis, fileName, onReset }) {
  const [selectedFirmId, setSelectedFirmId] = useState('');
  const [accountSize, setAccountSize] = useState(100000);

  const { data: firms = [] } = useQuery({
    queryKey: ['propfirms'],
    queryFn: () => base44.entities.PropFirm.list(),
  });

  const selectedFirm = firms.find(f => f.id === selectedFirmId);
  const comparison = selectedFirm ? compareWithFirm(analysis, selectedFirm, accountSize) : [];
  const violations = comparison.filter(c => c.type === 'violation').length;

  const chartData = analysis.dailyStats.map(d => ({
    date: d.date.slice(5), // MM-DD
    pnl: parseFloat(d.totalPnl.toFixed(0)),
    trades: d.tradeCount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Análise Completa</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{fileName} • {analysis.totalTrades} trades em {analysis.totalDays} dias</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="border-zinc-700 text-zinc-400 hover:text-white rounded-xl">
          <RefreshCw className="w-4 h-4 mr-1.5" /> Novo arquivo
        </Button>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge label="P&L Total" value={`${analysis.totalPnl >= 0 ? '+' : ''}$${analysis.totalPnl.toFixed(0)}`} color={analysis.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatBadge label="Win Rate" value={`${analysis.winRate}%`} color={analysis.winRate >= 55 ? 'text-green-400' : analysis.winRate >= 45 ? 'text-amber-400' : 'text-red-400'} />
        <StatBadge label="Max Drawdown" value={`$${analysis.maxOverallDrawdown.toFixed(0)}`} color="text-orange-400" />
        <StatBadge label="Trades/Dia" value={analysis.avgTradesPerDay} color={analysis.avgTradesPerDay > 20 ? 'text-red-400' : 'text-white'} />
        <StatBadge label="Média por Win" value={`$${analysis.avgWin.toFixed(0)}`} color="text-green-400" />
        <StatBadge label="Média por Loss" value={`$${analysis.avgLoss.toFixed(0)}`} color="text-red-400" />
        <StatBadge label="R:R Médio" value={`1:${analysis.rrRatio.toFixed(2)}`} color={analysis.rrRatio >= 1.5 ? 'text-green-400' : analysis.rrRatio >= 1 ? 'text-amber-400' : 'text-red-400'} />
        <StatBadge label="Dias lucrativos" value={`${analysis.profitableDays}/${analysis.totalDays}`} color="text-white" />
      </div>

      {/* Alerts from analysis */}
      <div className="space-y-2">
        {analysis.overtradingDays.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">🔁 Overtrading detectado</div>
              <div className="text-xs opacity-80 mt-0.5">
                {analysis.overtradingDays.map(d => `${d.date}: ${d.tradeCount} trades`).join(' | ')} — Volume atípico vs média de {analysis.avgTradesPerDay} trades/dia.
              </div>
            </div>
          </div>
        )}
        {analysis.revengeWarning && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">🧠 Padrão de revenge trading</div>
              <div className="text-xs opacity-80 mt-0.5">Dias com sequência de perdas seguidos de aumento no número de trades. Isso é sinal de operação emocional.</div>
            </div>
          </div>
        )}
      </div>

      {/* P&L Chart */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">P&L por Dia</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#3f3f46" />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trade count chart */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Número de Trades por Dia</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm">
                <div className="text-zinc-400 text-xs">{label}</div>
                <div className="font-bold text-amber-400">{payload[0].value} trades</div>
              </div>
            ) : null} />
            <Bar dataKey="trades" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.trades > analysis.avgTradesPerDay * 1.8 ? '#f97316' : '#f59e0b'} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Firm Comparison */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h3 className="text-lg font-bold text-white">Comparar com Prop Firm</h3>
        <p className="text-zinc-500 text-sm">Selecione uma mesa para ver se seus trades passariam pela avaliação.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedFirmId} onValueChange={setSelectedFirmId}>
            <SelectTrigger className="flex-1 bg-zinc-800 border-zinc-700 text-white rounded-xl">
              <SelectValue placeholder="Selecione uma prop firm..." />
            </SelectTrigger>
            <SelectContent>
              {firms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
            <input
              type="number"
              value={accountSize}
              onChange={e => setAccountSize(Number(e.target.value))}
              placeholder="Tamanho da conta"
              className="pl-7 h-9 w-full sm:w-40 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-sm px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {selectedFirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className={`flex items-center justify-between p-4 rounded-xl ${violations === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div>
                <div className={`font-bold text-lg ${violations === 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {violations === 0 ? '✅ Aprovado' : `❌ ${violations} violação(ões)`}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {violations === 0
                    ? `Seus trades respeitariam as regras da ${selectedFirm.name}.`
                    : `Você seria eliminado em ${violations} ponto(s) durante a avaliação.`}
                </div>
              </div>
              {violations === 0
                ? <TrendingUp className="w-8 h-8 text-green-400" />
                : <TrendingDown className="w-8 h-8 text-red-400" />}
            </div>

            {comparison.map((item, i) => <FeedbackItem key={i} item={item} index={i} />)}
          </motion.div>
        )}
      </div>
    </div>
  );
}