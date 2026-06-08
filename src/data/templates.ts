/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NoteTemplate } from '../types';

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    name: 'To-Do Checklist',
    icon: 'CheckSquare',
    title: 'Daily Action Checklist',
    category: 'Personal',
    tags: ['todo', 'daily'],
    content: `Daily Action Checklist
======================

Today's Core Goals:
- [ ] Complete the most critical task of the day
- [ ] Respond to urgent emails 
- [ ] Spend 30 minutes reading or learning

Secondary Focuses:
- [ ] Review notepad app design details
- [ ] Quick cardio exercise (20 min)
- [ ] Clear up workspace

Notes:
- Limit the primary goals to 3 items max per day for maximum productivity.
`
  },
  {
    name: 'Meeting Minutes',
    icon: 'Users',
    title: 'Meeting Notes: [Project Name]',
    category: 'Work',
    tags: ['meeting', 'work'],
    content: `Meeting Notes: [Project Name]
=============================
Date: 2026-06-08
Time: 10:00 AM UTC
Facilitator: [Name]

Participants:
- [Name 1]
- [Name 2]

1. Objectives
-------------
* Align on product design goals
* Assign clear action items and deadlines

2. Discussion Topics
--------------------
* Review current progress and feedback high-priority adjustments
* Evaluate system stability, styling details, and typography options

3. Decisions Reached
--------------------
* Adopt Inter and Lora font systems as primary options
* Direct client-side auto-save through local storage as standard path

4. Action Items
---------------
* [ ] [Name] Develop full responsive screen layout
* [ ] [Name] Test search filters and tag categorizations
`
  },
  {
    name: 'Journal Entry',
    icon: 'BookOpen',
    title: 'Reflections: Digital Journal',
    category: 'Personal',
    tags: ['journal', 'thoughts'],
    content: `Reflections: Digital Journal
===========================
Date: 2026-06-08

Morning Thoughts:
How am I feeling today?
What is on my mind?

Gratitude List:
1. The clarity of a clean coding interface.
2. A nice warm cup of coffee this afternoon.
3. Engaging in high-craft design projects.

Highlights of the day:
* Built the sleekest, most functional client-side notepad application ever.
* Set custom font-pairings that look beautifully balanced.
* Enjoyed beautiful structural alignment in Tailwind v4.
`
  },
  {
    name: 'Markdown Cheat Sheet',
    icon: 'FileText',
    title: 'Markdown Quick Guide',
    category: 'Ideas',
    tags: ['guide', 'markdown'],
    content: `Markdown Quick Guide
====================

A quick reference sheet for formatting notes.

# Heading 1
## Heading 2
### Heading 3

Make text **bold** or *italic*.

Bullet list:
* Item A
* Item B
  * Sub-item B.1

Numbered list:
1. First
2. Second
3. Third

Code blocks:
\`\`\`javascript
const greeting = "Hello, high-craft notepad!";
console.log(greeting);
\`\`\`

Quotes:
> "High craft is in the details, the micro-animations, and the complete flow."

Rule line:
---
`
  },
  {
    name: 'Brainstorming Board',
    icon: 'Lightbulb',
    title: 'Idea Brainstorm: [My Next Big Project]',
    category: 'Ideas',
    tags: ['brainstorm', 'ideas'],
    content: `Idea Brainstorm: [My Next Big Project]
=====================================

Core Concept / elevator pitch:
------------------------------


Why build this?
---------------


Target Audience:
---------------


Core Features:
--------------
- Feature A: 
- Feature B:
- Feature C:

Open Questions to Resolve:
--------------------------
1. Who is the target user?
2. What are the key resource constraints?
`
  }
];
