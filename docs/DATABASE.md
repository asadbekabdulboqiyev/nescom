# Nescom Database Documentation

## Schema Diagram

```
┌─────────────────────┐
│       Company       │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ description         │
│ logo                │
│ industry            │
│ createdAt           │
└─────────┬───────────┘
          │
          │ 1:N
          │
┌─────────┴───────────┐
│        User         │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ password            │
│ name                │
│ role (Enum)         │
│ avatar              │
│ phone               │
│ salary              │
│ salaryDueDate       │
│ startDate           │
│ department          │
│ companyId (FK)      │
│ createdAt           │
└─────────┬───────────┘
          │
          ├── 1:N ──→ Task (assignee)
          ├── 1:N ──→ Task (creator)
          ├── 1:N ──→ Message (sender)
          ├── 1:N ──→ Message (receiver)
          ├── 1:N ──→ File (sender)
          ├── 1:N ──→ File (receiver)
          ├── 1:N ──→ Salary
          └── 1:N ──→ Notification

┌─────────────────────┐
│        Task         │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ status (Enum)       │
│ priority (Enum)     │
│ dueDate             │
│ tags                │
│ assigneeId (FK)     │
│ creatorId (FK)      │
│ companyId (FK)      │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐
│       Message       │
├─────────────────────┤
│ id (PK)             │
│ content             │
│ read                │
│ readAt              │
│ senderId (FK)       │
│ receiverId (FK)     │
│ companyId (FK)      │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐
│        File         │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ url                 │
│ size                │
│ type                │
│ senderId (FK)       │
│ receiverId (FK)     │
│ companyId (FK)      │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐
│       Salary        │
├─────────────────────┤
│ id (PK)             │
│ amount              │
│ bonus               │
│ deductions          │
│ status (Enum)       │
│ paidAt              │
│ dueDate             │
│ userId (FK)         │
│ companyId (FK)      │
└─────────────────────┘

┌─────────────────────┐
│    Notification     │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ message             │
│ type (Enum)         │
│ read                │
│ link                │
│ userId (FK)         │
│ companyId (FK)      │
│ createdAt           │
└─────────────────────┘
```

## Models

### Company

Company information.

| Field       | Type     | Required | Description                 |
| ----------- | -------- | -------- | --------------------------- |
| id          | String   | Yes      | CUID, primary key           |
| name        | String   | Yes      | Company name                |
| description | String?  | No       | Description                 |
| logo        | String?  | No       | Logo URL                    |
| industry    | String?  | No       | Industry (IT, Finance, ...) |
| createdAt   | DateTime | Yes      | Creation date               |

**Relations:**

- `users` — 1:N (User)
- `tasks` — 1:N (Task)
- `messages` — 1:N (Message)
- `files` — 1:N (File)
- `salaries` — 1:N (Salary)
- `notifications` — 1:N (Notification)

---

### User

User/employee information.

| Field         | Type        | Required | Description                                 |
| ------------- | ----------- | -------- | ------------------------------------------- |
| id            | String      | Yes      | CUID, primary key                           |
| email         | String      | Yes      | Unique email                                |
| password      | String      | Yes      | Hashed password                             |
| name          | String      | Yes      | Full name                                   |
| role          | Role (Enum) | Yes      | CEO, MANAGER, DEVELOPER, DESIGNER, MARKETER |
| avatar        | String?     | No       | Avatar URL                                  |
| phone         | String?     | No       | Phone number                                |
| salary        | Float?      | No       | Monthly amount                              |
| salaryDueDate | DateTime?   | No       | Monthly payment date                        |
| startDate     | DateTime?   | No       | Start date                                  |
| department    | String?     | No       | Department                                  |
| companyId     | String      | Yes      | Company ID (FK)                             |
| createdAt     | DateTime    | Yes      | Creation date                               |

**Indexes:**

- `companyId` — Search by company
- `email` — Unique email lookup

**Relations:**

- `company` — N:1 (Company)
- `assignedTasks` — 1:N (Task) — assigned tasks
- `createdTasks` — 1:N (Task) — created tasks
- `sentMessages` — 1:N (Message) — sent messages
- `recvMessages` — 1:N (Message) — received messages
- `sentFiles` — 1:N (File) — sent files
- `recvFiles` — 1:N (File) — received files
- `salaries` — 1:N (Salary)
- `notifications` — 1:N (Notification)

---

### Task

Task information.

| Field       | Type              | Required | Description                      |
| ----------- | ----------------- | -------- | -------------------------------- |
| id          | String            | Yes      | CUID, primary key                |
| title       | String            | Yes      | Task title                       |
| description | String?           | No       | Description                      |
| status      | TaskStatus (Enum) | Yes      | TODO, IN_PROGRESS, DONE, BLOCKED |
| priority    | Priority (Enum)   | Yes      | LOW, MEDIUM, HIGH, URGENT        |
| dueDate     | DateTime?         | No       | Due date                         |
| tags        | String[]          | Yes      | Tags                             |
| assigneeId  | String?           | No       | Assigned user (FK)               |
| creatorId   | String            | Yes      | Creator (FK)                     |
| companyId   | String            | Yes      | Company (FK)                     |
| createdAt   | DateTime          | Yes      | Creation date                    |

