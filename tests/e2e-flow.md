# Nescom — E2E Test Flow

## Full User Journey

This document describes the complete user journey tested by the E2E API test suite.

---

### Step 1: Seed Data / Company Discovery

**Endpoint:** `GET /api/companies` (public)

- Lists all companies to find the target company ID
- No auth required
- Returns `{ companies: [{ id, name, industry, description, _count: { users } }] }`

---

### Step 2: Register CEO

**Endpoint:** `POST /api/auth/register` (public)

- Body: `{ email, password, name, companyId }`
- First user in a company automatically gets `CEO` role
- Returns `{ user: { id, email, name, role }, token }` (201)
- Token is a JWT containing `{ userId, email, companyId, role }`

**Validation tests:**

- Empty body → 400 "Missing required fields"
- Duplicate email → 409 "User already exists"
- Second user in same company → gets `DEVELOPER` role (not CEO)

---

### Step 3: Login as CEO

**Endpoint:** `POST /api/auth/login` (public)

- Body: `{ email, password }`
- Returns `{ token, user: { id, email, name, role, companyId } }` (200)
- Sets `token` httpOnly cookie

**Validation tests:**

- Empty body → 400
- Wrong credentials → 401 "Invalid credentials"

---

### Step 4: Get Current User

**Endpoint:** `GET /api/users/me` (auth via Bearer token)

- Header: `Authorization: Bearer <token>`
- Returns `{ user: { id, name, email, role, companyId, avatar, phone, ... } }` (200)
- Without token → 401

---

### Step 5: List Users

**Endpoint:** `GET /api/users` (x-company-id header)

- Header: `x-company-id: <companyId>`
- Returns `{ users: [...] }` scoped to the company (200)
- After CEO registration: at least 1 user

**Validation test:**

- Without x-company-id → 401

---

### Step 6: Create Employee

**Endpoint:** `POST /api/users` (x-company-id header)

- Header: `x-company-id: <companyId>`
- Body: `{ email, password, name, role, phone?, salary?, ... }`
- Returns `{ user: { id, email, name, role, ... } }` (201)

**Validation test:**

- Missing required fields → 400

---

### Step 7: List Tasks (empty initially)

**Endpoint:** `GET /api/tasks` (x-company-id header)

- Header: `x-company-id: <companyId>`
- Returns `{ tasks: [] }` initially (200)
- Supports optional filters: `?status=`, `?priority=`, `?assigneeId=`

---

### Step 8: Create Task

**Endpoint:** `POST /api/tasks` (x-company-id + x-user-id headers)

- Headers: `x-company-id`, `x-user-id`
- Body: `{ title, description?, status?, priority?, dueDate?, assigneeId? }`
- Returns `{ task: { ... } }` with nested assignee/creator (201)
- Defaults: status=TODO, priority=MEDIUM

**Validation test:**

- Missing title → 400 "Title is required"

---

### Step 9: Update Task

**Endpoint:** `PUT /api/tasks/[id]` (x-company-id header)

- Header: `x-company-id: <companyId>`
- Body: any of `{ title, description, status, priority, dueDate, assigneeId }`
- Returns updated task (200)
- Invalid task ID → 404 "Task not found"

---

### Step 10: List Messages (empty initially)

**Endpoint:** `GET /api/messages` (x-company-id + x-user-id headers)

- Returns messages involving the current user (sender or receiver)
- Supports `?receiverId=` filter for specific conversation

---

### Step 11: Send Message

**Endpoint:** `POST /api/messages` (x-company-id + x-user-id headers)

- Body: `{ content, receiverId }` (both required)
- Returns `{ message: { ... } }` with sender/receiver info (201)

**Validation test:**

- Missing receiverId → 400 "Content and receiverId are required"

---

### Step 12: List Salaries (empty initially)

**Endpoint:** `GET /api/salary` (x-company-id header)

- Returns `{ salaries: [] }` (200)
- Supports `?userId=`, `?status=` filters

---

### Step 13: Create Salary Record

**Endpoint:** `POST /api/salary` (x-company-id header)

- Body: `{ userId, amount, dueDate }` (all required)
- Returns `{ salary: { id, amount, status, user, ... } }` (201)
- Default status: PENDING

**Validation test:**

- Missing fields → 400 "userId, amount, and dueDate are required"

---

### Step 14: List Notifications (empty initially)

**Endpoint:** `GET /api/notifications` (x-company-id + x-user-id headers)

- Returns `{ notifications: [...], count: <unread> }` (200)
- `count` is the number of unread notifications
- Supports `?unreadOnly=true` filter

---

### Step 15: Create Notification

**Endpoint:** `POST /api/notifications` (x-company-id header)

- Body: `{ userId, title, message, type }` (all required, type: TASK|MESSAGE|SALARY)
- Returns `{ notification: { ... } }` (201)

---

## Auth Architecture Notes

| Route                     | Auth Method    | Headers Required             |
| ------------------------- | -------------- | ---------------------------- |
| `GET /api/companies`      | None           | —                            |
| `POST /api/companies`     | None           | —                            |
| `POST /api/auth/register` | None           | —                            |
| `POST /api/auth/login`    | None           | —                            |
| `GET /api/users/me`       | Bearer token   | `Authorization`              |
| `GET /api/users`          | Company scope  | `x-company-id`               |
| `POST /api/users`         | Company scope  | `x-company-id`               |
| `GET /api/tasks`          | Company scope  | `x-company-id`               |
| `POST /api/tasks`         | Company + User | `x-company-id` + `x-user-id` |
| `PUT /api/tasks/[id]`     | Company scope  | `x-company-id`               |
| `GET /api/messages`       | Company + User | `x-company-id` + `x-user-id` |
| `POST /api/messages`      | Company + User | `x-company-id` + `x-user-id` |
| `GET /api/salary`         | Company scope  | `x-company-id`               |
| `POST /api/salary`        | Company scope  | `x-company-id`               |
| `GET /api/notifications`  | Company + User | `x-company-id` + `x-user-id` |
| `POST /api/notifications` | Company scope  | `x-company-id`               |

## Running Tests

```bash
chmod +x run-tests.sh
bash run-tests.sh
```

The test runner will:

1. Start the Next.js dev server on port 3000 (or reuse an existing one)
2. Run all API tests sequentially
3. Report pass/fail for each test
4. Exit with code 0 (all pass) or 1 (failures)
5. Stop the dev server on exit
