import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FirmCompareCard from '../components/explorer/FirmCompareCard';

export default function Explorer() {
  const [search, setSearch] = useState('');
  const [drawdownFilter, setDrawdownFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('payout');

  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['propfirms'],
    queryFn: () => base44.entities.PropFirm.list(),
  });

  const filteredFirms = firms
    .filter(f => f.active !== false)
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()))
    .filter(f => drawdownFilter === 'all' || f.drawdown_type === drawdownFilter)
    .filter(f => difficultyFilter === 'all' || f.estimated_difficulty === difficultyFilter)
    .sort((a, b) => {
      if (sortBy === 'payout') return (b.payout_split || 0) - (a.payout_split || 0);
      if (sortBy === 'drawdown') return (b.max_drawdown_percent || 0) - (a.max_drawdown_percent || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/Landing" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <Link to="/Quiz">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg">
              Fazer o Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Explorar Prop Firms
          </h1>
          <p className="mt-2 text-zinc-400">
            Compare todas as mesas em detalhes. {firms.filter(f => f.active !== false).length} mesas disponíveis.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar mesa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl"
            />
          </div>
          <div className="flex gap-3">
            <Select value={drawdownFilter} onValueChange={setDrawdownFilter}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Drawdown" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="trailing">Trailing</SelectItem>
                <SelectItem value="eod">End of Day</SelectItem>
                <SelectItem value="static">Estático</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payout">Maior Payout</SelectItem>
                <SelectItem value="drawdown">Maior Drawdown</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFirms.map(firm => (
              <FirmCompareCard key={firm.id} firm={firm} />
            ))}
          </div>
        )}

        {!isLoading && filteredFirms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500">Nenhuma mesa encontrada com esses filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}