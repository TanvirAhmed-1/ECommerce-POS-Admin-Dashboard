---
name: Apex Engine
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-margin: 32px
  gutter: 24px
---

## Brand & Style

The design system is engineered for high-performance commerce management, targeting enterprise-level merchants and power users. The personality is authoritative, technical, and premium, evoking the feeling of a high-end command center rather than a standard back-office tool.

The visual style is a refined **Glassmorphism** execution built on a **Minimalist** foundation. It leverages depth through transparency and backdrop filters rather than traditional shadows. The interface prioritizes "data-density with clarity," using subtle borders and translucent layers to organize complex information without visual clutter.

Key characteristics:
- **Atmospheric Depth:** A deep slate canvas serves as the base, with nested glass containers creating a clear spatial hierarchy.
- **Precision Engineering:** Sharp execution of micro-interactions and rigorous alignment to a technical grid.
- **High-End Utility:** A "Pro" aesthetic that balances aesthetics with the high-intensity functional requirements of POS and inventory management.

## Colors

The palette is optimized for a dark-mode-first experience, ensuring high legibility and reduced eye strain during long working sessions.

- **Primary (Indigo #4F46E5):** Used for primary actions, active states, and brand-defining accents. In glass surfaces, this color should use a subtle glow effect (outer glow, 15% opacity).
- **Surface & Background:** The base layer is a solid #0B0F19. All floating containers use a semi-transparent slate (bg-slate-900/60) with a `backdrop-filter: blur(12px)`.
- **Semantic Colors:** Emerald (#10B981) for growth and success metrics; Amber (#F59E0B) for low-stock alerts or pending orders; Rose (#F43F5E) for critical errors and destructive POS actions.
- **Borders:** Use a consistent #1E293B (Slate-800) for internal dividers and container outlines.

## Typography

This design system uses a dual-font approach to balance character with utility.

- **Outfit (Headlines):** A geometric sans-serif that brings a modern, premium feel to titles, metrics, and page headers.
- **Inter (UI & Body):** A highly legible, systematic font used for all data tables, form fields, and functional labels.

**Hierarchy Rules:**
- Use `display-lg` exclusively for hero metrics (e.g., Total Revenue).
- Use `label-md` with 50% opacity for table headers and secondary metadata.
- All numbers in the POS interface should use `Inter` with tabular lining figures to ensure vertical alignment in columns.

## Layout & Spacing

The system follows a **12-column fluid grid** for the main dashboard, transitioning to a specialized **fixed-sidebar layout** for the POS terminal.

- **Grid:** 12 columns on desktop (1440px+), 8 columns on tablet (768px+), and 4 columns on mobile.
- **Rhythm:** An 8px linear scale (incremented by 4px for tight UI elements) governs all padding and margins.
- **Safe Areas:** A 32px global margin ensures the glass containers never feel cramped against the viewport edges.
- **POS Specifics:** In the POS view, the right-hand "Checkout" panel is fixed at 400px, while the product grid remains fluid to fill the remaining space.

## Elevation & Depth

Depth is conveyed through **backstage blurring** and **tonal stacking** rather than traditional drop shadows.

- **Level 0 (Base):** #0B0F19 (Solid).
- **Level 1 (Cards/Panels):** Surface bg-slate-900 at 60% opacity with a 12px backdrop blur. 1px solid border (#1E293B).
- **Level 2 (Modals/Popovers):** Surface bg-slate-800 at 80% opacity with a 20px backdrop blur. Add a subtle "Indigo Glow" (Primary color at 10% opacity, 40px spread) behind the modal to indicate focus.
- **Interaction:** Hovering over a card should increase the border-color to #334155 (Slate-700) and slightly increase the opacity of the background fill.

## Shapes

The design system utilizes a **2xl roundedness** philosophy to soften the technical nature of the dashboard.

- **Main Containers:** Use `rounded-2xl` (1rem / 16px) for all primary cards, inventory items, and modals.
- **Buttons & Inputs:** Use `rounded-xl` (0.75rem / 12px) for a modern, tactile feel.
- **Small Elements:** Chips, tags, and checkboxes use `rounded-md` (0.375rem / 6px).
- **POS Action Buttons:** Large "Pay" or "Terminal" buttons may use `rounded-2xl` to stand out as primary touch targets.

## Components

### Buttons
- **Primary:** Solid Indigo background with white text. On hover, apply a `box-shadow` of the primary color with a 15px blur (glow).
- **Secondary:** Glass background (white/10%) with a subtle 1px border.
- **Ghost:** No background, Indigo text, used for less frequent actions.

### Input Fields
- Dark backgrounds (Slate-950) with a 1px border. Focus state triggers a 2px Indigo border and a soft indigo inner glow.

### Cards & Stats
- Metric cards should feature a "glass-on-glass" effect. Large Outfit typography for the value, with a mini-sparkline chart in the background using the semantic color (Success/Error).

### POS Specific Components
- **Product Tile:** Large image area with a bottom-aligned glass overlay containing the price and name.
- **Cart List:** Zebra-striping using 5% opacity increments to maintain readability in fast-paced environments.
- **Numeric Keypad:** Large, high-contrast keys with a `rounded-xl` shape and active press states that "brighten" the glass surface.

### Status Chips
- High-saturation text on a low-opacity background of the same color (e.g., Success text on 10% Emerald background). Use a pill shape for these elements.