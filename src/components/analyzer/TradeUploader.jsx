import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeTrades } from './tradeAnalysisEngine';

const TRADE_SCHEMA = {
  type: 'object',
  properties: {
    trades: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Trade date YYYY-MM-DD' },
          time: { type: 'string', description: 'Trade time HH:MM' },
          symbol: { type: 'string', description: 'Instrument symbol' },
          pnl: { type: 'number', description: 'Profit or loss in USD for this trade' },
          qty: { type: 'number', description: 'Number of contracts or shares' },
        }
      }
    }
  }
};

const SAMPLE_CSV = `date,time,symbol,pnl,qty
2024-01-15,09:32,ES,-120,1
2024-01-15,10:05,ES,210,1
2024-01-15,10:45,ES,-85,1
2024-01-15,11:20,ES,340,2
2024-01-15,13:00,ES,-160,1
2024-01-16,09:35,ES,450,1
2024-01-16,10:15,ES,-200,1
2024-01-16,11:00,ES,-180,1
2024-01-16,11:30,ES,-220,1
2024-01-16,12:00,ES,-150,2
2024-01-17,09:30,ES,320,1
2024-01-17,10:10,ES,280,1
2024-01-17,11:00,ES,180,1`;

export default function TradeUploader({ onTradesLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const processFile = async (file) => {
    setLoading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: TRADE_SCHEMA,
      });
      if (result.status !== 'success' || !result.output) throw new Error('Não foi possível extrair os dados do arquivo.');
      const raw = result.output.trades ?? result.output ?? [];
      const trades = normalizeTrades(Array.isArray(raw) ? raw : [raw]);
      if (trades.length === 0) throw new Error('Nenhum trade encontrado. Verifique o formato do arquivo.');
      onTradesLoaded(trades, file.name);
    } catch (e) {
      setError(e.message || 'Erro ao processar arquivo.');
    }
    setLoading(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'json'].includes(ext)) {
      setError('Formato não suportado. Use CSV, Excel (.xlsx) ou JSON.');
      return;
    }
    processFile(file);
  };

  const loadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const file = new File([blob], 'sample_trades.csv', { type: 'text/csv' });
    processFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !loading && fileRef.current.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-10 text-center
          ${dragOver ? 'border-amber-400 bg-amber-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900'}`}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-zinc-400 font-medium">Analisando seus trades com IA...</p>
            <p className="text-zinc-600 text-sm">Isso pode levar alguns segundos</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Arraste ou clique para fazer upload</p>
              <p className="text-zinc-500 text-sm mt-1">CSV, Excel (.xlsx), JSON — qualquer exportação de corretora</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Supported formats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { name: 'Tradovate', format: 'CSV export', emoji: '📊' },
          { name: 'Rithmic', format: 'Trade Report', emoji: '📈' },
          { name: 'NinjaTrader', format: 'Performance CSV', emoji: '🎯' },
        ].map(b => (
          <div key={b.name} className="rounded-xl bg-zinc-800/40 border border-zinc-700/50 p-3">
            <div className="text-xl mb-1">{b.emoji}</div>
            <div className="text-white text-xs font-semibold">{b.name}</div>
            <div className="text-zinc-600 text-xs">{b.format}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs text-zinc-600">ou</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <button onClick={loadSample} disabled={loading} className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-sm flex items-center justify-center gap-2">
        <FileText className="w-4 h-4" /> Usar dados de exemplo (demo)
      </button>

      {/* API notice */}
      <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/40 p-4 text-xs text-zinc-500">
        <span className="text-zinc-400 font-semibold">🔗 Conexão direta via API (Rithmic/Tradovate)</span> — disponível no plano Builder+. Permite sincronização automática do histórico sem exportar arquivos.
      </div>
    </div>
  );
}