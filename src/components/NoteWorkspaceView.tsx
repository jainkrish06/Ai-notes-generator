import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit3,
  Eye,
  Save,
  Download,
  Copy,
  Check,
  Sparkles,
  Bot,
  FileText,
  RotateCcw,
  Layers,
  HelpCircle,
  Share2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { NoteDocument } from '../types/note';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TableOfContents } from './TableOfContents';
import { AskAssistantDrawer } from './AskAssistantDrawer';
import { RefineSectionModal } from './RefineSectionModal';
import { exportToPdf, exportToMarkdown, exportToPlainText } from '../services/exportService';
import { logActivity } from '../services/storage';

interface NoteWorkspaceViewProps {
  note: NoteDocument;
  onSaveNote: (updatedNote: NoteDocument) => void;
  onBack: () => void;
  onDeleteNote?: (id: string) => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToQuiz?: () => void;
}

export const NoteWorkspaceView: React.FC<NoteWorkspaceViewProps> = ({
  note,
  onSaveNote,
  onBack,
  onDeleteNote,
  onNavigateToFlashcards,
  onNavigateToQuiz,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [savedSnapshot, setSavedSnapshot] = useState(note.content);
  const [isSaved, setIsSaved] = useState(true);
  const [copied, setCopied] = useState(false);

  // Assistant & Refine Modals
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [selectedSectionForRefine, setSelectedSectionForRefine] = useState('');

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSavedSnapshot(note.content);
    setIsSaved(true);
  }, [note.id]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsSaved(newContent === savedSnapshot && title === note.title);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsSaved(newTitle === note.title && content === savedSnapshot);
  };

  const handleSave = () => {
    const updated: NoteDocument = {
      ...note,
      title: title.trim() || 'Untitled Note',
      content,
      updatedAt: Date.now(),
    };
    onSaveNote(updated);
    setSavedSnapshot(content);
    setIsSaved(true);
  };

  const handleUndo = () => {
    setContent(savedSnapshot);
    setTitle(note.title);
    setIsSaved(true);
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectSectionToRefine = (headingOrText: string) => {
    setSelectedSectionForRefine(headingOrText);
    setIsRefineOpen(true);
  };

  const handleApplyReplacement = (newSectionText: string) => {
    if (!selectedSectionForRefine) return;
    // Replace the target section or append
    if (content.includes(selectedSectionForRefine)) {
      const updated = content.replace(selectedSectionForRefine, newSectionText);
      handleContentChange(updated);
    } else {
      // Append if exact match not found
      handleContentChange(`${content}\n\n${newSectionText}`);
    }
  };

  const currentWordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Workspace Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            title="Back to library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {note.subject || 'General'}
              </span>
              <span className="text-xs text-slate-400 capitalize">• {note.educationLevel}</span>
              <span className="text-xs text-slate-400">• {currentWordCount} words</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switch */}
          {note.flashcards && note.flashcards.length > 0 && onNavigateToFlashcards && (
            <button
              onClick={onNavigateToFlashcards}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards ({note.flashcards.length})</span>
            </button>
          )}

          {note.quiz && note.quiz.length > 0 && onNavigateToQuiz && (
            <button
              onClick={onNavigateToQuiz}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Practice Quiz ({note.quiz.length})</span>
            </button>
          )}

          {/* Ask AI Assistant Button */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask NoteMind AI</span>
          </button>

          {/* Edit / View Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isEditing
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Preview Mode' : 'Edit Note'}</span>
          </button>

          {/* Save / Undo */}
          {!isSaved && (
            <>
              <button
                onClick={handleUndo}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                title="Revert unsaved edits"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopyNote}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Copy entire note"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-40 text-xs">
                <button
                  onClick={() => {
                    exportToPdf({ ...note, title, content });
                    logActivity('export_note', `Exported note: ${title}`, {
                      targetId: note.id,
                      targetType: 'note',
                      details: 'Format: Formatted PDF document',
                    });
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Download PDF Document</span>
                </button>
                <button
                  onClick={() => {
                    exportToMarkdown({ ...note, title, content });
                    logActivity('export_note', `Exported note: ${title}`, {
                      targetId: note.id,
                      targetType: 'note',
                      details: 'Format: Markdown (.md)',
                    });
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Download Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    exportToPlainText({ ...note, title, content });
                    logActivity('export_note', `Exported note: ${title}`, {
                      targetId: note.id,
                      targetType: 'note',
                      details: 'Format: Plain Text (.txt)',
                    });
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Download Plain Text (.txt)</span>
                </button>
              </div>
            )}
          </div>

          {/* Delete Option */}
          {onDeleteNote && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this note?')) {
                  onDeleteNote(note.id);
                  onBack();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Table of Contents & Note Info */}
        <div className="hidden lg:block lg:col-span-1 space-y-4 sticky top-6">
          <TableOfContents content={content} />

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3 text-xs shadow-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Note Details</h4>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium text-slate-900 uppercase">{note.noteType}</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium text-slate-900">{note.outputLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span>Length:</span>
                <span className="font-medium text-slate-900 capitalize">{note.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium text-slate-900">
                  {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Grounded in source document</span>
            </div>
          </div>
        </div>

        {/* Right Column: Note Reading / Editing Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-6">
            {/* Title Input / Display */}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 border-b-2 border-indigo-500 pb-2 focus:outline-hidden"
                  placeholder="Note Title..."
                />
              ) : (
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
                  <p className="text-xs text-slate-500">
                    Subject: <strong>{note.subject}</strong> • Level: <strong>{note.educationLevel}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Note Body */}
            {isEditing ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Markdown formatting supported (# H1, ## H2, **bold**, *italic*, - list, &gt; quote, \`code\`)</span>
                  <span>{content.length} characters</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={25}
                  className="w-full font-mono text-sm leading-relaxed text-slate-800 p-4 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y"
                  placeholder="Write or edit your study notes here..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[500px]">
                <MarkdownRenderer
                  content={content}
                  onSelectSection={handleSelectSectionToRefine}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grounded AI Assistant Drawer */}
      <AskAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        noteContent={content}
        sourceText={note.sourceSnippet}
        noteTitle={title}
        outputLanguage={note.outputLanguage}
      />

      {/* Refine Section Modal */}
      <RefineSectionModal
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        selectedText={selectedSectionForRefine}
        noteContent={content}
        sourceText={note.sourceSnippet}
        outputLanguage={note.outputLanguage}
        onApplyReplacement={handleApplyReplacement}
      />
    </div>
  );
};
