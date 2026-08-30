# Waypoint Studio

# Waypoint — Lovable Build Prompt

I'm building **Waypoint**, a premium, production-quality project management SaaS application for my frontend engineering portfolio. Think **Linear + Jira + Trello's interaction quality**, combined into a tool with its own distinct identity — not a clone of any of them.

**Positioning:** Waypoint is a lightweight, keyboard-first project management workspace for small engineering/product teams (3–15 people) who want Linear's speed without Jira's configuration overhead.

This must feel like a real SaaS product a founder would actually pay for — not a CRUD tutorial. Prioritize interaction quality, visual polish, and thoughtful empty/loading/error states over raw feature count.

---

## TECH STACK

- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui components
- React Router (nested routes)
- Zustand for UI/client state
- React Hook Form + Zod for all forms
- Framer Motion for animations
- Recharts for analytics charts
- Lucide React for icons
- **Mock data layer only for now** — no backend/Supabase yet. Structure all data fetching behind typed functions (e.g. `getTasks()`, `getProjects()`, `createTask()`) in a `services/` or per-feature `api/` layer that returns Promises, so this can be swapped for a real API later without touching UI components. Simulate network latency (150–400ms) in these functions so loading states are visible and testable.

---

## DESIGN DIRECTION

- Calm, dense-but-breathable, professional SaaS aesthetic — closer to Linear's restraint than Trello's playfulness
- One confident accent color, mostly neutral palette otherwise
- Support both light and dark theme, dark as default
- Clean type scale, generous whitespace, subtle borders over heavy shadows
- Purposeful motion only: state transitions, drag feedback, modal/panel entry — never decorative animation for its own sake
- Fully responsive: desktop (full sidebar, multi-column board), tablet (collapsible nav), mobile (bottom nav, horizontally scrollable board, mobile-adapted task panel)

---

## INFORMATION ARCHITECTURE

```
Workspace
 └─ Projects (multiple)
     └─ Tasks (multiple)
         ├─ Subtasks
         ├─ Comments
         ├─ Checklist items
         └─ Activity log entries
 └─ Team Members (workspace-scoped, assigned to tasks)
 └─ Labels (workspace-scoped, reusable across all projects — not per-project)
```

## ROUTES

```
/dashboard
/projects
/projects/:projectId              → redirects to /board
/projects/:projectId/board        → kanban, ?task=:taskId opens slide-over panel
/projects/:projectId/list
/projects/:projectId/calendar
/projects/:projectId/settings
/calendar                         → global calendar across all projects
/team
/analytics
/settings/workspace
/settings/profile
```

**Important interaction detail:** Task details open as a **slide-over panel from the right edge of the screen**, not a full page navigation. The panel state is driven by a `?task=:taskId` URL search param on whatever view is currently active, so panels are deep-linkable/shareable and closing returns cleanly to the underlying view. Esc key and an overlay click both close it.

---

## BUILD ORDER (build in this sequence, do not generate everything at once)

### Stage 1 — App shell
- Collapsible sidebar (workspace switcher, nav links: Dashboard, Projects, Calendar, Team, Analytics, Settings)
- Top bar with global search trigger (Cmd+K placeholder for now) and user menu
- Responsive behavior: sidebar collapses to icons on tablet, becomes a bottom nav or drawer on mobile
- Light/dark theme toggle wired to a Zustand store
- Route structure and layout wrapper in place

### Stage 2 — Dashboard
- Summary cards: active projects, total tasks, completed tasks, overdue tasks
- Upcoming deadlines list
- Recent activity feed (mock entries)
- A productivity/progress chart (Recharts)
- Proper skeleton loaders while mock data "loads," and a genuine empty state if a workspace has no projects yet (with a CTA to create one)

### Stage 3 — Projects list + Project detail shell
- Project cards: name, description, progress bar, member avatars, status badge, priority, due date
- Create/Edit project via a dialog form (React Hook Form + Zod validation, real inline error messages)
- Archive/Delete with confirmation dialogs, Duplicate action
- Project detail page header (name, progress, members, status, priority, due date, description) with tabs for Board / List / Calendar / Settings

### Stage 4 — Kanban board (this is the centerpiece — invest the most polish here)
- Columns: Backlog, Todo, In Progress, In Review, Done
- Drag-and-drop task cards between and within columns, smooth reordering animation, natural-feeling drag physics (use a library like `@dnd-kit/core`)
- Task cards show: title, priority indicator, assignee avatar, labels, due date, comment count icon, checklist progress (e.g. "3/5")
- Clicking a card opens the slide-over task detail panel (via URL param as described above)
- Column-level task count, "Add task" quick-entry per column

### Stage 5 — Task detail slide-over panel
- Title (inline editable), description (rich-ish text area), status, priority, assignee picker, due date picker, labels
- Checklist with add/check/delete items and a progress bar
- Comments section with an input and a scrollable thread
- Activity history (auto-generated entries like "Priya changed priority to High")
- Subtasks list
- Keep it information-dense but not cluttered — use collapsible sections if needed

### Stage 6 — List view
- Sortable, filterable data table: Task, Status, Priority, Assignee, Labels, Due Date, Created Date
- Column visibility toggle, multi-select rows with a bulk actions bar (change status, assign, delete)
- Search input that filters live
- Pagination

### Stage 7 — Calendar view
- Month/week/day toggle, tasks rendered on their due dates
- Use a real date library (date-fns) — no hardcoded dates
- Drag a task to a new date to reschedule it if feasible

### Stage 8 — Team page
- Member cards: avatar, name, role, assigned task count, completed task count, a small productivity indicator
- Filterable by role or activity

### Stage 9 — Analytics
- Recharts: tasks completed over time, completion rate, overdue tasks trend, work distribution across team members, project progress comparison

### Stage 10 — Settings
- Workspace settings (name, members, roles), project settings (workflow stages, labels, priorities), user settings (profile, theme, notification preferences)

---

## UX REQUIREMENTS (apply to every stage, not as an afterthought)

- Skeleton loaders that match the actual layout of the content being loaded — never a generic spinner or "Loading..." text
- Distinct, well-designed empty states for every list/board/table when there's no data, each with a clear CTA
- Toast notifications for create/update/delete actions (use shadcn's toast)
- Confirmation dialogs before destructive actions (delete, archive)
- Visible hover and focus states on every interactive element, keyboard-navigable where realistic
- Form validation errors shown inline, not just as toasts

---

## COMPONENT ARCHITECTURE

- `components/ui/` — untouched shadcn primitives, no business logic
- `components/shared/` — cross-feature composites (Avatar+name, EmptyState, ConfirmDialog, PageHeader) — still feature-agnostic
- `features/{projects,tasks,kanban,calendar,team,analytics,settings}/` — each with its own `components/`, mock `api/` functions, and types
- Keep Zustand stores scoped to genuine cross-cutting UI state only (theme, sidebar collapsed, command palette open, active filters) — not a dumping ground for everything

---

## WHAT TO SKIP FOR NOW (don't build these yet)

- Real authentication or backend — mock data only
- Real-time multiplayer sync
- File upload storage — a stubbed "attachments" UI is fine, no real upload
- Notifications and global command palette (Cmd+K) — these come in a later pass

---

**Start with Stage 1 (app shell) and Stage 2 (dashboard) only. Show me the result before continuing to Stage 3.**

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://swiftway-build.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8f7e1ae9-21a4-44ac-8562-e46fc0b23809).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
