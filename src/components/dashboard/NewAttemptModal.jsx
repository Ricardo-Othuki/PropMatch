import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function NewAttemptModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    firm_name: '',
    firm_id: '',
    phase: 'fase_1',
    account_size: 100000,
    current_balance: 100000,
    max_drawdown_percent: 6,
    drawdown_type: 'eod',
    daily_loss_limit_percent: 2,
    profit_target_percent: 6,
    min_trading_days: 5,
    days_traded: 0,
    status: 'ativa',
  });
  const [saving, setSaving] = useState(false);
  const [useExisting, setUseExisting] = useState(false);

  const { data: firms = [] } = useQuery({
    queryKey: ['propfirms'],
    queryFn: () => base44.entities.PropFirm.list(),
  });

  const handleFirmSelect = (firmId) => {
    const firm = firms.find(f => f.id === firmId);
    if (firm) {
      setForm(prev => ({
        ...prev,
        firm_name: firm.name,
        firm_id: firmId,
        max_drawdown_percent: firm.max_drawdown_percent || 6,
        drawdown_type: firm.drawdown_type || 'eod',
        daily_loss_limit_percent: firm.daily_loss_limit_percent || 0,
        profit_target_percent: firm.profit_target_percent || 6,
        min_trading_days: firm.min_trading_days || 0,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.firm_name || !form.account_size) return;
    setSaving(true);
    await base44.entities.TradeAttempt.create({ ...form, current_balance: form.account_size });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Registrar Nova Tentativa</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Select from database or type manually */}
          <div className="flex gap-2 mb-2">
            <button onClick={() => setUseExisting(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!useExisting ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>Digitar mesa</button>
            <button onClick={() => setUseExisting(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${useExisting ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>Selecionar do banco</button>
          </div>

          {useExisting ? (
            <div>
              <Label className="text-zinc-400 text-sm">Selecionar Mesa</Label>
              <Select onValueChange={handleFirmSelect}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl">
                  <SelectValue placeholder="Escolha uma mesa" />
                </SelectTrigger>
                <SelectContent>
                  {firms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.firm_name && <p className="text-xs text-amber-400 mt-1">✓ Regras importadas automaticamente</p>}
            </div>
          ) : (
            <div>
              <Label className="text-zinc-400 text-sm">Nome da Mesa</Label>
              <Input value={form.firm_name} onChange={e => setForm(p => ({ ...p, firm_name: e.target.value }))} placeholder="Ex: Apex, Topstep..." className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-sm">Fase</Label>
              <Select value={form.phase} onValueChange={v => setForm(p => ({ ...p, phase: v }))}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fase_1">Fase 1</SelectItem>
                  <SelectItem value="fase_2">Fase 2</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-400 text-sm">Tamanho da Conta ($)</Label>
              <Input type="number" value={form.account_size} onChange={e => setForm(p => ({ ...p, account_size: Number(e.target.value) }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <Label className="text-zinc-400 text-sm">Drawdown Máx (%)</Label>
              <Input type="number" value={form.max_drawdown_percent} onChange={e => setForm(p => ({ ...p, max_drawdown_percent: Number(e.target.value) }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <Label className="text-zinc-400 text-sm">Meta de Lucro (%)</Label>
              <Input type="number" value={form.profit_target_percent} onChange={e => setForm(p => ({ ...p, profit_target_percent: Number(e.target.value) }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <Label className="text-zinc-400 text-sm">Limite Diário (%)</Label>
              <Input type="number" value={form.daily_loss_limit_percent} onChange={e => setForm(p => ({ ...p, daily_loss_limit_percent: Number(e.target.value) }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <Label className="text-zinc-400 text-sm">Dias Mínimos</Label>
              <Input type="number" value={form.min_trading_days} onChange={e => setForm(p => ({ ...p, min_trading_days: Number(e.target.value) }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <Label className="text-zinc-400 text-sm">Tipo de Drawdown</Label>
              <Select value={form.drawdown_type} onValueChange={v => setForm(p => ({ ...p, drawdown_type: v }))}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trailing">Trailing</SelectItem>
                  <SelectItem value="eod">End of Day</SelectItem>
                  <SelectItem value="static">Estático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.firm_name} className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl">
            {saving ? 'Salvando...' : 'Registrar Tentativa'}
          </Button>
        </div>
      </div>
    </div>
  );
}