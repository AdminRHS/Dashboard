-- Yellow Card Dashboard - PostgreSQL Database Schema
-- Автоматично виконується при першому запуску PostgreSQL контейнера

-- Таблиця співробітників
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    dept VARCHAR(100),
    email VARCHAR(255),
    discord_id VARCHAR(100),
    avatar TEXT,
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration: add avatar column if missing (idempotent, for existing DBs)
-- Run once after deploy if table already exists
-- ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Таблиця порушень (жовті картки)
CREATE TABLE IF NOT EXISTS violations (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Documentation', 'Workflow', 'Communication')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця зелених карток (позитивні відзнаки)
CREATE TABLE IF NOT EXISTS green_cards (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для оптимізації запитів
CREATE INDEX IF NOT EXISTS idx_violations_employee_id ON violations(employee_id);
CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(date DESC);
CREATE INDEX IF NOT EXISTS idx_green_cards_employee_id ON green_cards(employee_id);
CREATE INDEX IF NOT EXISTS idx_green_cards_date ON green_cards(date DESC);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);

-- Додатковий індекс для швидкого пошуку за email
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email) WHERE email IS NOT NULL;
