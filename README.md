# Wall Calendar Interactive Component 🗓️

A polished, highly interactive, and responsive calendar component built with Next.js and Vanilla CSS. Inspired by the physical wall calendar aesthetic, this application natively supports both strict individual date interactions and complex multi-date range tracking. 

**Deployment URL:** [View Live Demonstration On Vercel](https://wall-calender-gamma-three.vercel.app) 

## ✨ Key Features & Workflow

- **Physical Calendar Aesthetic:** A two-pane interactive design featuring an immersive mountain vista image on the left, and a scalable, robust calendar engine on the right.
- **Smart Date Mapping:** Users can fluidly toggle between tracking a **Single Date** or establishing a **Date Range** (useful for long vacations).
- **Embedded Note Engine:** Clicking any date immediately context-shifts the associated `Notes` module. If you save a note spanning a specific range of days, a dynamic visual dot indicator effortlessly populates on every single day across that timeframe!
- **Rapid Top-Level Navigation:** Complete with direct `Year` and `Month` dropdown menus for rapid traversal without spamming chevron arrows.
- **Auto-Contrasting Dark Mode:** Leveraging deep integrations with `CSS variables` and `@media (prefers-color-scheme: dark)`, the calendar intelligently transitions its surface grid colors to ensure dates are vividly legible.

---

## 🛠 Tech Stack & Tools

- **Framework:** Next.js (App Router, Typescript)
- **Styling Engine:** Vanilla CSS & CSS Modules (Maximized for fine-tuned precision & light/dark variables without utility class pollution)
- **Date Management Engine:** `date-fns` (Crucial for robust date arithmetic, accurate leap year logic, and ISO string evaluation)
- **Iconography:** `lucide-react`
- **Asset Generation:** Local hosted Hero assets (bypassing external CDN/Unsplash timeouts)
- **Data Persistence:** Client-side HTML5 `localStorage`

---

## 🧩 Component Architecture 

The module is broken down into specific operational components to ensure cleanly decoupled rendering logic:

### 1. `Calendar.tsx` (`src/components/Calendar.tsx`)
The absolute core of the UI. This component bridges the display grid and manages the state machine:
- Dynamically renders exactly 7 columns utilizing Flexbox/Grid hybrids.
- Tracks `selectedSingle`, `rangeStart`, and `rangeEnd` via robust mathematical intersection logic.
- Implements `date-fns` interval comparisons dynamically to verify if any individual cell inside the matrix should receive the "Active Outline" or "Note Contextual Dot".

### 2. `useNotes.ts` (`src/hooks/useNotes.ts`)
A dedicated custom React hook for client-side storage processing.
- Handles standard JSON serialization/deserialization for `localStorage`.
- Secures notes via unique UUID generation.
- **The Intersection Fix:** Employs an exact chronological overlap checking formula (`dateIsoStr >= note.startIso && dateIsoStr <= note.endIso`) to guarantee that any date trapped conceptually *inside* a `Range Note` accurately triggers the dot marker and renders the note details when actively clicked. 

### 3. `page.tsx` (`src/app/page.tsx`)
The foundational layout structure container.
- Segments the UI using Desktop vs Mobile response logic via `page.module.css`.
- Leverages the `<Image>` tag with `src="/hero.png"` explicitly, ensuring guaranteed, high-performance static asset streaming independent of upstream API failures or 404 blockages.

---

## 🚀 Local Development Setup

To run this project locally, simply clone it and bypass any network dependency worries:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Test out adding a date range note and then switching to single-click mode to witness the overlapping note tracking!
