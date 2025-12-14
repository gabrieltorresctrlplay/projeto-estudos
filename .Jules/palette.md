# Palette's Journal - UX & Accessibility Learnings

## 2025-12-13 - Dashboard Card Accessibility

**Learning:** Large clickable cards using Shadcn/ui `Card` often trap keyboard focus on their internal button, making the card wrapper itself inaccessible to keyboard users despite visual cues.
**Action:** Wrap clickable cards with `role="button"`, `tabIndex={0}`, and explicit `onKeyDown` handlers (Enter/Space), while setting `pointer-events-none` and `tabIndex={-1}` on internal buttons to avoid redundant tab stops.
