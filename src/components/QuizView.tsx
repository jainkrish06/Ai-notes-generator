import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { QuizQuestion, NoteDocument } from '../types/note';
import { logActivity } from '../services/storage';

interface QuizViewProps {
  note?: NoteDocument;
  onUpdateNote?: (updated: NoteDocument) => void;
  onNavigateToCreate?: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  note,
  onNavigateToCreate,
}) => {
  const [questions] = useState<QuizQuestion[]>(note?.quiz || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(true);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Quiz Questions Available</h2>
        <p className="text-slate-600 mb-6 text-sm">
          Generate an interactive multiple-choice test based directly on your study materials, lecture notes, or textbooks.
        </p>
        {onNavigateToCreate && (
          <button
            onClick={onNavigateToCreate}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Mastery Quiz
          </button>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = userAnswers[currentIndex];
  const hasAnsweredCurrent = selectedOption !== undefined;

  // Calculate score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answerIndex) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted && !showImmediateFeedback) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx,
    }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    logActivity('complete_quiz', `Completed quiz: ${note?.title || 'Knowledge Assessment'}`, {
      targetId: note?.id,
      targetType: 'quiz',
      details: `Score: ${scorePercentage}% (${correctCount}/${questions.length} correct)`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {note?.subject || 'Practice Test'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{questions.length} Questions</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{note?.title || 'Knowledge Assessment Quiz'}</h1>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={showImmediateFeedback}
              onChange={(e) => setShowImmediateFeedback(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Instant Explanations</span>
          </label>

          <button
            onClick={handleResetQuiz}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Restart quiz"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Results Banner (if finished) */}
      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quiz Complete!</h2>
            <p className="text-slate-600 text-sm mt-1">Here is how you performed on this evaluation:</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-black text-slate-900">{correctCount}</div>
              <div className="text-xs text-slate-500 font-medium">Correct</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-black text-slate-900">{questions.length - correctCount}</div>
              <div className="text-xs text-slate-500 font-medium">Incorrect</div>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <div className="text-2xl font-black text-indigo-600">{scorePercentage}%</div>
              <div className="text-xs text-indigo-600 font-semibold">Mastery Score</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={handleResetQuiz}
              className="px-5 py-2.5 rounded-xl border border-slate-300 font-medium text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Review Answers
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-indigo-600">
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <span>
              Answered: {Object.keys(userAnswers).length} / {questions.length}
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === currentQ.answerIndex;
              const showResult = (showImmediateFeedback && hasAnsweredCurrent) || isSubmitted;

              let buttonStyle = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-600';

              if (showResult) {
                if (isCorrect) {
                  buttonStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'bg-red-50 border-red-300 text-red-950';
                  badgeStyle = 'bg-red-600 text-white';
                }
              } else if (isSelected) {
                buttonStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20';
                badgeStyle = 'bg-indigo-600 text-white';
              }

              const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${buttonStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${badgeStyle}`}
                  >
                    {optionLetter}
                  </span>
                  <span className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">{option}</span>
                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout */}
          {((showImmediateFeedback && hasAnsweredCurrent) || isSubmitted) && currentQ.explanation && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-sm space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Explanation
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">{currentQ.explanation}</p>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-xs transition cursor-pointer"
              >
                <span>Submit & Review Score</span>
                <Trophy className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-xs transition cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
