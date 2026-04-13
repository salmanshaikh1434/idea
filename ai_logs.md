# AI Development Logs – Idea Board Project

---

## 1. Backend API Design (Codex)

### Prompt:
I am building a backend for an Idea Board using Node.js and Express.

Data is stored in a local JSON file called ideas.json.

Each idea object should have:
- id (number)
- title (string)
- description (string)
- category (string)
- votes (number)

Requirements:
- GET /ideas → return all ideas
- POST /ideas → create a new idea
- POST /ideas/:id/upvote → increment votes
- DELETE /ideas/:id → delete an idea

Additional logic:
- Accept only title and description
- Auto-assign category using keyword matching
- Initialize votes = 0
- Use fs module for storage
- Handle edge cases (file not found, invalid JSON, idea not found)
- Enable CORS and JSON middleware

### Outcome:
Generated initial Express backend with CRUD APIs and JSON-based storage.

---

## 2. Improving Category Detection Logic

### Prompt:
Need to make category detection more robust as user input can vary.

### Action:
Expanded keyword matching logic to cover more real-world scenarios.

### Outcome:
Improved accuracy for category classification using multiple keyword groups.

---

## 3. Adding AI Fallback for Categorization

### Prompt:
Keyword matching may still fail for ambiguous inputs. Add fallback using AI (OpenAI API).

### Outcome:
Implemented hybrid approach:
- Primary → keyword matching
- Fallback → AI-based classification

### Insight:
This ensures better handling of edge cases where keywords are insufficient.

---

## 4. Frontend UI Creation (Codex)

### Prompt:
(Project context: React + Vite + Tailwind already set up)

Build a frontend for Idea Board:
- Form (title + description)
- Fetch ideas from API
- Group by category
- Show cards with votes
- Add upvote functionality

### Outcome:
Generated initial React UI with:
- Form submission
- Idea listing
- API integration

---

## 5. UI Refactor – Kanban Layout

### Prompt:
Refactor UI into Kanban-style board with:
- 4 columns (Bug, Feature, UI/UX, Performance)
- Modular components:
  - IdeaCard
  - Column
  - IdeaDialog
  - AddIdeaDialog
- Dialog-based interactions

### Outcome:
Improved UI:
- Better organization using category columns
- Cleaner UX with dialogs
- Modular component structure

---

## 6. Debugging Category Misclassification

### Issue:
Input:
"Paddings are not correctly showing"

Expected:
UI/UX

Actual:
Feature Request

### Prompt:
Category detection is not working correctly for UI-related issues.

### Action:
- Added more UI-specific keywords:
  - padding, margin, alignment, spacing
- Improved keyword coverage to reduce dependency on AI fallback

### Outcome:
Better classification without needing AI for common UI cases.

---

## Summary

- Used Codex for major feature generation (backend + frontend)
- Used iterative prompts to refine logic and fix issues
- Implemented hybrid categorization:
  - Keyword-based (primary)
  - AI fallback (secondary)
- Improved UI with Kanban layout and modular components