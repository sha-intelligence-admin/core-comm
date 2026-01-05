# Component Guide

This guide documents the reusable UI components available in the `components/` directory.

## UI Components (`components/ui/`)

These are foundational components built with Radix UI and styled with Tailwind CSS.

### Button
Standard button component with variants.
- **Path**: `components/ui/button.tsx`
- **Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Sizes**: `default`, `sm`, `lg`, `icon`

```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline" size="sm" onClick={handleClick}>
  Click Me
</Button>
```

### Input
Basic text input field.
- **Path**: `components/ui/input.tsx`

```tsx
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Email" />
```

### Dialog (Modal)
Modal dialog for user interactions.
- **Path**: `components/ui/dialog.tsx`
- **Usage**: Wraps `DialogTrigger` and `DialogContent`.

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

*(See `components/ui/` for full list including Card, Table, Toast, etc.)*

---

## Feature Components (`components/`)

These components are specific to CoreComm features.

### AppSidebar
The main navigation sidebar for the dashboard.
- **Path**: `components/app-sidebar.tsx`
- **Props**: None (fetches user state internally or via context)
- **Usage**: Used in `app/(dashboard)/layout.tsx`

### CallLogsTable
Displays a paginated list of call logs.
- **Path**: `components/call-logs-table.tsx`
- **Props**:
  - `logs`: Array of call log objects
  - `isLoading`: Boolean
- **Features**: Sorting, filtering, and row selection.

### LiveTranscript
Real-time transcript viewer for active calls.
- **Path**: `components/live-transcript.tsx`
- **Props**:
  - `callId`: string
- **Features**: Subscribes to Supabase Realtime for updates.

### MetricCard
Displays a single statistic with a trend indicator.
- **Path**: `components/metric-card.tsx`
- **Props**:
  - `title`: string
  - `value`: string | number
  - `trend`: number (percentage)
  - `icon`: LucideIcon

```tsx
<MetricCard 
  title="Total Calls" 
  value="1,234" 
  trend={+12} 
  icon={Phone} 
/>
```

### AddAgentModal
Modal for creating a new AI voice agent.
- **Path**: `components/add-agent-modal.tsx`
- **Features**: Form validation, API submission.

---

## Billing Components (`components/billing/`)

Components related to subscription and usage tracking.

### PlanCard
Displays pricing plan details.
- **Path**: `components/billing/plan-card.tsx`
- **Props**:
  - `plan`: Plan object (name, price, features)
  - `isCurrent`: boolean

### UsageStats
Visualizes current usage against plan limits.
- **Path**: `components/billing/usage-stats.tsx`
- **Props**:
  - `usage`: Usage object (minutes used, total allowed)

---

## Theme Components

### ThemeProvider
Wraps the app to provide light/dark mode context.
- **Path**: `components/theme-provider.tsx`
- **Based on**: `next-themes`

### ThemeToggle
Button to switch between light and dark modes.
- **Path**: `components/theme-toggle.tsx`

---

## Best Practices

1. **Composition**: Prefer composing small UI components over building monolithic ones.
2. **Props**: Define strict interfaces for component props.
3. **Server vs Client**: Use `"use client"` directive only when interactivity (hooks, event listeners) is needed.
4. **Styling**: Use Tailwind utility classes. Use `cn()` utility for conditional class merging.