**Indexes:**

- `companyId` — By company
- `assigneeId` — By assigned user
- `creatorId` — By creator
- `status` — By status

**Relations:**

- `assignee` — N:1 (User)
- `creator` — N:1 (User)
- `company` — N:1 (Company)

---

### Message

Message information.

| Field      | Type      | Required | Description           |
| ---------- | --------- | -------- | --------------------- |
| id         | String    | Yes      | CUID, primary key     |
| content    | String    | Yes      | Message content       |
| read       | Boolean   | Yes      | Read (default: false) |
| readAt     | DateTime? | No       | Read date             |
| senderId   | String    | Yes      | Sender (FK)           |
| receiverId | String    | Yes      | Receiver (FK)         |
| companyId  | String    | Yes      | Company (FK)          |
| createdAt  | DateTime  | Yes      | Creation date         |

**Indexes:**

- `companyId` — By company
- `senderId` — By sender
- `receiverId` — By receiver
- `createdAt` — By date

**Relations:**

- `sender` — N:1 (User)
- `receiver` — N:1 (User)
- `company` — N:1 (Company)

---

### File

File information.

| Field      | Type     | Required | Description       |
| ---------- | -------- | -------- | ----------------- |
| id         | String   | Yes      | CUID, primary key |
| name       | String   | Yes      | File name         |
| url        | String   | Yes      | File URL          |
| size       | Int      | Yes      | Size (in bytes)   |
| type       | String   | Yes      | MIME type         |
| senderId   | String   | Yes      | Sender (FK)       |
| receiverId | String   | Yes      | Receiver (FK)     |
| companyId  | String   | Yes      | Company (FK)      |
| createdAt  | DateTime | Yes      | Creation date     |

**Indexes:**

- `companyId` — By company
- `senderId` — By sender
- `receiverId` — By receiver

**Relations:**

- `sender` — N:1 (User)
- `receiver` — N:1 (User)
- `company` — N:1 (Company)

---

### Salary

Monthly salary information.

| Field      | Type                | Required | Description             |
| ---------- | ------------------- | -------- | ----------------------- |
| id         | String              | Yes      | CUID, primary key       |
| amount     | Float               | Yes      | Monthly amount          |
| bonus      | Float?              | No       | Bonus (default: 0)      |
| deductions | Float?              | No       | Deductions (default: 0) |
| status     | SalaryStatus (Enum) | Yes      | PENDING, PAID, OVERDUE  |
| paidAt     | DateTime?           | No       | Paid date               |
| dueDate    | DateTime            | Yes      | Due date                |
| userId     | String              | Yes      | User (FK)               |
| companyId  | String              | Yes      | Company (FK)            |

**Indexes:**

- `companyId` — By company
- `userId` — By user
- `status` — By status
- `dueDate` — By due date

**Relations:**

- `user` — N:1 (User)
- `company` — N:1 (Company)

---

### Notification

Notification information.

| Field     | Type                    | Required | Description           |
| --------- | ----------------------- | -------- | --------------------- |
| id        | String                  | Yes      | CUID, primary key     |
| title     | String                  | Yes      | Title                 |
| message   | String                  | Yes      | Message content       |
| type      | NotificationType (Enum) | Yes      | TASK, MESSAGE, SALARY |
| read      | Boolean                 | Yes      | Read (default: false) |
| link      | String?                 | No       | Link                  |
| userId    | String                  | Yes      | User (FK)             |
| companyId | String                  | Yes      | Company (FK)          |
| createdAt | DateTime                | Yes      | Creation date         |

**Indexes:**

- `companyId` — By company
- `userId` — By user
- `read` — By read status

**Relations:**

- `user` — N:1 (User)
- `company` — N:1 (Company)

---

## Enums

### Role

```
CEO | MANAGER | DEVELOPER | DESIGNER | MARKETER
```

### TaskStatus

```
TODO | IN_PROGRESS | DONE | BLOCKED
```

### Priority

```
LOW | MEDIUM | HIGH | URGENT
```

### SalaryStatus

```
PENDING | PAID | OVERDUE
```

### NotificationType

```
TASK | MESSAGE | SALARY
```

---

## Migration Guide

### Creating a new migration

```bash
npx prisma migrate dev --name migration_name
```

### Applying migrations to production

```bash
npx prisma migrate deploy
```

### Schema changes

1. Edit the `prisma/schema.prisma` file
2. `npx prisma migrate dev` — create a new migration
3. `npx prisma generate` — update the Prisma Client
4. Update the code

### Seed data

```bash
npx tsx prisma/seed.ts
```

The seed file adds the following data:

- 1 company (Acme Corp)
- 5 users (CEO, Manager, Developer, Designer, Marketer)
- Sample tasks
- Sample messages
- Sample salaries

---

## Performance Tips

1. **Indexes** — Indexes exist on all foreign keys
2. **Select** — Only fetch the fields you need (use `select`)
3. **Pagination** — Use `take`/`skip` for large lists
4. **Eager Loading** — Fetch related data eagerly with `include`
