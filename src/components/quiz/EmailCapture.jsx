import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EmailCapture({ onSubmit, isLoading }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit({ nome: nome.trim(), email: email.trim() });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Quase lá!
        </h2>
        <p className="mt-2 text-zinc-400">
          Informe seu e-mail para ver o ranking personalizado das mesas ideais pra você.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Seu nome (opcional)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="pl-11 py-6 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-amber-500 focus:ring-amber-500/20"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="email"
            required
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 py-6 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-amber-500 focus:ring-amber-500/20"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-6 rounded-xl text-lg shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Ver Meu Ranking
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
        <p className="text-xs text-zinc-600 text-center">
          Seus dados estão seguros. Sem spam, prometido.
        </p>
      </form>
    </motion.div>
  );
}