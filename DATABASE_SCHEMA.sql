-- Tutor Bridge — PostgreSQL schema
-- Run this against a fresh database (e.g. `psql -d tutor_bridge -f DATABASE_SCHEMA.sql`)

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  profile_photo VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE otp_verifications (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  otp_code VARCHAR NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_tickets (
  ticket_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_messages (
  message_id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tuition_requests (
  request_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  class_level VARCHAR(100) NOT NULL,
  preferred_gender VARCHAR(10) NOT NULL DEFAULT 'any' CHECK (preferred_gender IN ('male', 'female', 'any')),
  budget DECIMAL(10,2) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  preferred_time VARCHAR(100),
  description TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tutor_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  cv_url VARCHAR,
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  passing_year INTEGER NOT NULL,
  years_experience INTEGER NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  verification_status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tuition_applications (
  application_id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES tuition_requests(request_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (request_id, tutor_id)
);

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES tuition_applications(application_id) ON DELETE CASCADE,
  pidx VARCHAR(64) UNIQUE,
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'completed', 'failed', 'expired', 'canceled')),
  transaction_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL UNIQUE REFERENCES tuition_requests(request_id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  booking_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'rejected')),
  rejection_reason TEXT
);

CREATE TABLE chats (
  chat_id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, tutor_id)
);

CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
