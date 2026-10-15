import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Layers,
  HelpCircle,
  Clock,
  Star,
  Trash2,
  FileDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import { NoteDocument, EducationLevel, NoteType } from '../types/note';
import { exportNotesBackupJson } from '../services/storage';
import { downloadTextFile } from '../services/exportService';

interface MyNotesViewProps {
  notes: NoteDocument[];
  onSelectNote: (note: NoteDocument) => void;
  onNavigateToCreate: () => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  notes,
  onSelectNote,
  onNavigateToCreate,
  onDeleteNote,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'created'>('updated');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.subject) set.add(n.subject);
    });
    return Array.from(set);
  }, [notes]);

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = (n.title || '').toLowerCase().includes(q);
          const matchesSubject = (n.subject || '').toLowerCase().includes(q);
          const matchesTopic = (n.topic || '').toLowerCase().includes(q);
          const matchesContent = (n.content || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesSubject && !matchesTopic && !matchesContent) {
            return false;
          }
        }

        // Subject filter
        if (selectedSubject !== 'all' && n.subject !== selectedSubject) {
          return false;
        }

        // Type filter
        if (selectedType !== 'all' && n.noteType !== selectedType) {
          return false;
        }

        // Level filter
        if (selectedLevel !== 'all' && n.educationLevel !== selectedLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'created') {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }, [notes, searchQuery, selectedSubject, selectedType, selectedLevel, sortBy]);

  const handleExportBackup = () => {
    const jsonStr = exportNotesBackupJson();
    downloadTextFile(`notemind_notes_backup_${Date.now()}.json`, jsonStr, 'application/json');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Study Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and manage all your generated study notes, flashcards, and quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Export all notes to JSON backup"
          >
            <FileDown className="w-4 h-4" />
            <span>Backup Library</span>
          </button>

          <button
            onClick={onNavigateToCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Notes</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across titles, subjects, or note content..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-hidden"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title (A-Z)</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 transition cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'hover:text-slate-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg text-slate-600 transition cursor-pointer ${
                  layoutMode === 'list' ? 'bg-white shadow-2xs text-indigo-600' : 'hover:text-slate-900'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1 font-semibold text-slate-600 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="all">All Subjects ({notes.length})</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Note Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="all">All Formats</option>
            <option value="detailed">Detailed Notes</option>
            <option value="revision">Quick Revision</option>
            <option value="flashcards">Flashcards</option>
            <option value="quiz">Quizzes</option>
            <option value="formula">Formula Sheet</option>
            <option value="summary">Summary</option>
            <option value="definitions">Definitions</option>
            <option value="qa">Important Q&A</option>
            <option value="viva">Viva Prep</option>
          </select>

          {/* Education Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="all">All Education Levels</option>
            <option value="school">School (K-12)</option>
            <option value="college">College / Undergrad</option>
            <option value="engineering">Engineering</option>
            <option value="general">General</option>
          </select>

          {(selectedSubject !== 'all' || selectedType !== 'all' || selectedLevel !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedType('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No notes matched your criteria</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search terms or filters, or generate a fresh set of notes.
            </p>
          </div>
          <button
            onClick={onNavigateToCreate}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs sm:text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Notes</span>
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
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
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 capitalize">{note.educationLevel}</span>
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
                </div>

                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base line-clamp-2">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
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
                    <span className="flex items-center gap-0.5 text-indigo-600 font-semibold" title="Flashcard items">
                      <Layers className="w-3.5 h-3.5" /> {note.flashcards.length}
                    </span>
                  )}
                  {note.quiz && (
                    <span className="flex items-center gap-0.5 text-emerald-600 font-semibold" title="Quiz questions">
                      <HelpCircle className="w-3.5 h-3.5" /> {note.quiz.length}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note permanently?')) onDeleteNote(note.id);
                    }}
                    className="p-1 text-slate-300 hover:text-red-500 transition cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
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

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {note.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                      {note.subject}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {note.content.replace(/^#+.*$/gm, '').trim()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                <span className="hidden md:inline">{note.educationLevel}</span>
                <span>{new Date(note.updatedAt || Date.now()).toLocaleDateString()}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this note permanently?')) onDeleteNote(note.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
