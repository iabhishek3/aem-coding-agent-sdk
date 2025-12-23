# Design to Tokens Workflow

## Trigger
User uploads a design image and requests design specifications or tokens.

## Input Required
- Design image (screenshot, mockup, or exported design)
- Optional: Specific focus areas (colors only, typography only, etc.)
- Optional: Output format preference

## CRITICAL: Output Requirements

**ALWAYS generate output as a standalone Markdown file** that can be viewed and shared.

### Output File Location
```
{project_root}/design-specs/design-spec-{timestamp}.md
```

If no project is selected, create in:
```
~/Desktop/design-spec-{timestamp}.md
```

### File Naming Convention
```
design-spec-YYYY-MM-DD-HHMMSS.md
```
Example: `design-spec-2024-01-15-143022.md`

## Workflow Steps

### Step 1: Receive and Acknowledge Image
```yaml
action: acknowledge_input
response: |
  I'll analyze this design and generate a comprehensive Markdown specification file containing:
  - Complete color palette with tokens
  - Typography scale and font specs
  - Spacing system
  - Component specifications
  - Ready-to-use CSS variables

  The output will be saved as a .md file you can view and share.
```

### Step 2: Analyze Overall Composition
```yaml
action: visual_analysis
extract:
  - Layout structure (grid columns, flex patterns)
  - Visual hierarchy (what draws attention first)
  - Content sections
  - Navigation patterns
  - Key interactive elements
output: design_overview_section
```

### Step 3: Extract Color Palette
```yaml
action: extract_colors
process:
  - Identify all unique colors
  - Group into categories (primary, secondary, neutral, feedback)
  - Determine usage context for each
  - Check contrast ratios
output:
  - Color tokens (JSON)
  - CSS custom properties
  - Accessibility notes
```

### Step 4: Analyze Typography
```yaml
action: analyze_typography
process:
  - Identify font families (or suggest alternatives)
  - Extract heading sizes (h1-h6)
  - Determine body text specs
  - Note font weights used
  - Calculate line heights
output:
  - Typography tokens
  - Font stack recommendations
  - Type scale
```

### Step 5: Extract Spacing System
```yaml
action: extract_spacing
process:
  - Measure margins and padding
  - Identify gaps between elements
  - Detect grid gutters
  - Normalize to consistent scale
output:
  - Spacing scale tokens
  - Layout recommendations
```

### Step 6: Document Visual Effects
```yaml
action: extract_effects
process:
  - Border radius values
  - Shadow definitions
  - Border styles
  - Opacity values
  - Gradients (if present)
output:
  - Effect tokens
  - CSS declarations
```

### Step 7: Identify Components
```yaml
action: identify_components
for_each_component:
  - Assign descriptive name
  - Document structure
  - List variants (if visible)
  - Note states (hover, active, etc.)
  - Specify dimensions and spacing
output:
  - Component specifications
  - Implementation notes
```

### Step 8: Generate Token Files
```yaml
action: generate_outputs
formats:
  - JSON (design tokens format)
  - CSS (custom properties)
  - SCSS (variables)
  - Tailwind config (if requested)
```

### Step 9: Create Output Directory
```yaml
action: create_directory
path: "{project_root}/design-specs/"
fallback: "~/Desktop/"
```

### Step 10: Write Markdown File
```yaml
action: write_file
filename: "design-spec-{timestamp}.md"
content: |
  # Design Specification
  Generated: {date_time}
  Source: {image_name}

  ---

  ## Table of Contents
  1. [Design Overview](#design-overview)
  2. [Color Tokens](#color-tokens)
  3. [Typography](#typography)
  4. [Spacing Scale](#spacing-scale)
  5. [Effects & Borders](#effects--borders)
  6. [Component Specifications](#component-specifications)
  7. [CSS Variables](#css-variables)
  8. [Accessibility Notes](#accessibility-notes)

  ---

  [Full generated content here]

notify_user: |
  Design specification saved to: {file_path}
  You can open this file in any Markdown viewer or VS Code.
```

### Step 11: Confirm File Creation
```yaml
action: verify_and_notify
response: |
  ✅ Design specification generated successfully!

  📄 **File saved to:** `{file_path}`

  The file contains:
  - {color_count} color tokens
  - {typography_count} typography styles
  - {spacing_count} spacing values
  - {component_count} component specs
  - Complete CSS variables (copy-ready)

  Open the file to view the full specification.
```

## Output Template

```markdown
# Design Specification

## Overview
[Brief description of the design and its purpose]

---

## Color Tokens

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | #XXXXXX | Main actions, links |
| `--color-secondary` | #XXXXXX | Secondary actions |

### Neutral Colors
[Table of grays/neutrals]

### Feedback Colors
[Error, success, warning, info]

---

## Typography

### Font Families
```css
--font-sans: 'Inter', -apple-system, sans-serif;
--font-mono: 'Fira Code', monospace;
```

### Type Scale
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 12px | 400 | 1.5 | Captions |
| `--text-sm` | 14px | 400 | 1.5 | Secondary text |
| `--text-base` | 16px | 400 | 1.5 | Body text |

---

## Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Default gaps |

---

## Effects

### Border Radius
| Token | Value |
|-------|-------|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |

### Shadows
| Token | Value |
|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) |

---

## Component Specifications

### [Component Name]
**Purpose**: [What it does]
**Variants**: [List variants]

| Property | Value |
|----------|-------|
| Background | var(--color-X) |
| Padding | var(--space-X) |
| Border Radius | var(--radius-X) |

---

## Complete CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #XXXXXX;

  /* Typography */
  --font-sans: 'Inter', sans-serif;

  /* Spacing */
  --space-1: 4px;

  /* Effects */
  --radius-sm: 4px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
}
```

---

## Accessibility Notes
- [Contrast ratio findings]
- [Focus state recommendations]
- [Touch target notes]
```

## Error Handling

### Low Quality Image
```yaml
on_condition: blurry_or_low_res
action:
  - Note limitations in analysis
  - Provide best estimates with confidence levels
  - Recommend re-upload if critical details unclear
```

### Ambiguous Values
```yaml
on_condition: uncertain_values
action:
  - Provide range of possible values
  - Suggest standard alternatives
  - Note uncertainty in output
```

## Success Criteria
- [ ] All visible colors extracted and documented
- [ ] Typography fully specified
- [ ] Spacing scale derived
- [ ] Major components identified
- [ ] CSS variables ready to use
- [ ] Accessibility considerations noted
