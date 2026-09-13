# Contributing to Nescom

Thank you for contributing to the project!

## Development Setup

### 1. Fork the repository

Fork the repository on GitHub.

### 2. Clone the repository

```bash
git clone https://github.com/your-username/company-hub.git
cd company-hub
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment variables

```bash
cp .env.example .env
```

Fill in the `.env` file (see the README above).

### 5. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
npx tsx prisma/seed.ts
```

### 6. Development server

```bash
npm run dev
```

## Code Style Guidelines

### TypeScript

- All files must be `.ts` or `.tsx`
- Do not use `any` — create explicit types
- Interfaces and types use `PascalCase`

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad
interface user {
  id: any;
  name: any;
}
```

### React Components

- Use functional components
- Component names use `PascalCase`

```typescript
// ✅ Good
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ Bad
function userProfile(props: any) {
  return <div>{props.user.name}</div>;
}
```

### CSS/Tailwind

- Use Tailwind CSS classes
- Do not create custom CSS files
- Apply responsive design

```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Bad
<div style={{ display: 'flex', padding: '16px' }}>
```

### Naming Conventions

| Element       | Format           | Example                             |
| ------------- | ---------------- | ----------------------------------- |
| Components    | PascalCase       | `UserProfile`, `TaskCard`           |
| Functions     | camelCase        | `getUser`, `createTask`             |
| Variables     | camelCase        | `userId`, `taskList`                |
| Constants     | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL`          |
| Files         | kebab-case       | `user-profile.tsx`, `task-card.tsx` |
| API endpoints | kebab-case       | `/api/users`, `/api/tasks`          |

### Error Handling

```typescript
// ✅ Good
try {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ user });
} catch (error) {
  console.error('Get user error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### Validation

Use Zod schemas:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});
```

## Commit Message Format

Each commit must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description       | Example                                   |
| ---------- | ----------------- | ----------------------------------------- |
| `feat`     | New feature       | `feat(tasks): add task assignment`        |
| `fix`      | Bug fix           | `fix(auth): fix login validation`         |
| `docs`     | Documentation     | `docs: update API documentation`          |
| `style`    | Style changes     | `style: fix button colors`                |
| `refactor` | Refactoring       | `refactor(api): extract validation logic` |
| `test`     | Tests             | `test: add user API tests`                |
| `chore`    | Maintenance tasks | `chore: update dependencies`              |

### Examples

```
feat(tasks): add task filtering by priority

- Add priority query parameter
- Update task list component
- Add filter UI controls

Closes #123
```

```
fix(auth): prevent duplicate email registration

Fix validation to check email uniqueness before creating user.
```

## PR (Pull Request) Process

### 1. Create a branch

```bash
git checkout -b feature/your-feature-name
```

Branch name format:

- `feature/` — new feature
- `fix/` — bug fix
- `docs/` — documentation
- `refactor/` — refactoring

### 2. Make your changes

- Make code changes
- Run the tests
- Fix lint errors

### 3. Commit

```bash
git add .
git commit -m "feat(scope): description"
```

### 4. Push

```bash
git push origin feature/your-feature-name
```

### 5. Create a PR

Create a Pull Request on GitHub:

**Title:** `<type>(<scope>): <description>`

**Description:**

```markdown
## Summary

- Brief description

## Changes

- List of changes

## Testing

- How it was tested

## Screenshots (if applicable)

- Image
```

### 6. Review

- At least 1 review is required
- CI/CD must pass
- There must be no merge conflicts

## Testing

### Running tests

```bash
# All tests
npm test

# A specific test file
npm test -- user.test.ts

# With coverage
npm run test:coverage
```

### Writing tests

```typescript
describe('User API', () => {
  it('should create a new user', async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        role: 'DEVELOPER',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user.name).toBe('Test User');
  });
});
```

## Reporting Bugs

Report bugs on GitHub Issues using this format:

```markdown
## Bug description

A brief description of the bug

## Steps to reproduce

1. First step
2. Second step
3. ...

## Expected result

What was expected to happen

## Actual result

What actually happened

## Screenshots

Add a screenshot if possible

## Environment

- OS: macOS 14.0
- Node: 18.17.0
- npm: 9.8.1
```

### Feature Request

```markdown
## Feature description

Brief description

## Problem

What problem it solves

## Solution

What solution you propose

## Alternatives

Other solutions (if any)
```

## Questions?

- Ask questions in GitHub Discussions
- Open an issue
