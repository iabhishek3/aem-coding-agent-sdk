# Design Token Generation Skill

## Capability Description
Generate production-ready design tokens in multiple formats from analyzed design specifications.

## When to Use
- After analyzing a design image
- When creating a new design system
- When standardizing existing design values
- When preparing developer handoff

## Token Generation Process

### Step 1: Normalize Extracted Values
```yaml
action: normalize_values
rules:
  colors:
    - Convert all to 6-digit hex (lowercase)
    - Group similar colors (within 5% difference)
    - Assign semantic names
  spacing:
    - Round to 4px grid
    - Create consistent scale
  typography:
    - Convert to rem (base 16px)
    - Standardize weight names
```

### Step 2: Create Token Structure
```yaml
action: structure_tokens
hierarchy:
  - primitives (raw values)
  - semantic (purpose-based)
  - component (specific usage)
```

### Step 3: Generate Outputs

#### JSON Format (for Style Dictionary)
```json
{
  "color": {
    "primitive": {
      "blue": {
        "500": { "value": "#3b82f6", "type": "color" }
      }
    },
    "semantic": {
      "action": {
        "primary": { "value": "{color.primitive.blue.500}", "type": "color" }
      }
    }
  }
}
```

#### CSS Custom Properties
```css
:root {
  /* Primitives */
  --color-blue-500: #3b82f6;

  /* Semantic */
  --color-action-primary: var(--color-blue-500);

  /* Typography */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
}
```

#### SCSS Variables
```scss
// Colors
$color-blue-500: #3b82f6;
$color-action-primary: $color-blue-500;

// Typography
$font-size-base: 1rem;
$font-size-lg: 1.125rem;

// Spacing
$spacing-1: 0.25rem;
$spacing-2: 0.5rem;
```

#### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
      spacing: {
        '18': '4.5rem',
      },
      fontSize: {
        'xxs': '0.625rem',
      }
    }
  }
}
```

#### TypeScript Constants
```typescript
export const tokens = {
  color: {
    primary: '#3b82f6',
    secondary: '#64748b',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
  fontSize: {
    base: '1rem',
    lg: '1.125rem',
  }
} as const;

export type ColorToken = keyof typeof tokens.color;
export type SpacingToken = keyof typeof tokens.spacing;
```

## Naming Convention Rules

### General Pattern
```
[category]-[property]-[variant]-[modifier]
```

### Category Prefixes
| Prefix | Category |
|--------|----------|
| `color-` | Colors |
| `font-` | Typography |
| `spacing-` | Space values |
| `radius-` | Border radius |
| `shadow-` | Box shadows |
| `border-` | Borders |
| `z-` | Z-index |
| `duration-` | Animations |

### Size Modifiers
```
xs, sm, md, lg, xl, 2xl, 3xl
```
or
```
100, 200, 300, 400, 500, 600, 700, 800, 900
```

### State Modifiers
```
-default, -hover, -active, -focus, -disabled
```

## Validation Rules

### Colors
- Must be valid hex, rgb, or hsl
- Semantic tokens must reference primitives
- Dark mode variants should exist

### Typography
- Font sizes should follow consistent scale (1.125-1.333 ratio)
- Line heights between 1.2 and 1.8
- Limited font weights (3-4 maximum)

### Spacing
- Follow 4px or 8px base grid
- Scale should be consistent (linear or modular)
- Cover range from 4px to 64px minimum

## Output Quality Checklist
- [ ] All tokens have meaningful names
- [ ] Primitives and semantics properly separated
- [ ] No magic numbers (all values use tokens)
- [ ] Dark mode tokens included
- [ ] Responsive variants documented
- [ ] Token usage guidelines provided
