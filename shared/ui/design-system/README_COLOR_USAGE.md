# Design System Color Usage Guide

## Problem Statement

**Issue:** Many components use hardcoded hex color values (e.g., `className="text-[#686b6e]"`) instead of using Tailwind CSS color utilities from the design system. This causes colors to appear as black and creates maintenance issues.

**Root Cause:**
1. TypeScript color tokens in `tokens/colors.ts` are NOT automatically converted to Tailwind CSS classes
2. Components using hardcoded hex values bypass the design system entirely
3. The Tailwind configuration defines colors, but they weren't being used consistently

---

## ✅ Correct Way to Use Colors

### 1. **Use Tailwind Color Utilities (Recommended)**

Always use Tailwind's utility classes that reference the design system:

```tsx
// ✅ CORRECT - Uses design system via Tailwind
<div className="bg-primary-600 text-white">
  Primary Button
</div>

// ✅ CORRECT - Uses semantic colors
<p className="text-noble-black-500">
  Primary text color
</p>

// ✅ CORRECT - Uses background colors
<div className="bg-whitesmoke-100">
  Background content
</div>
```

### 2. **Use Color Utility Functions**

For dynamic colors or when you need programmatic access:

```tsx
import { getColorClass, colorClasses } from '@shared/ui/design-system/theme/color-utils';

// ✅ CORRECT - Get dynamic color class
const bgClass = getColorClass('primary', 600, 'bg'); // Returns: "bg-primary-600"

// ✅ CORRECT - Use pre-defined color class groups
<button className={colorClasses.primary.bg}>
  Click me
</button>
```

### 3. **Use Deprecated brandClasses (Temporary)**

For legacy code being migrated:

```tsx
import { brandClasses } from '@shared/ui/design-system/theme/theme-utils';

// ⚠️ DEPRECATED but functional - Updated to use Tailwind classes
<span className={brandClasses.text.primary}>
  Text content
</span>
```

---

## ❌ Incorrect Ways (Avoid These)

### 1. **Hardcoded Hex Values**

```tsx
// ❌ WRONG - Hardcoded hex values
<div className="bg-[#ff7500] text-[#363a3d]">
  Don't do this!
</div>

// ❌ WRONG - Inline styles with hex
<div style={{ color: '#686b6e' }}>
  This bypasses the design system
</div>
```

### 2. **Using TypeScript Token Values Directly**

```tsx
import { colorTokens } from '@shared/ui/design-system/tokens/colors';

// ❌ WRONG - TypeScript tokens don't generate CSS
<div style={{ backgroundColor: colorTokens.primary[600] }}>
  This won't work correctly
</div>
```

---

## Color Reference Table

### Primary Brand Colors (Orange)

| Tailwind Class | Usage | Hex Value |
|----------------|-------|-----------|
| `bg-primary-50` | Very light orange | `#fff1e6` |
| `bg-primary-600` | **Main brand orange** | `#ff7500` |
| `bg-primary-700` | Hover state | `#e86a00` |
| `bg-primary-800` | Active state | `#b55300` |

### Noble Black (Text Colors)

| Tailwind Class | Usage | Hex Value |
|----------------|-------|-----------|
| `text-noble-black-500` | Primary text | `#363a3d` |
| `text-noble-black-400` | Secondary text | `#686b6e` |
| `text-noble-black-300` | Muted text | `#9b9c9e` |
| `text-noble-black-200` | Light text | `#cdcecf` |

### Background Colors

| Tailwind Class | Usage | Hex Value |
|----------------|-------|-----------|
| `bg-whitesmoke-100` | Primary background | `#f9fafb` |
| `bg-whitesmoke-200` | Secondary background | `#f4f6f8` |
| `bg-white` | Card background | `#ffffff` |

### Semantic Colors

| Category | Background | Text | Border |
|----------|-----------|------|--------|
| **Success** | `bg-stem-green-600` | `text-stem-green-900` | `border-stem-green-600` |
| **Warning** | `bg-happy-orange-600` | `text-white` | `border-happy-orange-600` |
| **Error** | `bg-red-power-600` | `text-white` | `border-red-power-600` |
| **Info** | `bg-day-blue-500` | `text-white` | `border-day-blue-500` |

---

## Migration Guide

### Step 1: Identify Hardcoded Colors

Search for patterns like:
- `className="text-[#`
- `className="bg-[#`
- `style={{ color: '#`

### Step 2: Replace with Tailwind Classes

```tsx
// BEFORE
<button className="bg-[#ff7500] text-white hover:bg-[#e86a00]">
  Click me
</button>

// AFTER
<button className="bg-primary-600 text-white hover:bg-primary-700">
  Click me
</button>
```

### Step 3: Use Color Utilities for Complex Cases

