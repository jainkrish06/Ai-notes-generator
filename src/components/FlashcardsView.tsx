import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Layers,
  List,
  Plus,
  Trash2,
  Volume2,
} from 'lucide-react';
import { FlashcardItem, NoteDocument } from '../types/note';
import { logActivity } from '../services/storage';

interface FlashcardsViewProps {
  note?: NoteDocument;
  onUpdateNote?: (updated: NoteDocument) => void;
  onNavigateToCreate?: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  note,
  onUpdateNote,
  onNavigateToCreate,
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>(note?.flashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // New card modal/form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (note?.flashcards) {
      setCards(note.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [note]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal) return;
      if (viewMode !== 'card' || cards.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMastered();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, currentIndex, isFlipped, viewMode, showAddModal]);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleMastered = () => {
    if (!currentCard) return;
    const willBeMastered = !currentCard.mastered;
    const updated = cards.map((c, i) =>
      i === currentIndex ? { ...c, mastered: !c.mastered } : c
    );
    setCards(updated);
    if (note && onUpdateNote) {
      onUpdateNote({ ...note, flashcards: updated });
    }
    if (willBeMastered) {
      logActivity('practice_flashcards', `Practiced flashcards: ${note?.title || 'Study Deck'}`, {
        targetId: note?.id,
        targetType: 'flashcards',
        details: `Mastered card #${currentIndex + 1} (${currentCard.category || 'General'})`,
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetProgress = () => {
    const reset = cards.map((c) => ({ ...c, mastered: false }));
    setCards(reset);
    if (note && onUpdateNote) {
      onUpdateNote({ ...note, flashcards: reset });
    }
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
    if (note && onUpdateNote) {
      onUpdateNote({ ...note, flashcards: updated });
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: FlashcardItem = {
      id: `custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory.trim() || 'Custom',
      mastered: false,
    };

    const updated = [...cards, newCard];
    setCards(updated);
    if (note && onUpdateNote) {
      onUpdateNote({ ...note, flashcards: updated });
    }

    setNewFront('');
    setNewBack('');
    setNewCategory('');
    setShowAddModal(false);
  };

  // Text to speech for card pronunciation
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const masteredCount = cards.filter((c) => c.mastered).length;
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Flashcards Available</h2>
        <p className="text-slate-600 mb-6 text-sm">
          Select or generate a flashcard study deck from your lecture notes, documents, or custom topics.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onNavigateToCreate && (
            <button
              onClick={onNavigateToCreate}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Flashcard Deck
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add First Card Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Deck Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {note?.subject || 'Flashcard Deck'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{cards.length} cards in deck</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{note?.title || 'Interactive Flashcards'}</h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle between Single Card and List View"
          >
            {viewMode === 'card' ? <List className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            <span>{viewMode === 'card' ? 'List View' : 'Card View'}</span>
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleResetProgress}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Reset mastered status"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Mastery Progress</span>
          <span className="font-medium text-slate-500">
            <strong className="text-indigo-600 font-bold">{masteredCount}</strong> of {cards.length} mastered ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Single Card View */}
      {viewMode === 'card' && (
        <div className="space-y-4">
          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[320px] sm:min-h-[380px] p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none shadow-sm ${
              isFlipped
                ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800'
                : 'bg-white border-slate-200/90 hover:border-indigo-300'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isFlipped
                      ? 'bg-indigo-800/80 text-indigo-200 border border-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  {currentCard?.category || 'Concept'}
                </span>
                {currentCard?.mastered && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Mastered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(isFlipped ? currentCard.back : currentCard.front);
                  }}
                  className={`p-2 rounded-full transition cursor-pointer ${
                    isFlipped
                      ? 'text-indigo-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Read aloud"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-indigo-400' : ''}`} />
                </button>
                <span className={`text-xs font-medium ${isFlipped ? 'text-indigo-300' : 'text-slate-400'}`}>
                  Card {currentIndex + 1} of {cards.length}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="my-auto py-8 text-center px-2 sm:px-6">
              <div
                className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                  isFlipped ? 'text-indigo-300' : 'text-indigo-600'
                }`}
              >
                {isFlipped ? 'ANSWER / EXPLANATION' : 'QUESTION / CONCEPT'}
              </div>
              <p
                className={`text-lg sm:text-2xl font-medium leading-relaxed ${
                  isFlipped ? 'text-slate-100 font-normal' : 'text-slate-900 font-semibold'
                }`}
              >
                {isFlipped ? currentCard?.back : currentCard?.front}
              </p>
            </div>

            {/* Card Footer Hint */}
            <div className="flex items-center justify-between text-xs">
              <span className={isFlipped ? 'text-indigo-300' : 'text-slate-400'}>
                Press <strong>Space</strong> or tap anywhere to flip
              </span>
              <span className={`font-medium ${isFlipped ? 'text-indigo-200' : 'text-indigo-600'}`}>
                {isFlipped ? 'Tap to see prompt' : 'Tap to reveal answer'}
              </span>
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={toggleMastered}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                currentCard?.mastered
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentCard?.mastered ? 'Mark as Review' : 'Mark as Mastered (M)'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* List View of All Cards */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {cards.map((c, idx) => (
            <div
              key={c.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {c.category || 'General'}
                    </span>
                    {c.mastered && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                        Mastered
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.front}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {c.back}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      const updated = cards.map((item, i) =>
                        i === idx ? { ...item, mastered: !item.mastered } : item
                      );
                      setCards(updated);
                      if (note && onUpdateNote) onUpdateNote({ ...note, flashcards: updated });
                    }}
                    className={`p-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      c.mastered
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Toggle mastered"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(c.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Flashcard</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Category / Topic
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Core Definition, Formula, Case Study"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Front (Prompt / Question) *
                </label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Enter the concept, term, or question..."
                  rows={2}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Back (Answer / Explanation) *
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Enter the full explanation, formula, or breakdown..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
