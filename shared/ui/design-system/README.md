# ActiveOne Design System

A comprehensive, scalable design system built with Next.js, TypeScript, and Tailwind CSS. This system is founded on a "vectorized" approach, utilizing design tokens as the single source of truth for all stylistic values, ensuring consistency and enabling robust theming capabilities.

## 🏗️ Architecture

The design system's architecture prioritizes modularity, scalability, and developer experience. It leverages design tokens for all styling, which are then consumed by Tailwind CSS and custom components.

### File Structure
\`\`\`
├── design-system/           # Core design system
│   ├── components/         
│   │   ├── ui/            # Basic UI components (Button, Input, Tag, etc.)
│   │   ├── layout/        # Layout components (Container, Stack, Grid)
│   │   ├── feedback/      # Feedback components (Notification, Badge, Progress)
│   │   ├── navigation/    # Navigation components (NavigationItem, Tab)
│   │   └── forms/         # Form-specific components (FormField, FormInput)
│   ├── tokens/            # Design tokens (colors, spacing, typography)
│   └── index.ts           # Main exports for the design system
├── examples/              # Deprecated: Component examples (use /showcase)
├── app/                   # Next.js app directory
│   ├── showcase/          # Comprehensive showcase page for all tokens & components
│   ├── components/        # Page for interactive demos of Modal, Dropdown, DatePicker
│   ├── navigation/        # Page for NavigationItem demo
│   └── tags/              # Page for Tag & TagInput demo
├── components/ui/         # Base shadcn/ui components (used & extended by design-system)
├── lib/                   # Utility functions (e.g., cn)
└── public/                # Static assets
\`\`\`

### Design Tokens
Design tokens are the heart of the system, providing a centralized definition for all visual properties. They are defined in the `design-system/tokens/` directory and include:
- **Colors**: A comprehensive palette with semantic naming (e.g., `primary`, `noble-black`, `day-blue`). These are translated into CSS custom properties (e.g., `var(--color-primary-500)`) and Tailwind color utilities.
- **Spacing**: A consistent scale from `2px` to `128px`, used for padding, margins, and gaps via Tailwind's spacing scale.
- **Typography**: Definitions for font families (`Plus Jakarta Sans`, `Kanit`), font sizes, weights, and line heights, applied through Tailwind typography utilities and CSS custom properties (`var(--font-plus-jakarta-sans)`).
- **Border Radii**: Standardized border radius values, available as Tailwind utilities.

This token-driven approach ensures that any changes to the design language are propagated throughout the application consistently.

## 🎨 Components

The system includes a wide array of components, built with reusability and accessibility in mind.

### Core UI Components
- **Button**: Multiple variants, sizes, and states, including icon support.
- **Typography**: Semantic text rendering component using defined typography tokens.
- **Input/Textarea**: Form input fields with various states (default, error, success, warning) and sizes.
- **Notification**: Alert system with 4 variants (tip, warning, error, success) and display styles.
- **Tag/TagInput**: Components for displaying and managing tags or chips.
- **Dropdown**: Customizable select component with support for sections, icons, and boxed groups.
- **Modal**: Accessible dialog component for displaying focused content or actions.
- **DatePicker**: Component for selecting dates with a calendar interface.

### Layout Components
- **Container**: Responsive containers for managing content width.
- **Stack**: Flexbox-based layout component for arranging items in a single direction.
- **Grid**: CSS Grid-based layout component for more complex 2D arrangements.

### Feedback Components
- **Badge**: Small status indicators with multiple color variants.
- **Progress/ProgressBar**: Visual indicators for task completion or data loading.

### Navigation Components
- **NavigationItem/NavigationGroup**: Components for building hierarchical navigation menus.
- **Tab/TabGroup**: Components for creating tabbed interfaces.

### Form Components
- **FormField**: Wrapper for form elements providing consistent layout for labels, inputs, and hints/errors.
- **FormInput/FormTextarea**: Styled input and textarea components designed to be used within `FormField`.

## 🚀 Usage

Components and tokens can be imported directly from the `@/design-system` path alias.

\`\`\`tsx
import { Button, Typography, Stack } from "@/design-system"
import { colorTokens } from "@/design-system" // Access raw token values if needed

export function MyComponent() {
  return (
    <Stack spacing="md" style={{ backgroundColor: colorTokens.primary[100] }}>
      <Typography variant="heading-l" color="primary">
        Welcome to Our Platform
      </Typography>
      <Button variant="default" size="lg">
        Get Started
      </Button>
    </Stack>
  )
}
\`\`\`

## 🎯 Features

- ✅ **Token-Driven Design**: Fully "vectorized" with design tokens for colors, typography, spacing, etc., ensuring consistency and enabling easier theming.
- ✅ **TypeScript Support**: Full type safety for components and tokens.
- ✅ **Accessibility (WCAG)**: Components are designed with accessibility best practices (ARIA attributes, keyboard navigation).
- ✅ **Responsive**: Mobile-first design principles applied to components and layouts.
- ✅ **Tailwind CSS Integration**: Leverages the power and flexibility of Tailwind CSS for styling, configured with design tokens.
- ✅ **Scalable Architecture**: Modular structure for easy maintenance and expansion.
- ✅ **Comprehensive Showcase**: A dedicated page (`/showcase`) demonstrates all tokens and components with their variants and states.

## 📖 Documentation & Showcase

Visit `/showcase` to see all design tokens and components in action with interactive examples and usage patterns. This page serves as the primary visual documentation for the design system.

## 🛠️ Development

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linters and type checking (ensure these scripts are in package.json)
pnpm lint
pnpm type-check
\`\`\`

## 🎨 Color Palette (Overview)

The design system includes 10+ semantic color palettes, such as:
- **Primary** (Orange brand colors)
- **Noble Black** (Elegant grays and blacks)
- **Day Blue** (Interactive blues)
- **Stem Green** (Success states)
- **Red Power** (Error states)
- ...and more.

Each palette typically includes multiple shades (e.g., 50 to 900) to provide flexibility while maintaining accessibility and visual harmony. These are available as CSS custom properties and Tailwind utility classes.
