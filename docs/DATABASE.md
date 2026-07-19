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

## Modellar

### Company

Kompaniya ma'lumotlari.

| Maydon      | Tur      | Majburiy | Tavsif                  |
| ----------- | -------- | -------- | ----------------------- |
| id          | String   | Ha       | CUID, asosiy kalit      |
| name        | String   | Ha       | Kompaniya nomi          |
| description | String?  | Yo'q     | Tavsif                  |
| logo        | String?  | Yo'q     | Logo URL'i              |
| industry    | String?  | Yo'q     | Soha (IT, Finance, ...) |
| createdAt   | DateTime | Ha       | Yaratilgan sana         |

**Relations:**

- `users` — 1:N (User)
- `tasks` — 1:N (Task)
- `messages` — 1:N (Message)
- `files` — 1:N (File)
- `salaries` — 1:N (Salary)
- `notifications` — 1:N (Notification)

---

### User

Foydalanuvchi/xodim ma'lumotlari.

| Maydon        | Tur         | Majburiy | Tavsif                                      |
| ------------- | ----------- | -------- | ------------------------------------------- |
| id            | String      | Ha       | CUID, asosiy kalit                          |
| email         | String      | Ha       | Unikal email                                |
| password      | String      | Ha       | Hashlangan parol                            |
| name          | String      | Ha       | Ism Familiya                                |
| role          | Role (Enum) | Ha       | CEO, MANAGER, DEVELOPER, DESIGNER, MARKETER |
| avatar        | String?     | Yo'q     | Avatar URL'i                                |
| phone         | String?     | Yo'q     | Telefon raqami                              |
| salary        | Float?      | Yo'q     | Oylik miqdori                               |
| salaryDueDate | DateTime?   | Yo'q     | Oylik to'lov sanasi                         |
| startDate     | DateTime?   | Yo'q     | Ish boshlagan sana                          |
| department    | String?     | Yo'q     | Bo'lim                                      |
| companyId     | String      | Ha       | Kompaniya ID (FK)                           |
| createdAt     | DateTime    | Ha       | Yaratilgan sana                             |

**Indexes:**

- `companyId` — Kompaniya bo'yicha qidirish
- `email` — Unikal email qidirish

**Relations:**

- `company` — N:1 (Company)
- `assignedTasks` — 1:N (Task) — tayinlangan vazifalar
- `createdTasks` — 1:N (Task) — yaratgan vazifalar
- `sentMessages` — 1:N (Message) — yuborgan xabarlar
- `recvMessages` — 1:N (Message) — qabul qilgan xabarlar
- `sentFiles` — 1:N (File) — yuborgan fayllar
- `recvFiles` — 1:N (File) — qabul qilgan fayllar
- `salaries` — 1:N (Salary)
- `notifications` — 1:N (Notification)

---

### Task

Vazifa ma'lumotlari.

| Maydon      | Tur               | Majburiy | Tavsif                           |
| ----------- | ----------------- | -------- | -------------------------------- |
| id          | String            | Ha       | CUID, asosiy kalit               |
| title       | String            | Ha       | Vazifa sarlavhasi                |
| description | String?           | Yo'q     | Tavsif                           |
| status      | TaskStatus (Enum) | Ha       | TODO, IN_PROGRESS, DONE, BLOCKED |
| priority    | Priority (Enum)   | Ha       | LOW, MEDIUM, HIGH, URGENT        |
| dueDate     | DateTime?         | Yo'q     | Muddati                          |
| tags        | String[]          | Ha       | Teglar                           |
| assigneeId  | String?           | Yo'q     | Tayinlangan foydalanuvchi (FK)   |
| creatorId   | String            | Ha       | Yaratgan foydalanuvchi (FK)      |
| companyId   | String            | Ha       | Kompaniya (FK)                   |
| createdAt   | DateTime          | Ha       | Yaratilgan sana                  |

**Indexes:**

- `companyId` — Kompaniya bo'yicha
- `assigneeId` — Tayinlangan foydalanuvchi bo'yicha
- `creatorId` — Yaratgan foydalanuvchi bo'yicha
- `status` — Status bo'yicha

**Relations:**

- `assignee` — N:1 (User)
- `creator` — N:1 (User)
- `company` — N:1 (Company)

---

### Message

Xabar ma'lumotlari.

| Maydon     | Tur       | Majburiy | Tavsif                    |
| ---------- | --------- | -------- | ------------------------- |
| id         | String    | Ha       | CUID, asosiy kalit        |
| content    | String    | Ha       | Xabar matni               |
| read       | Boolean   | Ha       | O'qilgan (default: false) |
| readAt     | DateTime? | Yo'q     | O'qilgan sana             |
| senderId   | String    | Ha       | Yuboruvchi (FK)           |
| receiverId | String    | Ha       | Qabul qiluvchi (FK)       |
| companyId  | String    | Ha       | Kompaniya (FK)            |
| createdAt  | DateTime  | Ha       | Yaratilgan sana           |

