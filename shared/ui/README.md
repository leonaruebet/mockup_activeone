# ActiveOne UI Design System

A comprehensive atomic design system with locked branding for ActiveOne. This package provides reusable components following atomic design principles while maintaining consistent brand identity across all projects.

## 🎨 Brand Guidelines

### Brand Lock (Unchangeable)
- **Primary Color**: #ff7500 (Orange)
- **Fonts**: Plus Jakarta Sans, Kanit
- **Logo**: ActiveOne branding elements
- **Visual Identity**: Brand-specific styling

### Customizable Elements
- Semantic colors (success, error, warning, info)
- System colors (background, border, etc.)
- Component spacing and typography scales

## 📦 Package Structure

```
shared/ui/
├── core/                 # Theme system and utilities
├── atoms/               # Basic building blocks
├── molecules/           # Simple component combinations
├── organisms/           # Complex component groups
├── templates/           # Page-level layouts
├── utils/               # Helper functions and hooks
└── design-system/       # Design tokens and configuration
```

## 🚀 Installation & Usage

### Import the entire system
```typescript
import { Button, Card, ThemeProvider } from '@activeone/ui'
```

### Import specific layers
```typescript
// Atoms only
import { Button, Input } from '@activeone/ui/atoms'

// Theme system
import { ThemeProvider, useBrandTokens } from '@activeone/ui/theme'

// Utilities
import { cn, brandClasses } from '@activeone/ui/utils'
```

## 🎯 Atomic Design Structure

### Atoms
Basic UI elements that can't be broken down further:
- Buttons, inputs, labels
- Typography, icons, avatars
- Loading indicators, progress bars

### Molecules
Simple combinations of atoms:
- Form fields, search bars
- Cards, modals, dropdowns
- Navigation elements

### Organisms
Complex component groups:
- Headers, sidebars, navigation
- Data tables, form sections
- Dashboard layouts

### Templates
Page-level layouts and structures

## 🎨 Theme System

### Theme Provider
```tsx
import { ThemeProvider } from '@irc/ui/theme'

function App() {
  return (
    <ThemeProvider initialMode="light">
      <YourApp />
    </ThemeProvider>
  )
}
```

### Using Brand Tokens
```tsx
import { useBrandTokens, cn, brandClasses } from '@activeone/ui'

function CustomComponent() {
  const brand = useBrandTokens()

  return (
    <div className={cn(brandClasses.primary.bg, "p-4")}>
      <h1 style={{ color: brand.primary.orange[600] }}>
        ActiveOne Brand
      </h1>
    </div>
  )
}
```

## 📱 Component Examples

### Button Component
```tsx
import { Button } from '@activeone/ui/atoms'

<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost" size="sm">Minimal Action</Button>
```

### Card with Theme
```tsx
import { Card, CardContent, CardHeader } from '@activeone/ui/molecules'
import { brandClasses } from '@activeone/ui/utils'

<Card className={brandClasses.background.card}>
  <CardHeader className={brandClasses.text.primary}>
    ActiveOne Card
  </CardHeader>
  <CardContent>
    Content with brand styling
  </CardContent>
</Card>
```

## 🛠 Development

### Scripts
```bash
npm run build          # Build the package
npm run dev           # Watch mode for development
npm run lint          # Lint the codebase
npm run storybook     # Start Storybook
```

### Adding New Components

1. **Atoms**: Place in `/atoms/component-name/`
2. **Molecules**: Place in `/molecules/component-name/`
3. **Follow naming**: `component-name.tsx` + `index.ts`
4. **Export**: Add to respective layer's `index.ts`

Example structure:
```
atoms/
  new-component/
    ├── new-component.tsx
    ├── index.ts
    └── new-component.stories.tsx
```

## 🎨 Brand Compliance

### Do's ✅
- Use provided brand colors
- Follow typography scale
- Maintain consistent spacing
- Use theme utilities

### Don'ts ❌
- Modify brand orange (#ff7500)
- Change brand fonts
- Override logo styling
- Break atomic design hierarchy

## 🔧 Customization

### Extending Theme
```tsx
import { ThemeProvider } from '@activeone/ui/theme'

const customTokens = {
  semantic: {
    // Override semantic colors only
    'custom-blue': { 500: '#1234ff' }
  }
}

<ThemeProvider customTokens={customTokens}>
  <App />
</ThemeProvider>
```

### Custom Utility Classes
```typescript
import { cn, brandClasses } from '@activeone/ui/utils'

const customStyles = cn(
  brandClasses.primary.bg,
  "rounded-lg p-4 shadow-md",
  "hover:shadow-lg transition-shadow"
)
```

## 📋 Migration Guide

### From Old Structure
1. Update imports to use new paths
2. Replace direct token imports with theme hooks
3. Use brand utility classes instead of hardcoded values
4. Wrap app with `ThemeProvider`

### Breaking Changes in v1.1.0
- Reorganized export structure
- New theme system required
- Updated component APIs
- Consolidated utility functions

## 🤝 Contributing

1. Follow atomic design principles
2. Maintain brand consistency
3. Add proper TypeScript types
4. Include Storybook examples
5. Update documentation

## 📄 License

Private package for ActiveOne internal use.