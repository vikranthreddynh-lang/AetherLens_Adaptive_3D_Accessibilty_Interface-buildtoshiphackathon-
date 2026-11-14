# Accessibility Verification & Testing Guide

## Philosophy & Core Commitments

SenseWeave is engineered from the ground up to empower DeafBlind, blind, and low-vision individuals. Accessibility is not an afterthought or an overlay; it is the fundamental architecture of the application.

### Key Tenets
1. **Never Assume Single-Sense Modality**: Users may have no vision, no hearing, low vision, low hearing, or deafblindness. All information must be conveyable via haptics, refreshable Braille, screen-reader text, or spatial audio.
2. **Never Demand Medical Disclosure**: We do not ask users to disclose disabilities. Instead, we offer granular sensory controls.
3. **No Decorative Ambiguity**: Every UI element has a clearly defined accessible name, role, and value.
4. **No Flashing or Disorienting Motion**: Complies with WCAG 2.2 Level AAA criteria for seizure prevention and reduced motion (`prefers-reduced-motion`).

---

## 1. Keyboard Navigation & Focus Management

### Skip to Main Content
- An accessible skip link (`<SkipLink />`) is positioned as the very first focusable element in the DOM.
- Tabbing into the page reveals the skip button: "Skip to main content", allowing immediate bypass of repetitive navigation headers directly to `#main-content`.

### Focus Indicators & Flow
- All interactive controls (`button`, `a`, `input`, `select`) use high-visibility focus indicators: `focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:outline-none`.
- Modal dialogs (`HapticPreviewModal`, `SessionFeedbackModal`) trap focus within the active dialog and restore focus to the triggering element upon closing.
- Pressing `Escape` at any time closes open modals and tooltips.

### Keyboard Shortcuts
- `Space` / `Enter`: Activate buttons, toggles, and modal triggers.
- `Tab` / `Shift + Tab`: Navigate sequentially across interactive targets.
- `Arrow Keys`: Adjust sliders and select radio/segmented buttons.

---

## 2. Screen Reader Live Regions (`LiveRegion.tsx`)

To avoid speech collision while delivering timely cues, SenseWeave implements a dual-channel ARIA live region system:

```html
<!-- Non-urgent ambient cues and regular speaker transitions -->
<div id="live-region-polite" aria-live="polite" aria-atomic="true" class="sr-only"></div>

<!-- Critical warnings, overlapping speech, and system disruptions -->
<div id="live-region-assertive" aria-live="assertive" aria-atomic="true" class="sr-only"></div>
```

- **Polite Channel**: Queued by the screen reader and announced when the synthesizer finishes speaking its current phrase (e.g. "Speaker A began speaking").
- **Assertive Channel**: Interrupts the screen reader immediately for high-priority alerts (e.g. "Overlapping speech: Speaker B speaking at left" or "Camera connection lost").

---

## 3. Refreshable Braille Terminal (`BrailleDisplayBox.tsx`)

Refreshable Braille displays have finite pin lengths (typically 40 or 80 cells). Lengthy descriptions can overflow or require laborious finger panning. SenseWeave provides a dedicated Braille output container:

- **Tokenized Syntax**: Concise bracketed tokens designed for rapid finger-reading:
  - `[SPK-A (L)]` - Speaker A speaking at camera-left.
  - `[OVRLAP: A+B]` - Overlapping speech between Speaker A and B.
  - `[GEST: HAND-L]` - Visible hand raised at camera-left.
  - `[GEST: POINT-R]` - Visible pointing gesture toward camera-right.
  - `[ANNC: PUB]` - Public acoustic announcement.
- **Screen Reader Compatibility**: Displayed within an accessible `role="status"` region with an accessible copy button to transfer the Braille log to the system clipboard.
- **Cell Length Adjustment**: User toggle between 40-cell and 80-cell formatting in Settings.

---

## 4. Haptic Pattern Vocabulary (`hapticRegistry.ts`)

Mobile vibration motors are utilized to convey rhythmic vocabulary rather than claiming impossible directional resolution:

| Pattern Name | Vibration Sequence (ms) | Total Duration | Intended Event |
| :--- | :--- | :--- | :--- |
| `single_short` | `[60]` | 60ms | Speaker turn transition |
| `double_short` | `[60, 40, 60]` | 160ms | Hand-raise gesture |
| `rapid_pulse` | `[40, 30, 40, 30, 40]` | 180ms | Overlapping speech |
| `long_pulse` | `[200]` | 200ms | Display or scene transition |
| `soft_alert` | `[100, 50, 100]` | 250ms | Public announcement |
| `warning` | `[150, 50, 150, 50, 200]` | 600ms | Critical alert / Disconnection |
| `quiet` | `[]` | 0ms | Suppressed in Quiet Mode |

*Users can test every pattern interactively in the Settings page via the Haptic Preview Modal.*

---

## 5. Assistive Technology Testing Protocol

We recommend validating SenseWeave across the following assistive technology configurations:

### Screen Readers
- **Windows**: NVDA 2024.1+ (Chrome, Firefox, Edge) and JAWS 2024+.
- **macOS / iOS**: VoiceOver (Safari, Chrome).
- **Android**: TalkBack 14.1+ (Chrome).
- **Linux**: Orca (Firefox, Chromium).

### Refreshable Braille Displays
- **Focus 40 Blue** via Bluetooth / USB.
- **Orbit Reader 20**.
- **HumanWare Brailliant BI 40X**.

### Manual Testing Verification Checklist
1. **Zero-Mouse Walkthrough**: Complete an entire session cycle (Onboarding -> New Session -> Live Session -> Save Summary) solely using `Tab`, `Shift+Tab`, `Space`, `Enter`, and `Escape`.
2. **Contrast & Sizing**: Verify all text elements meet WCAG AAA 7:1 contrast ratio in High Contrast mode and 4.5:1 in standard dark mode. Test with 200% browser zoom without layout breakage.
3. **Screen Reader Announcement Audit**: Verify that speaker transitions do not trigger continuous duplicate speech. Verify that overlapping speech alerts speak promptly without truncating error warnings.
4. **Haptic Fallback Verification**: On desktop devices lacking a vibration motor, verify the visual pulse indicator flashes clearly and non-disruptively.
5. **Headphone Spatial Test**: Run the built-in stereo audio test in Settings to confirm clear panning separation between Left (-1.0), Center (0.0), and Right (+1.0).

---

## 6. DeafBlind & Blind Community Co-Design Principles

- **Informed Consent**: Explicit confirmation before initializing microphone or camera sensors.
- **No Deceptive Hardware Claims**: If an external tactile belt or directional array is not connected, the UI explicitly notes that vibration is limited to the single device motor.
- **Feedback & Co-Design Loops**: Built-in post-session feedback modal allows users to rate clarity and submit qualitative observations to refine cue thresholds.
