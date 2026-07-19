# Nescom'ga Hissa Qo'shish

Loyihaga hissa qo'shganingiz uchun rahmat!

## Development Setup

### 1. Repositoriyani Fork qiling

GitHub'da repositories'ni fork qiling.

### 2. Clone qiling

```bash
git clone https://github.com/your-username/company-hub.git
cd company-hub
```

### 3. Kutubxonalarni o'rnating

```bash
npm install
```

### 4. Environment variables

```bash
cp .env.example .env
```

`.env` faylini to'ldiring (yukoridagi README ga qarang).

### 5. Database sozlash

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

- Barcha fayllar `.ts` yoki `.tsx` formatda bo'lishi kerak
- `any` tipidan foydalanmang — aniq type yarating
- Interface va type'lar `PascalCase` formatda

```typescript
// ✅ Yaxshi
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Yomon
interface user {
  id: any;
  name: any;
}
```

### React Components

- Functional components ishlating
- Komponent nomlari `PascalCase` formatda

```typescript
// ✅ Yaxshi
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ Yomon
function userProfile(props: any) {
  return <div>{props.user.name}</div>;
}
```

### CSS/Tailwind

- Tailwind CSS classes ishlating
- Custom CSS fayllar yaratmang
- Responsive design qo'llang

```tsx
// ✅ Yaxshi
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Yomon
<div style={{ display: 'flex', padding: '16px' }}>
```

### Naming Conventions

| Element          | Format           | Misol                               |
| ---------------- | ---------------- | ----------------------------------- |
| Komponentlar     | PascalCase       | `UserProfile`, `TaskCard`           |
| Funksiyalar      | camelCase        | `getUser`, `createTask`             |
| O'zgaruvchilar   | camelCase        | `userId`, `taskList`                |
| Konstantalar     | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL`          |
| Fayllar          | kebab-case       | `user-profile.tsx`, `task-card.tsx` |
| API endpoint'lar | kebab-case       | `/api/users`, `/api/tasks`          |

### Error Handling

```typescript
// ✅ Yaxshi
try {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
  }
  return NextResponse.json({ user });
} catch (error) {
  console.error('Get user error:', error);
  return NextResponse.json({ error: 'Server xatosi yuz berdi' }, { status: 500 });
}
```

### Validation

Zod schemas ishlating:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Ism kiritish shart'),
  email: z.string().email("Email noto'g'ri formatda"),
});
```

## Commit Message Format

Har bir commit quyidagi formatda bo'lishi kerak:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type'lar

| Type       | Tavsif                | Misol                                     |
| ---------- | --------------------- | ----------------------------------------- |
| `feat`     | Yangi xususiyat       | `feat(tasks): add task assignment`        |
| `fix`      | Xato tuzatish         | `fix(auth): fix login validation`         |
| `docs`     | Hujjatlar             | `docs: update API documentation`          |
| `style`    | Stil o'zgartirishlari | `style: fix button colors`                |
| `refactor` | Refaktor              | `refactor(api): extract validation logic` |
| `test`     | Testlar               | `test: add user API tests`                |
| `chore`    | Texnik ishlar         | `chore: update dependencies`              |

### Misollar

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

### 1. Branch yarating

```bash
git checkout -b feature/your-feature-name
```

Branch nomi formati:

- `feature/` — yangi xususiyat
- `fix/` — xato tuzatish
- `docs/` — hujjatlar
- `refactor/` — refaktor

### 2. O'zgartirishlarni qiling

- Kodda o'zgartirishlar qiling
- Testlarni ishga tushiring
- Lint xatolarini tuzating

### 3. Commit qiling

```bash
git add .
git commit -m "feat(scope): description"
```

### 4. Push qiling

```bash
git push origin feature/your-feature-name
```

### 5. PR yarating

GitHub'da Pull Request yarating:

**Title:** `<type>(<scope>): <description>`

**Description:**

```markdown
## Summary

- Qisqacha tavsif

## Changes

- O'zgartirishlar ro'yxati

## Testing

- Qanday test qilindi

## Screenshots (agar mavjud)

- Rasm
```

### 6. Review

- Kamida 1 ta review kerak
- CI/CD muvaffaqiyatli o'tishi kerak
- Merge conflict yo'q bo'lishi kerak

## Testing

### Testlar ishga tushirish

```bash
# Barcha testlar
npm test

# Muayyan test fayl
npm test -- user.test.ts

# Coverage bilan
npm run test:coverage
```

### Test yozish

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

## Xatoliklar haqida xabar berish

### Bug Report

GitHub Issues'da quyidagi formatda xabar bering:

```markdown
## Xato tavsifi

Qisqacha xato tavsifi

## Qayta yaratish qadamlari

1. Birinchi qadam
2. Ikkinchi qadam
3. ...

## Kutilgan natija

Nima bo'lishi kerak edi

## Haqiqiy natija

Nima bo'ldi

##截图
Agar mumkin bo'lsa, screenshot qo'shing

## Environment

- OS: macOS 14.0
- Node: 18.17.0
- npm: 9.8.1
```

### Feature Request

```markdown
## Xususiyat tavsifi

Qisqacha tavsif

## Muammo

Qanday muammoni hal qiladi

## Yechim

Qanday yechim taklif qilasiz

## Muqobil yechimlar

Boshqa yechimlar (agar mavjud)
```

## Savollaringiz bo'lsa?

- GitHub Discussions'da savol bering
- Issue oching