**Indexes:**

- `companyId` — Kompaniya bo'yicha
- `senderId` — Yuboruvchi bo'yicha
- `receiverId` — Qabul qiluvchi bo'yicha
- `createdAt` — Sana bo'yicha

**Relations:**

- `sender` — N:1 (User)
- `receiver` — N:1 (User)
- `company` — N:1 (Company)

---

### File

Fayl ma'lumotlari.

| Maydon     | Tur      | Majburiy | Tavsif              |
| ---------- | -------- | -------- | ------------------- |
| id         | String   | Ha       | CUID, asosiy kalit  |
| name       | String   | Ha       | Fayl nomi           |
| url        | String   | Ha       | Fayl URL'i          |
| size       | Int      | Ha       | Hajm (baytlarda)    |
| type       | String   | Ha       | MIME turi           |
| senderId   | String   | Ha       | Yuboruvchi (FK)     |
| receiverId | String   | Ha       | Qabul qiluvchi (FK) |
| companyId  | String   | Ha       | Kompaniya (FK)      |
| createdAt  | DateTime | Ha       | Yaratilgan sana     |

**Indexes:**

- `companyId` — Kompaniya bo'yicha
- `senderId` — Yuboruvchi bo'yicha
- `receiverId` — Qabul qiluvchi bo'yicha

**Relations:**

- `sender` — N:1 (User)
- `receiver` — N:1 (User)
- `company` — N:1 (Company)

---

### Salary

Oylik to'lov ma'lumotlari.

| Maydon     | Tur                 | Majburiy | Tavsif                    |
| ---------- | ------------------- | -------- | ------------------------- |
| id         | String              | Ha       | CUID, asosiy kalit        |
| amount     | Float               | Ha       | Oylik miqdori             |
| bonus      | Float?              | Yo'q     | Bonus (default: 0)        |
| deductions | Float?              | Yo'q     | Qisqartmalar (default: 0) |
| status     | SalaryStatus (Enum) | Ha       | PENDING, PAID, OVERDUE    |
| paidAt     | DateTime?           | Yo'q     | To'langan sana            |
| dueDate    | DateTime            | Ha       | To'lov muddati            |
| userId     | String              | Ha       | Foydalanuvchi (FK)        |
| companyId  | String              | Ha       | Kompaniya (FK)            |

**Indexes:**

- `companyId` — Kompaniya bo'yicha
- `userId` — Foydalanuvchi bo'yicha
- `status` — Status bo'yicha
- `dueDate` — To'lov muddati bo'yicha

**Relations:**

- `user` — N:1 (User)
- `company` — N:1 (Company)

---

### Notification

Ogohlantirish ma'lumotlari.

| Maydon    | Tur                     | Majburiy | Tavsif                    |
| --------- | ----------------------- | -------- | ------------------------- |
| id        | String                  | Ha       | CUID, asosiy kalit        |
| title     | String                  | Ha       | Sarlavha                  |
| message   | String                  | Ha       | Xabar matni               |
| type      | NotificationType (Enum) | Ha       | TASK, MESSAGE, SALARY     |
| read      | Boolean                 | Ha       | O'qilgan (default: false) |
| link      | String?                 | Yo'q     | Havola                    |
| userId    | String                  | Ha       | Foydalanuvchi (FK)        |
| companyId | String                  | Ha       | Kompaniya (FK)            |
| createdAt | DateTime                | Ha       | Yaratilgan sana           |

**Indexes:**

- `companyId` — Kompaniya bo'yicha
- `userId` — Foydalanuvchi bo'yicha
- `read` — O'qilganlik bo'yicha

**Relations:**

- `user` — N:1 (User)
- `company` — N:1 (Company)

---

## Enum'lar

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

### Yangi migration yaratish

```bash
npx prisma migrate dev --name migration_name
```

### Migrationlarni production'ga qo'llash

```bash
npx prisma migrate deploy
```

### Schema o'zgartirishlar

1. `prisma/schema.prisma` faylini tahrirlang
2. `npx prisma migrate dev` — yangi migration yarating
3. `npx prisma generate` — Prisma Client'ni yangilang
4. Kodni yangilang

### Boshlang'ich ma'lumotlar

```bash
npx tsx prisma/seed.ts
```

Seed fayli quyidagi ma'lumotlarni qo'shadi:

- 1 ta kompaniya (Acme Corp)
- 5 ta foydalanuvchi (CEO, Manager, Developer, Designer, Marketer)
- Namuna vazifalar
- Namuna xabarlar
- Namuna oyliklar

---

## Performance Maslahatlari

1. **Indexlar** — Barcha foreign key'larda indexlar mavjud
2. **Select** — Faqat kerakli maydonlarni oling (`select` ishlating)
3. **Pagination** — Katta ro'yxatlar uchun `take`/`skip` ishlating
4. **Eager Loading** — `include` bilan bog'liq ma'lumotlarni bir vaqtda oling
