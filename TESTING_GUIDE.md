# Testing Guide

This guide outlines the testing strategy for CoreComm, covering unit, integration, and manual testing.

## 1. Automated Testing

We use **Jest** and **React Testing Library** for automated tests.

### Running Tests
```bash
npm test              # Run all tests
npm test:watch       # Run in watch mode
npm test:coverage    # Generate coverage report
```

### Test Structure
- `__tests__/api/`: Integration tests for API endpoints.
- `__tests__/components/`: Unit tests for React components.
- `__tests__/lib/`: Unit tests for utility functions.

### Writing Tests

#### Unit Test Example (`lib/utils.test.ts`)
```typescript
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2023-01-01')).toBe('Jan 1, 2023');
  });
});
```

#### Component Test Example
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 2. Manual Testing

For complex flows like Voice AI interactions and Billing, we rely on manual testing.

### Test Plan
Refer to **[MANUAL_TEST_PLAN.md](MANUAL_TEST_PLAN.md)** for a comprehensive checklist of test cases.

### Key Test Scenarios
1. **Onboarding**: Sign up -> Create Company -> Invite Member.
2. **Voice Agent Setup**: Create Agent -> Assign Number -> Configure Prompt.
3. **Call Flow**: Inbound Call -> AI Response -> Hangup -> Log Generation.
4. **Billing**: Subscribe -> Usage Update -> Invoice Generation.

### Feature Status
Check **[MANUAL_TEST_PLAN_FEATURE_STATUS.md](MANUAL_TEST_PLAN_FEATURE_STATUS.md)** to see which features are currently passing/failing.

## 3. End-to-End (E2E) Testing

*(Currently planned for future implementation using Playwright)*

## 4. Best Practices

- **Mock External Services**: Never call real Vapi or Stripe APIs in automated tests. Use Jest mocks.
- **Test Edge Cases**: Test empty states, error states, and boundary values.
- **Keep Tests Fast**: Avoid unnecessary delays or heavy computations in tests.
