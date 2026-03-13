/**
 * Motor de Matching & Diagnóstico - v2
 * Cruza perfil do trader com regras das mesas
 * Gera ranking, probabilidade de aprovação e diagnóstico
 */

// ──────────────────────────────────────────────
// DIAGNÓSTICO DE REPROVAÇÃO
// ──────────────────────────────────────────────
export function generateDiagnosis(answers) {
  const issues = [];
  const strengths = [];
  let approvalRisk = 0; // 0-100, higher = higher risk of failing
  let riskProfile = 'moderado';

  // Overtrading risk
  if (answers.trades_por_dia === 'acima_20') {
    issues.push({
      icon: '🚨',
      title: 'Alto risco de overtrading',
      detail: 'Fazer mais de 20 trades/dia indica operações por impulso. A maioria das mesas te derruba no drawdown antes da meta.'
    });
    approvalRisk += 30;
  } else if (answers.trades_por_dia === '10-20') {
    issues.push({
      icon: '⚠️',
      title: 'Tendência a overtrading',
      detail: 'Entre 10-20 trades/dia, o risco de violar drawdown por acumulação de pequenas perdas é alto.'
    });
    approvalRisk += 15;
  } else if (answers.trades_por_dia === 'ate_3') {
    strengths.push({ icon: '✅', title: 'Disciplina operacional', detail: 'Poucos trades por dia = menos exposição a erros impulsivos.' });
  }

  // Risk per trade
  if (answers.risco_por_trade === 'acima_2') {
    issues.push({
      icon: '🚨',
      title: 'Risco por trade muito alto',
      detail: 'Arriscar mais de 2% por trade é incompatível com a maioria das prop firms. 3-4 stops seguidos e você viola o drawdown.'
    });
    approvalRisk += 35;
    riskProfile = 'agressivo';
  } else if (answers.risco_por_trade === '1_2') {
    issues.push({
      icon: '⚠️',
      title: 'Risco por trade elevado',
      detail: 'Entre 1-2% por trade, você tem margem, mas precisa de boa sequência. Prefira mesas com drawdown mais generoso.'
    });
    approvalRisk += 15;
    riskProfile = 'moderado-agressivo';
  } else if (answers.risco_por_trade === 'menos_0.5') {
    strengths.push({ icon: '✅', title: 'Gestão de risco conservadora', detail: 'Risco baixo por trade é ideal para prop firms. Você tem margem para errar.' });
    riskProfile = 'conservador';
  }

  // Previous failures
  if (answers.ja_reprovou === true) {
    if (answers.motivo_reprovacao === 'overtrading') {
      issues.push({
        icon: '🔁',
        title: 'Padrão de overtrading identificado',
        detail: 'Você já reprovou por overtrading antes. Mesas com regra de consistência moderada/rigorosa podem te ajudar a se disciplinar — mas também te eliminar mais fácil.'
      });
      approvalRisk += 20;
    }
    if (answers.motivo_reprovacao === 'violacao_regra') {
      issues.push({
        icon: '📋',
        title: 'Violação de regra anterior',
        detail: 'Você já reprovou por não conhecer/respeitar as regras. Priorize mesas com menos restrições e leia o contrato completo antes.'
      });
      approvalRisk += 15;
    }
    if (answers.motivo_reprovacao === 'drawdown') {
      issues.push({
        icon: '📉',
        title: 'Drawdown foi seu algoz',
        detail: 'Você já estourou o drawdown antes. Mesas com trailing drawdown são mais perigosas pro seu perfil — prefira EOD ou estático.'
      });
      approvalRisk += 20;
    }
    if (answers.motivo_reprovacao === 'psicologico') {
      issues.push({
        icon: '🧠',
        title: 'Fator psicológico detectado',
        detail: 'Reprovou por questões emocionais (revenge trade, FOMO, etc.). Mesas sem limite de perda diária podem ser perigosas. Escolha regras mais rígidas pra te proteger de você mesmo.'
      });
      approvalRisk += 25;
    }
  } else if (answers.ja_reprovou === false) {
    strengths.push({ icon: '🏆', title: 'Histórico limpo', detail: 'Nunca reprovou ou é sua primeira tentativa — sem vícios a corrigir.' });
  }

  // Trading style vs rules compatibility
  if (answers.estilo_operacional === 'swing' && answers.ja_reprovou === true && answers.motivo_reprovacao === 'drawdown') {
    issues.push({
      icon: '🎯',
      title: 'Swing + Trailing = Combinação Perigosa',
      detail: 'Se você faz swing e já estourou drawdown, EVITE mesas com trailing drawdown. O stop vai subindo enquanto você está posicionado.'
    });
    approvalRisk += 10;
  }

  // Positive flags
  if (answers.tolerancia_drawdown === 'alta' && answers.risco_por_trade !== 'acima_2') {
    strengths.push({ icon: '💪', title: 'Resistência emocional', detail: 'Alta tolerância a drawdown sem risco excessivo é o perfil ideal para prop firms.' });
  }
  if (answers.objetivo_principal === 'estabilidade') {
    strengths.push({ icon: '🎯', title: 'Mentalidade de longo prazo', detail: 'Foco em estabilidade aumenta muito suas chances de manter a conta funded.' });
  }

  // Cap risk
  approvalRisk = Math.min(approvalRisk, 90);
  const approvalChance = Math.max(10, 100 - approvalRisk);

  // Determine risk profile label
  if (approvalRisk >= 60) riskProfile = 'agressivo';
  else if (approvalRisk >= 30) riskProfile = 'moderado';
  else riskProfile = 'conservador';

  return { issues, strengths, approvalChance, riskProfile };
}

