# Nescom API Documentation

Barcha API endpoint'lari `/api/` prefix bilan ishlaydi.

## Autentifikatsiya

API endpoint'lari orqali ishlash uchun JWT token talab qilinadi. Token `cookie` yoki `Authorization` header orqali yuborilishi kerak:

```
Authorization: Bearer <token>
```

Yoki cookie orqali avtomatik yuboriladi.

---

## Auth (Autentifikatsiya)

### POST /api/auth/register

Ro'yxatdan o'tish. Yangi foydalanuvchi yaratadi.

**Auth talab:** Yo'q

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "parol123",
  "name": "Ism Familiya",
  "companyId": "optional-company-id"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "Ism Familiya",
    "role": "CEO"
  },
  "token": "jwt-token"
}
```

**Xatoliklar:**

- `400` — Validatsiya xatosi
- `409` — Email allaqachon ro'yxatdan o'tgan
- `404` — Kompaniya topilmadi
- `500` — Server xatosi

---

### POST /api/auth/login

Tizimga kirish.

**Auth talab:** Yo'q

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "parol123"
}
```

**Response (200):**

```json
{
  "token": "jwt-token",
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "Ism Familiya",
    "role": "CEO",
    "companyId": "company-id"
  }
}
```

**Xatoliklar:**

- `400` — Validatsiya xatosi
- `401` — Email yoki parol noto'g'ri
- `500` — Server xatosi

---

### POST /api/auth/logout

Tizimdan chiqish. Cookie'ni tozalaydi.

**Auth talab:** Yo'q

**Request body:** Bo'sh

**Response (200):**

```json
{
  "message": "Logged out"
}
```

---

## Tasks (Vazifalar)

### GET /api/tasks

Vazifalar ro'yxatini olish.

**Auth talab:** Ha (x-company-id header)

**Query parametrlari:**

| Parametr   | Majburiy | Tavsif                           |
| ---------- | -------- | -------------------------------- |
| status     | Yo'q     | TODO, IN_PROGRESS, DONE, BLOCKED |
| priority   | Yo'q     | LOW, MEDIUM, HIGH, URGENT        |
| assigneeId | Yo'q     | Tayinlangan foydalanuvchi ID     |

**Response (200):**

```json
{
  "tasks": [
    {
      "id": "cuid",
      "title": "Vazifa nomi",
      "description": "Tavsif",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2026-07-25T00:00:00.000Z",
      "tags": ["frontend"],
      "createdAt": "2026-07-19T00:00:00.000Z",
      "assignee": { "id": "cuid", "name": "Ism", "avatar": null },
      "creator": { "id": "cuid", "name": "Ism", "avatar": null }
    }
  ]
}
```

---

### POST /api/tasks

Yangi vazifa yaratish.

**Auth talab:** Ha (x-company-id, x-user-id, x-user-role)
**Ruxsat:** CEO, MANAGER, DEVELOPER

**Request body:**

```json
{
  "title": "Vazifa nomi",
  "description": "Tavsif (ixtiyoriy)",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-07-25",
  "assigneeId": "user-id (ixtiyoriy)"
}
```

**Response (201):**

```json
{
  "task": {
    "id": "cuid",
    "title": "Vazifa nomi",
    "status": "TODO",
    "priority": "MEDIUM",
    "assignee": { "id": "cuid", "name": "Ism", "avatar": null },
    "creator": { "id": "cuid", "name": "Ism", "avatar": null }
  }
}
```

**Xatoliklar:**

- `400` — Validatsiya xatosi
- `401` — Ruxsatsiz kirish
- `403` — Ruxsat yo'q
- `500` — Server xatosi

---

### GET /api/tasks/[id]

Bitta vazifani olish.

**Auth talab:** Ha (x-company-id)

**Response (200):**

```json
{
  "id": "cuid",
  "title": "Vazifa nomi",
  "description": "Tavsif",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-07-25T00:00:00.000Z",
  "tags": [],
  "assignee": { "id": "cuid", "name": "Ism", "avatar": null },
  "creator": { "id": "cuid", "name": "Ism", "avatar": null }
}
```

**Xatoliklar:**

- `404` — Vazifa topilmadi

---

### PUT /api/tasks/[id]

Vazifani yangilash.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO, MANAGER, DEVELOPER

**Request body:** (POST bilan bir xil, barcha maydonlar ixtiyoriy)

**Response (200):** Yangilangan vazifa

---

### DELETE /api/tasks/[id]

Vazifani o'chirish.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO, MANAGER, DEVELOPER

**Response (200):**

```json
{
  "message": "Vazifa o'chirildi"
}
```

---

## Messages (Xabarlar)

### GET /api/messages

Xabarlar ro'yxatini olish.

**Auth talab:** Ha (x-company-id, x-user-id)

**Query parametrlari:**

