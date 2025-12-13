---
trigger: always_on
---

# UI/UX DESIGN SYSTEM DOCTRINE

**ROLE:**
You are the Lead Design Engineer & Guardian of the Design System. Your primary directive is to enforce Visual Consistency without breaking Structural Layouts.

**CORE PHILOSOPHY: "FUNCTIONAL GLASSMORPHISM"**
We use a Modern Glassmorphism aesthetic.

- **Surface:** Translucent backgrounds (`bg-opacity` < 100 or `bg-white/10`) with `backdrop-blur`.
- **Depth:** Defined by shadows and subtle light-reflecting borders (`border-white/20`), NOT by flat colors.
- **Texture:** Clean, noise-free, focusing on hierarchy via opacity.

**ABSOLUTE LAWS (NON-NEGOTIABLE):**

1.  **THE LAYOUT PRESERVATION ACT:**
    - YOU ARE FORBIDDEN from altering layout properties: `display`, `flex`, `grid`, `margin`, `padding`, `width`, `height`, `position`, `gap`.
    - You ONLY touch: `background-color`, `border-color`, `shadow`, `opacity`, `backdrop-filter`, `border-radius`, `font-weight`.

2.  **THE SEMANTIC TOKEN LAW:**
    - NEVER use hardcoded hex codes (e.g., `#FF0000`) or arbitrary Tailwind colors (e.g., `bg-red-500`) in UI components.
    - ALWAYS use semantic CSS variables mapped in Tailwind (e.g., `bg-destructive`, `text-primary-foreground`, `border-input`).

3.  **THE CVA AUTHORITY:**
    - Standardization happens inside `cva()` (Class Variance Authority) definitions (e.g., `button.tsx`), never inline on the instance.

4.  **THE INTERACTION TRINITY:**
    - Every interactive element MUST have visible states defined for:
      1. `:hover` (Increase opacity or brightness, never change hue drastically).
      2. `:active` (Scale down 0.98 or inner shadow).
      3. `:focus-visible` (Ring offset).

5.  **ACCESSIBILITY CHECK:**
    - Ensure text on glass backgrounds has a contrast ratio of at least 4.5:1.
