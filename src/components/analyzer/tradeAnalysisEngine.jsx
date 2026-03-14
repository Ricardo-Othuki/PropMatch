/**
 * Motor de análise de trades
 * Detecta overtrading, drawdown diário, padrões e compara com regras de prop firms
 */

// Normaliza trades de diferentes formatos CSV
export function normalizeTrades(rawTrades) {
  return rawTrades.map((t, i) => {
    const pnl = parseFloat(t.pnl ?? t.profit ?? t.net_pnl ?? t['P&L'] ?? t.resultado ?? 0);
    const date = t.date ?? t.data ?? t.Date ?? t.DATA ?? '';
    const time = t.time ?? t.hora ?? t.Time ?? '';
    const qty = parseInt(t.quantity ?? t.qty ?? t.contratos ?? t.size ?? 1);
    const symbol = t.symbol ?? t.instrumento ?? t.Symbol ?? 'N/A';
    return { id: i, date: String(date).split('T')[0], time: String(time), symbol, pnl, qty };
  }).filter(t => t.date && !isNaN(t.pnl));
}

// Agrupa trades por dia
export function groupByDay(trades) {
  const days = {};
  for (const t of trades) {
    if (!days[t.date]) days[t.date] = [];
    days[t.date].push(t);
  }
  return days;
}

// Analisa um único dia
function analyzeDay(date, trades) {
  let runningPnl = 0;
  let peakPnl = 0;
  let maxDrawdown = 0;
  let maxConsecLosses = 0;
  let curConsecLosses = 0;
  let wins = 0;
  let losses = 0;

  for (const t of trades) {
    runningPnl += t.pnl;
    if (runningPnl > peakPnl) peakPnl = runningPnl;
    const dd = peakPnl - runningPnl;
    if (dd > maxDrawdown) maxDrawdown = dd;

    if (t.pnl > 0) { wins++; curConsecLosses = 0; }
    else if (t.pnl < 0) {
      losses++;
      curConsecLosses++;
      if (curConsecLosses > maxConsecLosses) maxConsecLosses = curConsecLosses;
    }
  }

  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalQty = trades.reduce((s, t) => s + (t.qty || 1), 0);
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
  const avgWin = wins > 0 ? trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0) / losses) : 0;
  const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

  return {
    date,
    tradeCount: trades.length,
    totalPnl,
    maxDrawdown,
    maxConsecLosses,
    wins,
    losses,
    winRate,
    avgWin,
    avgLoss,
    rrRatio,
    totalQty,
  };
}

// Análise completa
export function analyzeAllTrades(trades) {
  const byDay = groupByDay(trades);
  const dailyStats = Object.entries(byDay)
    .map(([date, dayTrades]) => analyzeDay(date, dayTrades))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDays = dailyStats.length;
  const profitableDays = dailyStats.filter(d => d.totalPnl > 0).length;
  const totalPnl = dailyStats.reduce((s, d) => s + d.totalPnl, 0);
  const totalTrades = trades.length;
  const avgTradesPerDay = totalDays > 0 ? Math.round(totalTrades / totalDays) : 0;
  const maxDailyLoss = Math.min(...dailyStats.map(d => d.totalPnl));
  const maxDailyProfit = Math.max(...dailyStats.map(d => d.totalPnl));

  // Overall drawdown from equity curve
  let equity = 0;
  let peakEquity = 0;
  let maxOverallDrawdown = 0;
  for (const t of trades) {
    equity += t.pnl;
    if (equity > peakEquity) peakEquity = equity;
    const dd = peakEquity - equity;
    if (dd > maxOverallDrawdown) maxOverallDrawdown = dd;
  }

  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const avgWin = wins > 0 ? trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0) / losses) : 0;
  const rrRatio = avgLoss > 0 ? (avgWin / avgLoss) : 0;

  // Overtrading detection (days with abnormally high trade count)
  const meanTrades = avgTradesPerDay;
  const overtradingDays = dailyStats.filter(d => d.tradeCount > Math.max(meanTrades * 2, 15));

  // Revenge trading (day that starts bad and has more trades in 2nd half)
  const revengeWarning = dailyStats.some(d => d.totalPnl < 0 && d.tradeCount > 10 && d.maxConsecLosses >= 3);

  return {
    dailyStats,
    totalDays,
    profitableDays,
    totalPnl,
    totalTrades,
    avgTradesPerDay,
    maxDailyLoss,
    maxDailyProfit,
    maxOverallDrawdown,
    wins,
    losses,
    winRate,
    avgWin,
    avgLoss,
    rrRatio,
    overtradingDays,
    revengeWarning,
  };
}

