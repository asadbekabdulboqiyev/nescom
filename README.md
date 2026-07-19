# Nescom

A comprehensive company management system built with modern web technologies. Manage employees, tasks, messages, salaries, and join requests — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

## Features

### Authentication & Authorization
- JWT authentication with httpOnly cookies
- 10 role-based access control (CEO, Manager, Developer, Designer, Marketer, HR, Sales, Intern, Accountant, Support)
- Join request approval system
- Password hashing with bcrypt

### Task Management
- Kanban-style task board with 6 status workflow:
  - `TODO` → `ACCEPTED` → `IN_PROGRESS` → `READY` → `DONE`
  - `BLOCKED` status for paused tasks
- Task assignment with priority levels (Low, Medium, High, Urgent)
- Status change permissions based on role

### Real-time Messaging
- Direct messaging between employees
- Conversation list with unread counts
- Message history with timestamps

### Salary Management
- Salary records with bonus/deductions
- Payment calendar with due date tracking
- Mark as paid functionality
- CSV export
- Role-based access (CEO, Manager, Accountant only)

### Employee Management
- Add employees with role assignment
- Employee profiles with contact information
- Join request approval by CEO/Manager/HR

### Dashboard
- Overview stats (employees, tasks, salaries)
- Recent activity feed
- Quick actions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Language | TypeScript 5 (strict mode) |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 |
| Auth | JWT (jose) + bcryptjs |
| Validation | Zod 4 |
| Testing | Jest + React Testing Library |
| Deployment | Vercel / Docker |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/asadbekabdulboqiyev/nescom.git
cd nescom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npx prisma generate
npx prisma db push

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nescom"

# JWT (required, min 32 characters)
JWT_SECRET="your-super-secret-key-at-least-32-characters-long"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/me` | Get current user |
| POST | `/api/users` | Create user (CEO/Manager/HR) |
| PUT | `/api/users/[id]` | Update user |
| DELETE | `/api/users/[id]` | Delete user (CEO/Manager/HR) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/[id]` | Get task |
| PUT | `/api/tasks/[id]` | Update task (status, assignee) |
| DELETE | `/api/tasks/[id]` | Delete task |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | List messages |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/conversations` | List conversations |

### Salary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/salary` | List salaries (CEO/Manager/Accountant) |
| POST | `/api/salary` | Create salary record (CEO/Accountant) |
| PUT | `/api/salary/pay/[id]` | Mark as paid (CEO/Accountant) |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List companies |
| POST | `/api/companies` | Create company |
| PUT | `/api/companies` | Update company (CEO) |

### Join Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/join-requests` | List pending requests (CEO/Manager/HR) |
| POST | `/api/join-requests` | Submit join request |
| PUT | `/api/join-requests/[id]` | Approve/reject request |

## Role Permissions

| Feature | CEO | Manager | Developer | Designer | Marketer | HR | Sales | Support | Intern |
|---------|-----|---------|-----------|----------|----------|-----|-------|---------|--------|
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Salary | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Salary | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Company | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Review Join Requests | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Send Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Project Structure

```
nescom/
├── prisma/                 # Database schema & migrations
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── (dashboard)/    # Dashboard pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── charts/         # Chart components
│   │   ├── settings/       # Settings tab components
│   │   └── __tests__/      # Component tests
│   ├── contexts/           # React contexts (Auth)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (auth, rbac, validation)
│   │   └── __tests__/      # Unit tests
│   └── types/              # TypeScript types
├── tests/                  # API integration tests
├── docs/                   # Documentation
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose
└── .github/workflows/      # CI/CD
```

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker-compose up -d
```

### Manual

```bash
npm run build
npm start
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Asadbek Abdulboqiyev** - [GitHub](https://github.com/asadbekabdulboqiyev)
