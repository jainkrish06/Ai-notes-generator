import React from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  FileUp,
  FileText,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { NoteDocument, ActivityItem } from '../types/note';
import { RecentActivity } from './RecentActivity';

interface DashboardViewProps {
  notes: NoteDocument[];
  activities?: ActivityItem[];
  onSelectNote: (note: NoteDocument) => void;
  onNavigateToCreate: (prefill?: Partial<NoteDocument>) => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectActivity?: (activity: ActivityItem) => void;
  onClearActivities?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  activities = [],
  onSelectNote,
  onNavigateToCreate,
  onDeleteNote,
  onToggleFavorite,
  onSelectActivity,
  onClearActivities,
}) => {
  // Compute analytics
  const totalNotes = notes.length;
  const totalFlashcards = notes.reduce(
    (acc, n) => acc + (n.flashcards ? n.flashcards.length : 0),
    0
  );
  const totalQuizzes = notes.filter((n) => n.quiz && n.quiz.length > 0).length;
  const totalWords = notes.reduce(
    (acc, n) => acc + (n.content ? n.content.split(/\s+/).filter(Boolean).length : 0),
    0
  );

  const recentNotes = [...notes]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Academic Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Elevate your study workflow with <span className="text-indigo-400">NoteMind AI</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Transform dense PDFs, complex textbooks, and lecture transcripts into structured study notes, active recall flashcards, and mastery quizzes in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToCreate()}
              className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition shadow-md hover:shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Notes</span>
            </button>
            <button
              onClick={() => onNavigateToCreate({ noteType: 'flashcards' })}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-300" />
              <span>Generate Flashcards</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Analytics Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Notes</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalNotes}</div>
          <div className="text-xs text-slate-500">Across your library</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Flashcards</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalFlashcards}</div>
          <div className="text-xs text-slate-500">Active recall cards</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Quizzes</span>
            <HelpCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalQuizzes}</div>
          <div className="text-xs text-slate-500">Interactive tests</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Words Synthesized</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalWords.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Knowledge distilled</div>
        </div>
      </div>

      {/* Quick Launch Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateToCreate()}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900">Upload PDF Document</div>
            <p className="text-xs text-slate-500">Extract text and generate comprehensive study notes.</p>
          </button>

          <button
            onClick={() => onNavigateToCreate({ noteType: 'revision' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900">Quick Revision Cram</div>
            <p className="text-xs text-slate-500">High-yield bullet points & exam cheat sheets.</p>
          </button>

          <button
            onClick={() => onNavigateToCreate({ noteType: 'flashcards' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition">
              <Layers className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900">Create Flashcard Deck</div>
            <p className="text-xs text-slate-500">Interactive flip cards for spaced repetition.</p>
          </button>

          <button
            onClick={() => onNavigateToCreate({ noteType: 'quiz' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900">Generate Practice Quiz</div>
            <p className="text-xs text-slate-500">Multiple-choice test with answer explanations.</p>
          </button>
        </div>
      </div>

      {/* Recent Activity Timeline Component */}
      <RecentActivity
        activities={activities}
        onSelectActivity={onSelectActivity}
        onClearActivities={onClearActivities}
      />

      {/* Recent Notes Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Study Notes</h3>
          <button
            onClick={() => onNavigateToCreate()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-1"
          >
            <span>Create new</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No notes generated yet. Click "Create New Notes" to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {note.subject || 'General'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(note.id);
                      }}
                      className="text-slate-300 hover:text-amber-500 transition cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          note.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 text-sm sm:text-base">
                    {note.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {note.content.replace(/^#+.*$/gm, '').trim()}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(note.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {note.flashcards && (
                      <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                        <Layers className="w-3.5 h-3.5" /> {note.flashcards.length}
                      </span>
                    )}
                    {note.quiz && (
                      <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                        <HelpCircle className="w-3.5 h-3.5" /> {note.quiz.length}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this note?')) onDeleteNote(note.id);
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding & Study Tips Card */}
      <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Factual Integrity & Grounded Learning</span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            NoteMind AI strictly extracts and builds upon your uploaded syllabus or lecture text without inventing false citations or page references. Use the <strong>Ask NoteMind AI</strong> assistant in any note to explore concepts deeper.
          </p>
        </div>
        <button
          onClick={() => onNavigateToCreate()}
          className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition shadow-2xs shrink-0 cursor-pointer"
        >
          Start New Study Session
        </button>
      </div>
    </div>
  );
};
