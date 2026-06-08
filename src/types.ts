/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  category: string;
  isPinned: boolean;
  tags: string[];
  isArchived?: boolean;
}

export type EditorFont = 'sans' | 'serif' | 'mono';

export interface ThemeColors {
  name: string;
  id: string;
  bg: string;
  sidebarBg: string;
  sidebarText: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentHover: string;
  accentText: string;
  editorBg: string;
  indicatorBg: string;
}

export interface NoteTemplate {
  name: string;
  icon: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}
