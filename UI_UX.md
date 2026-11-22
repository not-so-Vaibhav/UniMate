# UniMate --- UI/UX Design Specification

**Design intent:** Premium, calm, modern, highly usable campus product\
**Status:** Mandatory visual and interaction direction for every
development phase

------------------------------------------------------------------------

## 1. Product experience

UniMate should feel like a polished commercial software product---not a
generic college project, template dashboard, or AI-generated interface.

The experience should be: - Calm and confident. - Clean, refined, and
highly legible. - Consistent across all five modules. - Fast to
understand for first-time users. - Responsive across desktop, tablet,
and mobile. - Accessible and functional, not merely decorative.

The design must support the work students and service operators need to
complete. Visual polish must never obscure task clarity.

## 2. Non-negotiable visual rules

### Do

-   Use a restrained, sophisticated palette.
-   Prefer warm off-white or neutral surfaces with deep navy/slate text.
-   Use one controlled accent color for primary actions and selected
    states.
-   Use generous but purposeful whitespace.
-   Maintain a clear type scale and alignment system.
-   Use subtle borders and restrained shadows.
-   Use consistent, purposeful Lucide icons.
-   Design real loading, empty, error, and success states.
-   Make forms, tables, filters, and status information easy to scan.
-   Keep interactions predictable and accessible.

### Do not

-   Use neon colors or glowing effects.
-   Use decorative or random emojis.
-   Add gradients simply to make a screen look "modern."
-   Overuse glassmorphism, blur, or translucent cards.
-   Use excessive shadows, thick borders, or oversized rounded cards.
-   Fill every area with cards, charts, badges, or decorative elements.
-   Use random icon styles or mixed icon libraries.
-   Add animations that slow down or distract from tasks.
-   Use tiny low-contrast text.
-   Create a different visual language for each module.
-   use placeholder content as if it were real campus information.

## 3. Visual direction and color tokens

Use the following as an initial palette. Tune exact values after
reviewing contrast and real screens, but preserve the restrained
direction.

  Token              Suggested value   Use
  ------------------ ----------------- ---------------------------------------
  `background`       `#F7F8FA`         Main application background
  `surface`          `#FFFFFF`         Main panels and forms
  `surface-muted`    `#F1F3F6`         Secondary surfaces
  `text-primary`     `#172033`         Main text
  `text-secondary`   `#667085`         Supporting text
  `border`           `#E4E7EC`         Dividers and outlines
  `primary`          `#263B5A`         Primary actions and active navigation
  `primary-hover`    `#1E304A`         Hover/pressed primary action
  `accent`           `#648579`         Restrained secondary accent
  `success`          `#287A57`         Success state
  `warning`          `#A66B20`         Warning state
  `danger`           `#B54747`         Error/destructive state
  `focus`            `#6B8DB8`         Visible keyboard focus

Rules: - Do not use every token on every screen. - Reserve semantic
colors for their meaning. - Maintain WCAG-conscious contrast, especially
for text and controls. - Never communicate status by color alone; pair
it with a label or icon. - Avoid neon saturation and full-screen
saturated backgrounds.

## 4. Typography

Use **Geist** or **Inter** if already available and properly
licensed/configured in the project. Otherwise use a clean system
sans-serif stack. Do not add a font dependency without checking the
existing setup.

Suggested hierarchy:

  Style              Guidance
  ------------------ -----------------------------------------------
  Page title         28--32 px desktop; 24--28 px mobile; semibold
  Section title      18--22 px; semibold
  Card/panel title   15--17 px; medium/semibold
  Body               14--16 px; regular
  Supporting text    12--14 px; readable contrast
  Labels             13--14 px; medium
  Data/table text    13--14 px; consistent and scannable

Use a consistent line-height. Avoid excessive font weights, all-caps
labels, and oversized hero typography inside operational screens.

## 5. Layout and spacing

Use a consistent spacing scale based on 4 px increments. Suggested
values: 4, 8, 12, 16, 20, 24, 32, 40, 48.

-   Establish a consistent content width and page gutter.
-   Align page titles, actions, filters, and content.
-   Keep primary actions in predictable locations.
-   Use whitespace to group related content.
-   Avoid unnecessary nested cards.
-   Use a consistent grid and responsive breakpoints.
-   Tables should remain readable; on small screens use a considered
    responsive treatment rather than shrinking text excessively.

## 6. Navigation and application shell

