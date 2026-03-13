/**
 * Motor de Matching - Cruza perfil do trader com regras das mesas
 * Retorna ranking ordenado por pontuação
 */

export function calculateMatch(answers, firms) {
  return firms
    .filter(f => f.active !== false)
    .map(firm => {
      let score = 0;
      let reasons = [];
      let warnings = [];

      // 1. Estilo operacional vs regras
      if (answers.estilo_operacional === 'scalper') {
        if (firm.hft_allowed) { score += 15; reasons.push('Permite HFT/scalping agressivo'); }
        if (firm.drawdown_type === 'static') { score += 10; reasons.push('Static drawdown - ideal para scalper'); }
        if (firm.drawdown_type === 'trailing') { score -= 5; warnings.push('Trailing drawdown pode ser difícil para scalpers'); }
        if (firm.daily_loss_limit_percent === 0) { score += 8; reasons.push('Sem limite de perda diária'); }
      }
      if (answers.estilo_operacional === 'intraday') {
        if (firm.drawdown_type === 'eod') { score += 10; reasons.push('EOD drawdown - bom para intraday'); }
        if (firm.drawdown_type === 'static') { score += 8; reasons.push('Static drawdown dá mais segurança'); }
        score += 5;
      }
      if (answers.estilo_operacional === 'swing') {
        if (firm.drawdown_type === 'static') { score += 15; reasons.push('Static drawdown - perfeito para swing'); }
        if (firm.drawdown_type === 'trailing') { score -= 10; warnings.push('Trailing drawdown é ruim para swing trade'); }
        if (firm.min_trading_days <= 5) { score += 5; }
      }

      // 2. Opera notícia
      if (answers.opera_noticia === true) {
        if (firm.news_trading_allowed) { score += 10; reasons.push('Permite operar em notícia'); }
        else { score -= 15; warnings.push('NÃO permite operar em notícia'); }
      }

      // 3. Contratos
      const contractNeeds = { '1-2': 5, '3-5': 10, '6-10': 15, '10+': 25 };
      const needed = contractNeeds[answers.contratos_media] || 5;
      if (firm.max_contracts >= needed) {
        score += 8; reasons.push(`Suporta até ${firm.max_contracts} contratos`);
      } else {
        score -= 10; warnings.push(`Limite de ${firm.max_contracts} contratos pode ser baixo`);
      }

      // 4. Tolerância a drawdown
      if (answers.tolerancia_drawdown === 'baixa') {
        if (firm.drawdown_type === 'static') { score += 12; reasons.push('Static drawdown - mais seguro'); }
        if (firm.max_drawdown_percent >= 6) { score += 8; reasons.push('Drawdown generoso'); }
        if (firm.max_drawdown_percent < 4) { score -= 5; warnings.push('Drawdown apertado'); }
      }
      if (answers.tolerancia_drawdown === 'alta') {
        if (firm.drawdown_type === 'trailing') { score += 5; }
        score += 5;
      }

      // 5. Objetivo principal
      if (answers.objetivo_principal === 'passar_rapido') {
        if (firm.evaluation_phases === 1) { score += 12; reasons.push('Apenas 1 fase de avaliação'); }
        if (firm.evaluation_phases >= 2) { score -= 8; warnings.push(`${firm.evaluation_phases} fases de avaliação`); }
        if (firm.min_trading_days <= 5) { score += 8; reasons.push(`Apenas ${firm.min_trading_days} dias mínimos`); }
        if (firm.min_trading_days === 0) { score += 5; reasons.push('Sem dias mínimos!'); }
        if (firm.consistency_rule === 'nenhuma') { score += 10; reasons.push('Sem regra de consistência'); }
        const ratio = firm.profit_target_percent / firm.max_drawdown_percent;
        if (ratio <= 1) { score += 8; reasons.push('Meta de lucro <= Drawdown (mais fácil)'); }
      }
      if (answers.objetivo_principal === 'estabilidade') {
        if (firm.drawdown_type === 'static') { score += 12; reasons.push('Static drawdown = estabilidade'); }
        if (firm.max_drawdown_percent >= 6) { score += 8; reasons.push('Margem de drawdown confortável'); }
        if (firm.scaling_plan) { score += 5; reasons.push('Plano de escalonamento'); }
      }
      if (answers.objetivo_principal === 'sacar_rapido') {
        if (firm.payout_frequency === 'sob_demanda') { score += 15; reasons.push('Saque sob demanda!'); }
        if (firm.payout_frequency === 'semanal') { score += 12; reasons.push('Saque semanal'); }
        if (firm.payout_frequency === 'quinzenal') { score += 6; }
        if (firm.payout_split >= 90) { score += 10; reasons.push(`${firm.payout_split}% de payout`); }
        if (firm.payout_split === 100) { score += 5; reasons.push('Payout total de 100%!'); }
      }

      // 6. Experiência
      if (answers.experiencia === 'iniciante') {
        if (firm.estimated_difficulty === 'facil') { score += 10; reasons.push('Dificuldade baixa - bom para iniciantes'); }
        if (firm.estimated_difficulty === 'dificil' || firm.estimated_difficulty === 'muito_dificil') {
          score -= 8; warnings.push('Dificuldade alta para iniciantes');
        }
        if (firm.consistency_rule === 'nenhuma' || firm.consistency_rule === 'leve') {
          score += 5; reasons.push('Regras mais flexíveis');
        }
      }
      if (answers.experiencia === 'avancado') {
        if (firm.max_contracts >= 20) { score += 5; }
        if (firm.scaling_plan) { score += 5; }
      }

      // 7. Orçamento
      if (answers.orcamento === 'ate_100' || answers.orcamento === '100_300') {
        if (firm.price_range === 'barato') { score += 8; reasons.push('Preço acessível'); }
        if (firm.price_range === 'caro') { score -= 10; warnings.push('Avaliação cara'); }
      }
      if (answers.orcamento === 'acima_500') {
        if (firm.price_range === 'caro') { score += 3; }
      }

      // 8. Bônus geral de qualidade
      if (firm.payout_split === 100) score += 5;
      if (firm.consistency_rule === 'nenhuma') score += 3;

      // Remove duplicate reasons/warnings
      reasons = [...new Set(reasons)];
      warnings = [...new Set(warnings)];

      return {
        firm,
        score: Math.max(score, 0),
        reasons: reasons.slice(0, 4),
        warnings: [...warnings.slice(0, 2), ...(firm.warnings || []).slice(0, 1)]
      };
    })
    .sort((a, b) => b.score - a.score);
}