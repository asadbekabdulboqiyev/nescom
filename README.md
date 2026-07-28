# 🏢 Nescom — Company Management Dashboard

A full-stack company management platform built with **Next.js 16**, **React 19**, **TypeScript 5**, **Prisma 7**, and **PostgreSQL**. Manage employees, tasks, messages, salaries, and join requests — all in one place with role-based access control.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT authentication with `httpOnly` cookies (via `jose`)
- **10 role-based access control** roles: CEO, Manager, Developer, Designer, Marketer, HR, Sales, Intern, Accountant, Support
- Join request approval system (CEO / Manager / HR can approve)
- Password hashing with `bcryptjs`

### 📋 Task Management
- Kanban-style task board with **6 status workflow**:
  - `TODO` → `ACCEPTED` → `IN_PROGRESS` → `READY` → `DONE`
  - `BLOCKED` status for paused tasks
- Task assignment with **4 priority levels**: Low, Medium, High, Urgent
- Tag-based organization and due date tracking
- Role-based status change permissions

### 💬 Real-time Messaging
- Direct messaging between employees
- Conversation list with unread message counts
- Message history with timestamps and read status

### 💰 Salary Management
- Salary records with bonus/deduction tracking
- Interactive payment calendar with due date visualization
- Mark as paid functionality
- Salary overview charts (paid vs. pending)
- CSV export support
- Role-based access (CEO, Manager, Accountant only)

### 👥 Employee Management
- Add employees with role assignment
- Employee profiles with contact information
- Join request approval by CEO/Manager/HR
- Employee search and role-based filtering

### 📊 Dashboard & Analytics
- Real-time overview stats with animated counters and sparkline charts
- Interactive charts: Salary Overview, Tasks by Status, Team Activity
- Recent activity feed
- Quick action shortcuts
- Responsive design for all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + Tailwind CSS 4 |
| **Language** | TypeScript 5 (strict mode) |
| **ORM** | Prisma 7 |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT (`jose`) + `bcryptjs` |
| **Validation** | Zod 4 |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Testing** | Jest + React Testing Library |
| **Deployment** | Vercel / Docker |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 16+
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/asadbekabdulboqiyev/nescom.git
cd nescom

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 5. Seed the database (optional)
npm run seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/companyhub"

# JWT (required, min 32 characters)
JWT_SECRET="your-super-secret-key-at-least-32-characters-long"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 📁 Project Structure

```
nescom/
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma           # Prisma schema (8 models)
│   ├── seed.ts                 # Database seed script
│   └── migrations/             # Database migrations
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Dashboard pages
│   │   │   ├── dashboard/      # Main dashboard with analytics
│   │   │   ├── employees/      # Employee management
│   │   │   ├── tasks/          # Task board
│   │   │   ├── messages/       # Messaging system
│   │   │   ├── salary/         # Salary management
│   │   │   ├── join-requests/  # Join request approval
│   │   │   └── settings/       # User settings
│   │   └── api/                # Backend API routes
│   │       ├── auth/           # Login, register, logout
│   │       ├── users/          # User CRUD
│   │       ├── tasks/          # Task CRUD
│   │       ├── messages/       # Messaging
│   │       ├── salary/         # Salary management
│   │       ├── companies/      # Company management
│   │       ├── join-requests/  # Join request flow
│   │       ├── notifications/  # Notifications
│   │       └── upload/         # File upload
│   ├── components/             # Reusable React components
│   │   ├── charts/             # Chart components (Recharts)
│   │   ├── settings/           # Settings tab components
│   │   └── __tests__/          # Component tests
│   ├── contexts/               # React contexts (Auth)
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities (auth, rbac, validation)
│   │   └── __tests__/          # Unit tests
│   ├── proxy.ts                # API proxy utilities
│   └── types/                  # TypeScript types
├── tests/                      # API integration tests
├── docs/                       # Documentation (API, Database)
├── .github/workflows/          # CI/CD (GitHub Actions)
├── Dockerfile                  # Docker build
├── docker-compose.yml          # Docker Compose (app + PostgreSQL)
└── vercel.json                 # Vercel deployment config
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users (paginated) |
| `GET` | `/api/users/me` | Get current user |
| `POST` | `/api/users` | Create user (CEO/Manager/HR) |
| `PUT` | `/api/users/[id]` | Update user |
| `DELETE` | `/api/users/[id]` | Delete user (CEO/Manager/HR) |
| `POST` | `/api/users/me/change-password` | Change password |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks (paginated, filterable) |
| `POST` | `/api/tasks` | Create task |
| `GET` | `/api/tasks/[id]` | Get task |
| `PUT` | `/api/tasks/[id]` | Update task |
| `DELETE` | `/api/tasks/[id]` | Delete task |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages` | List messages (paginated) |
| `POST` | `/api/messages` | Send message |
| `GET` | `/api/messages/conversations` | List conversations |

### Salary
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/salary` | List salaries (paginated) |
| `POST` | `/api/salary` | Create salary record |
| `PUT` | `/api/salary/[id]` | Update salary |
| `POST` | `/api/salary/pay/[id]` | Mark as paid |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/companies` | List companies |
| `POST` | `/api/companies` | Create company |
| `PUT` | `/api/companies` | Update company (CEO) |

> 💡 All list endpoints support **pagination** via `?page=1&limit=50` query parameters. Response includes `{ pagination: { page, limit, total, pages } }`.

### Join Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/join-requests` | List pending requests |
| `POST` | `/api/join-requests` | Submit join request |
| `PUT` | `/api/join-requests/[id]` | Approve/reject request |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | List notifications |
| `PATCH` | `/api/notifications` | Mark as read |
| `POST` | `/api/upload` | Upload file |
| `GET` | `/api/health` | Health check |

> 📖 Full API documentation: [docs/API.md](docs/API.md)

---

## 🔑 Role Permissions

| Feature | CEO | Manager | Developer | Designer | Marketer | HR | Sales | Support | Intern |
|---------|:---:|:-------:|:---------:|:--------:|:--------:|:--:|:-----:|:-------:|:------:|
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Salary | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Salary | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Company | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Review Join Requests | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Send Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests (requires database)
npm run test:integration
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# All checks
npm run check
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
# Start with Docker Compose (app + PostgreSQL)
docker-compose up -d

# Or build and run manually
docker build -t nescom .
docker run -p 3000:3000 nescom
```

### Manual

```bash
npm run build
npm start
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Asadbek Abdulboqiyev** — [GitHub](https://github.com/asadbekabdulboqiyev)
