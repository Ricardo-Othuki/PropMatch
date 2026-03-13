import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Activity, Newspaper, BarChart2, Target, Crosshair, GraduationCap, Wallet, TrendingDown, AlertCircle, Hash } from 'lucide-react';
import QuizStep from '../components/quiz/QuizStep';
import EmailCapture from '../components/quiz/EmailCapture';
import { calculateMatch, generateDiagnosis } from '../components/matchingEngine';

const QUESTIONS = [
  {
    key: 'estilo_operacional',
    question: 'Qual seu estilo operacional?',
    description: 'Como você opera no mercado',
    icon: Activity,
    options: [
      { value: 'scalper', label: 'Scalper', description: 'Operações rápidas, segundos a minutos' },
      { value: 'intraday', label: 'Intraday / Day Trade', description: 'Opera ao longo do dia, fecha antes do fechamento' },
      { value: 'swing', label: 'Swing Trade', description: 'Mantém posições por dias ou semanas' },
    ]
  },
  {
    key: 'trades_por_dia',
    question: 'Quantos trades você faz por dia?',
    description: 'Média nos seus dias operando',
    icon: Hash,
    options: [
      { value: 'ate_3', label: '1 a 3 trades', description: 'Operações seletivas e disciplinadas' },
      { value: '3-10', label: '3 a 10 trades', description: 'Volume moderado' },
      { value: '10-20', label: '10 a 20 trades', description: 'Alto volume' },
      { value: 'acima_20', label: 'Mais de 20 trades', description: 'Operações de alta frequência' },
    ]
  },
  {
    key: 'risco_por_trade',
    question: 'Quanto você arrisca por operação?',
    description: '% da conta por trade (ex: 1% de $100k = $1.000 de risco)',
    icon: Target,
    options: [
      { value: 'menos_0.5', label: 'Menos de 0.5%', description: 'Risco muito conservador' },
      { value: '0.5_1', label: '0.5% a 1%', description: 'Risco equilibrado' },
      { value: '1_2', label: '1% a 2%', description: 'Risco moderado-alto' },
      { value: 'acima_2', label: 'Mais de 2%', description: 'Risco agressivo' },
    ]
  },
  {
    key: 'opera_noticia',
    question: 'Você opera em momentos de notícia?',
    description: 'NFP, FOMC, CPI e outros eventos macro',
    icon: Newspaper,
    options: [
      { value: true, label: 'Sim, opero notícia', description: 'Aproveito a volatilidade dos eventos' },
      { value: false, label: 'Não, evito notícias', description: 'Prefiro momentos mais calmos' },
    ]
  },
  {
    key: 'ja_reprovou',
    question: 'Você já reprovou em alguma prop firm?',
    description: 'Seja honesto — isso muda completamente a recomendação',
    icon: AlertCircle,
    options: [
      { value: false, label: 'Não, nunca reprovou', description: 'Primeira tentativa ou histórico limpo' },
      { value: true, label: 'Sim, já reprovou', description: 'Tive experiências negativas antes' },
    ]
  },
  {
    key: 'motivo_reprovacao',
    question: 'Qual foi o principal motivo da reprovação?',
    description: 'O que te derrubou nas tentativas anteriores',
    icon: TrendingDown,
    condition: (answers) => answers.ja_reprovou === true,
    options: [
      { value: 'overtrading', label: 'Overtrading', description: 'Operei demais, acumulei perdas pequenas' },
      { value: 'violacao_regra', label: 'Violei uma regra', description: 'Esqueci ou não respeitei alguma regra da mesa' },
      { value: 'drawdown', label: 'Estourei o drawdown', description: 'Tive um trade ou sequência muito ruim' },
      { value: 'psicologico', label: 'Questão psicológica', description: 'Revenge trade, FOMO, entrei com raiva' },
    ]
  },
  {
    key: 'tolerancia_drawdown',
    question: 'Qual sua tolerância a drawdown?',
    description: 'Emocionalmente, quanto você aguenta de perda acumulada?',
    icon: BarChart2,
    options: [
      { value: 'baixa', label: 'Baixa', description: 'Fico ansioso com qualquer perda acumulada' },
      { value: 'media', label: 'Média', description: 'Consigo lidar com drawdown moderado' },
      { value: 'alta', label: 'Alta', description: 'Tenho sangue frio, aguento pressão' },
    ]
  },
  {
    key: 'objetivo_principal',
    question: 'Qual seu objetivo principal agora?',
    description: 'O que mais importa pra você nesse momento',
    icon: Crosshair,
    options: [
      { value: 'passar_rapido', label: 'Passar rápido na avaliação', description: 'Ser aprovado no menor tempo possível' },
      { value: 'estabilidade', label: 'Estabilidade na conta funded', description: 'Operar com segurança depois de aprovado' },
      { value: 'sacar_rapido', label: 'Sacar o lucro rápido', description: 'Receber meu payout com frequência' },
    ]
  },
  {
    key: 'experiencia',
    question: 'Qual seu nível de experiência?',
    description: 'Honestidade aqui muda muito o resultado',
    icon: GraduationCap,
    options: [
      { value: 'iniciante', label: 'Iniciante', description: 'Menos de 1 ano operando' },
      { value: 'intermediario', label: 'Intermediário', description: '1 a 3 anos de experiência' },
      { value: 'avancado', label: 'Avançado', description: 'Mais de 3 anos operando consistentemente' },
    ]
  },
  {
    key: 'orcamento',
    question: 'Quanto pretende investir na avaliação?',
    description: 'Valor em dólares para a taxa da mesa',
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

  // Filter out conditional questions that don't apply
  const visibleQuestions = QUESTIONS.filter(q => !q.condition || q.condition(answers));
  const isQuizComplete = step >= visibleQuestions.length;
  const currentQuestion = visibleQuestions[step];

  const handleAnswer = (value) => {
    const key = currentQuestion.key;
    setAnswers(prev => {
      const updated = { ...prev, [key]: value };
      // If they say "never failed", clear the failure reason
      if (key === 'ja_reprovou' && value === false) {
        updated.motivo_reprovacao = 'nunca_reprovou';
      }
      return updated;
    });
    setTimeout(() => setStep(prev => prev + 1), 300);
  };

  const handleBack = () => {
    if (step === 0) navigate('/Landing');
    else setStep(step - 1);
  };

  const handleEmailSubmit = async ({ nome, email }) => {
    setIsSubmitting(true);
    const ranking = calculateMatch(answers, firms);
    const { approvalChance } = generateDiagnosis(answers);
    const topFirmIds = ranking.slice(0, 3).map(r => String(r.firm.id));
    const avgProb = ranking.slice(0, 3).reduce((s, r) => s + r.approvalProbability, 0) / 3;

    await base44.entities.QuizSubmission.create({
      ...answers,
      nome,
      email,
      top_firms: topFirmIds,
      probabilidade_media: Math.round(avgProb),
    });

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
            onClick={handleBack}
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Início' : 'Anterior'}
          </button>
          <span className="text-sm text-zinc-600 font-medium tracking-wider">PROPMATCH</span>
          <div className="w-16" />
        </div>

        {!isQuizComplete ? (
          <QuizStep
            step={step + 1}
            totalSteps={visibleQuestions.length}
            question={currentQuestion.question}
            description={currentQuestion.description}
            options={currentQuestion.options}
            value={answers[currentQuestion.key]}
            onChange={handleAnswer}
            icon={currentQuestion.icon}
          />
        ) : (
          <EmailCapture onSubmit={handleEmailSubmit} isLoading={isSubmitting} />
        )}
      </div>
    </div>
  );
}