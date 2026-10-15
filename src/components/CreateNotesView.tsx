import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileUp,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  GraduationCap,
  Languages,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  ClipboardPaste,
} from 'lucide-react';
import {
  EducationLevel,
  NoteType,
  NoteLength,
  GenerationParams,
  NoteDocument,
} from '../types/note';
import { extractDocumentText, generateNotesApi } from '../services/api';

interface CreateNotesViewProps {
  onNoteCreated: (note: NoteDocument) => void;
  defaultEducationLevel?: EducationLevel;
  defaultOutputLanguage?: string;
  defaultLength?: NoteLength;
}

const SAMPLE_LECTURES: { label: string; subject: string; topic: string; level: EducationLevel; text: string }[] = [
  {
    label: 'Neuroscience: Synaptic Plasticity & Long-Term Potentiation',
    subject: 'Neurobiology',
    topic: 'Synaptic Plasticity',
    level: 'college',
    text: `Synaptic plasticity is the biological process by which specific patterns of synaptic activity result in changes in synaptic strength and is thought to contribute to learning and memory. The primary model mechanism is Long-Term Potentiation (LTP), first observed in the rabbit hippocampus by Terje Lømo in 1966.

During basal neurotransmission, glutamate released from the presynaptic terminal binds to AMPA receptors on the postsynaptic dendritic spine, causing an influx of sodium (Na+) ions and mild depolarization. At resting membrane potential (-70 mV), the pore of the NMDA receptor is physically blocked by an extracellular magnesium ion (Mg2+).

When high-frequency stimulation (tetanus) induces strong and prolonged depolarization of the postsynaptic membrane (to approximately -30 mV or higher), the electrostatic repulsion expels the Mg2+ block from the NMDA channel. This permits a critical influx of calcium ions (Ca2+) into the dendritic spine.

The elevated intracellular Ca2+ binds to calmodulin, activating Ca2+/calmodulin-dependent protein kinase II (CaMKII). Activated CaMKII autophosphorylates at Thr286, locking it in an autonomously active state. CaMKII phosphorylates existing AMPA receptors (enhancing their single-channel conductance) and drives the exocytosis and insertion of additional AMPA receptors from intracellular endosomes into the postsynaptic density (PSD). The net functional result is an enduring increase in the amplitude of excitatory postsynaptic potentials (EPSPs) in response to subsequent presynaptic action potentials.`,
  },
  {
    label: 'Thermodynamics: The Carnot Cycle & Entropy',
    subject: 'Physics & Engineering',
    topic: 'Carnot Heat Engine',
    level: 'engineering',
    text: `The Carnot cycle represents an idealized thermodynamic cycle proposed by Nicolas Léonard Sadi Carnot in 1824. It establishes the upper limit on the efficiency that any classical heat engine can achieve during the conversion of thermal energy into mechanical work between two thermal reservoirs.

The cycle operates on a closed system containing an ideal gas and consists of four reversible thermodynamic processes:
1. Isothermal Expansion (Process 1 -> 2): The working gas is in thermal contact with a high-temperature reservoir at temperature Th. The gas expands reversibly, absorbing heat Qh while maintaining constant temperature Th. Internal energy change ΔU = 0, so work done W12 = Qh = n*R*Th*ln(V2/V1).
2. Isentropic (Adiabatic) Expansion (Process 2 -> 3): The cylinder is thermally insulated. The gas continues to expand without heat transfer (Q = 0), doing work against external pressure. The gas temperature drops from Th to low temperature Tc.
3. Isothermal Compression (Process 3 -> 4): The cylinder is placed in contact with a cold reservoir at temperature Tc. External work is done on the gas to compress it, rejecting heat Qc into the cold sink at constant temperature Tc. W34 = -Qc = n*R*Tc*ln(V4/V3).
4. Isentropic (Adiabatic) Compression (Process 4 -> 1): The cylinder is insulated again. Compression continues adiabatically without heat transfer, raising the temperature of the gas back from Tc to Th.

The maximum thermal efficiency η_Carnot is derived strictly from reservoir temperatures:
η_Carnot = 1 - (Tc / Th) = (Th - Tc) / Th

By Clausius's formulation of the Second Law of Thermodynamics, the integral of dQ/T around the reversible Carnot cycle equals zero: ∮(dQ/T) = 0. This defines entropy (S) as a state variable: dS = dQ_rev / T. In irreversible cycles, ∮(dQ/T) < 0, signifying net entropy generation in the universe.`,
  },
];

