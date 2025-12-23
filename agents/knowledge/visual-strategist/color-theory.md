# Color Theory for Design Systems

## Color Extraction from Images

### Primary Methods
1. **Dominant Color Analysis**: Most prevalent color in the image
2. **Palette Extraction**: 5-8 key colors that define the design
3. **Contrast Pairs**: Text/background combinations

### Color Roles

| Role | Purpose | Typical Usage |
|------|---------|---------------|
| Primary | Brand identity | CTAs, links, key actions |
| Secondary | Supporting brand | Secondary buttons, accents |
| Neutral | Content foundation | Text, backgrounds, borders |
| Success | Positive feedback | Confirmations, completed states |
| Warning | Caution states | Alerts, pending states |
| Error | Negative feedback | Errors, destructive actions |
| Info | Informational | Tips, help text |

## Color Scales

### Generating a Color Scale
From a base color, generate 10 shades:

```
50  - Lightest (backgrounds, subtle highlights)
100 - Very light (hover states on light bg)
200 - Light (disabled states)
300 - Light-medium (borders)
400 - Medium-light (placeholder text)
500 - Base color (primary usage)
600 - Medium-dark (hover states)
700 - Dark (active states)
800 - Very dark (text on light bg)
900 - Darkest (headings, emphasis)
```

### HSL Adjustments
```
Lighter shades: Increase L, decrease S slightly
Darker shades: Decrease L, increase S slightly
```

## Contrast & Accessibility

### WCAG Requirements

| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | 4.5:1 |

### Large Text Definition
- 18pt (24px) regular weight, OR
- 14pt (18.66px) bold weight

### Common Contrast Pairs
```css
/* Good contrast examples */
--text-on-light: #1f2937;  /* gray-800 on white = 12.6:1 */
--text-on-dark: #f9fafb;   /* gray-50 on gray-900 = 15.1:1 */
--link-on-light: #2563eb;  /* blue-600 on white = 4.7:1 */
```

## Color Spaces

### Hex vs HSL vs RGB

```css
/* Same color in different formats */
--blue: #3b82f6;           /* Hex - compact */
--blue: rgb(59, 130, 246); /* RGB - direct values */
--blue: hsl(217, 91%, 60%); /* HSL - easier to adjust */
```

### When to Use Each
- **Hex**: Final output, compact storage
- **HSL**: Creating variations, adjusting lightness
- **RGB**: Opacity needs (rgba), calculations

## Dark Mode Considerations

### Token Strategy
```json
{
  "color": {
    "background": {
      "light": "#ffffff",
      "dark": "#0f172a"
    },
    "text-primary": {
      "light": "#1f2937",
      "dark": "#f1f5f9"
    }
  }
}
```

### Inversion Rules
- Don't simply invert colors
- Reduce contrast slightly in dark mode (less eye strain)
- Desaturate bright colors for dark backgrounds
- Maintain semantic meaning (error = red in both modes)

## Color Harmonies

### Extracting Harmonious Colors
From a primary color, derive:

- **Complementary**: 180° on color wheel
- **Analogous**: ±30° adjacent colors
- **Triadic**: 120° apart
- **Split-Complementary**: 150° and 210°

### Practical Application
```
Primary:    Brand color from design
Secondary:  Analogous or complementary
Accent:     High-contrast pop color
Neutrals:   Desaturated primary or pure gray
```
