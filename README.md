# AetherLens — Adaptive 3D Accessibility Interface

AetherLens is a high-craft frontend shell for an inclusive spatial interface, built around the **What-If Accessibility Pathway Engine**. It demonstrates how people navigating institutional directives (e.g. university notices, administrative deadlines) can explore documented alternatives, identify missing policy information, and formulate targeted clarification questions.

> *"Instructions can be clear and still be impossible for someone to follow. AetherLens helps people explore documented alternatives and identify what the source does not say."*

---

## 🎨 Strict Five-Color Palette System

Every visual element — including Three.js 3D meshes, directional/ambient lighting, fog, HUD panels, borders, typography, focus outlines, and state badges — adheres strictly to the mandated 5-color palette:

| Hex Code | Semantic Role |
| :--- | :--- |
| `#EDE8F5` | Page background, WebGL scene background, fog, calm cards, inverted text |
| `#ADBBDA` | Secondary surfaces, inactive 3D meshes, concentric floor rings |
| `#8697C4` | Wireframes, depth contours, panel borders, muted labels |
| `#7091E6` | Interactive 3D nodes, active indicators, secondary pills, directional light |
| `#3D52A0` | Primary typography, primary buttons, active anchors, focus rings |

---

## 🚀 Core Features & Interaction Flow

1. **3D Spatial Environment**:
   - Central morphing low-poly icosahedron sculpture in `#7091E6` with `#3D52A0` wireframe contours and concentric `#ADBBDA` floor rings.
   - 3 interactive orbiting nodes:
     - **What-If Pathways** (Core Engine)
     - **Live Sign & Captions** (Spatial Sensory Sync)
     - **Vernacular Bridge** (Administrative Dialect Adapter)
   - Bounded, damped `OrbitControls` with smooth, interruptible camera framing transitions for each node.
   - Built-in WebGL failure boundary and accessible 2D spatial fallback.

2. **Contextual Feature Drawer**:
   - Opens on node selection via 3D click, HUD pill navigation, or keyboard tab.
   - Retains 75%+ canvas visibility on desktop; adapts to an accessible bottom sheet on mobile.

3. **What-If Accessibility Pathway Demo**:
   - **Sample Notice**: Clearly marked fictional academic registration notice from Apex Metropolitan University.
   - **Barrier Selection**: 4 real-world barriers (*"I can't visit the office"*, *"I don't have access to a printer"*, *"I can't make a phone call"*, *"I missed the stated deadline"*).
   - **Evidence State Simulation**:
     - *Alternative stated in source* (`source-supported`)
     - *Alternative not specified* (`information-not-specified`)
     - *Source wording is unclear* (`source-ambiguous`)
   - **Dynamic Pathway Analysis**: Highlights policy silences, cites source text, and recommends actionable next steps.
   - **Editable Clarification Question**: Real-time editable query with 1-click clipboard copy, confirmation feedback, and selectable fallback.

4. **Inclusive Control Dock**:
   - **Hold to Speak**: Interactive simulated voice stream with continuous audio wave feedback + accessible click-toggle alternative for users with motor limitations (no mic permissions requested).
   - **Simplify View**: Presentation toggle switching between technical academic text and plain-language phrasing (no fake AI claims).

5. **Calm Mode & Universal Accessibility**:
   - Respects OS `prefers-reduced-motion` on initial mount.
   - Manual toggle immediately freezes all 3D rotations, floating oscillations, and camera sweeps.
   - Switches to a static high-contrast 2D card layout with complete functional equivalence.
   - Live ARIA region announcements (`aria-live="polite"`) for mode changes, clipboard copy, and drawer interactions.
   - Multilingual interface labels for English, Hindi, Tamil, and Bengali.

---

## 🛠️ Technology Stack

- **React 18** with **Vite 6** & **TypeScript**
- **Tailwind CSS** (configured with exclusive 5-color palette tokens)
- **Three.js** via **@react-three/fiber** & **@react-three/drei**
- **Lucide React** (icons)
- **Framer Motion** (2D layout transitions)
- **Google Fonts Lexend** (typography)

---

## 🔌 Integration Slots

This shell contains typed contracts for future AI and accessibility backend services:
- `onFeatureSelect`: Spatial navigation event hook.
- `onVoiceTrigger`: Slot for local Whisper/STT speech-to-text pipeline.
- `onSimplifyTrigger`: Slot for plain-language LLM summarization.
- `WhatIfDemo`: Ready to receive live pathway inference payloads (`{ evidenceState, sourceQuote, suggestedAction, defaultQuestion }`).
