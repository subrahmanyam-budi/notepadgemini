/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  HelpCircle, 
  Sparkles, 
  Info,
  ChevronRight,
  BookOpen,
  Plus,
  ArrowRight,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import { Note, EditorFont, ThemeColors } from './types';
import { THEMES } from './data/themes';
import { NOTE_TEMPLATES } from './data/templates';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';

// LocalStorage persistent key identifiers
const STORAGE_KEY_NOTES = 'notepad_app_notes_v1';
const STORAGE_KEY_THEME = 'notepad_app_theme_v1';
const STORAGE_KEY_FONT = 'notepad_app_font_v1';
const STORAGE_KEY_FONT_SIZE = 'notepad_app_font_size_v1';

// Polished onboarding welcome notes to seed if storage is empty
const INITIAL_NOTES_SEED: Note[] = [
  {
    id: 'welcome-notes-1',
    title: 'Welcome to your Digital Notepad! 📝',
    category: 'Personal',
    tags: ['guide', 'onboarding', 'notepad'],
    isPinned: true,
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
    updatedAt: Date.now() - 3600000 * 2,
    content: `Welcome to your Digital Notepad! 📝
===============================

This is a modern, distraction-free writing environment built with high-craft speed, typography adjustments, and instant local state persistence.

Key Capabilities:
-----------------
1. **Auto-Save Engine**: Any word typed in the canvas is cached instantly to your browser's local state. Try closing or refreshing this tab—your drafts are fully preserved!
2. **Typography Selector**: Toggle between clean *Sans-serif*, literary *Serif* (Lora), and code-centered *Monospace* (JetBrains Mono).
3. **Advanced Text Statistics**: Live metrics are calculated on the bottom panel (words, sentences, density, and average reading time).
4. **Markdown Preview mode**: Toggle "Preview (MD)" on the top-right tool bar to render rich markdown layouts, code formatting block styles, blockquotes, and checkboxes.
5. **Interactive Checklist**: Clicking a checkbox in preview mode flips the text state (\`- [ ]\`) back and forth in real-time! Try it!
6. **Files Export & Import**: Save your documents as standard TXT files or Markdown files directly to your hard drive, or upload existing notes to continue drafting here.

Let's try formatting some Markdown:
---

### Markdown Checklist Practice:
- [ ] Read this onboarding guide completely
- [x] Select the theme panel to switch visual color schemes
- [ ] Create a brand new blank note using the purple sidebar action

\`\`\`javascript
// Enjoy beautiful monospace block layouts
const notepad = {
  speed: "Near-instantaneous",
  persistence: "Local Storage offline-safe",
  typography: "Highly optimized"
};
\`\`\`

> "Good typography is silent. It guides the eye and centers focus, letting your ideas speak."
`
  },
  {
    id: 'welcome-notes-2',
    title: '🚀 Idea Board: Smart Productivity Extensions',
    category: 'Ideas',
    tags: ['ideas', 'roadmap'],
    isPinned: false,
    createdAt: Date.now() - 60000 * 15, // 15 mins ago
    updatedAt: Date.now() - 60000 * 15,
    content: `🚀 Idea Board: Smart Productivity Extensions
===========================================

Reviewing conceptual items to expand the notepad experience.

Feature Candidates:
-------------------
- [ ] Add support for custom tag labels and group categorization
- [ ] Design a minimalist Pomodoro focal clock widget in the corner
- [ ] Incorporate standard word-find and string replacements
- [x] Configure offline printing style overrides (Completed! Try hitting the printer icon on the toolbar!)

Resource Outlay:
* Development Platform: Google AI Studio container
* CSS Framework: Tailwind CSS v4 Utility classes
* Font Pairing: Inter, Lora, and JetBrains Mono

Next Steps:
-----------
Get writing! Delete or modify this note as you see fit. Your changes will save immediately.
`
  }
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // Custom states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editorFont, setEditorFont] = useState<EditorFont>('sans');
  const [editorFontSize, setEditorFontSize] = useState<number>(15);
  const [themeId, setThemeId] = useState<string>('paper');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [showThemePanel, setShowThemePanel] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // 1. Loading cached values on initial mount
  useEffect(() => {
    // Load notes
    try {
      const storedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
      if (storedNotes) {
        const parsed = JSON.parse(storedNotes) as Note[];
        setNotes(parsed);
        if (parsed.length > 0) {
          // Fallback to first non-archived note
          const firstActive = parsed.find(n => !n.isArchived) || parsed[0];
          setActiveNoteId(firstActive.id);
        }
      } else {
        // Seed initial tutorials
        setNotes(INITIAL_NOTES_SEED);
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(INITIAL_NOTES_SEED));
        setActiveNoteId(INITIAL_NOTES_SEED[0].id);
      }
    } catch (e) {
      console.error('Error loading stored notepad data', e);
      setNotes(INITIAL_NOTES_SEED);
      setActiveNoteId(INITIAL_NOTES_SEED[0].id);
    }

    // Load theme
    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (storedTheme) {
      setThemeId(storedTheme);
    }

    // Load font settings
    const storedFont = localStorage.getItem(STORAGE_KEY_FONT);
    if (storedFont) {
      setEditorFont(storedFont as EditorFont);
    }

    const storedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (storedFontSize) {
      setEditorFontSize(parseInt(storedFontSize, 10));
    }
  }, []);

  // 2. Local persistence callback on notes change
  const persistNotes = useCallback((updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updatedNotes));
  }, []);

  // Set visual theme handler
  const handleSelectTheme = (id: string) => {
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY_THEME, id);
  };

  // Set font family handler
  const handleSetEditorFont = (font: EditorFont) => {
    setEditorFont(font);
    localStorage.setItem(STORAGE_KEY_FONT, font);
  };

  // Set physical font size handler
  const handleSetEditorFontSize = (size: number) => {
    setEditorFontSize(size);
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, size.toString());
  };

  // Locate the active selected theme model
  const activeTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // Pick the active Note model from list securely
  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  // Add highly robust note handler
  const handleAddNote = (templateContent?: string, templatedTitle?: string, category?: string) => {
    const newNote: Note = {
      id: 'note-' + Date.now() + Math.random().toString(36).substr(2, 5),
      title: templatedTitle || '',
      content: templateContent || '',
      category: category || 'Personal',
      tags: templateContent ? ['template'] : [],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedNotes = [newNote, ...notes];
    persistNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    // If we're looking at trash, switch to 'All' or appropriate group to view the note immediately
    if (selectedCategory === 'Trash') {
      setSelectedCategory('All');
    }
  };

  // Create note from templates selection directly
  const handleCreateFromTemplate = (templateName: string, title: string, category: string) => {
    const matchedTemplate = NOTE_TEMPLATES.find(t => t.name === templateName);
    if (matchedTemplate) {
      handleAddNote(matchedTemplate.content, title, category);
    }
  };

  // Handle local files imports manually
  const handleImportNote = (fileContent: string, filename: string) => {
    const cleanTitle = filename.replace(/\.(txt|md)$/i, '');
    const newNote: Note = {
      id: 'note-' + Date.now() + Math.random().toString(36).substr(2, 5),
      title: cleanTitle,
      content: fileContent,
      category: 'Drafts',
      tags: ['imported'],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updatedNotes = [newNote, ...notes];
    persistNotes(updatedNotes);
    setActiveNoteId(newNote.id);
  };

  // Trigger content, metadata, or tag updates inside active note
  const handleUpdateNote = (id: string, fields: Partial<Note>) => {
    const updated = notes.map(note => {
      if (note.id === id) {
        return {
          ...note,
          ...fields,
          updatedAt: Date.now()
        };
      }
      return note;
    });
    persistNotes(updated);
  };

  // Toggle Pinned preference
  const handleTogglePin = (id: string) => {
    const updated = notes.map(note => {
      if (note.id === id) {
        return { ...note, isPinned: !note.isPinned };
      }
      return note;
    });
    persistNotes(updated);
  };

  // Handles soft archiving first, then purge permanently if already in trash bin
  const handleDeleteNote = (id: string) => {
    const targetNote = notes.find(n => n.id === id);
    if (!targetNote) return;

    if (targetNote.isArchived) {
      // Purge permanently
      const filtered = notes.filter(n => n.id !== id);
      persistNotes(filtered);
      
      if (activeNoteId === id) {
        const nextActive = filtered.find(n => n.isArchived) || filtered[0] || null;
        setActiveNoteId(nextActive ? nextActive.id : null);
      }
    } else {
      // Move to trash box (soft deleted)
      const updated = notes.map(note => {
        if (note.id === id) {
          return { ...note, isArchived: true, isPinned: false };
        }
        return note;
      });
      persistNotes(updated);

      if (activeNoteId === id) {
        // Find next active note
        const remainingActive = updated.filter(n => !n.isArchived);
        setActiveNoteId(remainingActive.length > 0 ? remainingActive[0].id : null);
      }
    }
  };

  // Recover soft archive
  const handleRestoreNote = (id: string) => {
    const updated = notes.map(note => {
      if (note.id === id) {
        return { ...note, isArchived: false };
      }
      return note;
    });
    persistNotes(updated);
    setActiveNoteId(id);
  };

  return (
    <div className={`w-full h-full flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ${activeTheme.bg} font-sans text-neutral-900 selection:bg-amber-100selection:text-amber-950`}>
      
      {/* 1. Left Responsive Sidebar Column */}
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        theme={activeTheme}
        isSidebarOpen={isSidebarOpen}
        onSelectNote={setActiveNoteId}
        onAddNote={() => handleAddNote()}
        onDeleteNote={handleDeleteNote}
        onRestoreNote={handleRestoreNote}
        onTogglePin={handleTogglePin}
        onSetCategory={setSelectedCategory}
        onSetSearchQuery={setSearchQuery}
        onSetSidebarOpen={setIsSidebarOpen}
      />

      {/* 2. Main Workspace Editor Column */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Editor
          note={activeNote}
          theme={activeTheme}
          editorFont={editorFont}
          editorFontSize={editorFontSize}
          onUpdateNote={handleUpdateNote}
          onSetEditorFont={handleSetEditorFont}
          onSetEditorFontSize={handleSetEditorFontSize}
          onDeleteNote={handleDeleteNote}
          onAddFromTemplate={handleCreateFromTemplate}
          onImportNote={handleImportNote}
        />

        {/* Floating Utility actions panel trigger (Themes, Help) */}
        <div className="absolute top-26 right-4 sm:top-18 sm:right-6 flex flex-col gap-2 z-10">
          <button
            id="floating-theme-trigger"
            onClick={() => setShowThemePanel(!showThemePanel)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-neutral-200/50 dark:border-zinc-700 font-bold flex items-center justify-center text-amber-600 hover:text-amber-700 hover:scale-105 active:scale-95 transition-all text-xs"
            title="Switch Writing Themes"
          >
            <Palette className="w-5 h-5" />
          </button>

          <button
            id="floating-help-trigger"
            onClick={() => setShowHelpModal(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-neutral-200/50 dark:border-zinc-700 font-bold flex items-center justify-center text-blue-500 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all text-xs"
            title="Writing Guidelines & Help info"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* 3. Sliding Theme Selector Drawer Overlay */}
      <AnimatePresence>
        {showThemePanel && (
          <>
            {/* Background Backdrop click close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowThemePanel(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            
            {/* Slide up Theme selector drawer list */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-zinc-900 border-t border-x border-neutral-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-6 z-50 text-neutral-900 dark:text-neutral-100"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-lg tracking-tight">Select Notebook Canvas</h3>
                </div>
                <button
                  id="close-theme-panel"
                  onClick={() => setShowThemePanel(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {THEMES.map((t) => {
                  const isCurrent = t.id === themeId;
                  return (
                    <button
                      key={t.id}
                      id={`theme-btn-${t.id}`}
                      onClick={() => handleSelectTheme(t.id)}
                      className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative ${t.bg} ${t.text} ${
                        isCurrent 
                          ? 'border-amber-500 ring-2 ring-amber-500/10 scale-98 shadow-inner' 
                          : 'border-neutral-200/80 hover:border-neutral-300 dark:border-zinc-800 hover:scale-102 shadow-sm'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}
                      
                      <span className="font-bold text-xs select-none">{t.name}</span>
                      <div className="mt-2.5 flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300/30 bg-neutral-100 dark:bg-neutral-800" />
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300/30 bg-indigo-500" />
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300/30 bg-amber-600" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] opacity-60 text-center select-none font-medium mt-2">
                Color adjustments apply to backgrounds, margins, and paper textures.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Formatting Guidelines Help Popover Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto max-w-md h-fit max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl z-50"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Workspace Shortcuts</h3>
                </div>
                <button
                  id="close-help-modal"
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="text-sm text-neutral-700 dark:text-neutral-350 space-y-4">
                <div>
                  <h4 className="font-bold text-xs uppercase text-amber-700 tracking-wider mb-1.5">Note Presets</h4>
                  <p className="text-xs leading-relaxed">
                    Need formatting guidance? Create a note by clicking <strong className="font-bold">New Note</strong> and choosing any checklist, meeting logs, or guides.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase text-amber-700 tracking-wider mb-1.5">Markdown Highlights</h4>
                  <ul className="text-xs space-y-2 font-mono bg-neutral-50 dark:bg-zinc-950 p-3 rounded-xl border border-neutral-100 dark:border-zinc-800">
                    <li># Header 1</li>
                    <li>## Header 2</li>
                    <li>- [ ] Checklist option item</li>
                    <li>* Bullet list list</li>
                    <li>**Bold writing style**</li>
                    <li>&gt; Nested Blockquotes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase text-amber-700 tracking-wider mb-1.5">Local Storage Cache</h4>
                  <p className="text-xs leading-relaxed">
                    All notebook drafts are fully persistent on your desktop computer or phone locally. Clearing your web browser cache will remove any saved offline text logs.
                  </p>
                </div>
              </div>

              <button
                id="btn-help-accept"
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl text-center text-xs transition-colors cursor-pointer shadow-sm"
              >
                Return to Editing Focus
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
