/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Archive, 
  Sparkles, 
  Clock, 
  Tag, 
  RotateCcw,
  BookOpen, 
  Users, 
  CheckSquare, 
  FileText, 
  Lightbulb,
  X,
  Menu
} from 'lucide-react';
import { Note, ThemeColors } from '../types';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  selectedCategory: string;
  searchQuery: string;
  theme: ThemeColors;
  isSidebarOpen: boolean;
  onSelectNote: (id: string) => void;
  onAddNote: (templateContent?: string, title?: string, category?: string) => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSetCategory: (category: string) => void;
  onSetSearchQuery: (query: string) => void;
  onSetSidebarOpen: (isOpen: boolean) => void;
}

const CATEGORIES = ['All', 'Work', 'Personal', 'Ideas', 'Trash'];

export default function Sidebar({
  notes,
  activeNoteId,
  selectedCategory,
  searchQuery,
  theme,
  isSidebarOpen,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onRestoreNote,
  onTogglePin,
  onSetCategory,
  onSetSearchQuery,
  onSetSidebarOpen
}: SidebarProps) {
  
  // Format long content snippets
  const getSnippet = (content: string) => {
    const clean = content.replace(/[#*`=-]/g, '').trim();
    if (clean.length < 50) return clean || 'Empty Note';
    return clean.slice(0, 50) + '...';
  };

  // Human readable relative dates
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Advanced searching and filtering
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Trash filtering
      if (selectedCategory === 'Trash') {
         if (!note.isArchived) return false;
      } else {
         if (note.isArchived) return false;
         if (selectedCategory !== 'All' && note.category !== selectedCategory) return false;
      }

      // Search matches
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(lowerQuery);
      const matchContent = note.content.toLowerCase().includes(lowerQuery);
      const matchTags = note.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      return matchTitle || matchContent || matchTags;
    });
  }, [notes, selectedCategory, searchQuery]);

  // Separate pinned vs standard notes
  const sortedNotes = useMemo(() => {
    // Pinned notes bubble to top, then sorted by last updated time desc
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [filteredNotes]);

  // Quick stats
  const activeNotesCount = notes.filter(n => !n.isArchived).length;
  const trashNotesCount = notes.filter(n => n.isArchived).length;

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div className={`md:hidden flex items-center justify-between p-3 border-b ${theme.border} ${theme.sidebarBg} ${theme.sidebarText}`}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span className="font-bold tracking-tight">Digital Notepad</span>
        </div>
        <button 
          id="btn-sidebar-toggle-mobile"
          onClick={() => onSetSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg hover:bg-black/10 transition-colors`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar container */}
      <aside 
        id="notepad-sidebar"
        className={`fixed md:relative z-20 top-0 left-0 h-full md:h-auto w-72 flex-shrink-0 flex flex-col border-r transition-transform duration-300 ease-in-out md:translate-x-0 ${theme.border} ${theme.sidebarBg} ${theme.sidebarText} ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header & Close button for mobile */}
        <div className="p-4 flex items-center justify-between border-b border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Digital Notepad</h1>
              <p className="text-xs opacity-70">Local Auto-Save System</p>
            </div>
          </div>
          
          <button 
            id="btn-sidebar-close-mobile"
            onClick={() => onSetSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button & Main Creation triggers */}
        <div className="p-4 flex flex-col gap-2">
          <button
            id="btn-add-new-note"
            onClick={() => {
              onAddNote();
              if (window.innerWidth < 768) onSetSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium tracking-tight text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600`}
          >
            <Plus className="w-4 h-4" />
            New Blank Note
          </button>
        </div>

        {/* Search Notes bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-50">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="search-notes-input"
              type="text"
              placeholder="Search title, content, tags..."
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-black/5 hover:bg-black/8 focus:bg-white focus:outline-none/5 focus:ring-1 focus:ring-amber-500/50 transition-all border border-transparent placeholder-black/40 text-current"
            />
            {searchQuery && (
              <button 
                onClick={() => onSetSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-50 hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Pill row */}
        <div className="px-4 py-2 border-b border-black/5 overflow-x-auto shrink-0 flex gap-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSel = selectedCategory === cat;
            const isTrash = cat === 'Trash';
            return (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase()}`}
                onClick={() => onSetCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  isSel 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-black/5 text-current hover:bg-black/10'
                }`}
              >
                {cat} 
                <span className="ml-1 opacity-70 text-[10px]">
                  ({isTrash ? trashNotesCount : notes.filter(n => !n.isArchived && (cat === 'All' || n.category === cat)).length})
                </span>
              </button>
            );
          })}
        </div>

        {/* Notes listing area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 select-none scrollbar-thin">
          <AnimatePresence initial={false}>
            {sortedNotes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center px-4"
              >
                <FileText className="w-10 h-10 text-current opacity-30 mb-2" />
                <p className="text-sm font-medium opacity-80">No notes found</p>
                <p className="text-xs opacity-50 mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Start writing to save notes!'}
                </p>
              </motion.div>
            ) : (
              sortedNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <motion.div
                    key={note.id}
                    layoutId={`note-card-${note.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    id={`note-card-${note.id}`}
                    className={`group/card relative p-3 rounded-xl cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-white shadow-md border-amber-500/30' 
                        : 'bg-black/5 border-transparent hover:bg-black/10'
                    }`}
                    onClick={() => {
                      onSelectNote(note.id);
                      if (window.innerWidth < 768) onSetSidebarOpen(false);
                    }}
                  >
                    {/* Background line highlights to indicate custom card selections */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-0 w-1 bg-amber-500 rounded-r-md h-6" />
                    )}

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className={`font-semibold text-sm line-clamp-1 flex-1 leading-tight ${isActive ? 'text-amber-950 font-bold' : 'opacity-90'}`}>
                        {note.title.trim() || 'Untitled Note'}
                      </h3>
                      
                      {/* Pinned star/indicator */}
                      <div className="flex items-center gap-1">
                        {!note.isArchived && (
                          <button
                            id={`pin-btn-${note.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(note.id);
                            }}
                            className={`p-1 rounded-md opacity-20 group-hover/card:opacity-100 transition-opacity hover:bg-black/5 ${
                              note.isPinned ? '!opacity-100 text-amber-600' : 'text-current'
                            }`}
                            title={note.isPinned ? "Unpin Note" : "Pin Note"}
                          >
                            <Pin className="w-3.5 h-3.5" fill={note.isPinned ? "currentColor" : "none"} />
                          </button>
                        )}

                        <button
                          id={`del-btn-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                          className="p-1 rounded-md text-red-600 opacity-0 group-hover/card:opacity-100 hover:bg-red-50 transition-all"
                          title={note.isArchived ? "Delete and purge permanently" : "Move to Trash"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed mb-2 opacity-70 ${isActive ? 'text-stone-700' : ''}`}>
                      {getSnippet(note.content)}
                    </p>

                    <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-2 mt-2">
                      <span className="text-[10px] opacity-60 flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(note.updatedAt)}
                      </span>
                      
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {note.category && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${
                            note.category === 'Work' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' :
                            note.category === 'Personal' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200' :
                            note.category === 'Ideas' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' :
                            'bg-slate-150 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          }`}>
                            {note.category}
                          </span>
                        )}
                        {note.tags.slice(0, 1).map((tag, idx) => (
                          <span key={idx} className="text-[9px] opacity-50 select-none truncate">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Trash Recovery action bar if showing inside Trash bin */}
                    {note.isArchived && (
                      <div className="mt-2.5 pt-2 border-t border-red-500/10 flex items-center justify-between">
                        <span className="text-[10px] text-red-500 font-medium">In Trash Bin</span>
                        <button
                          id={`restore-btn-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreNote(note.id);
                          }}
                          className="flex items-center gap-1 text-[10px] bg-amber-600/10 text-amber-700 hover:bg-amber-600/20 px-2 py-0.5 rounded-md font-medium transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore Note
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-black/10 text-center flex flex-col gap-1 shrink-0 bg-black/5">
          <div className="text-[10px] opacity-60">
            Total Saved Notes: <span className="font-bold">{activeNotesCount}</span> active, <span className="font-medium text-red-500">{trashNotesCount} in trash</span>
          </div>
          <div className="text-[9px] opacity-40 font-mono tracking-tight">
            Notepad App v1.4.0
          </div>
        </div>
      </aside>

      {/* Background Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={() => onSetSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-10 md:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
}