// ──────────────────────────────────────────────
// PROBABILIDADE DE APROVAÇÃO POR MESA
// ──────────────────────────────────────────────
function calcApprovalProbability(answers, firm, baseChance) {
  let prob = baseChance;

  // Drawdown type compatibility
  if (answers.estilo_operacional === 'swing') {
    if (firm.drawdown_type === 'trailing') prob -= 20;
    if (firm.drawdown_type === 'static') prob += 10;
  }
  if (answers.estilo_operacional === 'scalper') {
    if (firm.drawdown_type === 'static') prob += 10;
    if (firm.daily_loss_limit_percent === 0) prob += 5;
  }

  // Previous failure pattern
  if (answers.motivo_reprovacao === 'drawdown' && firm.drawdown_type === 'trailing') prob -= 15;
  if (answers.motivo_reprovacao === 'overtrading' && firm.consistency_rule === 'rigorosa') prob -= 10;
  if (answers.motivo_reprovacao === 'psicologico' && firm.daily_loss_limit_percent > 0) prob += 10;

  // Firm difficulty
  if (firm.estimated_difficulty === 'facil') prob += 15;
  if (firm.estimated_difficulty === 'dificil') prob -= 15;
  if (firm.estimated_difficulty === 'muito_dificil') prob -= 25;

  // Phases
  if (firm.evaluation_phases === 1) prob += 10;
  if (firm.evaluation_phases >= 2) prob -= 10;

  // Consistency rule
  if (firm.consistency_rule === 'nenhuma') prob += 10;
  if (firm.consistency_rule === 'rigorosa') prob -= 15;

  // High risk per trade
  if (answers.risco_por_trade === 'acima_2') prob -= 20;
  if (answers.risco_por_trade === 'menos_0.5') prob += 10;

  // Trading volume vs daily loss limit
  if (answers.trades_por_dia === 'acima_20' && firm.daily_loss_limit_percent > 0) prob -= 10;

  // Profit target vs drawdown ratio (easier = higher)
  const ratio = firm.profit_target_percent / firm.max_drawdown_percent;
  if (ratio <= 0.75) prob += 10;
  if (ratio >= 1.5) prob -= 10;

  return Math.min(95, Math.max(5, Math.round(prob)));
}

