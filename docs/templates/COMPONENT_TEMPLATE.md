# [Component Name]

## Purpose
What does this component do? Where is it used?

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `propName` | `string` | Yes | - | Description of the prop |

## Usage Example
```tsx
import { ComponentName } from "@/components/path/to/component"

export function Example() {
  return (
    <ComponentName 
      propName="value"
      onAction={() => console.log('Action')}
    />
  )
}
```

## Variants / States
Describe different visual states or variants (e.g., loading, error, size variants).

## Dependencies
- **Internal**: Other components used.
- **External**: Libraries (e.g., Radix UI, Lucide).

## Accessibility
- ARIA attributes used.
- Keyboard interactions.
