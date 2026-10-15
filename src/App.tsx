import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sparkles,
  Search,
  BookOpen,
  Plus,
} from 'lucide-react';
import { NoteDocument, UserPreferences, ActivityItem } from './types/note';
import {
  getSavedNotes,
  saveSingleNote,
  deleteNote,
  getUserPreferences,
  saveUserPreferences,
  getRecentActivities,
  logActivity,
  clearActivities,
} from './services/storage';
import { Sidebar, NavView } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CreateNotesView } from './components/CreateNotesView';
import { MyNotesView } from './components/MyNotesView';
import { NoteWorkspaceView } from './components/NoteWorkspaceView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [activeNote, setActiveNote] = useState<NoteDocument | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load notes & activities on mount
  useEffect(() => {
    const loaded = getSavedNotes();
    setNotes(loaded);
    setActivities(getRecentActivities());
  }, []);

  const refreshNotes = () => {
    const loaded = getSavedNotes();
    setNotes(loaded);
  };

  const refreshActivities = () => {
    setActivities(getRecentActivities());
  };

  const handleSelectNote = (note: NoteDocument) => {
    setActiveNote(note);
  };

  const handleSaveNote = (updated: NoteDocument) => {
    saveSingleNote(updated);
    setActiveNote(updated);
    refreshNotes();

    const targetType = updated.noteType === 'flashcards' ? 'flashcards' : updated.noteType === 'quiz' ? 'quiz' : 'note';
    logActivity('update_note', `Updated ${targetType}: ${updated.title}`, {
      targetId: updated.id,
      targetType,
      details: `Saved changes • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    });
    refreshActivities();
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    deleteNote(id);
    if (activeNote?.id === id) {
      setActiveNote(null);
    }
    refreshNotes();

    if (noteToDelete) {
      logActivity('delete_note', `Deleted note: ${noteToDelete.title}`);
      refreshActivities();
    }
  };

  const handleToggleFavorite = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (target) {
      const updated = { ...target, isFavorite: !target.isFavorite };
      saveSingleNote(updated);
      if (activeNote?.id === id) {
        setActiveNote(updated);
      }
      refreshNotes();
    }
  };

  const handleNoteCreated = (newNote: NoteDocument) => {
    saveSingleNote(newNote);
    refreshNotes();
    setActiveNote(newNote);

    const targetType = newNote.noteType === 'flashcards' ? 'flashcards' : newNote.noteType === 'quiz' ? 'quiz' : 'note';
    logActivity('create_note', `Created note: ${newNote.title}`, {
      targetId: newNote.id,
      targetType,
      details: `${newNote.subject} • ${newNote.educationLevel} • ${newNote.length}`,
    });
    refreshActivities();

    // If generated type is flashcards, route straight to flashcards
    if (newNote.noteType === 'flashcards') {
      setCurrentView('flashcards');
    } else if (newNote.noteType === 'quiz') {
      setCurrentView('quiz');
    } else {
      // Stay on workspace
    }
  };

  const handleSelectActivity = (act: ActivityItem) => {
    if (!act.targetId) return;
    const target = notes.find((n) => n.id === act.targetId);
    if (target) {
      setActiveNote(target);
      if (act.targetType === 'flashcards') {
        setCurrentView('flashcards');
      } else if (act.targetType === 'quiz') {
        setCurrentView('quiz');
      }
    }
  };

  const handleClearActivities = () => {
    clearActivities();
    refreshActivities();
  };

  // Stats calculation
  const totalFlashcards = notes.reduce(
    (acc, n) => acc + (n.flashcards ? n.flashcards.length : 0),
    0
  );
  const totalQuizzes = notes.filter((n) => n.quiz && n.quiz.length > 0).length;

  return (
    <div className="min-h-screen bg-stone-50/60 text-slate-900 flex font-sans antialiased">
      {/* Sidebar Component */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          if (v !== 'notes' && v !== 'dashboard') {
            // keep active note if appropriate or let user select
          }
        }}
        noteCount={notes.length}
        flashcardCount={totalFlashcards}
        quizCount={totalQuizzes}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Mode indicator */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <span className="capitalize">{currentView}</span>
              {activeNote && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-indigo-600 truncate max-w-[200px] sm:max-w-xs">
                    {activeNote.title}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveNote(null);
                setCurrentView('create');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notes</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          {/* Active Note Workspace has priority when activeNote is selected */}
          {activeNote && currentView !== 'flashcards' && currentView !== 'quiz' && (
            <NoteWorkspaceView
              note={activeNote}
              onSaveNote={handleSaveNote}
              onBack={() => setActiveNote(null)}
              onDeleteNote={handleDeleteNote}
              onNavigateToFlashcards={() => setCurrentView('flashcards')}
              onNavigateToQuiz={() => setCurrentView('quiz')}
            />
          )}

          {/* Flashcards View */}
          {currentView === 'flashcards' && (
            <FlashcardsView
              note={
                activeNote?.flashcards && activeNote.flashcards.length > 0
                  ? activeNote
                  : notes.find((n) => n.flashcards && n.flashcards.length > 0)
              }
              onUpdateNote={handleSaveNote}
              onNavigateToCreate={() => {
                setActiveNote(null);
                setCurrentView('create');
              }}
            />
          )}

          {/* Practice Quiz View */}
          {currentView === 'quiz' && (
            <QuizView
              note={
                activeNote?.quiz && activeNote.quiz.length > 0
                  ? activeNote
                  : notes.find((n) => n.quiz && n.quiz.length > 0)
              }
              onUpdateNote={handleSaveNote}
              onNavigateToCreate={() => {
                setActiveNote(null);
                setCurrentView('create');
              }}
            />
          )}

          {/* Other Standard Views when no active note is open */}
          {!activeNote && currentView === 'dashboard' && (
            <DashboardView
              notes={notes}
              activities={activities}
              onSelectNote={handleSelectNote}
              onNavigateToCreate={(prefill) => {
                setActiveNote(null);
                setCurrentView('create');
              }}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onSelectActivity={handleSelectActivity}
              onClearActivities={handleClearActivities}
            />
          )}

          {!activeNote && currentView === 'create' && (
            <CreateNotesView
              onNoteCreated={handleNoteCreated}
              defaultEducationLevel={preferences.defaultEducationLevel}
              defaultOutputLanguage={preferences.defaultOutputLanguage}
              defaultLength={preferences.defaultNoteLength}
            />
          )}

          {!activeNote && currentView === 'notes' && (
            <MyNotesView
              notes={notes}
              onSelectNote={handleSelectNote}
              onNavigateToCreate={() => {
                setActiveNote(null);
                setCurrentView('create');
              }}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              preferences={preferences}
              onUpdatePreferences={(newPrefs) => setPreferences(newPrefs)}
              onReloadNotes={refreshNotes}
            />
          )}
        </main>
      </div>
    </div>
  );
}