```tsx
// BEFORE
const getButtonColor = (variant: string) => {
  switch(variant) {
    case 'primary': return 'bg-[#ff7500]';
    case 'secondary': return 'bg-[#f4f6f8]';
    default: return 'bg-white';
  }
};

// AFTER
import { colorClasses } from '@shared/ui/design-system/theme/color-utils';

const getButtonColor = (variant: string) => {
  switch(variant) {
    case 'primary': return colorClasses.primary.bg;
    case 'secondary': return colorClasses.background.secondary;
    default: return colorClasses.background.card;
  }
};
```

---

## Button Component Example

The button component has been updated as a reference implementation:

```tsx
// File: shared/ui/atoms/button/button.tsx

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg...",
  {
    variants: {
      variant: {
        // ✅ Uses Tailwind classes from design system
        default: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
        secondary: "bg-whitesmoke-200 text-noble-black-500 hover:bg-noble-black-100",
        outline: "border border-noble-black-200 bg-white text-noble-black-500",
        ghost: "text-noble-black-500 hover:bg-whitesmoke-100",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
      },
    },
  }
);
```

---

## Color Utility API Reference

### `getColorClass(colorName, shade, type)`

Get a Tailwind color class from design system tokens.

**Parameters:**
- `colorName`: Color token name (e.g., `'primary'`, `'noble-black'`)
- `shade`: Color shade (e.g., `100`, `500`, `900`)
- `type`: Utility type (`'bg'`, `'text'`, `'border'`, `'ring'`)

**Returns:** Tailwind class string (e.g., `"bg-primary-600"`)

**Example:**
```tsx
const bgClass = getColorClass('primary', 600, 'bg');
// Returns: "bg-primary-600"
```

### `colorClasses` Object

Pre-defined color class groups for common use cases.

**Available groups:**
- `colorClasses.primary.*` - Primary brand orange
- `colorClasses.text.*` - Text colors
- `colorClasses.background.*` - Background colors
- `colorClasses.border.*` - Border colors
- `colorClasses.semantic.*` - Semantic colors (success, warning, error, info)

**Example:**
```tsx
import { colorClasses } from '@shared/ui/design-system/theme/color-utils';

<div className={colorClasses.primary.bg}>
  {/* Uses bg-primary-600 */}
</div>
```

### `getButtonVariantClasses(variant)`

Get complete button styling for a specific variant.

**Parameters:**
- `variant`: Button variant (`'default'`, `'secondary'`, `'outline'`, `'ghost'`, `'link'`, `'destructive'`, `'success'`)

**Returns:** Complete Tailwind class string

**Example:**
```tsx
const classes = getButtonVariantClasses('default');
// Returns: "bg-primary-600 text-white hover:bg-primary-700..."
```

---

## Testing Your Changes

After migrating to Tailwind color classes:

1. **Build the design system:**
   ```bash
   cd shared/ui
   pnpm run build
   ```

2. **Check in browser:**
   - Colors should render correctly (not black)
   - Hover states should work
   - Dark mode should work (if implemented)

3. **Verify class generation:**
   - Open browser DevTools
   - Check that classes like `bg-primary-600` are applied
   - Verify computed styles show correct hex values

---

## Troubleshooting

### Colors Still Appear Black

1. **Check if Tailwind is processing the classes:**
   ```bash
   # Rebuild the UI library
   cd shared/ui && pnpm run build

   # Restart the web app
   cd ../../apps/web && pnpm dev
   ```

2. **Verify Tailwind content paths:**
   - Check `apps/web/tailwind.config.ts`
   - Ensure `shared/ui/**/*.{ts,tsx}` is included

3. **Check for CSS import order:**
   - `globals.css` should import design system CSS
   - Tailwind directives should come first

### Class Not Applying

1. **Use browser DevTools to check:**
   - Is the class present in the DOM?
   - Is it being overridden by other styles?
   - Check the computed styles

2. **Purging issue:**
   - Ensure you're not dynamically constructing class names
   - ❌ Bad: `` `bg-${color}-600` ``
   - ✅ Good: Use `getColorClass()` or predefined classes

---

## Best Practices

1. **Always use Tailwind classes** from the design system
2. **Never hardcode hex values** in className or style props
3. **Use color utilities** for dynamic color selection
4. **Follow the migration guide** when updating legacy code
5. **Test in browser** after making color changes
6. **Keep design system as single source of truth**

---

## Need Help?

- Check `shared/ui/design-system/tokens/colors.ts` for available colors
- Check `shared/ui/design-system/tailwind.config.ts` for Tailwind color definitions
- Refer to `shared/ui/atoms/button/button.tsx` for a reference implementation
- See `shared/ui/design-system/theme/color-utils.ts` for utility functions

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
