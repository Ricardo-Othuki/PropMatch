import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RankingCard from '../components/results/RankingCard';
import DiagnosisPanel from '../components/results/DiagnosisPanel';
import { generateDiagnosis } from '../components/matchingEngine';

export default function Results() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('propMatchResults');
    const storedAnswers = sessionStorage.getItem('propMatchAnswers');

    if (storedResults && storedAnswers) {
      setRanking(JSON.parse(storedResults));
      const answers = JSON.parse(storedAnswers);
      setDiagnosis(generateDiagnosis(answers));
    } else {
      navigate('/Quiz');
    }
  }, [navigate]);

  if (!ranking.length || !diagnosis) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Topbar */}
      <div className="border-b border-zinc-900 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/Landing')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Início
          </button>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <Link to="/Quiz">
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Refazer
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <span className="text-sm font-medium text-amber-300">Resultado personalizado</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Seu diagnóstico +{' '}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">ranking</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-sm max-w-xl mx-auto">
            Analisamos seu perfil, identificamos seus riscos e mapeamos as mesas com maior probabilidade real de aprovação.
          </p>
        </motion.div>

        {/* Diagnosis first */}
        <DiagnosisPanel diagnosis={diagnosis} />

        {/* Ranking */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">Ranking personalizado</h2>
          <p className="text-sm text-zinc-500">Ordenado por compatibilidade com seu perfil</p>
        </div>

        <div className="space-y-4">
          {ranking.map((match, index) => (
            <RankingCard
              key={match.firm.id}
              match={match}
              position={index}
              delay={0.1 + index * 0.08}
            />
          ))}
        </div>

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">Quer comparar todos os detalhes?</h3>
          <p className="text-zinc-400 text-sm mb-6">Explore todas as mesas com filtros avançados.</p>
          <Link to="/Explorer">
            <Button className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl px-8">
              <Search className="w-4 h-4 mr-2" /> Explorar Todas as Mesas
            </Button>
          </Link>
        </motion.div>

        <p className="mt-8 text-xs text-zinc-700 text-center">
          Probabilidades estimadas com base no seu perfil. Nenhuma recomendação garante aprovação.
        </p>
      </div>
    </div>
  );
}