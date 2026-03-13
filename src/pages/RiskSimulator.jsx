import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, AlertTriangle, Target, TrendingUp, Shield, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

function StatCard({ label, value, sub, color = 'text-white', highlight = false }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-zinc-800/60 border border-zinc-700/40'}`}>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function AlertRow({ icon: Icon, color, title, detail }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${color}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-80 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}

export default function RiskSimulator() {
  const [capital, setCapital] = useState(100000);
  const [profitTargetPct, setProfitTargetPct] = useState(6);
  const [maxDrawdownPct, setMaxDrawdownPct] = useState(6);
  const [dailyLossLimitPct, setDailyLossLimitPct] = useState(2);
  const [tradesPerDay, setTradesPerDay] = useState(5);
  const [riskPerTradePct, setRiskPerTradePct] = useState(1);
  const [winRate, setWinRate] = useState(55);
  const [rrRatio, setRrRatio] = useState(1.5);

  const calc = useMemo(() => {
    const profitTarget = capital * (profitTargetPct / 100);
    const maxLoss = capital * (maxDrawdownPct / 100);
    const dailyLossLimit = capital * (dailyLossLimitPct / 100);
    const riskPerTrade = capital * (riskPerTradePct / 100);
    const rewardPerTrade = riskPerTrade * rrRatio;

    // Trades needed to hit target (expected value per trade)
    const winRateDecimal = winRate / 100;
    const expectedValuePerTrade = (winRateDecimal * rewardPerTrade) - ((1 - winRateDecimal) * riskPerTrade);
    const tradesNeededForTarget = expectedValuePerTrade > 0 ? Math.ceil(profitTarget / expectedValuePerTrade) : null;

    // Days needed
    const daysNeeded = tradesNeededForTarget ? Math.ceil(tradesNeededForTarget / tradesPerDay) : null;

    // Max consecutive losses before drawdown
    const maxConsecLosses = Math.floor(maxLoss / riskPerTrade);
    const maxDailyConsecLosses = dailyLossLimitPct > 0 ? Math.floor(dailyLossLimit / riskPerTrade) : null;

    // Risk per day total
    const dailyRiskTotal = riskPerTrade * tradesPerDay;
    const dailyRiskOkVsLimit = dailyLossLimitPct === 0 || dailyRiskTotal <= dailyLossLimit;

    // Is plan viable?
    const isViable = expectedValuePerTrade > 0 && maxConsecLosses >= 3 && (maxDailyConsecLosses === null || maxDailyConsecLosses >= 2);

    // Risk score (0-100, higher = safer)
    let safetyScore = 100;
    if (riskPerTradePct > 2) safetyScore -= 30;
    else if (riskPerTradePct > 1) safetyScore -= 15;
    if (maxConsecLosses < 3) safetyScore -= 30;
    else if (maxConsecLosses < 5) safetyScore -= 10;
    if (!dailyRiskOkVsLimit) safetyScore -= 25;
    if (winRate < 45) safetyScore -= 20;
    if (rrRatio < 1) safetyScore -= 20;
    safetyScore = Math.max(0, safetyScore);

    // Suggested position size (contracts) for ES-style (assume $50/pt, 4pt stop = $200 risk per contract)
    // Generic: riskPerTrade / stopLossInDollars
    const suggestedContracts = Math.floor(riskPerTrade / 200); // ES ~$200 risk/contract as example

    return {
      profitTarget,
      maxLoss,
      dailyLossLimit,
      riskPerTrade,
      rewardPerTrade,
      expectedValuePerTrade,
      tradesNeededForTarget,
      daysNeeded,
      maxConsecLosses,
      maxDailyConsecLosses,
      dailyRiskTotal,
      dailyRiskOkVsLimit,
      isViable,
      safetyScore,
      suggestedContracts: Math.max(1, suggestedContracts),
    };
  }, [capital, profitTargetPct, maxDrawdownPct, dailyLossLimitPct, tradesPerDay, riskPerTradePct, winRate, rrRatio]);

  const safetyColor = calc.safetyScore >= 70 ? 'text-green-400' : calc.safetyScore >= 45 ? 'text-amber-400' : 'text-red-400';
  const safetyBarColor = calc.safetyScore >= 70 ? 'bg-green-500' : calc.safetyScore >= 45 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-900 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/Landing" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Simulador de Risco</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Calcule seu plano operacional</h1>
          <p className="mt-2 text-zinc-400">Insira os parâmetros da sua mesa e estratégia para gerar um plano matemático seguro.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Inputs */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            {/* Mesa parameters */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Parâmetros da Mesa
              </h2>

              <div>
                <Label className="text-zinc-400 text-sm">Capital da Conta</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                  <Input
                    type="number"
                    value={capital}
                    onChange={e => setCapital(Number(e.target.value))}
                    className="pl-7 bg-zinc-800/50 border-zinc-700 text-white rounded-xl"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[25000, 50000, 100000, 150000].map(v => (
                    <button key={v} onClick={() => setCapital(v)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all ${capital === v ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}>
                      ${(v / 1000)}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Meta de Lucro <span className="text-amber-400 font-bold">{profitTargetPct}% = ${(capital * profitTargetPct / 100).toLocaleString()}</span>
                </Label>
                <Slider value={[profitTargetPct]} onValueChange={([v]) => setProfitTargetPct(v)} min={3} max={15} step={0.5} className="mt-3" />
              </div>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Drawdown Máximo <span className="text-red-400 font-bold">{maxDrawdownPct}% = ${(capital * maxDrawdownPct / 100).toLocaleString()}</span>
                </Label>
                <Slider value={[maxDrawdownPct]} onValueChange={([v]) => setMaxDrawdownPct(v)} min={2} max={15} step={0.5} className="mt-3" />
              </div>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Limite de Perda Diária <span className="text-orange-400 font-bold">{dailyLossLimitPct}% = ${(capital * dailyLossLimitPct / 100).toLocaleString()}</span>
                </Label>
                <Slider value={[dailyLossLimitPct]} onValueChange={([v]) => setDailyLossLimitPct(v)} min={0} max={5} step={0.25} className="mt-3" />
                {dailyLossLimitPct === 0 && <p className="text-xs text-zinc-600 mt-1">0% = sem limite diário</p>}
              </div>
            </div>

            {/* Strategy parameters */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" /> Parâmetros da Estratégia
              </h2>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Risco por Trade <span className="text-white font-bold">{riskPerTradePct}% = ${(capital * riskPerTradePct / 100).toLocaleString()}</span>
                </Label>
                <Slider value={[riskPerTradePct]} onValueChange={([v]) => setRiskPerTradePct(v)} min={0.1} max={5} step={0.1} className="mt-3" />
              </div>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Relação Risco:Retorno <span className="text-white font-bold">1:{rrRatio}</span>
                </Label>
                <Slider value={[rrRatio]} onValueChange={([v]) => setRrRatio(v)} min={0.5} max={5} step={0.25} className="mt-3" />
              </div>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Taxa de Acerto (Win Rate) <span className="text-white font-bold">{winRate}%</span>
                </Label>
                <Slider value={[winRate]} onValueChange={([v]) => setWinRate(v)} min={20} max={90} step={1} className="mt-3" />
              </div>

              <div>
                <Label className="text-zinc-400 text-sm flex justify-between">
                  Trades por Dia <span className="text-white font-bold">{tradesPerDay}</span>
                </Label>
                <Slider value={[tradesPerDay]} onValueChange={([v]) => setTradesPerDay(v)} min={1} max={30} step={1} className="mt-3" />
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
            {/* Safety Score */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Score de Segurança</h2>
                <span className={`text-3xl font-bold ${safetyColor}`}>{calc.safetyScore}/100</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${safetyBarColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${calc.safetyScore}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {calc.safetyScore >= 70 ? 'Plano seguro e sustentável.' : calc.safetyScore >= 45 ? 'Plano arriscado. Ajuste os parâmetros.' : 'Plano perigoso. Alto risco de violar drawdown.'}
              </p>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Meta de Lucro" value={`$${calc.profitTarget.toLocaleString()}`} sub={`${profitTargetPct}% da conta`} color="text-green-400" />
              <StatCard label="Perda Máxima" value={`$${calc.maxLoss.toLocaleString()}`} sub={`${maxDrawdownPct}% da conta`} color="text-red-400" />
              <StatCard label="Risco por Trade" value={`$${calc.riskPerTrade.toLocaleString()}`} sub={`Retorno: $${calc.rewardPerTrade.toLocaleString()}`} color="text-amber-400" highlight />
              <StatCard label="EV por Trade" value={calc.expectedValuePerTrade > 0 ? `+$${calc.expectedValuePerTrade.toFixed(0)}` : 'EV negativo!'} sub="Valor esperado" color={calc.expectedValuePerTrade > 0 ? 'text-green-400' : 'text-red-400'} />
              <StatCard label="Trades p/ Meta" value={calc.tradesNeededForTarget ? calc.tradesNeededForTarget : '—'} sub="Estimativa" />
              <StatCard label="Dias Estimados" value={calc.daysNeeded ? `~${calc.daysNeeded} dias` : '—'} sub="Para atingir a meta" color="text-amber-400" />
            </div>

            {/* Operational Plan */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Plano Operacional Sugerido
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Max losses consecutivas</span>
                  <span className={`font-bold ${calc.maxConsecLosses >= 5 ? 'text-green-400' : calc.maxConsecLosses >= 3 ? 'text-amber-400' : 'text-red-400'}`}>
                    {calc.maxConsecLosses} stops seguidos
                  </span>
                </div>
                {calc.maxDailyConsecLosses !== null && (
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Max losses/dia (limite diário)</span>
                    <span className={`font-bold ${calc.maxDailyConsecLosses >= 3 ? 'text-green-400' : calc.maxDailyConsecLosses >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                      {calc.maxDailyConsecLosses} stops
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Risco total/dia</span>
                  <span className={`font-bold ${calc.dailyRiskOkVsLimit ? 'text-green-400' : 'text-red-400'}`}>
                    ${calc.dailyRiskTotal.toLocaleString()} {!calc.dailyRiskOkVsLimit && '⚠️ > limite diário'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Contratos sugeridos (ES)</span>
                  <span className="font-bold text-white">{calc.suggestedContracts} contrato(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ratio Meta/Drawdown</span>
                  <span className={`font-bold ${profitTargetPct <= maxDrawdownPct ? 'text-green-400' : profitTargetPct <= maxDrawdownPct * 1.5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {(profitTargetPct / maxDrawdownPct).toFixed(1)}x {profitTargetPct <= maxDrawdownPct ? '✅' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-2">
              {!calc.dailyRiskOkVsLimit && (
                <AlertRow icon={AlertTriangle} color="bg-red-500/10 border border-red-500/20 text-red-300" title="Risco diário excede o limite da mesa" detail={`Você arrisca $${calc.dailyRiskTotal.toLocaleString()}/dia mas o limite é $${calc.dailyLossLimit.toLocaleString()}. Reduza o risco por trade ou o número de trades.`} />
              )}
              {calc.expectedValuePerTrade <= 0 && (
                <AlertRow icon={AlertTriangle} color="bg-red-500/10 border border-red-500/20 text-red-300" title="Estratégia com EV negativo" detail="Com essa combinação de win rate e R:R, você perde dinheiro no longo prazo. Aumente o R:R ou o win rate." />
              )}
              {calc.maxConsecLosses < 3 && (
                <AlertRow icon={AlertTriangle} color="bg-orange-500/10 border border-orange-500/20 text-orange-300" title="Risco muito alto por trade" detail={`Com ${maxDrawdownPct}% de drawdown e ${riskPerTradePct}% por trade, apenas ${calc.maxConsecLosses} stops seguidos te eliminam. Reduza para 0.5-1% por trade.`} />
              )}
              {riskPerTradePct > 2 && (
                <AlertRow icon={Info} color="bg-amber-500/10 border border-amber-500/20 text-amber-300" title="Risco por trade elevado" detail="A maioria dos traders aprovados em prop firms usa entre 0.25% e 1% por trade. Considere reduzir." />
              )}
              {calc.isViable && calc.safetyScore >= 60 && (
                <AlertRow icon={TrendingUp} color="bg-green-500/10 border border-green-500/20 text-green-300" title="Plano matematicamente viável" detail={`Com consistência, você atinge a meta em ~${calc.daysNeeded} dias operando ${tradesPerDay} trade(s)/dia.`} />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}