# Nescom

Kompaniya boshqaruv tizimi — xodimlarni, vazifalarni, oyliklarni va kommunikatsiyani bir joydan boshqaring.

## Xususiyatlar

- **Dashboard** — kompaniya statistikasi, grafiklar, tezkor ma'lumotlar
- **Tasks** — vazifalar yaratish, tayinlash, status boshqarish (Kanban uslubi)
- **Messages** — xodimlararo chat, suhbatlar tarixi
- **Employees** — xodimlar ro'yxati, profil ma'lumotlari, rol boshqaruvi
- **Salary** — oylik to'lovlari, taqdirlash kalendar, bonus/chiqimlar
- **Settings** — kompaniya ma'lumotlari, profil sozlamalari
- **Notifications** — real-time ogohlantirishlar (vazifa, xabar, oylik)
- **File Upload** — hujjatlar yuklash (rasm, PDF, Word, Excel)

## Texnologiyalar

| Texnologiya  | Versiya | Maqsad                 |
| ------------ | ------- | ---------------------- |
| Next.js      | 16      | Framework (App Router) |
| React        | 19      | UI komponentlari       |
| Prisma       | 7       | ORM, DB migration      |
| PostgreSQL   | 16      | Ma'lumotlar bazasi     |
| Tailwind CSS | 4       | Styling                |
| Zod          | 4       | Schema validation      |
| bcryptjs     | 3       | Parol hashlash         |
| jsonwebtoken | 9       | JWT autentifikatsiya   |
| Recharts     | 3       | Grafiklar              |
| lucide-react | 1       | Iconlar                |

## O'rnatish

### Talablar

- Node.js 18+
- PostgreSQL 14+
- npm yoki yarn

### O'rnatish qadamlari

```bash
# 1. Repositoriyani clone qiling
git clone https://github.com/your-username/company-hub.git
cd company-hub

# 2. Kutubxonalarni o'rnating
npm install

# 3. .env faylini yarating
cp .env.example .env
# yoki to'g'ridan-to'g'ri yarating:
```

### .env fayli

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/companyhub"

# JWT
JWT_SECRET="your-super-secret-key-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database sozlash

```bash
# Migrationlarni qo'llash
npx prisma migrate dev

# Boshlang'ich ma'lumotlarni qo'shish (ixtiyoriy)
npx tsx prisma/seed.ts

# Prisma Client generatsiya qilish
npx prisma generate
```

### Loyihani ishga tushirish

```bash
# Development rejimida
npm run dev

# Production build
npm run build
npm start
```

Brauzerda `http://localhost:3000` oching.

## Environment Variables

| O'zgaruvchi           | Majburiy | Tavsif                                         |
| --------------------- | -------- | ---------------------------------------------- |
| `DATABASE_URL`        | Ha       | PostgreSQL ulanish URL'i                       |
| `JWT_SECRET`          | Ha       | JWT tokenlarini imzolash uchun maxfiy kalit    |
| `NODE_ENV`            | Yo'q     | `development` yoki `production`                |
| `NEXT_PUBLIC_APP_URL` | Yo'q     | Ilova URL'i (default: `http://localhost:3000`) |

## API Endpoint'lari

### Auth (Autentifikatsiya)

| Endpoint             | Method | Tavsif            |
| -------------------- | ------ | ----------------- |
| `/api/auth/register` | POST   | Ro'yxatdan o'tish |
| `/api/auth/login`    | POST   | Tizimga kirish    |
| `/api/auth/logout`   | POST   | Tizimdan chiqish  |

### Tasks (Vazifalar)

| Endpoint          | Method | Tavsif             |
| ----------------- | ------ | ------------------ |
| `/api/tasks`      | GET    | Vazifalar ro'yxati |
| `/api/tasks`      | POST   | Vazifa yaratish    |
| `/api/tasks/[id]` | GET    | Bitta vazifa       |
| `/api/tasks/[id]` | PUT    | Vazifani yangilash |
| `/api/tasks/[id]` | DELETE | Vazifani o'chirish |

### Messages (Xabarlar)

| Endpoint                      | Method | Tavsif             |
| ----------------------------- | ------ | ------------------ |
| `/api/messages`               | GET    | Xabarlar ro'yxati  |
| `/api/messages`               | POST   | Xabar yuborish     |
| `/api/messages/conversations` | GET    | Suhbatlar ro'yxati |

