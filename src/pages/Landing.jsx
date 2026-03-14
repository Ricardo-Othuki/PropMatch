import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';
import Navbar from '../components/landing/Navbar';

export default function Landing() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      {/* Footer */}
      <footer className="py-8 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-zinc-600">
            PropMatch © {new Date().getFullYear()} · Buscador Inteligente de Prop Firms
          </p>
          <p className="text-xs text-zinc-700 mt-2">
            Este site não garante aprovação em nenhuma mesa proprietária. Os rankings são baseados em critérios objetivos e personalizados.
          </p>
        </div>
      </footer>
    </div>
  );
}