export const CreateNotesView: React.FC<CreateNotesViewProps> = ({
  onNoteCreated,
  defaultEducationLevel = 'college',
  defaultOutputLanguage = 'English',
  defaultLength = 'medium',
}) => {
  // Input mode tab: 'upload' | 'text' | 'transcript'
  const [inputTab, setInputTab] = useState<'upload' | 'text' | 'transcript'>('upload');

  // Input states
  const [sourceText, setSourceText] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(defaultEducationLevel);
  const [noteType, setNoteType] = useState<NoteType>('detailed');
  const [length, setLength] = useState<NoteLength>(defaultLength);
  const [sourceLanguage, setSourceLanguage] = useState('Auto-detect');
  const [outputLanguage, setOutputLanguage] = useState(defaultOutputLanguage);

  // File upload states
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ pages?: number; words?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File drop handler
  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setExtractionWarning(null);

    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Please upload a PDF (.pdf), Word (.docx), or plain text (.txt) document.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds 20MB. Please select a smaller file.');
      return;
    }

    setIsExtractingFile(true);
    setUploadedFileName(file.name);

    try {
      const extracted = await extractDocumentText(file);
      setSourceText(extracted.text);
      setFileDetails({ pages: extracted.pageCount, words: extracted.wordCount });

      if (extracted.warning) {
        setExtractionWarning(extracted.warning);
      }

      // Auto-populate subject or topic if empty based on file name
      if (!topic) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTopic(cleanName);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract text from document.');
      setUploadedFileName(null);
      setFileDetails(null);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sourceText || sourceText.trim().length < 20) {
      setErrorMessage('Please provide at least 20 characters of source text or upload a document.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing source content structure...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Synthesizing core concepts and definitions with Gemini...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Structuring study sections, examples, and takeaways...');
      }, 3500);

      const params: GenerationParams = {
        sourceText,
        subject: subject.trim() || 'General Studies',
        topic: topic.trim() || undefined,
        educationLevel,
        noteType,
        length,
        sourceLanguage,
        outputLanguage,
      };

      const result = await generateNotesApi(params);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const newNote: NoteDocument = {
        id: `note-${Date.now()}`,
        title: result.title || (topic ? `${topic} Notes` : `${subject || 'Study'} Notes`),
        subject: subject.trim() || 'General Studies',
        topic: topic.trim() || undefined,
        educationLevel,
        noteType,
        length,
        sourceLanguage,
        outputLanguage,
        content: result.content || '',
        flashcards: result.flashcards,
        quiz: result.quiz,
        sourceSnippet: sourceText.slice(0, 1500),
        sourceWordCount: sourceText.split(/\s+/).filter(Boolean).length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [subject || 'Study', noteType],
      };

      onNoteCreated(newNote);
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const loadSample = (sample: typeof SAMPLE_LECTURES[0]) => {
    setSubject(sample.subject);
    setTopic(sample.topic);
    setEducationLevel(sample.level);
    setSourceText(sample.text);
    setInputTab('text');
  };

  const clearUploadedFile = () => {
    setUploadedFileName(null);
    setSourceText('');
    setFileDetails(null);
    setExtractionWarning(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Study Notes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload course materials, paste transcripts, or enter topics to generate structured notes, flashcards, or quizzes.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Input Method Selector Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1">
          <button
            type="button"
            onClick={() => setInputTab('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              inputTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document (PDF, DOCX, TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => setInputTab('text')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              inputTab === 'text'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Text or Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setInputTab('transcript')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              inputTab === 'transcript'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lecture Transcript</span>
          </button>
        </div>

        {/* Input Content Area */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          {/* Tab 1: Upload */}
          {inputTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedFileName ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100/80 flex items-center justify-center text-indigo-600 transition">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Drop your PDF, DOCX, or TXT file here
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports up to 20MB. Real text extraction occurs on our secure server.
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                /* Uploaded File Info Card */
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{uploadedFileName}</div>
                      <div className="text-xs text-slate-500">
                        {fileDetails?.words ? `${fileDetails.words} words extracted` : 'Document extracted'}{' '}
                        {fileDetails?.pages ? `• ${fileDetails.pages} pages` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearUploadedFile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {isExtractingFile && (
                <div className="flex items-center gap-2 p-3 text-xs text-indigo-700 bg-indigo-50 rounded-xl border border-indigo-200">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Extracting text and verifying document integrity on server...</span>
                </div>
              )}

              {extractionWarning && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Scanned PDF / Image Notice:</strong>
                    <p className="mt-0.5 leading-relaxed">{extractionWarning}</p>
                  </div>
                </div>
              )}

              {sourceText && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Extracted Document Preview ({sourceText.split(/\s+/).filter(Boolean).length} words)
                  </label>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    rows={6}
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="Extracted content will appear here..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 2 & 3: Paste Text or Transcript */}
          {(inputTab === 'text' || inputTab === 'transcript') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {inputTab === 'transcript' ? 'Lecture Transcript / Recording Text' : 'Study Text or Topic Material'} *
                </label>
                <div className="text-xs text-slate-400">
                  {sourceText.split(/\s+/).filter(Boolean).length} words • {sourceText.length} chars
                </div>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={10}
                required
                className="w-full text-sm p-4 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-800"
                placeholder={
                  inputTab === 'transcript'
                    ? "Paste your lecture transcript here (e.g. 'Professor Smith: Today we will explore thermodynamics and the Carnot cycle...')"
                    : 'Paste article text, chapter excerpt, or raw study notes here...'
                }
              />

              {/* Sample loader */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Need inspiration? Try a sample:</span>
                <div className="flex gap-2">
                  {SAMPLE_LECTURES.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadSample(s)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      {s.subject} Sample
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Note Configuration Form Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Generation Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Area *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Chemistry, Quantum Physics, History"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Topic or Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Nucleophilic Substitution, Carnot Engine"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Education Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Target Education Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'school', label: 'School (K-12)', desc: 'Intuitive everyday analogies' },
                { id: 'college', label: 'College / Undergrad', desc: 'Academic rigor & terminology' },
                { id: 'engineering', label: 'Engineering / Tech', desc: 'Formulas, logic & edge cases' },
                { id: 'general', label: 'General Learner', desc: 'Clear, practical real-world' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEducationLevel(lvl.id as EducationLevel)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    educationLevel === lvl.id
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm">{lvl.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Note Format Selector (10 Options) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Output Format & Study Structure</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'detailed', label: 'Detailed Notes', icon: '📝' },
                { id: 'revision', label: 'Quick Revision (Cram)', icon: '⚡' },
                { id: 'summary', label: 'Chapter Summary', icon: '📖' },
                { id: 'definitions', label: 'Key Definitions', icon: '🏷️' },
                { id: 'qa', label: 'Important Q&A', icon: '❓' },
                { id: 'viva', label: 'Viva / Oral Prep', icon: '🎙️' },
                { id: 'flashcards', label: 'Flashcards Deck', icon: '🗂️' },
                { id: 'quiz', label: 'Multiple Choice Quiz', icon: '🎯' },
                { id: 'formula', label: 'Formula Sheet', icon: '∑' },
                { id: 'step_by_step', label: 'Step-by-Step Flow', icon: '🔢' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setNoteType(type.id as NoteType)}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    noteType === type.id
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-xs leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Depth / Length & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Detail Level</span>
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as NoteLength)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="short">Short (High-Yield / Concise)</option>
                <option value="medium">Medium (Balanced Overview)</option>
                <option value="detailed">Detailed (Comprehensive / Deep)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                <span>Source Language</span>
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Auto-detect">Auto-detect</option>
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
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                <span>Output Language</span>
              </label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
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
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress Feedback Indicator */}
        {isGenerating && (
          <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-indigo-800 font-bold text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Generating Notes with Gemini 3.8 Flash...</span>
            </div>
            <p className="text-xs text-indigo-600 font-medium">{generationStep}</p>
          </div>
        )}

        {/* Primary CTA Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || isExtractingFile || !sourceText.trim()}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 disabled:opacity-50 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Study Material...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Notes with NoteMind AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
