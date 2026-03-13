import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Pare de escolher mesa
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
            no escuro
          </span>
        </h2>
        <p className="mt-6 text-lg text-zinc-400">
          Faça o quiz agora, é rápido e gratuito. Descubra qual prop firm foi feita pro seu perfil.
        </p>
        <Link to="/Quiz" className="inline-block mt-10">
          <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-lg px-10 py-6 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 transition-all">
            Começar o Quiz Agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}