# Design Guidelines: Blockchain Video Verification System

## Design Approach
**Reference-Based**: Drawing from blockchain explorers (Etherscan, Blockchain.com) and modern fintech apps (Stripe, Plaid) - emphasizing trust, transparency, and technical precision with bold visual feedback.

## Color Palette
- **Primary Background**: Black (#000000)
- **Primary Accent**: Royal Blue (#4169E1)
- **Success/Active**: Neon Green (#39FF14)
- **Error/Alert**: Red (#FF0000)
- **Text**: White (#FFFFFF) with reduced opacity for secondary text

## Typography
- **Headings**: Inter or Space Grotesk - Bold, 700-900 weight
- **Body**: Inter - Regular 400, Medium 500
- **Code/Technical**: JetBrains Mono for hashes, timestamps, technical data
- **Sizes**: Hero (4xl-6xl), Section Headers (2xl-3xl), Body (base-lg), Technical (sm-base)

## Layout System
**Spacing**: Tailwind units of 4, 8, 12, 16, 24 for consistent rhythm (p-4, gap-8, mt-12, py-16, mb-24)

## Page-Specific Designs

### Home Page
**Hero Section** (80vh):
- Animated blockchain visualization (canvas/SVG): 3-5 blocks connecting with lines, glowing on link formation
- Centered heading: "Tamper-Proof Video Verification"
- Subheading explaining the technology
- Primary CTA: "Upload & Verify" (royal blue background, neon green on hover)
- Animation: Blocks pulse with neon green glow, connections draw in sequentially

**Explanation Section** (py-24):
- Three-column grid (lg:grid-cols-3, md:grid-cols-2, grid-cols-1)
- Icons: Lock, Chain, CheckCircle (Font Awesome)
- Titles + descriptions for: Hash Integrity, Chain Continuity, Cryptographic Signatures
- Minimal background cards with royal blue borders on hover

### Upload & Verification Page
**Upload Section** (max-w-2xl centered):
- Two upload zones side-by-side (grid-cols-2 on desktop, stacked mobile)
- Left: Video file (.mp4) with icon preview
- Right: Metadata JSON with code preview
- Large "Verify Authenticity" button below (w-full, royal blue, 16 height)

**Results Display**:
- Animated reveal (fade-in from opacity-0 to 100, 500ms delay)
- Four result cards in 2x2 grid:
  - Frame Hash Match: Large checkmark/X icon, glowing border (green/red)
  - Chain Continuity: Chain icon with status
  - Signature Validity: Key icon with status
  - Sensor Fingerprint: Fingerprint icon with status
- Each card: p-8, rounded-lg, border-2, glowing box-shadow on success/failure
- Technical details expandable below each card (monospace font)

### Blockchain Viewer Page
**Interactive Chain Display**:
- Vertical timeline layout (desktop), stacked cards (mobile)
- Each block card (max-w-4xl):
  - Header: Block index (large, neon green)
  - Grid layout showing: chunkHash, sensorFingerprint, prevHash, timestamp
  - Monospace font for hash values (truncated with ellipsis, hover to expand)
  - Border left: 4px royal blue stripe
- Connection lines between blocks (SVG paths, animated drawing effect)
- Hover: Card glows with royal blue shadow
- Latest block highlighted with neon green accent

## Component Library

**Buttons**:
- Primary: Royal blue bg, white text, rounded-lg, px-8 py-4, hover:scale-105 transition
- Success: Neon green bg, black text
- Danger: Red bg, white text

**Cards**:
- Black bg, white border (border-2), rounded-xl, p-6-8
- Hover: Royal blue border with glow (shadow-lg shadow-blue-500/50)

**Input Fields**:
- Black bg, white border, rounded-lg, p-4
- Focus: Royal blue border with glow
- File upload: Dashed border, hover state with blue tint

**Status Indicators**:
- Success: Neon green circle with checkmark
- Error: Red circle with X
- Loading: Animated blue spinner

## Animations

**Hero Chain Animation**:
- Blocks fade in sequentially (200ms intervals)
- Connection lines draw from left to right (stroke-dasharray animation)
- Pulse effect on active block (scale 1.0 to 1.05)

**Verification Results**:
- Stagger fade-in (each card delays by 100ms)
- Glow animation on borders (0-10px blur over 1s)
- Success: Green pulse, Failure: Red pulse

**Blockchain Connections**:
- Draw path animation (stroke-dashoffset)
- Hover reveals detailed connection info tooltip

## Mobile Optimization
- Stack all grids to single column below md breakpoint
- Hero animation simplified (2-3 blocks instead of 5)
- Results cards full-width stacked
- Touch-friendly button sizes (min-h-12)
- Reduced animation complexity for performance

## Images
No hero images required - use animated canvas/SVG blockchain visualization instead. Focus on iconography (Font Awesome) for feature sections and status indicators.