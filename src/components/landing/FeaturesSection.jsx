import React from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart3, Shield, Zap, TrendingUp, Brain } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Quiz Inteligente',
    description: 'Perguntas precisas sobre seu estilo operacional, objetivos e tolerância a risco.'
  },
  {
    icon: Target,
    title: 'Match Personalizado',
    description: 'Algoritmo que cruza seu perfil com as regras reais de cada mesa proprietária.'
  },
  {
    icon: BarChart3,
    title: 'Ranking Transparente',
    description: 'Ranking claro com motivos, destaques e alertas para cada mesa recomendada.'
  },
  {
    icon: Shield,
    title: 'Análise de Risco',
    description: 'Avaliação de drawdown, consistência, payout e dificuldade de aprovação.'
  },
  {
    icon: TrendingUp,
    title: 'Comparador de Mesas',
    description: 'Compare mesas lado a lado em todos os critérios que importam.'
  },
  {
    icon: Zap,
    title: 'Resultado Instantâneo',
    description: 'Em menos de 2 minutos você sabe qual mesa é ideal pro seu perfil.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Como funciona
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Um sistema inteligente que analisa seu perfil e encontra a mesa proprietária perfeita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:border-amber-500/30 transition-all duration-300 hover:bg-zinc-800"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}