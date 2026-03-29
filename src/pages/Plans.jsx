import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    name: 'Plano Essencial',
    price: 'R$49/mês',
    features: [
      'Acesso à Plataforma Base',
      'Ranking de Mesas',
      'Explorar Mesas',
      'Simulador de Risco',
      'Suporte Padrão',
    ],
    buttonText: 'Assinar Essencial',
    isPopular: false,
  },
  {
    name: 'Plano Premium',
    price: 'R$99/mês',
    features: [
      'Todos os recursos do Essencial',
      'Dashboard de Tentativas',
      'Analisador de Trades (CSV)',
      'Diagnóstico Inteligente (Quiz)',
      'Match Personalizado',
      'Assistente IA Financeiro',
      'Suporte Prioritário',
      'Acesso a Novas Ferramentas',
    ],
    buttonText: 'Assinar Premium',
    isPopular: true,
  },
];

export default function Plans() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-12">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Planos e Preços</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Escolha seu Plano para o Sucesso
          </h1>
          <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
            Desbloqueie ferramentas avançadas para dominar o mercado de prop firms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="h-full"
            >
              <Card className={`relative flex flex-col h-full rounded-2xl ${plan.isPopular ? 'border-amber-500 bg-zinc-900 shadow-xl shadow-amber-500/10' : 'border-zinc-800 bg-zinc-900/60'}`}>
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <Crown className="w-3 h-3" /> Mais Popular
                  </div>
                )}
                <CardHeader className="text-center pt-8 pb-4">
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-amber-400 text-3xl font-extrabold mt-2">{plan.price}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-2 px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6 px-6 pb-8">
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className={`w-full text-base font-semibold rounded-xl py-5 ${plan.isPopular ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-xs mt-10">
          Ao assinar, você concorda com nossos termos de uso. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  );
}