Create one coherent application shell shared by all modules.

### Public Landing Experience (`/`)

-   **Sticky Navigation Bar:** Logo mark with subtle "Smart Campus" tag, anchor navigation (Home, Services, How It Works, Showcase, Architecture), and auth-aware CTAs ("Sign In" / "Get Started", or "Open Dashboard" for authenticated users).
-   **Hero Presentation:** Refined type scale, calm background (`#F7F8FA`), and high-fidelity browser-framed product mockup showcasing the real application dashboard.
-   **Interactions:** Smooth scrolling to anchor targets with `@media (prefers-reduced-motion: reduce)` fallbacks; responsive floating mobile drawer with clean backdrop overlay.
-   **Showcase & Architecture:** Interactive tabbed interface tours highlighting real screenshots and honest technical integrity specifications.

### Desktop App Shell

-   A restrained left navigation rail/sidebar with clear active state.
-   A compact top bar for page context and account actions.
-   Main content area with consistent page headers.
-   Avoid overcrowded navigation and decorative widgets.

### Mobile

-   Use a mobile-appropriate navigation pattern.
-   Keep primary actions reachable.
-   Avoid forcing desktop tables or sidebars onto narrow screens.
-   Ensure forms and dialogs fit the viewport and support keyboard
    behavior.

### Navigation structure

The exact labels can be refined, but the five modules must remain easy
to find: - AI Assistant - Campus Navigation - Canteen - Xerox /
Printing - Lost & Found

Account/profile and administrative navigation should appear only where
appropriate for the signed-in role.

## 7. Component design rules

### Buttons

-   Clear hierarchy: primary, secondary, tertiary/ghost, destructive.
-   Use concise action labels.
-   Provide hover, active, disabled, and focus states.
-   Prevent repeated submission while an operation is in progress.
-   Do not make every button visually primary.

### Forms

-   Persistent visible labels; do not rely on placeholder text as the
    only label.
-   Explain required fields and validation errors.
-   Place errors close to the relevant field.
-   Preserve user input when safe after a recoverable error.
-   Group related fields logically.
-   Make upload requirements and limits clear.

### Cards and panels

-   Use only when they create meaningful grouping.
-   Prefer subtle borders over heavy shadows.
-   Keep padding and heading alignment consistent.
-   Avoid a dashboard made entirely of identical cards.

### Tables and lists

-   Clear column labels and row hierarchy.
-   Align numeric and status data consistently.
-   Provide useful empty states and pagination where needed.
-   Keep row actions discoverable without visual clutter.
-   On mobile, use stacked summaries or controlled horizontal scrolling.

### Status indicators

-   Use restrained semantic colors with text labels.
-   Define consistent status vocabulary for each workflow.
-   Do not imply a status transition succeeded until the backend
    confirms it.

### Dialogs and notifications

-   Use dialogs for focused confirmation or short tasks, not long forms.
-   Confirm destructive actions.
-   Use concise toast/inline feedback.
-   Notifications must not hide critical information or disappear too
    quickly.

### Icons

-   Use Lucide icons consistently.
-   Use icons to clarify actions or navigation.
-   Avoid emoji as interface icons.
-   Provide accessible labels for icon-only controls.

## 8. Module-specific UX

### 8.1 AI Campus Assistant

Experience goals: - A clear, focused conversation interface. - A
welcoming but restrained initial state with example question suggestions
only when useful. - Readable message width and comfortable line
length. - Obvious distinction between user prompts and assistant
responses. - Visible response/loading state. - Clear retry/error state
if the AI service fails. - Source references or grounding indicators
when the system actually has verified sources. - Honest "I don't have
verified information" behavior for unknown campus facts.

Avoid: - Fake typing animations that delay responses. - Unsupported
confidence scores or invented citations. - Overly playful chatbot
styling. - Decorative bot avatars or emoji-heavy messages.

### 8.2 Campus Navigation

Experience goals: - Search is prominent and easy to use. - Search
results show location name and useful distinguishing information. -
Location detail pages are scannable. - Map presentation is used only
when real location/map data is available. - Clear fallback when a
location has no verified coordinates or route.

Avoid: - Fake map pins, invented distances, or fabricated directions. -
A map that dominates the screen when a simple search/list is more
useful.

### 8.3 Canteen Pre-ordering

