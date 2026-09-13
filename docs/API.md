# Nescom API Documentation

All API endpoints operate under the `/api/` prefix.

## Authentication

A JWT token is required to use the API endpoints. The token must be sent via a `cookie` or the `Authorization` header:

```
Authorization: Bearer <token>
```

Or it is sent automatically via a cookie.

---

## Auth (Authentication)

### POST /api/auth/register

Registers a new account. Creates a new user.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "First Last",
  "companyId": "optional-company-id"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "First Last",
    "role": "CEO"
  },
  "token": "jwt-token"
}
```

**Errors:**

- `400` — Validation error
- `409` — Email is already registered
- `404` — Company not found
- `500` — Internal server error

---

### POST /api/auth/login

Logs the user in.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "token": "jwt-token",
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "First Last",
    "role": "CEO",
    "companyId": "company-id"
  }
}
```

**Errors:**

- `400` — Validation error
- `401` — Invalid email or password
- `500` — Internal server error

---

### POST /api/auth/logout

Logs the user out. Clears the cookie.

**Auth required:** No

**Request body:** Empty

**Response (200):**

```json
{
  "message": "Logged out"
}
```

---

## Tasks

### GET /api/tasks

Gets the list of tasks.

**Auth required:** Yes (x-company-id header)

**Query parameters:**

| Parameter  | Required | Description                      |
| ---------- | -------- | -------------------------------- |
| status     | No       | TODO, IN_PROGRESS, DONE, BLOCKED |
| priority   | No       | LOW, MEDIUM, HIGH, URGENT        |
| assigneeId | No       | Assigned user ID                 |

**Response (200):**

```json
{
  "tasks": [
    {
      "id": "cuid",
      "title": "Task title",
      "description": "Description",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2026-07-25T00:00:00.000Z",
      "tags": ["frontend"],
      "createdAt": "2026-07-19T00:00:00.000Z",
      "assignee": { "id": "cuid", "name": "First", "avatar": null },
      "creator": { "id": "cuid", "name": "First", "avatar": null }
    }
  ]
}
```

---

### POST /api/tasks

Creates a new task.

**Auth required:** Yes (x-company-id, x-user-id, x-user-role)
**Permission:** CEO, MANAGER, DEVELOPER

**Request body:**

```json
{
  "title": "Task title",
  "description": "Description (optional)",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-07-25",
  "assigneeId": "user-id (optional)"
}
```

**Response (201):**

```json
{
  "task": {
    "id": "cuid",
    "title": "Task title",
    "status": "TODO",
    "priority": "MEDIUM",
    "assignee": { "id": "cuid", "name": "First", "avatar": null },
    "creator": { "id": "cuid", "name": "First", "avatar": null }
  }
}
```

**Errors:**

- `400` — Validation error
- `401` — Unauthorized
- `403` — Permission denied
- `500` — Internal server error

---

### GET /api/tasks/[id]

Gets a single task.

**Auth required:** Yes (x-company-id)

**Response (200):**

```json
{
  "id": "cuid",
  "title": "Task title",
  "description": "Description",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-07-25T00:00:00.000Z",
  "tags": [],
  "assignee": { "id": "cuid", "name": "First", "avatar": null },
  "creator": { "id": "cuid", "name": "First", "avatar": null }
}
```

**Errors:**

- `404` — Task not found

---

### PUT /api/tasks/[id]

Updates a task.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO, MANAGER, DEVELOPER

**Request body:** (Same as POST; all fields optional)

**Response (200):** Updated task

---

### DELETE /api/tasks/[id]

Deletes a task.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO, MANAGER, DEVELOPER

**Response (200):**

```json
{
  "message": "Task deleted"
}
```

---

## Messages

### GET /api/messages

Gets the list of messages.

**Auth required:** Yes (x-company-id, x-user-id)

**Query parameters:**

| Parameter | Required | Description                       |
| --------- | -------- | --------------------------------- |
| userId    | No       | Conversation with a specific user |

**Response (200):**