// Compara análise com regras de uma prop firm
export function compareWithFirm(analysis, firm, accountSize) {
  const results = [];
  const maxLossUSD = accountSize * (firm.max_drawdown_percent / 100);
  const dailyLimitUSD = firm.daily_loss_limit_percent > 0 ? accountSize * (firm.daily_loss_limit_percent / 100) : null;
  const profitTargetUSD = accountSize * (firm.profit_target_percent / 100);

  // Daily loss limit violations
  if (dailyLimitUSD) {
    const violations = analysis.dailyStats.filter(d => d.totalPnl < -dailyLimitUSD);
    if (violations.length > 0) {
      results.push({
        type: 'violation',
        icon: '🚨',
        title: `${violations.length} violação(ões) do limite diário`,
        detail: `Em ${violations.length} dia(s), você perdeu mais de $${dailyLimitUSD.toLocaleString()} (${firm.daily_loss_limit_percent}%). Isso eliminaria sua conta instantaneamente.`,
        days: violations.map(d => d.date),
      });
    } else {
      results.push({
        type: 'pass',
        icon: '✅',
        title: 'Limite diário respeitado',
        detail: `Em todos os ${analysis.totalDays} dias, suas perdas ficaram dentro do limite de $${dailyLimitUSD.toLocaleString()}/dia.`,
      });
    }
  }

  // Overall drawdown
  if (analysis.maxOverallDrawdown > maxLossUSD) {
    results.push({
      type: 'violation',
      icon: '💥',
      title: 'Drawdown máximo violado',
      detail: `Seu maior drawdown foi $${analysis.maxOverallDrawdown.toFixed(0)} vs limite de $${maxLossUSD.toLocaleString()} (${firm.max_drawdown_percent}%). Conta encerrada.`,
    });
  } else {
    const pct = ((analysis.maxOverallDrawdown / maxLossUSD) * 100).toFixed(0);
    results.push({
      type: pct > 75 ? 'warning' : 'pass',
      icon: pct > 75 ? '⚠️' : '✅',
      title: `Drawdown geral: ${pct}% do limite`,
      detail: `Você usou $${analysis.maxOverallDrawdown.toFixed(0)} de $${maxLossUSD.toLocaleString()} de drawdown máximo permitido.`,
    });
  }

  // Overtrading
  if (analysis.overtradingDays.length > 0) {
    results.push({
      type: 'warning',
      icon: '🔁',
      title: `Overtrading detectado em ${analysis.overtradingDays.length} dia(s)`,
      detail: `Dias com volume atípico: ${analysis.overtradingDays.map(d => `${d.date} (${d.tradeCount} trades)`).join(', ')}. Operar excessivamente aumenta custos e erros impulsivos.`,
    });
  }

  // Consistency rule
  if (firm.consistency_rule === 'rigorosa' || firm.consistency_rule === 'moderada') {
    const maxDayPnl = Math.max(...analysis.dailyStats.map(d => d.totalPnl));
    const totalPct = maxDayPnl / Math.max(analysis.totalPnl, 1);
    if (totalPct > 0.5) {
      results.push({
        type: 'warning',
        icon: '📊',
        title: 'Regra de consistência: atenção',
        detail: `Seu melhor dia representou ${(totalPct * 100).toFixed(0)}% do lucro total. Mesas com consistência ${firm.consistency_rule} geralmente exigem que nenhum dia represente mais de 30-40% do lucro.`,
      });
    } else {
      results.push({
        type: 'pass',
        icon: '✅',
        title: 'Consistência adequada',
        detail: `Distribuição de lucro entre os dias está dentro do aceitável para regra ${firm.consistency_rule}.`,
      });
    }
  }

  // Revenge trading
  if (analysis.revengeWarning) {
    results.push({
      type: 'warning',
      icon: '🧠',
      title: 'Possível revenge trading identificado',
      detail: 'Padrão de dias negativos com alto volume de trades após sequência de perdas. Isso indica operação emocional — o maior motivo de reprovação em prop firms.',
    });
  }

  // Progress toward profit target
  const progressPct = (analysis.totalPnl / profitTargetUSD) * 100;
  results.push({
    type: progressPct >= 100 ? 'pass' : progressPct >= 50 ? 'info' : 'info',
    icon: progressPct >= 100 ? '🏆' : '📈',
    title: `Progresso na meta: ${Math.max(0, progressPct).toFixed(0)}%`,
    detail: `Você lucrou $${analysis.totalPnl.toFixed(0)} de $${profitTargetUSD.toLocaleString()} necessários (${firm.profit_target_percent}% da conta).`,
  });

  return results;
}