Experience goals: - Menu categories and item details are easy to
browse. - Price and availability are clear when verified. - Quantity
selection and cart editing are straightforward. - Order review happens
before final submission. - Confirmation includes a clear reference and
current status. - Operator queue prioritizes actionable order
information.

Avoid: - Misleading availability. - Unconfirmed payment flows. -
Ambiguous or unexplained order statuses.

### 8.4 Xerox / Printing

Experience goals: - A guided request form. - Clear file selection,
upload progress, and validation. - Print preferences grouped
logically. - A review step before submission when useful. - Request
reference and status after submission. - Operator queue makes file
access and job details clear but secure.

Avoid: - Exposing private file links. - Unclear file constraints. -
Losing form data after recoverable errors.

### 8.5 Lost & Found

Experience goals: - Clear distinction between "Lost" and "Found." - A
simple listing form. - Search and filters that are easy to discover. -
Listings show relevant information without exposing unnecessary personal
details. - Clear status for active, resolved, or unavailable items. -
Easy way to edit permitted details or update status.

Avoid: - Publicly exposing private contact details by default. -
Unverified claims that a match has been confirmed. - Cluttered listing
cards with excessive metadata.

## 9. Role-specific UX

### Student

Prioritize the five services and the student's own active
requests/orders/listings. Make the next useful action obvious.

### Service Operator

Prioritize work queues, filters, request/order detail, and safe status
updates. Keep the operator interface efficient and focused.

### Admin

Prioritize user/service oversight and management tools. Use tables and
filters where appropriate. Do not overload the admin dashboard with
decorative charts that do not support a decision.

## 10. Interaction and motion

-   Use short, subtle transitions for state changes and navigation.
-   Motion must communicate cause and effect.
-   Respect `prefers-reduced-motion`.
-   Provide immediate feedback for actions.
-   Use skeletons only when they improve perceived loading; otherwise
    use simple progress indicators.
-   Never use animation to conceal slow or broken behavior.
-   Keep keyboard focus visible and predictable.

## 11. Responsive behavior

Design and test at representative widths: - Small mobile: approximately
360--390 px. - Large mobile: approximately 414--430 px. - Tablet:
approximately 768 px. - Laptop: approximately 1280--1440 px. - Wide
desktop: approximately 1600 px.

Requirements: - No unintended horizontal overflow. - Touch targets
should be comfortably usable. - Forms should fit narrow screens. -
Navigation adapts to screen width. - Data tables have a deliberate
mobile behavior. - Dialogs and popovers remain within the viewport.

## 12. Accessibility

-   Use semantic HTML elements.
-   Associate form labels and inputs.
-   Support keyboard navigation.
-   Show visible focus indicators.
-   Provide accessible names for icon-only buttons.
-   Maintain sufficient text and control contrast.
-   Do not rely on color alone to communicate status.
-   Announce important asynchronous feedback appropriately.
-   Respect reduced-motion preferences.
-   Use meaningful alt text for informative images.

## 13. Screen quality checklist

Before a screen is considered complete, verify:

-   Does the page have one clear primary purpose?
-   Is the main action immediately understandable?
-   Is the hierarchy clear without excessive decoration?
-   Are spacing, alignment, typography, and colors consistent?
-   Are all controls usable with keyboard and touch?
-   Are loading, empty, error, disabled, and success states designed?
-   Does it work on mobile without clipping or overflow?
-   Is the content real or clearly identified as sample data?
-   Does it match the shared UniMate design system?
-   Does the screen feel polished and purposeful rather than
    template-generated?

## 14. Antigravity UI implementation mandate

For every phase, Google Antigravity must:

1.  Read this document before creating or modifying UI.
2.  Inspect the existing components and styling system before
    introducing new ones.
3.  Reuse and extend a consistent design system rather than creating
    one-off styles.
4.  Build complete responsive states, not only static screenshots.
5.  Use Lucide icons consistently and no decorative emojis.
6.  Avoid neon colors, glowing effects, excessive gradients, clutter,
    gratuitous glassmorphism, and generic AI-dashboard styling.
7.  Ensure every visible control has a meaningful behavior or is clearly
    disabled/not yet available.
8.  Verify the actual rendered UI at desktop and mobile sizes.
9.  Fix visible spacing, alignment, contrast, overflow, and interaction
    defects before reporting completion.

**Final quality bar:** UniMate should look and behave like a carefully
designed, production-grade campus product. Visual quality,
accessibility, and usability are acceptance criteria---not optional
polish.
