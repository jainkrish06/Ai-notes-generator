import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, Loader2, User } from 'lucide-react';
import { askQuestionApi } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AskAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  sourceText?: string;
  noteTitle: string;
  outputLanguage: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  'Summarize the core concept in 3 simple bullet points.',
  'What is the most tricky or frequently tested exam trap in this material?',
  'Explain the hardest formula or concept using an intuitive real-world analogy.',
  'How would an examiner test this in an oral or viva exam?',
];

export const AskAssistantDrawer: React.FC<AskAssistantDrawerProps> = ({
  isOpen,
  onClose,
  noteContent,
  sourceText,
  noteTitle,
  outputLanguage,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your NoteMind study assistant. Ask me anything about **"${noteTitle}"** or request deeper explanations, worked examples, and exam advice grounded strictly in your source material.`,
      timestamp: Date.now(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const answer = await askQuestionApi({
        noteContent,
        sourceText,
        question: q,
        outputLanguage,
      });

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to get answer. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Study Assistant</h3>
            <p className="text-xs text-slate-500 truncate max-w-[260px]">{noteTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 mt-1 ${
                m.role === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
              }`}
            >
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <MarkdownRenderer content={m.content} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Consulting note and source material...</span>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length <= 2 && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Prompts
          </div>
          <div className="flex flex-col gap-1">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-left text-xs p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition cursor-pointer truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about this note..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