| Parametr | Majburiy | Tavsif                             |
| -------- | -------- | ---------------------------------- |
| userId   | Yo'q     | Muayyan foydalanuvchi bilan suhbat |

**Response (200):**

```json
{
  "messages": [
    {
      "id": "cuid",
      "content": "Xabar matni",
      "read": false,
      "createdAt": "2026-07-19T00:00:00.000Z",
      "sender": { "id": "cuid", "name": "Ism", "avatar": null },
      "receiver": { "id": "cuid", "name": "Ism", "avatar": null }
    }
  ]
}
```

---

### POST /api/messages

Xabar yuborish.

**Auth talab:** Ha (x-company-id, x-user-id, x-user-role)
**Ruxsat:** Barcha rollar

**Request body:**

```json
{
  "receiverId": "qabul-qiluvchi-id",
  "content": "Xabar matni"
}
```

**Response (201):**

```json
{
  "message": {
    "id": "cuid",
    "content": "Xabar matni",
    "sender": { "id": "cuid", "name": "Ism", "avatar": null },
    "receiver": { "id": "cuid", "name": "Ism", "avatar": null }
  }
}
```

---

### GET /api/messages/conversations

Suhbatlar ro'yxatini olish.

**Auth talab:** Ha (x-company-id, x-user-id)

**Response (200):**

```json
{
  "conversations": [
    {
      "user": { "id": "cuid", "name": "Ism", "avatar": null },
      "lastMessage": "Oxirgi xabar",
      "lastMessageAt": "2026-07-19T00:00:00.000Z",
      "unread": 3
    }
  ]
}
```

---

## Users (Foydalanuvchilar)

### GET /api/users

Xodimlar ro'yxatini olish.

**Auth talab:** Ha (x-company-id)

**Response (200):**

