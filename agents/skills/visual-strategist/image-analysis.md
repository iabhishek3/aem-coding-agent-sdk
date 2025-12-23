# Image Analysis Skill

## Capability Description
Analyze UI/UX design images to extract visual properties, identify components, and generate comprehensive design specifications.

## When to Use
- User uploads a design screenshot or mockup
- User asks for design specs from an image
- User wants to extract design tokens from a visual
- User needs component documentation from a design

## Analysis Process

### Step 1: Overall Assessment
```yaml
action: analyze_composition
extract:
  - Layout type (grid, flex, absolute)
  - Visual hierarchy
  - Primary content areas
  - Navigation patterns
  - Whitespace distribution
```

### Step 2: Color Extraction
```yaml
action: extract_colors
method: visual_analysis
outputs:
  - Dominant colors (sorted by prominence)
  - Background colors
  - Text colors (primary, secondary)
  - Accent/action colors
  - Border colors
  - Shadow colors (if visible)
format:
  - Hex codes
  - Estimated RGB values
  - Usage context
```

### Step 3: Typography Analysis
```yaml
action: analyze_typography
extract:
  - Font families (identify or suggest similar)
  - Heading hierarchy (h1-h6 sizes)
  - Body text size
  - Font weights used
  - Line heights
  - Letter spacing patterns
output_format:
  - Pixel values
  - Rem equivalents (base 16px)
  - CSS declarations
```

### Step 4: Spacing Analysis
```yaml
action: analyze_spacing
extract:
  - Page margins
  - Section padding
  - Component gaps
  - Internal element spacing
  - Grid gutters
derive:
  - Spacing scale (4px base recommended)
  - Consistent patterns
```

### Step 5: Component Identification
```yaml
action: identify_components
for_each_component:
  - Name and purpose
  - Visual boundaries
  - Internal structure
  - Variants visible
  - Interactive states (if shown)
  - Responsive hints
```

### Step 6: Effects & Decorations
```yaml
action: analyze_effects
extract:
  - Border radius values
  - Shadow properties (offset, blur, spread, color)
  - Opacity levels
  - Gradient definitions
  - Border styles and widths
```

## Output Templates

### Quick Summary
```markdown
## Design Analysis Summary

**Layout**: [Grid/Flex/Mixed] with [X] columns
**Color Palette**: [X] primary colors identified
**Typography**: [Font family] with [X] size variations
**Components**: [X] unique components identified
**Spacing System**: [X]px base unit detected
```

### Detailed Specification
```markdown
## Complete Design Specification

### 1. Color System
[Full color token table]

### 2. Typography Scale
[Font stack and size scale]

### 3. Spacing Scale
[Spacing values and usage]

### 4. Component Library
[Each component documented]

### 5. CSS Variables
[Ready-to-use CSS custom properties]
```

## Accuracy Guidelines

### Color Extraction
- Provide confidence level for extracted colors
- Note if colors appear affected by image compression
- Suggest similar standard colors when exact match uncertain

### Typography
- If font cannot be identified, suggest 2-3 similar alternatives
- Note visual weight even if exact weight unknown
- Estimate sizes based on visible scale relationships

### Spacing
- Round to nearest 4px for consistency
- Note any inconsistencies in original design
- Recommend normalized spacing scale

## Quality Checklist
- [ ] All visible colors documented
- [ ] Typography hierarchy complete
- [ ] Spacing patterns identified
- [ ] Major components cataloged
- [ ] CSS variables generated
- [ ] Accessibility notes included
