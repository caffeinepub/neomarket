# Study Notes Maker with AJITO — Lite

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Landing page with glowing CSS title "Study Notes Maker with AJITO"
- Auth: signup/login with email + password (hashed), stored on ICP canister
- Notes Generator: user enters a topic, backend generates structured notes (Summary, Key Points, Explanation, Example, Mermaid diagram)
- Google Search API scaffold (SEARCH_API_KEY via HTTP outcalls) with fallback mock data
- Diagram Generator: auto Mermaid flowchart from key points, editable textarea + re-render
- Micro Cheat Notes: 5-10 bullet quick revision tips, customizable word limit
- Live Preview pane: notes appear instantly, no overlapping text
- PDF Export: client-side html2canvas + jsPDF, proper pagination, 3 font choices
- Save Notes dashboard: saved notes with title + date, view/delete
- Low-resource mode toggle: disables CSS animations
- Performance: lazy-load Mermaid and jsPDF libs

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Motoko backend: User type (id, email, passwordHash, verified), Note type (id, userId, topic, content, diagram, cheatNotes, createdAt)
2. Backend functions: signup, login (return token), saveNote, getNotes, deleteNote, generateNotes (mock + Google API scaffold)
3. Frontend pages: Landing, Auth (login/signup), Generator, Dashboard
4. Generator page: topic input, generate button, live preview panel (Summary/KeyPoints/Explanation/Example), Mermaid diagram (lazy), cheat notes panel, PDF export button
5. Diagram editor: textarea with Mermaid source, re-render button
6. PDF: lazy-load jsPDF+html2canvas on demand, A4 output, no overlap
7. Dashboard: list saved notes cards with title/date, delete option
8. Low-resource toggle in header disables all CSS transitions/animations
9. Google API key stored as canister env config, falls back to mock when absent
