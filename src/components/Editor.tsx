/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Plus, 
  X, 
  Sparkles, 
  Info,
  FileText,
  Bookmark,
  BookOpen,
  Edit3,
  CheckSquare,
  Users,
  Tag
} from 'lucide-react';
import { Note, ThemeColors, EditorFont } from '../types';

interface EditorProps {
  note: Note | null;
  theme: ThemeColors;
  editorFont: EditorFont;
  editorFontSize: number;
  onUpdateNote: (id: string, fields: Partial<Note>) => void;
  onSetEditorFont: (font: EditorFont) => void;
  onSetEditorFontSize: (size: number) => void;
  onDeleteNote: (id: string) => void;
  onAddFromTemplate: (templateContent: string, title: string, category: string) => void;
  onImportNote: (content: string, filename: string) => void;
}

export default function Editor({
  note,
  theme,
  editorFont,
  editorFontSize,
  onUpdateNote,
  onSetEditorFont,
  onSetEditorFontSize,
  onDeleteNote,
  onAddFromTemplate,
  onImportNote
}: EditorProps) {
  const [newTag, setNewTag] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Trigger a brief saving flash when user typing occurs
  useEffect(() => {
    if (!note) return;
    setIsSaving(true);
    const handler = setTimeout(() => {
      setIsSaving(false);
    }, 650);
    return () => clearTimeout(handler);
  }, [note?.content, note?.title, note?.category, note?.tags]);

  // Read-only/Auto-Metrics calculation
  const metrics = useMemo(() => {
    if (!note) return { words: 0, characters: 0, sentences: 0, paragraphs: 0, readTime: 0 };
    const content = note.content || '';
    const charCount = content.length;
    const cleanText = content.trim();
    const wordCount = cleanText === '' ? 0 : cleanText.split(/\s+/).length;
    // Simple calculations for sentences & paragraphs
    const paragraphCount = cleanText === '' ? 0 : cleanText.split(/\n\s*\n/).length;
    const sentenceCount = cleanText === '' ? 0 : (cleanText.match(/[.!?]+(\s|$)/g) || []).length || 1;
    const readMinutes = Math.ceil(wordCount / 200); // Average 200 words per minute

    return {
      words: wordCount,
      characters: charCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      readTime: readMinutes === 0 ? 1 : readMinutes
    };
  }, [note?.content]);

  // Handle tags adding
  const handleAddTag = () => {
    if (!note || !newTag.trim()) return;
    const tag = newTag.trim().toLowerCase().replace(/#/g, '');
    if (!note.tags.includes(tag)) {
      onUpdateNote(note.id, { tags: [...note.tags, tag] });
    }
    setNewTag('');
  };

  // Delete a specific tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!note) return;
    onUpdateNote(note.id, { tags: note.tags.filter(t => t !== tagToRemove) });
  };

  // Convert casings helper
  const transformCasing = (mode: 'upper' | 'lower' | 'title') => {
    if (!note) return;
    let newContent = note.content;
    if (mode === 'upper') {
      newContent = note.content.toUpperCase();
    } else if (mode === 'lower') {
      newContent = note.content.toLowerCase();
    } else if (mode === 'title') {
      newContent = note.content.replace(/\b\w/g, c => c.toUpperCase());
    }
    onUpdateNote(note.id, { content: newContent });
  };

  // Download Note as .txt or .md
  const handleDownload = (format: 'txt' | 'md') => {
    if (!note) return;
    const filename = `${note.title || 'untitled'}.${format}`;
    let fileContent = note.content;
    
    // Add minor header template fields if txt file is requested
    if (format === 'txt') {
      fileContent = `Title: ${note.title || 'Untitled note'}\nCategory: ${note.category || 'General'}\nTags: ${note.tags.join(', ') || 'None'}\nUpdated: ${new Date(note.updatedAt).toLocaleString()}\n\n---\n\n${note.content}`;
    }

    const element = document.createElement("a");
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle local File Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      onImportNote(content, file.name);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input element
  };

  // Copy active text to Clipboard
  const handleCopyToClipboard = () => {
    if (!note) return;
    navigator.clipboard.writeText(note.content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Elegant Document Printing
  const handlePrint = () => {
    if (!note) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${note.title || 'Print Note'}</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 40px; color: #222; line-height: 1.6; }
            h1 { font-family: 'Segoe UI', sans-serif; font-size: 28px; border-bottom: 2px solid #ccc; padding-bottom: 12px; }
            .meta { color: #666; font-size: 13px; font-family: 'Segoe UI', sans-serif; margin-bottom: 30px; }
            .content { white-space: pre-wrap; word-wrap: break-word; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${note.title || 'Untitled Note'}</h1>
          <div class="meta">
            <strong>Category:</strong> ${note.category || 'General'} | 
            <strong>Tags:</strong> ${note.tags.join(', ') || 'None'} | 
            <strong>Last Updated:</strong> ${new Date(note.updatedAt).toLocaleString()}
          </div>
          <div class="content">${note.content}</div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Clean, fast Custom Markdown checklist click parser
  const toggleChecklistInMarkdown = (lineIndex: number, isChecked: boolean) => {
    if (!note) return;
    const lines = note.content.split('\n');
    let tracker = 0;
    
    const newLines = lines.map((line, idx) => {
      // Find list checkbox lines
      const checkMatch = line.match(/^(\s*[-*]\s*)\[([ xX])\](.*)/);
      if (checkMatch) {
        if (tracker === lineIndex) {
          const replacementBox = isChecked ? ' ' : 'x';
          return `${checkMatch[1]}[${replacementBox}]${checkMatch[3]}`;
        }
        tracker++;
      }
      return line;
    });

    onUpdateNote(note.id, { content: newLines.join('\n') });
  };

  // Elegant Interactive Custom Markdown renderer (Handles major list items, blocks, and headers)
  const renderedMarkdown = useMemo(() => {
    if (!note) return null;
    const lines = note.content.split('\n');
    
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let checklistIndex = 0;

    return (
      <div className="space-y-3 prose max-w-none text-current" style={{ fontSize: `${editorFontSize}px` }}>
        {lines.map((line, idx) => {
          // 1. Code Block detector
          if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
              inCodeBlock = false;
              const savedCode = codeContent.join('\n');
              codeContent = [];
              return (
                <pre key={idx} className="bg-black/5 dark:bg-black/30 p-4 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto border border-black/10 select-all">
                  <code>{savedCode}</code>
                </pre>
              );
            } else {
              inCodeBlock = true;
              return null;
            }
          }
          
          if (inCodeBlock) {
            codeContent.push(line);
            return null;
          }

          const trimmed = line.trim();

          // 2. Headings
          if (trimmed.startsWith('#')) {
            const level = (line.match(/^#+/) || ['#'])[0].length;
            const text = line.replace(/^#+\s*/, '');
            if (level === 1) {
              return <h1 key={idx} className="text-3xl font-extrabold tracking-tight mt-6 mb-3 border-b border-black/10 pb-2 text-current">{text}</h1>;
            } else if (level === 2) {
              return <h2 key={idx} className="text-2xl font-bold tracking-tight mt-5 mb-2.5 text-current">{text}</h2>;
            } else {
              return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2 text-current">{text}</h3>;
            }
          }

          // 3. Horizontal Rule
          if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
            return <hr key={idx} className="my-6 border-t-2 border-black/10" />;
          }

          // 4. Interactive Checklist
          const checkMatch = line.match(/^(\s*[-*]\s*)\[([ xX])\](.*)/);
          if (checkMatch) {
            const currentIdx = checklistIndex;
            checklistIndex++;
            const checked = checkMatch[2].toLowerCase() === 'x';
            const labelText = checkMatch[3].trim();
            const paddingLeft = checkMatch[1].length * 12;

            return (
              <div key={idx} className="flex items-start gap-3 py-1 text-current group" style={{ paddingLeft: `${paddingLeft}px` }}>
                <input
                  id={`preview-chk-${currentIdx}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleChecklistInMarkdown(currentIdx, checked)}
                  className="mt-1 w-4.5 h-4.5 text-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded border-amber-300 transform scale-105 cursor-pointer"
                />
                <span className={`text-base select-text flex-1 ${checked ? 'line-through opacity-50' : 'opacity-90'}`}>
                  {labelText || <span className="italic opacity-30">[Empty item]</span>}
                </span>
              </div>
            );
          }

          // 5. Bullet List Items (Not Checkboxes)
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const text = trimmed.slice(2);
            return (
              <ul key={idx} className="list-disc pl-6 space-y-1 text-current my-1">
                <li className="opacity-90">{text}</li>
              </ul>
            );
          }

          // 6. Blockquote
          if (trimmed.startsWith('>')) {
            const text = trimmed.replace(/^>\s*/, '');
            return (
              <blockquote key={idx} className="border-l-4 border-amber-500/50 pl-4 py-1 italic opacity-80 my-3">
                {text}
              </blockquote>
            );
          }

          // 7. Base Paragraph Lines
          if (trimmed === '') {
            return <div key={idx} className="h-2.5" />;
          }

          return (
            <p key={idx} className="leading-relaxed opacity-90 my-1.5 min-h-[1.2em] whitespace-pre-wrap select-text">
              {line}
            </p>
          );
        })}
      </div>
    );
  }, [note?.content, editorFontSize]);

  // Handle editor fallback when there are zero selected notes
  if (!note) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${theme.bg} ${theme.text}`}>
        <div className="max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50 p-8 rounded-3xl shadow-xl flex flex-col items-center">
          <BookOpen className="w-16 h-16 text-amber-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">No Active Note</h2>
          <p className="text-sm opacity-70 mb-6">
            Write down your inspirations, build structured outlines, or seed notes instantly using one of our responsive templates below.
          </p>
          
          <div className="w-full text-left">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-3 text-center">
              Quick Setup Note Templates
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                id="template-todo-quick"
                onClick={() => onAddFromTemplate(`To-Do Checklist`, 'Daily To-Do List', 'Personal')}
                className="flex items-center gap-3 p-3 bg-white/90 dark:bg-neutral-850 hover:bg-amber-100/50 dark:hover:bg-amber-950/20 border border-neutral-100 dark:border-neutral-800 rounded-xl transition-all font-medium text-xs text-left"
              >
                <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/30">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">To-Do Action List</div>
                  <div className="font-normal opacity-60 text-[10px]">Track checklists, goals, and daily tasks</div>
                </div>
              </button>

              <button
                id="template-work-quick"
                onClick={() => onAddFromTemplate(`Meeting Minutes`, 'Meeting Reflections', 'Work')}
                className="flex items-center gap-3 p-3 bg-white/90 dark:bg-neutral-850 hover:bg-amber-100/50 dark:hover:bg-amber-950/20 border border-neutral-100 dark:border-neutral-800 rounded-xl transition-all font-medium text-xs text-left"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Meeting Minutes</div>
                  <div className="font-normal opacity-60 text-[10px]">Document participants, agendas, and actions</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-xs opacity-50">OR</span>
            <button
              id="btn-import-first-note"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1.5 text-amber-700 font-bold hover:underline"
            >
              <Upload className="w-3.5 h-3.5" />
              Import draft file (.txt, .md)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 relative ${theme.bg} ${theme.text} ${
        isFullscreen ? 'fixed inset-0 z-30' : ''
      }`}
    >
      {/* Top toolbar */}
      <header className={`px-4 py-3 border-b flex flex-col lg:flex-row gap-3 lg:items-center justify-between shadow-xs select-none ${theme.border} bg-white/60 dark:bg-black/10 backdrop-blur-xs`}>
        {/* Right notes editor state */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Pill Picker */}
          <div className="flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 opacity-60" />
            <select
              id="select-note-category"
              value={note.category}
              disabled={note.isArchived}
              onChange={(e) => onUpdateNote(note.id, { category: e.target.value })}
              className="bg-black/5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer text-current disabled:opacity-50"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Ideas">Ideas</option>
              <option value="Drafts">Draft</option>
            </select>
          </div>

          <div className="h-4 w-px bg-current opacity-20 hidden sm:block" />

          {/* Typography options */}
          <div className="flex items-center bg-black/5 rounded-lg p-0.5 border border-black/5">
            <button
              id="btn-editor-font-sans"
              onClick={() => onSetEditorFont('sans')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md transition-all ${
                editorFont === 'sans' ? 'bg-white shadow-xs text-amber-950 font-extrabold' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Sans
            </button>
            <button
              id="btn-editor-font-serif"
              onClick={() => onSetEditorFont('serif')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md transition-all ${
                editorFont === 'serif' ? 'bg-white shadow-xs text-amber-950 font-extrabold' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Serif
            </button>
            <button
              id="btn-editor-font-mono"
              onClick={() => onSetEditorFont('mono')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md transition-all ${
                editorFont === 'mono' ? 'bg-white shadow-xs text-amber-950 font-extrabold' : 'opacity-60 hover:opacity-100'
              }`}
            >
              Mono
            </button>
          </div>

          {/* Text Size sizing buttons */}
          <div className="flex items-center bg-black/5 rounded-lg p-0.5 border border-black/5 text-xs font-semibold">
            <button
              id="btn-font-dec"
              onClick={() => onSetEditorFontSize(Math.max(12, editorFontSize - 1))}
              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1.5 font-mono text-[10px]">{editorFontSize}px</span>
            <button
              id="btn-font-inc"
              onClick={() => onSetEditorFontSize(Math.min(28, editorFontSize + 1))}
              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Dynamic Note Utilities: Print, Copy, Download, Mode Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit/Preview Toggle Pill */}
          <div className="flex bg-black/5 rounded-lg p-0.5">
            <button
              id="btn-toggle-editor"
              onClick={() => setIsPreviewMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                !isPreviewMode ? 'bg-white shadow-xs text-amber-900' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              id="btn-toggle-preview"
              onClick={() => setIsPreviewMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                isPreviewMode ? 'bg-white shadow-xs text-amber-900' : 'opacity-60 hover:opacity-100'
              }`}
              title="Markdown Formatting & Interactive Checklist preview"
            >
              <FileText className="w-3.5 h-3.5" />
              Preview (MD)
            </button>
          </div>

          <div className="h-4 w-px bg-current opacity-20 hidden sm:block" />

          {/* Core file adjustments */}
          <div className="flex items-center gap-1">
            {/* Clipboard Trigger */}
            <button
              id="btn-copy-clipboard"
              onClick={handleCopyToClipboard}
              className={`p-1.5 rounded-lg hover:bg-black/5 transition-all text-current`}
              title="Copy to Clipboard"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Print Trigger */}
            <button
              id="btn-print-note"
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-all text-current"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* TXT Download Action */}
            <button
              id="btn-download-txt"
              onClick={() => handleDownload('txt')}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-all text-current text-xs font-bold flex items-center gap-1"
              title="Download Note as TXT File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TXT</span>
            </button>

            {/* MD Download Action */}
            <button
              id="btn-download-md"
              onClick={() => handleDownload('md')}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-all text-current text-xs font-bold flex items-center gap-1"
              title="Download Note as MD File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MD</span>
            </button>

            <button
              id="btn-import-file-inline"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-all text-current"
              title="Import local .txt or .md file"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              className="hidden"
            />
          </div>

          <div className="h-4 w-px bg-current opacity-20 hidden md:block" />

          {/* Toggle Fullscreen mode button */}
          <button
            id="btn-toggle-fullscreen"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-all text-current hidden md:block"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Writing Focus"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Editor Main Canvas Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 flex flex-col gap-4 scrollbar-thin">
        {/* Save confirmation + informational alert on top if in soft Deleted Draft view */}
        {note.isArchived && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-700 rounded-xl text-xs flex items-center justify-between font-semibold">
            <span>This note is located in the Trash container. Restore it to make active edits.</span>
            <button
              id="btn-purge-permanent"
              onClick={() => onDeleteNote(note.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-xs transition-colors"
            >
              Purge Permanently
            </button>
          </div>
        )}

        {/* Note title */}
        <div className="flex items-center gap-3">
          <input
            id="editable-note-title"
            type="text"
            placeholder="Title of Note..."
            value={note.title}
            disabled={!!note.isArchived}
            onChange={(e) => onUpdateNote(note.id, { title: e.target.value })}
            className={`w-full font-bold text-3xl md:text-4xl bg-transparent border-none outline-none focus:ring-0 placeholder-current opacity-50 focus:opacity-100 transition-opacity tracking-tight font-sans disabled:opacity-40`}
          />
          
          {/* Quick inline Saving Flash dot */}
          <div className="flex items-center gap-1 text-[10px] opacity-40 shrink-0 select-none">
            <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500 animate-ping' : 'bg-green-600'}`} />
            <span>{isSaving ? 'saved' : 'cached'}</span>
          </div>
        </div>

        {/* Tag row picker */}
        <div className="flex flex-wrap items-center gap-1.5 py-1 select-none">
          <Tag className="w-3.5 h-3.5 opacity-40" />
          
          {note.tags.map((tag) => (
            <span 
              key={tag}
              className="flex items-center gap-1 text-xs border border-current opacity-70 px-2 py-0.5 rounded-md font-mono"
            >
              #{tag}
              {!note.isArchived && (
                <button 
                  id={`remove-tag-btn-${tag}`}
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}

          {!note.isArchived && (
            <div className="flex items-center gap-1 ml-1.5">
              <input
                id="input-inline-tag"
                type="text"
                placeholder="add tag..."
                value={newTag}
                ref={tagInputRef}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="bg-transparent border-b border-dashed border-current opacity-40 hover:opacity-100 focus:opacity-100 text-xs py-0.5 px-1 outline-none font-mono focus:border-solid w-16 focus:w-24 transition-all"
              />
              <button 
                id="btn-add-tag-action"
                onClick={handleAddTag}
                className="p-1 hover:bg-black/5 rounded"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Standard divider */}
        <div className="h-px bg-current opacity-10" />

        {/* Editor or Markdown render viewport */}
        <div className="flex-1 min-h-[300px]">
          {isPreviewMode ? (
            <div id="markdown-rendered-view" className="h-full select-text selection:bg-amber-100">
              {note.content.trim() ? (
                renderedMarkdown
              ) : (
                <div className="text-center py-16 opacity-40 italic">
                  Note is empty. Type in the Editor first to see a beautiful rich layout.
                </div>
              )}
            </div>
          ) : (
            <textarea
              id="notepad-textarea-canvas"
              placeholder="Start drafting your note here. Markdown formatting is supported (e.g., # headers, - [ ] checklists, **bold**)..."
              value={note.content}
              disabled={!!note.isArchived}
              onChange={(e) => onUpdateNote(note.id, { content: e.target.value })}
              style={{
                fontSize: `${editorFontSize}px`,
                fontFamily: editorFont === 'sans' ? 'var(--font-sans)' : editorFont === 'serif' ? 'var(--font-serif)' : 'var(--font-mono)'
              }}
              className="w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none focus:ring-0 leading-relaxed placeholder-current opacity-70 focus:opacity-100 transition-opacity scrollbar-thin select-text"
            />
          )}
        </div>
      </div>

      {/* Editor bottom status statistics footer */}
      <footer className={`px-4 py-2 border-t flex flex-col md:flex-row gap-3 md:items-center justify-between select-none ${theme.border} bg-white/40 dark:bg-black/15 text-xs opacity-80`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Words: <strong className="font-mono">{metrics.words}</strong></span>
          <span>Chars: <strong className="font-mono">{metrics.characters}</strong></span>
          <span>Sentences: <strong className="font-mono">{metrics.sentences}</strong></span>
          <span>Paragraphs: <strong className="font-mono">{metrics.paragraphs}</strong></span>
          <span>Reading speed: <strong className="font-mono font-bold">~ {metrics.readTime} min</strong></span>
        </div>

        {/* Text casing and quick transform actions */}
        {!note.isArchived && !isPreviewMode && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] opacity-60 mr-1.5 uppercase tracking-wider">Casing:</span>
            <button
              id="casing-uppercase"
              onClick={() => transformCasing('upper')}
              className="px-2 py-0.5 bg-black/5 hover:bg-black/10 rounded font-bold text-[10px] uppercase transition-colors"
              title="Convert all characters to uppercase"
            >
              AAA
            </button>
            <button
              id="casing-lowercase"
              onClick={() => transformCasing('lower')}
              className="px-2 py-0.5 bg-black/5 hover:bg-black/10 rounded font-bold text-[10px] lowercase transition-colors"
              title="Convert all characters to lowercase"
            >
              aaa
            </button>
            <button
              id="casing-titlecase"
              onClick={() => transformCasing('title')}
              className="px-2 py-0.5 bg-black/5 hover:bg-[#b6732e]/10 hover:text-[#b6732e] rounded font-bold text-[10px] capitalize transition-all"
              title="Capitalize every word"
            >
              Aa Aa
            </button>

            <div className="w-px h-3 bg-current opacity-20 mx-1" />

            <button
              id="casing-clear"
              onClick={() => onUpdateNote(note.id, { content: '' })}
              className="px-2 py-0.5 bg-red-150/10 text-red-600 hover:bg-red-500 hover:text-white rounded font-bold text-[10px] transition-all"
              title="Empty whole content canvas"
            >
              Clear
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
