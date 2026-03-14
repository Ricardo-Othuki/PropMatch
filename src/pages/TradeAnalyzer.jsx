import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import TradeUploader from '../components/analyzer/TradeUploader';
import AnalysisReport from '../components/analyzer/AnalysisReport';
import { analyzeAllTrades } from '../components/analyzer/tradeAnalysisEngine';

export default function TradeAnalyzer() {
  const [trades, setTrades] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleTradesLoaded = (rawTrades, name) => {
    const result = analyzeAllTrades(rawTrades);
    setTrades(rawTrades);
    setAnalysis(result);
    setFileName(name);
  };

  const handleReset = () => {
    setTrades(null);
    setAnalysis(null);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-900 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/Landing" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Analisador de Trades</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Analise seu histórico</h1>
          <p className="mt-2 text-zinc-400">
            Faça upload da exportação da sua corretora e descubra se seu comportamento passaria em uma prop firm.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!analysis ? (
            <TradeUploader onTradesLoaded={handleTradesLoaded} />
          ) : (
            <AnalysisReport analysis={analysis} fileName={fileName} onReset={handleReset} />
          )}
        </motion.div>
      </div>
    </div>
  );
}