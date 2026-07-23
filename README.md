# Tutor Bridge

Tutor Bridge is a full-stack tutoring marketplace that connects **students** looking for tutors with **tutors** looking for students — without brokers, middlemen, or hidden fees. Students post what they need, verified tutors apply, students pick and pay a small booking fee, an admin gives the final approval, and both sides get a live chat and a review system to close the loop.

Built as a complete end-to-end platform: registration with OTP verification, role-based dashboards, tutor profile verification, a real booking + payment flow (Khalti), real-time notifications over WebSockets, in-app chat, and an admin panel to run the whole thing.

## How it works

1. **Student** posts a tuition request (subject, level, location, budget, schedule).
2. Every **tutor** on the platform is notified instantly and can apply — but only after their tutor profile (CV, education, experience) has been verified by an **admin**.
3. The student reviews applicants and **books** a tutor, paying a small confirmation fee through **Khalti**.
4. The booking lands in the **admin's** queue for final approval. Once approved, both the student and tutor are notified and can **message each other directly** in-app.
5. After the session, the student can **rate and review** the tutor — editable or removable any time.

Every step in this flow pushes a **real-time notification** (Socket.IO) to whoever needs to see it next.

## Tech Stack

**Frontend** — React 19 + Vite, React Router, Axios, Socket.IO client, react-hot-toast
**Backend** — Node.js + Express 5, PostgreSQL (`pg`), JWT auth, Socket.IO, Multer + Cloudinary (file uploads), Nodemailer (OTP emails), bcrypt
**Payments** — Khalti ePayment (KPG-2)
**Architecture** — MVC on the backend (`routes → controllers → models`), with a thin `services/` layer for third-party integrations (Cloudinary, email, Khalti, Socket.IO)

## Features

- **Auth** — registration with email OTP verification, login, forgot/reset password, change password
- **Role-based dashboards** — separate experiences for Student, Tutor, and Admin
- **Tuition requests** — students post requests; tutors browse and apply
- **Tutor profiles** — CV upload, education, experience, skills; admin approves/rejects with a reason
- **Bookings & payments** — student books and pays via Khalti; admin gives final approval or rejection (with reason)
- **My Requests / My Applications / My Booking** — full status tracking for both sides of a booking
- **My Tutor / My Student** — once booked, each side sees the other with an in-app chat thread
- **Reviews & ratings** — students rate/review their tutor; editable and deletable
- **Support tickets** — students/tutors raise issues, admin resolves them
- **Real-time notifications** — Socket.IO push + in-app bell dropdown for every key event (new request, new applicant, payment confirmed, booking approved)
- **Admin tools** — manage users, manage tutor profile verifications, manage bookings, manage support tickets

## Project Structure

```
tutor-bridge-web/
├── backend/
│   ├── config/          # DB (Postgres) and Cloudinary config
│   ├── routes/          # Express routers
│   ├── controllers/     # Request handlers (business logic)
│   ├── models/          # SQL queries (pg)
│   ├── middleware/       # JWT auth, role guards, file upload
│   ├── services/        # Cloudinary, email, Khalti, Socket.IO
│   └── server.js         # App entry point
└── frontend/
    └── src/
        ├── pages/         # Route-level page components
        ├── component/     # Shared/reusable components (navbars, modals, chat, reviews)
        ├── service/       # Api.jsx (Axios) and socket.js (Socket.IO client)
        └── utils/         # Small helpers (role-based routing, etc.)
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a connection string to one)
- A Cloudinary account (for CV/profile photo uploads)
- A Khalti merchant account (sandbox is fine — [test-admin.khalti.com](https://test-admin.khalti.com))
- A Gmail (or SMTP) account for sending OTP emails

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=tutor_bridge
DB_PASSWORD=your_db_password
DB_PORT=5432

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

JWT_SECRET=some_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

KHALTI_BASE_URL=https://dev.khalti.com/api/v2
KHALTI_SECRET_KEY=your_khalti_test_secret_key

FRONTEND_URL=http://localhost:5173
```

Run the tables in `DATABASE_SCHEMA.sql` (or your own migration) against your Postgres database, then:

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_BASE_URL=http://localhost:3000
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Author

Built by Amrit Chand Thakuri.