```json
{
  "messages": [
    {
      "id": "cuid",
      "content": "Message content",
      "read": false,
      "createdAt": "2026-07-19T00:00:00.000Z",
      "sender": { "id": "cuid", "name": "First", "avatar": null },
      "receiver": { "id": "cuid", "name": "First", "avatar": null }
    }
  ]
}
```

---

### POST /api/messages

Sends a message.

**Auth required:** Yes (x-company-id, x-user-id, x-user-role)
**Permission:** All roles

**Request body:**

```json
{
  "receiverId": "receiver-id",
  "content": "Message content"
}
```

**Response (201):**

```json
{
  "message": {
    "id": "cuid",
    "content": "Message content",
    "sender": { "id": "cuid", "name": "First", "avatar": null },
    "receiver": { "id": "cuid", "name": "First", "avatar": null }
  }
}
```

---

### GET /api/messages/conversations

Gets the list of conversations.

**Auth required:** Yes (x-company-id, x-user-id)

**Response (200):**

```json
{
  "conversations": [
    {
      "user": { "id": "cuid", "name": "First", "avatar": null },
      "lastMessage": "Last message",
      "lastMessageAt": "2026-07-19T00:00:00.000Z",
      "unread": 3
    }
  ]
}
```

---

## Users

### GET /api/users

Gets the list of employees.

**Auth required:** Yes (x-company-id)

**Response (200):**

```json
{
  "users": [
    {
      "id": "cuid",
      "email": "user@example.com",
      "name": "First Last",
      "role": "DEVELOPER",
      "avatar": null,
      "phone": "+998901234567",
      "salary": 5000000,
      "salaryDueDate": "2026-07-25T00:00:00.000Z",
      "startDate": "2026-01-01T00:00:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/users

Adds a new employee.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO, MANAGER

**Request body:**

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "DEVELOPER",
  "phone": "+998901234567",
  "salary": 5000000,
  "salaryDueDate": "2026-07-25",
  "startDate": "2026-07-01"
}
```

**Response (201):** Updated user

**Errors:**

- `400` — Validation error; email, name, and role are required
- `403` — Permission denied

---

### GET /api/users/[id]

Gets a single employee.

**Auth required:** Yes (x-company-id)

**Response (200):**

```json
{
  "id": "cuid",
  "email": "user@example.com",
  "name": "First Last",
  "role": "DEVELOPER",
  "company": { "id": "cuid", "name": "Company" }
}
```

---

### PUT /api/users/[id]

Updates an employee.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO, MANAGER

**Request body:** (Same as POST; all fields optional)

**Response (200):** Updated user

---

### DELETE /api/users/[id]

Deletes an employee.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO, MANAGER

**Response (200):**

```json
{
  "message": "User deleted"
}
```

---

### GET /api/users/me

Gets the current user's information.

**Auth required:** Yes (Bearer token or cookie)

**Response (200):**

