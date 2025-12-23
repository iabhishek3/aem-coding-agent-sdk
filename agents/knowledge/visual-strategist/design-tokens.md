# Design Tokens Knowledge Base

## What Are Design Tokens?

Design tokens are the smallest pieces of a design system - the visual design atoms. They store design decisions (colors, typography, spacing, etc.) as data, allowing consistent application across platforms.

## Token Architecture

### Three-Tier Token System

```
┌─────────────────────────────────────────────────────────┐
│                    COMPONENT TOKENS                      │
│     (button-primary-bg, card-border-radius)             │
├─────────────────────────────────────────────────────────┤
│                    SEMANTIC TOKENS                       │
│     (color-action-primary, spacing-content)             │
├─────────────────────────────────────────────────────────┤
│                    PRIMITIVE TOKENS                      │
│     (blue-500, spacing-16, font-size-14)                │
└─────────────────────────────────────────────────────────┘
```

### Primitive Tokens (Raw Values)
```json
{
  "color": {
    "blue": {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a"
    }
  }
}
```

### Semantic Tokens (Purpose-Based)
```json
{
  "color": {
    "action": {
      "primary": "{color.blue.600}",
      "primary-hover": "{color.blue.700}",
      "secondary": "{color.gray.600}"
    },
    "feedback": {
      "error": "{color.red.500}",
      "success": "{color.green.500}",
      "warning": "{color.yellow.500}"
    }
  }
}
```

### Component Tokens (Component-Specific)
```json
{
  "button": {
    "primary": {
      "background": "{color.action.primary}",
      "background-hover": "{color.action.primary-hover}",
      "text": "{color.text.inverse}",
      "border-radius": "{border-radius.md}",
      "padding-x": "{spacing.4}",
      "padding-y": "{spacing.2}"
    }
  }
}
```

## Token Categories

### Color Tokens
| Category | Purpose | Example |
|----------|---------|---------|
| Brand | Primary brand colors | `brand-primary`, `brand-secondary` |
| Background | Surface colors | `bg-primary`, `bg-secondary`, `bg-elevated` |
| Text | Typography colors | `text-primary`, `text-secondary`, `text-disabled` |
| Border | Stroke colors | `border-default`, `border-subtle` |
| Feedback | Status colors | `error`, `success`, `warning`, `info` |
| Interactive | Action colors | `action-primary`, `action-secondary` |

### Typography Tokens
| Token | Description | Values |
|-------|-------------|--------|
| `font-family` | Font stacks | `sans`, `serif`, `mono` |
| `font-size` | Text sizes | `xs` to `5xl` |
| `font-weight` | Text weight | `normal`, `medium`, `bold` |
| `line-height` | Line spacing | `tight`, `normal`, `relaxed` |
| `letter-spacing` | Character spacing | `tight`, `normal`, `wide` |

### Spacing Tokens
```
4px  (spacing-1)  - Tight internal spacing
8px  (spacing-2)  - Default internal spacing
12px (spacing-3)  - Comfortable spacing
16px (spacing-4)  - Section spacing
24px (spacing-6)  - Component gaps
32px (spacing-8)  - Large section gaps
48px (spacing-12) - Page section spacing
64px (spacing-16) - Major section breaks
```

### Effect Tokens
- **Shadow**: Elevation levels (sm, md, lg, xl)
- **Border Radius**: Corner rounding (none, sm, md, lg, full)
- **Opacity**: Transparency levels
- **Blur**: Backdrop blur effects

## Naming Conventions

### Format
```
[category]-[property]-[variant]-[state]
```

### Examples
```
color-background-primary
color-text-secondary
spacing-padding-lg
border-radius-button
shadow-elevation-high
font-size-heading-lg
```

## Token Formats

### JSON (Design Tools)
```json
{
  "color-primary": {
    "value": "#3b82f6",
    "type": "color"
  }
}
```

### CSS Variables
```css
:root {
  --color-primary: #3b82f6;
}
```

### SCSS Variables
```scss
$color-primary: #3b82f6;
```

### JavaScript/TypeScript
```typescript
export const tokens = {
  colorPrimary: '#3b82f6',
} as const;
```

## Tools & Workflow

### Token Management Tools
- **Tokens Studio** (Figma plugin)
- **Style Dictionary** (Build system)
- **Theo** (Salesforce token tool)
- **Design Tokens CLI**

### Typical Workflow
```
Design Tool (Figma)
       ↓
Token Export (JSON)
       ↓
Style Dictionary Transform
       ↓
Platform Outputs (CSS, iOS, Android)
```
