import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Activity, Newspaper, BarChart2, Target, Crosshair, GraduationCap, Wallet } from 'lucide-react';
import QuizStep from '../components/quiz/QuizStep';
import EmailCapture from '../components/quiz/EmailCapture';
import { calculateMatch } from '../components/matchingEngine';

const QUESTIONS = [
  {
    key: 'estilo_operacional',
    question: 'Qual seu estilo operacional?',
    description: 'Como você opera no dia a dia',
    icon: Activity,
    options: [
      { value: 'scalper', label: 'Scalper', description: 'Operações rápidas, poucos segundos a minutos' },
      { value: 'intraday', label: 'Intraday / Day Trade', description: 'Operações ao longo do dia, fecha tudo antes do fim' },
      { value: 'swing', label: 'Swing Trade', description: 'Mantém posições por dias ou semanas' },
    ]
  },
  {
    key: 'opera_noticia',
    question: 'Você opera em momentos de notícia?',
    description: 'Payroll, FOMC, CPI e outros eventos',
    icon: Newspaper,
    options: [
      { value: true, label: 'Sim, opero notícia', description: 'Aproveito a volatilidade dos eventos' },
      { value: false, label: 'Não, evito notícias', description: 'Prefiro operar em momentos mais calmos' },
    ]
  },
  {
    key: 'contratos_media',
    question: 'Quantos contratos você costuma usar?',
    description: 'Média por operação',
    icon: BarChart2,
    options: [
      { value: '1-2', label: '1 a 2 contratos', description: 'Operações leves' },
      { value: '3-5', label: '3 a 5 contratos', description: 'Operações moderadas' },
      { value: '6-10', label: '6 a 10 contratos', description: 'Operações pesadas' },
      { value: '10+', label: 'Mais de 10', description: 'Operações agressivas' },
    ]
  },
  {
    key: 'tolerancia_drawdown',
    question: 'Qual sua tolerância a drawdown?',
    description: 'O quanto você aguenta de perda antes de ficar desconfortável',
    icon: Target,
    options: [
      { value: 'baixa', label: 'Baixa', description: 'Preciso de margem confortável, não gosto de pressão' },
      { value: 'media', label: 'Média', description: 'Consigo lidar com drawdown moderado' },
      { value: 'alta', label: 'Alta', description: 'Tenho controle emocional, aguento pressão' },
    ]
  },
  {
    key: 'objetivo_principal',
    question: 'Qual seu objetivo principal?',
    description: 'O que mais importa pra você agora',
    icon: Crosshair,
    options: [
      { value: 'passar_rapido', label: 'Passar rápido na avaliação', description: 'Quero ser aprovado o mais rápido possível' },
      { value: 'estabilidade', label: 'Estabilidade na conta funded', description: 'Quero operar com segurança depois de aprovado' },
      { value: 'sacar_rapido', label: 'Sacar o mais rápido possível', description: 'Quero receber meu lucro logo' },
    ]
  },
  {
    key: 'experiencia',
    question: 'Qual seu nível de experiência?',
    description: 'Seja honesto, isso ajuda no match',
    icon: GraduationCap,
    options: [
      { value: 'iniciante', label: 'Iniciante', description: 'Menos de 1 ano operando' },
      { value: 'intermediario', label: 'Intermediário', description: '1 a 3 anos de experiência' },
      { value: 'avancado', label: 'Avançado', description: 'Mais de 3 anos operando' },
    ]
  },
  {
    key: 'orcamento',
    question: 'Quanto pretende investir na avaliação?',
    description: 'Valor em dólares para a taxa da avaliação',
    icon: Wallet,
    options: [
      { value: 'ate_100', label: 'Até $100', description: 'Orçamento enxuto' },
      { value: '100_300', label: '$100 a $300', description: 'Orçamento médio' },
      { value: '300_500', label: '$300 a $500', description: 'Orçamento confortável' },
      { value: 'acima_500', label: 'Acima de $500', description: 'Sem restrição de orçamento' },
    ]
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: firms = [] } = useQuery({
    queryKey: ['propfirms'],
    queryFn: () => base44.entities.PropFirm.list(),
  });

  const isQuizComplete = step >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.key]: value }));
    // Auto-advance after selection
    setTimeout(() => {
      setStep(prev => prev + 1);
    }, 300);
  };

  const handleEmailSubmit = async ({ nome, email }) => {
    setIsSubmitting(true);
    const ranking = calculateMatch(answers, firms);
    const topFirmIds = ranking.slice(0, 3).map(r => String(r.firm.id));

    await base44.entities.QuizSubmission.create({
      ...answers,
      nome,
      email,
      top_firms: topFirmIds,
    });

    // Store results in sessionStorage for the results page
    sessionStorage.setItem('propMatchResults', JSON.stringify(ranking));
    sessionStorage.setItem('propMatchAnswers', JSON.stringify(answers));
    setIsSubmitting(false);
    navigate('/Results');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/Landing')}
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Voltar' : 'Anterior'}
          </button>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
        </div>

        {!isQuizComplete ? (
          <>
            <QuizStep
              step={step + 1}
              totalSteps={QUESTIONS.length}
              question={currentQuestion.question}
              description={currentQuestion.description}
              options={currentQuestion.options}
              value={answers[currentQuestion.key]}
              onChange={handleAnswer}
              icon={currentQuestion.icon}
            />
          </>
        ) : (
          <EmailCapture onSubmit={handleEmailSubmit} isLoading={isSubmitting} />
        )}
      </div>
    </div>
  );
}