```json
{
  "user": {
    "id": "cuid",
    "name": "First Last",
    "email": "user@example.com",
    "role": "CEO",
    "companyId": "company-id",
    "avatar": null,
    "phone": "+998901234567",
    "salary": 5000000,
    "salaryDueDate": "2026-07-25T00:00:00.000Z",
    "startDate": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors:**

- `401` — Token missing or invalid
- `404` — User not found

---

### POST /api/users/me/change-password

Changes the user's password.

**Auth required:** Yes (Bearer token or cookie)

**Request body:**

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

**Errors:**

- `400` — Current password is incorrect, or the new password is fewer than 6 characters
- `401` — Invalid token
- `404` — User not found

---

## Salary

### GET /api/salary

Gets the list of salaries.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO, MANAGER

**Query parameters:**

| Parameter | Required | Description            |
| --------- | -------- | ---------------------- |
| userId    | No       | A specific user        |
| status    | No       | PENDING, PAID, OVERDUE |

**Response (200):**

```json
{
  "salaries": [
    {
      "id": "cuid",
      "amount": 5000000,
      "status": "PENDING",
      "dueDate": "2026-07-25T00:00:00.000Z",
      "paidAt": null,
      "bonus": 0,
      "deductions": 0,
      "user": { "id": "cuid", "name": "First", "avatar": null }
    }
  ]
}
```

---

### POST /api/salary

Creates a new salary record.

**Auth required:** Yes (x-company-id, x-user-role)
**Permission:** CEO

**Request body:**

```json
{
  "userId": "user-id",
  "amount": 5000000,
  "dueDate": "2026-07-25"
}
```

**Response (201):** Created salary record

**Errors:**

- `400` — Validation error
- `403` — Permission denied

---

### GET /api/salary/[id]

Gets a single salary record.

**Auth required:** Yes (x-company-id)

**Response (200):** Salary information

---

### PUT /api/salary/[id]

Updates a salary record.

**Auth required:** Yes (x-company-id)

**Request body:**

```json
{
  "status": "PAID",
  "paidAt": "2026-07-19",
  "amount": 5500000,
  "dueDate": "2026-07-25"
}
```

**Response (200):** Updated salary record

---

### POST /api/salary/pay/[id]

Marks a salary record as paid.

**Auth required:** Yes (x-company-id)

**Response (200):**

```json
{
  "id": "cuid",
  "status": "PAID",
  "paidAt": "2026-07-19T00:00:00.000Z"
}
```

---

## Companies

### GET /api/companies

Gets the list of companies.

**Auth required:** No

**Response (200):**

```json
{
  "companies": [
    {
      "id": "cuid",
      "name": "Company name",
      "industry": "IT",
      "description": "Description",
      "_count": { "users": 10 }
    }
  ]
}
```

---

### POST /api/companies

Creates a company.

**Auth required:** No

**Request body:**

```json
{
  "name": "New Company",
  "industry": "IT",
  "description": "Company description"
}
```

**Response (201):** Created company

---

### PUT /api/companies

Updates a company.

**Auth required:** Yes (x-user-role)
**Permission:** CEO

**Request body:**

```json
{
  "id": "company-id",
  "name": "New name",
  "industry": "FinTech",
  "description": "New description"
}
```

**Response (200):** Updated company

---

## Notifications

### GET /api/notifications

Gets the list of notifications.

**Auth required:** Yes (x-company-id, x-user-id)

**Query parameters:**

| Parameter  | Required | Description                |
| ---------- | -------- | -------------------------- |
| unreadOnly | No       | Only unread items (`true`) |

**Response (200):**

```json
{
  "notifications": [
    {
      "id": "cuid",
      "title": "Title",
      "message": "Message content",
      "type": "TASK",
      "read": false,
      "link": "/tasks/123",
      "createdAt": "2026-07-19T00:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

---

### POST /api/notifications

Creates a notification.

**Auth required:** Yes (x-company-id)

**Request body:**

```json
{
  "userId": "user-id",
  "title": "Notification title",
  "message": "Notification message",
  "type": "TASK"
}
```

**Response (201):** Created notification

---

### PATCH /api/notifications

Marks a notification as read.

**Auth required:** Yes (x-company-id, x-user-id)

**Request body (readAll):**

```json
{
  "action": "readAll"
}
```

**Request body (read):**

```json
{
  "action": "read",
  "id": "notification-id"
}
```

**Response (200):**

```json
{
  "success": true
}
```

---

## Upload

### POST /api/upload

Uploads a file.

**Auth required:** Yes (x-company-id, x-user-id)

**Request body:** `multipart/form-data`

| Field | Type | Description    |
| ----- | ---- | -------------- |
| file  | File | File to upload |

**Allowed types:**

- image/jpeg, image/png, image/gif, image/webp
- application/pdf
- application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- text/plain

**Maximum size:** 10MB

**Response (200):**

```json
{
  "url": "/uploads/1234567890-abc123.jpg",
  "name": "image.jpg",
  "size": 1024000,
  "type": "image/jpeg"
}
```

**Errors:**

- `400` — File is larger than 10MB or the type is not allowed
- `401` — Unauthorized
- `500` — Upload error

---

## Error formats

All errors are returned in the following format:

```json
{
  "error": "Message content"
}
```

**Common status codes:**

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 200  | Success                               |
| 201  | Created                               |
| 400  | Validation error                      |
| 401  | Authentication error                  |
| 403  | Permission denied                     |
| 404  | Not found                             |
| 409  | Conflict (e.g., email already exists) |
| 500  | Internal server error                 |
