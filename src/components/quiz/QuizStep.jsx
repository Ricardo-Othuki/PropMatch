import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizStep({ step, totalSteps, question, description, options, value, onChange, icon: Icon }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-zinc-500 mb-2">
            <span>Pergunta {step} de {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-amber-400" />
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{question}</h2>
          {description && <p className="mt-2 text-zinc-400">{description}</p>}
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                value === option.value
                  ? 'bg-amber-500/10 border-amber-500/40 text-white'
                  : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  value === option.value ? 'border-amber-400' : 'border-zinc-600'
                }`}>
                  {value === option.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-zinc-500 mt-0.5">{option.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}