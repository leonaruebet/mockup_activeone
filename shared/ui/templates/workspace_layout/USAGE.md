# WorkspaceLayout Usage Guide

The `WorkspaceLayout` component provides a consistent layout structure for all workspace pages with easy customization options.

## Quick Start

### Basic Page with Title

```tsx
import { WorkspaceLayout } from '@irc/ui';

export default function MyPage() {
  return (
    <WorkspaceLayout
      title="My Page Title"
      subtitle="A brief description of this page"
      organizationId="org_123"
      userTier="plus"
    >
      <div>Your content here</div>
    </WorkspaceLayout>
  );
}
```

## Common Patterns

### 1. Full-Width Content (No White Container)

Perfect for pricing pages, landing pages, or custom layouts:

```tsx
<WorkspaceLayout
  title="Pricing"
  subtitle="Choose your plan"
  showWhiteContainer={false}  // ← Key prop!
  organizationId={org.id}
  userTier={userTier}
>
  <PricingCards />
</WorkspaceLayout>
```

### 2. Page with Header Actions

Add buttons, filters, or other controls in the header:

```tsx
import { Button } from '@irc/ui';

<WorkspaceLayout
  title="Projects"
  subtitle="Manage your projects"
  headerActions={
    <div className="flex gap-2">
      <Button variant="outline">Filter</Button>
      <Button onClick={createProject}>New Project</Button>
    </div>
  }
>
  <ProjectList />
</WorkspaceLayout>
```

### 3. Hide Title Section

When you want complete control over the header:

```tsx
<WorkspaceLayout
  showTitle={false}
  organizationId={org.id}
  userTier={userTier}
>
  <CustomHeader />
  <YourContent />
</WorkspaceLayout>
```

### 4. i18n Integration

Use translations for title and subtitle:

```tsx
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('profile');

  return (
    <WorkspaceLayout
      title={t('title')}
      subtitle={t('subtitle')}
      organizationId={org.id}
      userTier={userTier}
    >
      <ProfileContent />
    </WorkspaceLayout>
  );
}
```

## Server-Side Pattern (Recommended for Next.js App Router)

For pages that need to fetch data server-side, you can determine title/subtitle in the layout:

```tsx
// app/[locale]/layout.tsx
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const user = await get_current_user();

  if (user) {
    const pathname = headersList.get('x-pathname');

    // Determine title based on pathname
    let title, subtitle;
    if (pathname.includes('/profile')) {
      title = dict.profile.title;
      subtitle = dict.profile.subtitle;
    } else if (pathname.includes('/pricing')) {
      title = dict.pricing.title;
      subtitle = dict.pricing.subtitle;
    } else {
      title = dict.dashboard.welcomeTitle;
      subtitle = dict.dashboard.welcomeDescription;
    }

    return (
      <WorkspaceLayout
        title={title}
        subtitle={subtitle}
        showWhiteContainer={!pathname.includes('/pricing')}
        organizationId={user.org_id}
        userTier={userTier}
      >
        {children}
      </WorkspaceLayout>
    );
  }
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Page title displayed at the top |
| `subtitle` | `string` | - | Optional subtitle below the title |
| `showTitle` | `boolean` | `true` | Whether to show the title section |
| `showWhiteContainer` | `boolean` | `true` | Whether to show the white container layer |
| `headerActions` | `ReactNode` | - | Custom actions (buttons, etc.) in the header |
| `organizationId` | `string` | - | Organization ID for sidebar |
| `userTier` | `'free' \| 'plus' \| 'pro' \| 'enterprise'` | - | User's subscription tier |
| `orgName` | `string` | - | Organization name |
| `className` | `string` | - | Additional CSS classes |
| `panelProps` | `GlassPanelProps` | - | Advanced: Direct props to GlassPanel |

## Tips

1. **White Container**: Set `showWhiteContainer={false}` for pages that need full-width content like pricing tables or custom dashboards

2. **Title Customization**: You can control titles in two ways:
   - Pass props directly to individual page components (best for client components)
   - Detect pathname in the parent layout and set titles there (best for server components)

3. **Header Actions**: Use the `headerActions` prop for page-specific controls instead of hardcoding them in your content

4. **i18n**: Always use translation keys for titles and subtitles to support multiple languages

## Examples in Codebase

- **Dashboard**: Basic layout with welcome title
- **Profile Page**: Uses i18n for all text (apps/web/app/[locale]/profile/page.tsx:line 99-112)
- **Pricing Page**: Full-width layout without white container (apps/web/app/[locale]/layout.tsx:line 108)

## Need More Control?

For advanced customization, you can:

1. Use the `panelProps` to pass props directly to the underlying `GlassPanel` component
2. Create a custom layout component that extends or replaces `WorkspaceLayout`
3. Use the `WorkspaceContentSection` helper component for organizing sections within your page