### Users (Foydalanuvchilar)

| Endpoint                        | Method | Tavsif               |
| ------------------------------- | ------ | -------------------- |
| `/api/users`                    | GET    | Xodimlar ro'yxati    |
| `/api/users`                    | POST   | Yangi xodim qo'shish |
| `/api/users/[id]`               | GET    | Bitta xodim          |
| `/api/users/[id]`               | PUT    | Xodimni yangilash    |
| `/api/users/[id]`               | DELETE | Xodimni o'chirish    |
| `/api/users/me`                 | GET    | Joriy foydalanuvchi  |
| `/api/users/me/change-password` | POST   | Parolni o'zgartirish |

### Salary (Oylik)

| Endpoint               | Method | Tavsif            |
| ---------------------- | ------ | ----------------- |
| `/api/salary`          | GET    | Oyliklar ro'yxati |
| `/api/salary`          | POST   | Oylik yaratish    |
| `/api/salary/[id]`     | GET    | Bitta oylik       |
| `/api/salary/[id]`     | PUT    | Oylikni yangilash |
| `/api/salary/pay/[id]` | POST   | Oylikni to'lash   |

### Companies (Kompaniyalar)

| Endpoint         | Method | Tavsif                |
| ---------------- | ------ | --------------------- |
| `/api/companies` | GET    | Kompaniyalar ro'yxati |
| `/api/companies` | POST   | Kompaniya yaratish    |
| `/api/companies` | PUT    | Kompaniyani yangilash |

### Notifications (Ogohlantirishlar)

| Endpoint             | Method | Tavsif                                 |
| -------------------- | ------ | -------------------------------------- |
| `/api/notifications` | GET    | Ogohlantirishlar ro'yxati              |
| `/api/notifications` | POST   | Ogohlantirish yaratish                 |
| `/api/notifications` | PATCH  | Ogohlantirishni o'qilgan deb belgilash |

### Upload (Yuklash)

| Endpoint      | Method | Tavsif                  |
| ------------- | ------ | ----------------------- |
| `/api/upload` | POST   | Fayl yuklash (max 10MB) |

## Rollar va Ruxsatlar

| Roli      | Vazifalar   | Xodimlar    | Oylik       | Xabarlar | Kompaniya |
| --------- | ----------- | ----------- | ----------- | -------- | --------- |
| CEO       | ✅ Barchasi | ✅ Barchasi | ✅ Barchasi | ✅       | ✅        |
| Manager   | ✅ CRUD     | 📖 O'qish   | 📖 O'qish   | ✅       | ❌        |
| Developer | ✅ CRUD     | ❌          | 📖 O'qish   | ✅       | ❌        |
| Designer  | ✅ CRUD     | ❌          | 📖 O'qish   | ✅       | ❌        |
| Marketer  | ✅ CRUD     | ❌          | 📖 O'qish   | ✅       | ❌        |

## Loyiha tuzilishi

```
company-hub/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts             # Boshlang'ich ma'lumotlar
│   └── migrations/         # Migration fayllari
├── src/
│   ├── app/
│   │   ├── api/            # API endpoint'lari
│   │   ├── (auth)/         # Auth sahifalari
│   │   └── (dashboard)/    # Dashboard sahifalari
│   ├── components/         # React komponentlari
│   ├── contexts/           # React context'lar
│   ├── hooks/              # Custom hook'lar
│   └── lib/                # Yordamchi kutubxonalar
│       ├── auth.ts         # JWT autentifikatsiya
│       ├── prisma.ts       # Prisma client
│       ├── rbac.ts         # Rollarga asoslangan ruxsat
│       ├── roles.ts        # Rol konfiguratsiyasi
│       ├── utils.ts        # Yordamchi funksiyalar
│       └── validation.ts   # Zod validation
├── public/                 # Statik fayllar
├── .env                    # Environment variables
├── package.json
└── tsconfig.json
```

## Deployment

### Vercel

1. GitHub repositoriyangizni Vercel'ga ulang
2. Environment variables qo'shing
3. Deploy tugmasini bosing

```bash
# Vercel CLI bilan
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Docker build va run
docker build -t company-hub .
docker run -p 3000:3000 company-hub
```

## Qo'shishga hissa qo'shish

CONTRIBUTING.md faylini o'qing.

## Litsensiya

MIT License — batafsil LICENSE faylida.