// ──────────────────────────────────────────────
// MAIN MATCHING FUNCTION
// ──────────────────────────────────────────────
export function calculateMatch(answers, firms) {
  const { approvalChance: baseChance } = generateDiagnosis(answers);

  return firms
    .filter(f => f.active !== false)
    .map(firm => {
      let score = 0;
      let reasons = [];
      let warnings = [];

      // 1. Estilo operacional
      if (answers.estilo_operacional === 'scalper') {
        if (firm.hft_allowed) { score += 15; reasons.push('Permite HFT/scalping agressivo'); }
        if (firm.drawdown_type === 'static') { score += 10; reasons.push('Static drawdown - ideal para scalper'); }
        if (firm.drawdown_type === 'trailing') { score -= 5; warnings.push('Trailing drawdown difícil para scalpers'); }
        if (firm.daily_loss_limit_percent === 0) { score += 8; reasons.push('Sem limite de perda diária'); }
      }
      if (answers.estilo_operacional === 'intraday') {
        if (firm.drawdown_type === 'eod') { score += 10; reasons.push('EOD drawdown - perfeito para intraday'); }
        if (firm.drawdown_type === 'static') { score += 8; reasons.push('Static drawdown dá mais segurança'); }
        score += 5;
      }
      if (answers.estilo_operacional === 'swing') {
        if (firm.drawdown_type === 'static') { score += 15; reasons.push('Static drawdown - perfeito para swing'); }
        if (firm.drawdown_type === 'trailing') { score -= 15; warnings.push('⚠️ Trailing drawdown é PERIGOSO para swing'); }
        if (firm.min_trading_days <= 5) { score += 5; }
      }

      // 2. Opera notícia
      if (answers.opera_noticia === true) {
        if (firm.news_trading_allowed) { score += 10; reasons.push('Permite operar em notícia'); }
        else { score -= 20; warnings.push('❌ NÃO permite operar em notícia'); }
      }

      // 3. Volume de trades
      if (answers.trades_por_dia === 'acima_20') {
        if (firm.consistency_rule === 'nenhuma') { score += 5; reasons.push('Sem regra de consistência - ajuda quem opera muito'); }
        if (firm.daily_loss_limit_percent === 0) { score += 8; reasons.push('Sem limite diário - seguro para alto volume'); }
        if (firm.consistency_rule === 'rigorosa') { score -= 15; warnings.push('Regra de consistência rigorosa vs alto volume de trades'); }
      }
      if (answers.trades_por_dia === 'ate_3') {
        score += 5; // disciplina favorece qualquer mesa
      }

      // 4. Risco por trade
      if (answers.risco_por_trade === 'acima_2') {
        if (firm.max_drawdown_percent >= 8) { score += 8; reasons.push('Drawdown generoso suporta risco alto'); }
        if (firm.max_drawdown_percent < 5) { score -= 15; warnings.push('⚠️ Drawdown apertado vs risco alto por trade'); }
      }
      if (answers.risco_por_trade === 'menos_0.5') {
        score += 5; reasons.push('Risco conservador - compatível com qualquer mesa');
      }

      // 5. Histórico de reprovação
      if (answers.motivo_reprovacao === 'drawdown') {
        if (firm.drawdown_type === 'trailing') { score -= 15; warnings.push('Você já estourou drawdown - evite trailing!'); }
        if (firm.drawdown_type === 'static') { score += 12; reasons.push('Static drawdown - mais seguro para seu histórico'); }
        if (firm.max_drawdown_percent >= 8) { score += 8; reasons.push('Drawdown generoso dá mais margem'); }
      }
      if (answers.motivo_reprovacao === 'violacao_regra') {
        if (firm.evaluation_phases === 1) { score += 8; reasons.push('1 fase = menos regras para lembrar'); }
        if (firm.consistency_rule === 'nenhuma') { score += 10; reasons.push('Sem consistência - menos restrições'); }
      }
      if (answers.motivo_reprovacao === 'psicologico') {
        if (firm.daily_loss_limit_percent > 0) { score += 8; reasons.push('Limite diário te protege de revenge trade'); }
      }

      // 6. Contratos
      const contractNeeds = { '1-2': 5, '3-5': 10, '6-10': 15, '10+': 25 };
      const needed = contractNeeds[answers.contratos_media] || 5;
      if (firm.max_contracts >= needed) {
        score += 8; reasons.push(`Suporta até ${firm.max_contracts} contratos`);
      } else {
        score -= 12; warnings.push(`Limite de ${firm.max_contracts} contratos pode ser baixo`);
      }

      // 7. Tolerância a drawdown
      if (answers.tolerancia_drawdown === 'baixa') {
        if (firm.drawdown_type === 'static') { score += 12; reasons.push('Static drawdown - mais previsível'); }
        if (firm.max_drawdown_percent >= 6) { score += 8; reasons.push('Drawdown generoso'); }
        if (firm.max_drawdown_percent < 4) { score -= 5; warnings.push('Drawdown apertado'); }
      }
      if (answers.tolerancia_drawdown === 'alta') {
        score += 5;
      }

      // 8. Objetivo principal
      if (answers.objetivo_principal === 'passar_rapido') {
        if (firm.evaluation_phases === 1) { score += 12; reasons.push('Apenas 1 fase de avaliação'); }
        if (firm.evaluation_phases >= 2) { score -= 8; warnings.push(`${firm.evaluation_phases} fases de avaliação`); }
        if (firm.min_trading_days <= 5) { score += 8; reasons.push(`Mínimo de ${firm.min_trading_days || 0} dias`); }
        if (firm.consistency_rule === 'nenhuma') { score += 10; reasons.push('Sem regra de consistência'); }
        const ratio = firm.profit_target_percent / firm.max_drawdown_percent;
        if (ratio <= 1) { score += 8; reasons.push('Meta ≤ Drawdown (mais fácil de passar)'); }
      }
      if (answers.objetivo_principal === 'estabilidade') {
        if (firm.drawdown_type === 'static') { score += 12; reasons.push('Static drawdown = estabilidade real'); }
        if (firm.max_drawdown_percent >= 6) { score += 8; reasons.push('Margem confortável de drawdown'); }
        if (firm.scaling_plan) { score += 5; reasons.push('Plano de escalonamento'); }
      }
      if (answers.objetivo_principal === 'sacar_rapido') {
        if (firm.payout_frequency === 'sob_demanda') { score += 15; reasons.push('🔥 Saque sob demanda!'); }
        if (firm.payout_frequency === 'semanal') { score += 12; reasons.push('Saque semanal'); }
        if (firm.payout_frequency === 'quinzenal') { score += 6; }
        if (firm.payout_split >= 90) { score += 10; reasons.push(`${firm.payout_split}% de payout`); }
        if (firm.payout_split === 100) { score += 5; }
      }

      // 9. Experiência
      if (answers.experiencia === 'iniciante') {
        if (firm.estimated_difficulty === 'facil') { score += 10; reasons.push('Dificuldade baixa - ideal para iniciantes'); }
        if (firm.estimated_difficulty === 'dificil' || firm.estimated_difficulty === 'muito_dificil') {
          score -= 8; warnings.push('Dificuldade alta para o seu nível');
        }
        if (firm.consistency_rule === 'nenhuma' || firm.consistency_rule === 'leve') {
          score += 5; reasons.push('Regras simples e flexíveis');
        }
      }
      if (answers.experiencia === 'avancado') {
        if (firm.max_contracts >= 20) score += 5;
        if (firm.scaling_plan) { score += 5; reasons.push('Escalonamento disponível'); }
      }

      // 10. Orçamento
      if (answers.orcamento === 'ate_100' || answers.orcamento === '100_300') {
        if (firm.price_range === 'barato') { score += 8; reasons.push('Preço acessível para seu orçamento'); }
        if (firm.price_range === 'caro') { score -= 12; warnings.push('Avaliação cara para seu orçamento'); }
      }
      if (answers.orcamento === 'acima_500') {
        if (firm.price_range === 'caro') score += 3;
      }

      // Bonus
      if (firm.payout_split === 100) score += 5;
      if (firm.consistency_rule === 'nenhuma') score += 3;

      reasons = [...new Set(reasons)].slice(0, 4);
      warnings = [...new Set([...warnings, ...(firm.warnings || []).slice(0, 1)])].slice(0, 3);

      const approvalProbability = calcApprovalProbability(answers, firm, baseChance);

      return {
        firm,
        score: Math.max(score, 0),
        reasons,
        warnings,
        approvalProbability,
      };
    })
    .sort((a, b) => b.score - a.score);
}