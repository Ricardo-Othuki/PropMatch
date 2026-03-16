import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-amber-400" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.content && (
          <div className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-amber-500 text-zinc-950 font-medium'
              : 'bg-zinc-800 border border-zinc-700/50 text-zinc-200'
          }`}>
            {isUser ? (
              <p className="leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:leading-relaxed [&_ul]:my-1 [&_li]:my-0.5"
                components={{
                  p: ({ children }) => <p className="my-1">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="text-amber-400 font-semibold">{children}</strong>,
                  code: ({ children }) => <code className="bg-zinc-700 px-1 py-0.5 rounded text-xs text-amber-300">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && !message.content && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-xs text-zinc-500">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            Consultando seus dados...
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-zinc-300" />
        </div>
      )}
    </div>
  );
}

const QUICK_PROMPTS = [
  'Analise minhas tentativas ativas',
  'Qual mesa tem melhor custo-benefício?',
  'Como melhorar minha gestão de risco?',
  'Explique o drawdown trailing',
];

export default function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && conversation) {
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [isOpen, conversation]);

  const initConversation = async () => {
    setIsCreating(true);
    const conv = await base44.agents.createConversation({
      agent_name: 'finance_expert',
      metadata: { name: 'Assistente PropMatch' },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    setIsCreating(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || isSending || !conversation) return;
    setInput('');
    setIsSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content });
    setIsSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const chatHeight = isExpanded ? 'h-[600px]' : 'h-[420px]';
  const chatWidth = isExpanded ? 'w-[420px]' : 'w-[360px]';

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 ${chatWidth} ${chatHeight} flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">PropMatch AI</div>
                <div className="text-xs text-zinc-500">Especialista em prop firms</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {isCreating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-xs text-zinc-500">Iniciando assistente...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">PropMatch AI</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">
                      Sou especialista em prop firms e mercado financeiro. Como posso ajudar?
                    </p>
                  </div>
                  <div className="w-full space-y-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:text-white hover:border-amber-500/30 hover:bg-zinc-800 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-800 flex-shrink-0">
              <div className="flex items-end gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2 focus-within:border-amber-500/40 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte algo sobre seu trading..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 resize-none outline-none min-h-[20px] max-h-[80px] leading-5"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                  }}
                  disabled={isSending || isCreating}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isSending || isCreating}
                  className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 text-zinc-950 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-zinc-950" />
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-zinc-700 mt-1.5">Enter para enviar · Shift+Enter para nova linha</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}