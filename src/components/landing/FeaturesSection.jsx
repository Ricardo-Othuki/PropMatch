import React from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart3, Shield, Zap, TrendingUp, Brain, Calculator, LayoutDashboard, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Brain,
    title: 'Diagnóstico Inteligente',
    description: 'Quiz que detecta overtrading, risco mal calibrado e padrões de reprovação do seu perfil.',
    to: '/Quiz'
  },
  {
    icon: Target,
    title: 'Match Personalizado',
    description: 'Probabilidade real de aprovação por mesa, baseada no seu histórico e estilo.',
    to: '/Quiz'
  },
  {
    icon: Calculator,
    title: 'Simulador de Risco',
    description: 'Calcule o tamanho ideal de posição, stops máximos e plano operacional matemático.',
    to: '/RiskSimulator'
  },
  {
    icon: Filter,
    title: 'Ranking por Cenário',
    description: 'Filtre mesas por "Scalpers que operam notícia", "Melhor para iniciantes" e mais.',
    to: '/Ranking'
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard de Tentativas',
    description: 'Registre suas tentativas ativas e receba alertas antes de violar o drawdown.',
    to: '/Dashboard'
  },
  {
    icon: Shield,
    title: 'Alertas Preventivos',
    description: 'O sistema monitora seu saldo e avisa antes de você cruzar o limite de perda.',
    to: '/Dashboard'
  },
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
                {feature.to && (
                <Link to={feature.to} className="inline-block mt-3 text-xs text-amber-400 hover:text-amber-300 font-medium">
                  Acessar →
                </Link>
                )}
                </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}