```json
{
  "users": [
    {
      "id": "cuid",
      "email": "user@example.com",
      "name": "Ism Familiya",
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

Yangi xodim qo'shish.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO, MANAGER

**Request body:**

```json
{
  "email": "newuser@example.com",
  "name": "Yangi Foydalanuvchi",
  "role": "DEVELOPER",
  "phone": "+998901234567",
  "salary": 5000000,
  "salaryDueDate": "2026-07-25",
  "startDate": "2026-07-01"
}
```

**Response (201):** Yangilangan foydalanuvchi

**Xatoliklar:**

- `400` — Validatsiya xatosi, email/ism/rol majburiy
- `403` — Ruxsat yo'q

---

### GET /api/users/[id]

Bitta xodimni olish.

**Auth talab:** Ha (x-company-id)

**Response (200):**

```json
{
  "id": "cuid",
  "email": "user@example.com",
  "name": "Ism Familiya",
  "role": "DEVELOPER",
  "company": { "id": "cuid", "name": "Kompaniya" }
}
```

---

### PUT /api/users/[id]

Xodimni yangilash.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO, MANAGER

**Request body:** (POST bilan bir xil, barcha maydonlar ixtiyoriy)

**Response (200):** Yangilangan foydalanuvchi

---

### DELETE /api/users/[id]

Xodimni o'chirish.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO, MANAGER

**Response (200):**

```json
{
  "message": "Foydalanuvchi o'chirildi"
}
```

---

### GET /api/users/me

Joriy foydalanuvchi ma'lumotlarini olish.

**Auth talab:** Ha (Bearer token yoki cookie)

**Response (200):**

```json
{
  "user": {
    "id": "cuid",
    "name": "Ism Familiya",
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

**Xatoliklar:**

- `401` — Token yo'q yoki noto'g'ri
- `404` — Foydalanuvchi topilmadi

---

### POST /api/users/me/change-password

Parolni o'zgartirish.

**Auth talab:** Ha (Bearer token yoki cookie)

**Request body:**

```json
{
  "currentPassword": "joriy-parol",
  "newPassword": "yangi-parol"
}
```

**Response (200):**

```json
{
  "message": "Parol muvaffaqiyatli o'zgartirildi"
}
```

**Xatoliklar:**

- `400` — Joriy parol noto'g'ri, yangi parol 6 ta belgidan kam
- `401` — Token noto'g'ri
- `404` — Foydalanuvchi topilmadi

---

## Salary (Oylik)

### GET /api/salary

Oyliklar ro'yxatini olish.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO, MANAGER

**Query parametrlari:**

| Parametr | Majburiy | Tavsif                 |
| -------- | -------- | ---------------------- |
| userId   | Yo'q     | Muayyan foydalanuvchi  |
| status   | Yo'q     | PENDING, PAID, OVERDUE |

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
      "user": { "id": "cuid", "name": "Ism", "avatar": null }
    }
  ]
}
```

---

### POST /api/salary

Yangi oylik yaratish.

**Auth talab:** Ha (x-company-id, x-user-role)
**Ruxsat:** CEO

**Request body:**

```json
{
  "userId": "foydalanuvchi-id",
  "amount": 5000000,
  "dueDate": "2026-07-25"
}
```

**Response (201):** Yaratilgan oylik

**Xatoliklar:**

- `400` — Validatsiya xatosi
- `403` — Ruxsat yo'q

---

### GET /api/salary/[id]

Bitta oylikni olish.

**Auth talab:** Ha (x-company-id)

**Response (200):** Oylik ma'lumotlari

---

### PUT /api/salary/[id]

Oylikni yangilash.

**Auth talab:** Ha (x-company-id)

**Request body:**

```json
{
  "status": "PAID",
  "paidAt": "2026-07-19",
  "amount": 5500000,
  "dueDate": "2026-07-25"
}
```

**Response (200):** Yangilangan oylik

---

### POST /api/salary/pay/[id]

Oylikni to'langan deb belgilash.

**Auth talab:** Ha (x-company-id)

**Response (200):**

```json
{
  "id": "cuid",
  "status": "PAID",
  "paidAt": "2026-07-19T00:00:00.000Z"
}
```

---

## Companies (Kompaniyalar)

### GET /api/companies

Kompaniyalar ro'yxatini olish.

**Auth talab:** Yo'q

**Response (200):**

```json
{
  "companies": [
    {
      "id": "cuid",
      "name": "Kompaniya nomi",
      "industry": "IT",
      "description": "Tavsif",
      "_count": { "users": 10 }
    }
  ]
}
```

---

### POST /api/companies

Kompaniya yaratish.

**Auth talab:** Yo'q

**Request body:**

```json
{
  "name": "Yangi Kompaniya",
  "industry": "IT",
  "description": "Kompaniya tavsifi"
}
```

**Response (201):** Yaratilgan kompaniya

---

### PUT /api/companies

Kompaniyani yangilash.

**Auth talab:** Ha (x-user-role)
**Ruxsat:** CEO

**Request body:**

```json
{
  "id": "kompaniya-id",
  "name": "Yangi nom",
  "industry": "FinTech",
  "description": "Yangi tavsif"
}
```

**Response (200):** Yangilangan kompaniya

---

## Notifications (Ogohlantirishlar)

### GET /api/notifications

Ogohlantishlar ro'yxatini olish.

**Auth talab:** Ha (x-company-id, x-user-id)

**Query parametrlari:**

| Parametr   | Majburiy | Tavsif                       |
| ---------- | -------- | ---------------------------- |
| unreadOnly | Yo'q     | Faqat o'qilmaganlar (`true`) |

**Response (200):**

```json
{
  "notifications": [
    {
      "id": "cuid",
      "title": "Sarlavha",
      "message": "Xabar matni",
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

Ogohlantirish yaratish.

**Auth talab:** Ha (x-company-id)

**Request body:**

```json
{
  "userId": "foydalanuvchi-id",
  "title": "Ogohlantirish sarlavhasi",
  "message": "Ogohlantirish matni",
  "type": "TASK"
}
```

**Response (201):** Yaratilgan ogohlantirish

---

### PATCH /api/notifications

Ogohlantirishni o'qilgan deb belgilash.

**Auth talab:** Ha (x-company-id, x-user-id)

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

## Upload (Yuklash)

### POST /api/upload

Fayl yuklash.

**Auth talab:** Ha (x-company-id, x-user-id)

**Request body:** `multipart/form-data`

| Maydon | Tur  | Tavsif             |
| ------ | ---- | ------------------ |
| file   | File | Yuklanayotgan fayl |

**Ruxsat etilgan turlar:**

- image/jpeg, image/png, image/gif, image/webp
- application/pdf
- application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- text/plain

**Maksimal hajm:** 10MB

**Response (200):**

```json
{
  "url": "/uploads/1234567890-abc123.jpg",
  "name": "rasm.jpg",
  "size": 1024000,
  "type": "image/jpeg"
}
```

**Xatoliklar:**

- `400` — Fayl hajmi 10MB dan katta yoki ruxsatsiz tur
- `401` — Ruxsatsiz kirish
- `500` — Yuklash xatosi

---

## Xatolik formatlari

Barcha xatoliklar quyidagi formatda qaytariladi:

```json
{
  "error": "Xabar matni"
}
```

**Umumiy status kodlari:**

| Kod | Ma'nosi                                     |
| --- | ------------------------------------------- |
| 200 | Muvaffaqiyatli                              |
| 201 | Yaratildi                                   |
| 400 | Validatsiya xatosi                          |
| 401 | Autentifikatsiya xatosi                     |
| 403 | Ruxsat yo'q                                 |
| 404 | Topilmadi                                   |
| 409 | Konflikt (masalan, email allaqachon mavjud) |
| 500 | Server xatosi                               |
