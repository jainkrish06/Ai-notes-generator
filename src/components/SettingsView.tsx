import React, { useState, useRef } from 'react';
import {
  Settings,
  HardDrive,
  Cloud,
  FileDown,
  FileUp,
  Trash2,
  Check,
  AlertCircle,
  Save,
  Info,
} from 'lucide-react';
import { UserPreferences, EducationLevel, NoteLength, NoteType } from '../types/note';
import {
  saveUserPreferences,
  exportNotesBackupJson,
  importNotesBackupJson,
  saveNotes,
} from '../services/storage';
import { downloadTextFile } from '../services/exportService';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onReloadNotes: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onReloadNotes,
}) => {
  const [eduLevel, setEduLevel] = useState<EducationLevel>(preferences.defaultEducationLevel);
  const [outputLang, setOutputLang] = useState(preferences.defaultOutputLanguage);
  const [noteLength, setNoteLength] = useState<NoteLength>(preferences.defaultNoteLength);
  const [noteType, setNoteType] = useState<NoteType>(preferences.defaultNoteType);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserPreferences = {
      defaultEducationLevel: eduLevel,
      defaultOutputLanguage: outputLang,
      defaultNoteLength: noteLength,
      defaultNoteType: noteType,
    };
    saveUserPreferences(updated);
    onUpdatePreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const json = exportNotesBackupJson();
    downloadTextFile(`notemind_ai_library_backup_${Date.now()}.json`, json, 'application/json');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importNotesBackupJson(text);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} notes!`);
        onReloadNotes();
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllNotes = () => {
    if (confirm('Are you sure you want to delete all saved notes and flashcards? This action cannot be undone.')) {
      saveNotes([]);
      onReloadNotes();
      alert('All local notes have been erased.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your default academic generation settings, local data backups, and storage sync status.
        </p>
      </div>

      {/* Cloud vs Local Status Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Storage & Sync Mode</h3>
            <p className="text-xs text-slate-500">How your notes and flashcards are persisted</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Mode: Local Storage
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700">
              Offline Ready
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your notes and study decks are securely stored inside your browser's persistent local storage. Your data remains private to this computer and browser session.
          </p>
        </div>

        {/* Firebase Cloud Sync explanation */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3 text-xs text-slate-700">
          <Cloud className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-slate-900">Cloud Sync & Firebase Authentication:</strong>
            <p className="leading-relaxed">
              To synchronize your notes across multiple mobile and desktop devices with Google Sign-in, Firebase Auth & Firestore can be connected through AI Studio's provisioning tools. In local mode, you can use the JSON Backup & Restore buttons below at any time to transfer your notes.
            </p>
          </div>
        </div>
      </div>

      {/* Study Defaults Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Study Generation Defaults</h3>
            <p className="text-xs text-slate-500">Preset preferences applied when creating new notes</p>
          </div>
        </div>

        <form onSubmit={handleSavePrefs} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Education Level
              </label>
              <select
                value={eduLevel}
                onChange={(e) => setEduLevel(e.target.value as EducationLevel)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="school">School (K-12)</option>
                <option value="college">College / Undergraduate</option>
                <option value="engineering">Engineering / Technical</option>
                <option value="general">General Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Output Language
              </label>
              <select
                value={outputLang}
                onChange={(e) => setOutputLang(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Mandarin">Mandarin (中文)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Portuguese">Portuguese</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Detail Level
              </label>
              <select
                value={noteLength}
                onChange={(e) => setNoteLength(e.target.value as NoteLength)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="short">Short (High-Yield / Cram)</option>
                <option value="medium">Medium (Balanced Overview)</option>
                <option value="detailed">Detailed (Deep & Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Note Type
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as NoteType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="detailed">Detailed Notes</option>
                <option value="revision">Quick Revision</option>
                <option value="flashcards">Flashcards</option>
                <option value="quiz">Multiple-Choice Quiz</option>
                <option value="formula">Formula Sheet</option>
                <option value="summary">Chapter Summary</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Defaults</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Library Backup & Recovery
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-sm text-slate-900">Export Library JSON</div>
            <p className="text-xs text-slate-500 mt-0.5">
              Download all your notes, flashcards, and quizzes in a portable JSON file.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Backup</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div>
            <div className="font-semibold text-sm text-slate-900">Restore Library from JSON</div>
            <p className="text-xs text-slate-500 mt-0.5">
              Import a previously exported JSON backup file to merge or restore your notes.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <FileUp className="w-4 h-4" />
              <span>Import Backup</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            {importStatus}
          </div>
        )}

        {/* Danger Zone */}
        <div className="pt-4 border-t border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-sm text-red-600">Erase All Local Data</div>
            <p className="text-xs text-slate-500 mt-0.5">
              Delete all cached notes, quizzes, and flashcards from this device.
            </p>
          </div>
          <button
            onClick={handleClearAllNotes}
            className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
