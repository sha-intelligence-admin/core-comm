# Contributing to CoreComm

Thank you for your interest in contributing! This guide will help you understand our development workflow and standards.

## Development Workflow

1. **Branching Strategy**
   - `main`: Production-ready code.
   - `develop`: Integration branch for next release.
   - `feature/name`: New features (branch off `develop`).
   - `bugfix/name`: Bug fixes (branch off `develop`).
   - `hotfix/name`: Critical production fixes (branch off `main`).

2. **Making Changes**
   - Create a new branch.
   - Make your changes.
   - Run tests locally (`npm test`).
   - Commit with descriptive messages.

3. **Pull Requests**
   - Push your branch to origin.
   - Open a PR against `develop`.
   - Fill out the PR template.
   - Request review from a team member.

## Code Style Guide

### TypeScript & React
- **Strict Typing**: Avoid `any`. Define interfaces for props and data structures.
- **Functional Components**: Use React Functional Components with Hooks.
- **Naming**:
  - Files: `kebab-case.tsx` (e.g., `call-log-item.tsx`)
  - Components: `PascalCase` (e.g., `CallLogItem`)
  - Functions/Variables: `camelCase`
- **Exports**: Use named exports for components and utilities.

### Comments & Documentation
- **JSDoc/TSDoc**: Mandatory for all exported functions and components.
  ```typescript
  /**
   * Calculates the total duration of a call in seconds.
   * @param startTime - ISO string of start time
   * @param endTime - ISO string of end time
   * @returns Duration in seconds
   */
  export function calculateDuration(startTime: string, endTime: string): number { ... }
  ```
- **Inline Comments**: Explain *why* complex logic exists, not just *what* it does.

### CSS / Styling
- Use **Tailwind CSS** utility classes.
- Avoid inline styles (`style={{ ... }}`).
- Use `clsx` or `cn` helper for conditional classes.

## Testing

- **Unit Tests**: Write Jest tests for utility functions and complex components.
- **Integration Tests**: Test API endpoints and database interactions.
- **Running Tests**:
  ```bash
  npm test
  ```

## Linting & Formatting

We use ESLint and Prettier.
```bash
npm run lint      # Check for issues
npm run lint:fix  # Auto-fix issues
```

## Database Changes

- Never modify the schema manually in production.
- Create a migration file in `supabase/migrations/`.
- Document changes in `DATABASE_SCHEMA.md`.

## Definition of Done

- [ ] Code compiles without errors.
- [ ] Tests pass.
- [ ] Linter passes.
- [ ] Documentation updated (if applicable).
- [ ] PR reviewed and approved.
