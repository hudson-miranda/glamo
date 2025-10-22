# 🎨 Glamo Style Guide

**Version:** 1.0.0  
**Design System:** Premium, Minimal (Nubank-inspired)  
**Last Updated:** 2025-10-22

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing](#spacing)
6. [Components](#components)
7. [Layout Guidelines](#layout-guidelines)
8. [Accessibility](#accessibility)
9. [Best Practices](#best-practices)

---

## Design Principles

### 1. **Minimal & Premium**
- Clean interfaces with ample whitespace
- Subtle animations and transitions
- Premium feel without complexity

### 2. **Consistent & Predictable**
- Use design tokens for all styling
- Follow established patterns
- Maintain visual hierarchy

### 3. **Responsive & Accessible**
- Mobile-first approach
- Keyboard navigation support
- ARIA labels and semantic HTML

### 4. **Fast & Performant**
- Optimize for speed
- Lazy load when appropriate
- Minimal re-renders

---

## Design Tokens

All design tokens are defined in `app/src/client/styles/tokens.ts`.

### Importing Tokens

```typescript
import { colors, spacing, typography, motion } from '../styles/tokens';
```

### Using with Tailwind

Tokens are automatically mapped to Tailwind classes:

```jsx
<div className="bg-primary-500 p-6 rounded-lg shadow-md">
  Content
</div>
```

---

## Color System

### Primary Colors (Brand)
**Usage:** Buttons, links, active states, brand elements

- `primary-500`: Main brand color (`#a855f7` - Purple)
- `primary-600`: Hover state
- `primary-700`: Pressed state

```jsx
// Primary button
<Button className="bg-primary-500 hover:bg-primary-600">
  Click Me
</Button>
```

### Semantic Colors

#### Success (Green)
**Usage:** Success messages, completed states, positive actions

```jsx
<Badge className="bg-success-500">Completed</Badge>
```

#### Warning (Yellow)
**Usage:** Warnings, pending states, caution

```jsx
<Alert variant="warning">Payment pending</Alert>
```

#### Danger (Red)
**Usage:** Errors, destructive actions, critical states

```jsx
<Button variant="destructive">Delete</Button>
```

### Neutral Colors
**Usage:** Text, backgrounds, borders

- `neutral-50` to `neutral-950`: Full grayscale
- Use `text-neutral-600` for secondary text
- Use `bg-neutral-100` for subtle backgrounds

### Dark Mode
Uses `hsl(var(--background))` and other CSS variables from shadcn/ui.

```jsx
// Automatically adapts to dark mode
<div className="bg-background text-foreground">
  Content
</div>
```

---

## Typography

### Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, captions |
| `text-sm` | 14px | Body text (secondary) |
| `text-base` | 16px | Body text (primary) |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Card titles |
| `text-2xl` | 24px | Section headings |
| `text-3xl` | 30px | Page titles |
| `text-5xl` | 48px | Hero/display text |

### Weights

- `font-normal` (400): Body text
- `font-medium` (500): Labels, emphasis
- `font-semibold` (600): Headings, buttons
- `font-bold` (700): Display text

### Examples

```jsx
// Page title
<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

// Section heading
<h2 className="text-2xl font-semibold">Recent Activity</h2>

// Body text
<p className="text-base text-muted-foreground">
  Your salon overview
</p>

// Caption
<span className="text-sm text-neutral-500">Updated 2 hours ago</span>
```

---

## Spacing

Use consistent spacing scale from tokens:

- `p-4` = 16px (standard padding)
- `p-6` = 24px (card padding)
- `gap-4` = 16px (standard gap)
- `space-y-6` = 24px vertical spacing

### Guidelines

- **Page padding:** `px-6` on desktop, `px-4` on mobile
- **Card padding:** `p-6`
- **Button padding:** `px-4 py-2`
- **Section spacing:** `space-y-6` or `space-y-8`

```jsx
// Page container
<div className="space-y-6 px-6">
  <PageHeader />
  <MainContent />
</div>

// Card
<Card className="p-6">
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

---

## Components

### Available Components

Located in `app/src/components/ui/`:

1. **Button** - Primary, secondary, ghost, outline variants
2. **Card** - Content containers
3. **Input** - Text inputs
4. **Select** - Dropdowns
5. **Dialog** - Modals
6. **Alert** - Notifications
7. **Badge** - Status indicators
8. **Table** - Data tables
9. **Toast** - Temporary notifications
10. **Checkbox** - Selection
11. **Switch** - Toggle
12. **Separator** - Dividers
13. **Avatar** - User images
14. **Dropdown Menu** - Contextual menus
15. **Sheet** - Slide-in panels
16. **Progress** - Progress bars
17. **Accordion** - Collapsible sections
18. **Label** - Form labels
19. **Textarea** - Multi-line input
20. **Alert Dialog** - Confirmation dialogs
21. **Confirm Dialog** - Delete/action confirmation
22. **Empty State** - No data states

### Button Usage

```jsx
import { Button } from '@/components/ui/button';

// Primary action
<Button>Save Changes</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Client
</Button>
```

### Card Usage

```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Total Clients</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">245</div>
  </CardContent>
</Card>
```

### Table Usage

```jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Layout Guidelines

### Page Structure

```jsx
import { DashboardLayout } from '@/layouts/DashboardLayout';

export default function MyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
            <p className="text-muted-foreground">Page description</p>
          </div>
          <Button>Action</Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            {/* Content */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### Grid Layouts

```jsx
// 4-column grid for stats cards
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// 2-column form
<div className="grid gap-4 md:grid-cols-2">
  <Input label="First Name" />
  <Input label="Last Name" />
</div>
```

### Max Width

Content should have a max width for readability:

```jsx
<div className="max-w-screen-xl mx-auto">
  {/* Content */}
</div>
```

---

## Accessibility

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use proper focus states: `focus:ring-2 focus:ring-primary`
- Tab order should be logical

```jsx
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click Me
</Button>
```

### ARIA Labels

```jsx
// Icon-only button
<Button aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>

// Form inputs
<Input
  id="email"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby="email-error"
/>
{error && <span id="email-error" className="text-sm text-destructive">{error}</span>}
```

### Semantic HTML

Use proper HTML elements:
- `<button>` for actions
- `<a>` for navigation
- `<h1>`-`<h6>` for headings
- `<nav>` for navigation
- `<main>` for main content

---

## Best Practices

### 1. **Component Composition**

```jsx
// Good: Compose from primitives
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// Bad: Custom card without reusable parts
<div className="rounded border p-4">
  <h3>Title</h3>
  <div>Content</div>
</div>
```

### 2. **Consistent Spacing**

```jsx
// Good: Use spacing scale
<div className="space-y-6">
  <Section1 />
  <Section2 />
</div>

// Bad: Random spacing
<div>
  <Section1 />
  <div style={{ marginTop: '23px' }} />
  <Section2 />
</div>
```

### 3. **Error States**

```jsx
// Always handle loading and error states
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Skeleton />;
if (error) return <ErrorState error={error} />;
if (!data?.length) return <EmptyState />;

return <Table data={data} />;
```

### 4. **Toast Notifications**

```jsx
import { useToast } from '@/hooks/useToast';

const { toast } = useToast();

// Success
toast({
  title: 'Success',
  description: 'Client created successfully',
});

// Error
toast({
  variant: 'destructive',
  title: 'Error',
  description: 'Failed to create client',
});
```

### 5. **Loading States**

```jsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

## Motion & Animation

### Durations

- Fast: 150ms (hover, active states)
- Normal: 200ms (most transitions)
- Slow: 300ms (complex animations)

### Easing

Use `ease-out` for most transitions:

```jsx
<div className="transition-all duration-200 ease-out">
  Content
</div>
```

### Hover Effects

```jsx
// Button
<Button className="transition-colors hover:bg-primary-600">
  Click Me
</Button>

// Card
<Card className="transition-shadow hover:shadow-lg">
  Content
</Card>
```

---

## Examples

### Complete Page Example

```jsx
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function ClientsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your salon clients
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            {/* Table component */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

---

## Resources

- **shadcn/ui Documentation:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev
- **Radix UI:** https://www.radix-ui.com

---

**Questions?** Refer to existing implementations in the codebase or consult the design team.
