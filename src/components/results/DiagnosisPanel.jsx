import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const riskColors = {
  conservador: { bar: 'bg-green-500', text: 'text-green-400', label: 'Conservador', bg: 'bg-green-500/10 border-green-500/20' },
  moderado: { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Moderado', bg: 'bg-amber-500/10 border-amber-500/20' },
  'moderado-agressivo': { bar: 'bg-orange-500', text: 'text-orange-400', label: 'Moderado-Agressivo', bg: 'bg-orange-500/10 border-orange-500/20' },
  agressivo: { bar: 'bg-red-500', text: 'text-red-400', label: 'Agressivo', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function DiagnosisPanel({ diagnosis }) {
  const { issues, strengths, approvalChance, riskProfile } = diagnosis;
  const riskStyle = riskColors[riskProfile] || riskColors['moderado'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Diagnóstico do Seu Perfil</h2>
          <p className="text-sm text-zinc-500">Análise baseada nas suas respostas</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Approval Probability Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Probabilidade média de aprovação</span>
            <span className={`text-2xl font-bold ${approvalChance >= 60 ? 'text-green-400' : approvalChance >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {approvalChance}%
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${approvalChance >= 60 ? 'bg-green-500' : approvalChance >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${approvalChance}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            {approvalChance >= 70 ? 'Seu perfil tem ótimas chances de aprovação nas mesas certas.' 
            : approvalChance >= 45 ? 'Chances razoáveis. Escolha bem a mesa e siga o plano.'
            : 'Atenção: seu perfil tem fatores de risco relevantes. Leia os diagnósticos abaixo.'}
          </p>
        </div>

        {/* Risk Profile Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${riskStyle.bg} ${riskStyle.text}`}>
          <span>Perfil de Risco:</span>
          <span className="font-bold">{riskStyle.label}</span>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Pontos de atenção críticos
            </h3>
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-4 rounded-xl bg-red-500/5 border border-red-500/15"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{issue.icon}</span>
                    <div>
                      <div className="font-semibold text-white text-sm">{issue.title}</div>
                      <div className="text-xs text-zinc-400 mt-1 leading-relaxed">{issue.detail}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Pontos fortes do seu perfil
            </h3>
            <div className="space-y-2">
              {strengths.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="p-3 rounded-xl bg-green-500/5 border border-green-500/15 flex items-start gap-3"
                >
                  <span className="text-lg flex-shrink-0">{s.icon}</span>
                  <div>
                    <div className="font-semibold text-white text-sm">{s.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{s.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}