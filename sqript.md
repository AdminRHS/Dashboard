# SQL Script для створення таблиці green_cards

## Опис
Цей скрипт створює таблицю `green_cards` для зберігання зелених карток співробітників. Таблиця має аналогічну структуру до таблиці `violations`, але призначена для позитивних відзнак.

## Структура таблиці

```sql
-- Створення таблиці green_cards з явним зв'язком до employees
CREATE TABLE IF NOT EXISTS green_cards (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Foreign Key constraint для зв'язку з таблицею employees
    CONSTRAINT fk_green_cards_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);
```

## Індекси для оптимізації

```sql
-- Індекс на employee_id для швидких JOIN операцій
CREATE INDEX IF NOT EXISTS idx_green_cards_employee_id 
ON green_cards(employee_id);

-- Індекс на date для швидкого пошуку за датою
CREATE INDEX IF NOT EXISTS idx_green_cards_date 
ON green_cards(date);

-- Композитний індекс для оптимізації запитів по співробітнику та даті
CREATE INDEX IF NOT EXISTS idx_green_cards_employee_date 
ON green_cards(employee_id, date DESC);
```

## Повний скрипт для виконання

```sql
-- ============================================
-- SQL Script: Створення таблиці green_cards
-- База даних: PostgreSQL
-- Дата створення: 2025-11-13
-- ============================================

-- Перевірка існування таблиці employees (обов'язкова для foreign key)
-- Якщо таблиця employees не існує, спочатку створіть її:
/*
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    dept VARCHAR(100),
    email VARCHAR(100),
    discord_id VARCHAR(100),
    join_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
*/

-- Створення таблиці green_cards з явним зв'язком до employees
CREATE TABLE IF NOT EXISTS green_cards (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Явний Foreign Key constraint для зв'язку з таблицею employees
    CONSTRAINT fk_green_cards_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Створення індексів для оптимізації запитів

-- Індекс на employee_id для швидких JOIN операцій
CREATE INDEX IF NOT EXISTS idx_green_cards_employee_id 
ON green_cards(employee_id);

-- Індекс на date для швидкого пошуку за датою
CREATE INDEX IF NOT EXISTS idx_green_cards_date 
ON green_cards(date);

-- Композитний індекс для оптимізації запитів по співробітнику та даті
CREATE INDEX IF NOT EXISTS idx_green_cards_employee_date 
ON green_cards(employee_id, date DESC);

-- Коментарі до таблиці та колонок
COMMENT ON TABLE green_cards IS 'Таблиця для зберігання зелених карток (позитивних відзнак) співробітників. Пов''язана з таблицею employees через Foreign Key';
COMMENT ON COLUMN green_cards.id IS 'Унікальний ідентифікатор зеленої картки';
COMMENT ON COLUMN green_cards.employee_id IS 'ID співробітника (Foreign Key до employees.id, автоматично видаляється при видаленні співробітника)';
COMMENT ON COLUMN green_cards.date IS 'Дата видачі зеленої картки';
COMMENT ON COLUMN green_cards.type IS 'Тип зеленої картки (Achievement, Recognition, Documentation, Workflow, Communication)';
COMMENT ON COLUMN green_cards.comment IS 'Коментар або опис зеленої картки';
COMMENT ON COLUMN green_cards.created_at IS 'Дата та час створення запису';
```

## Типи зелених карток

Допустимі значення для поля `type`:
- `Achievement` - Досягнення
- `Recognition` - Визнання
- `Documentation` - Документація
- `Workflow` - Робочий процес
- `Communication` - Комунікація

## Приклади використання

### Додати зелену картку
```sql
INSERT INTO green_cards (employee_id, date, type, comment)
VALUES (1, '2025-11-13', 'Achievement', 'Відмінна робота над проектом');
```

### Отримати всі зелені картки співробітника
```sql
SELECT gc.*, e.name as employee_name
FROM green_cards gc
JOIN employees e ON gc.employee_id = e.id
WHERE gc.employee_id = 1
ORDER BY gc.date DESC;
```

### Отримати статистику зелених карток
```sql
SELECT 
    COUNT(*) as total_green_cards,
    COUNT(DISTINCT employee_id) as employees_with_cards,
    COUNT(CASE WHEN type = 'Achievement' THEN 1 END) as achievement_cards,
    COUNT(CASE WHEN type = 'Recognition' THEN 1 END) as recognition_cards
FROM green_cards;
```

### Видалити зелену картку
```sql
DELETE FROM green_cards WHERE id = 1;
```

## Зв'язок з таблицею employees

Таблиця `green_cards` пов'язана з таблицею `employees` через Foreign Key constraint:
- **Поле зв'язку**: `employee_id` → `employees.id`
- **Назва constraint**: `fk_green_cards_employee`
- **ON DELETE CASCADE**: При видаленні співробітника автоматично видаляються всі його зелені картки
- **ON UPDATE CASCADE**: При зміні ID співробітника автоматично оновлюється `employee_id` в зелені картки

### Важливо!
Перед створенням таблиці `green_cards` переконайтеся, що таблиця `employees` вже існує в базі даних. Якщо таблиця `employees` не існує, спочатку створіть її:

```sql
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    dept VARCHAR(100),
    email VARCHAR(100),
    discord_id VARCHAR(100),
    join_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Примітки

- Таблиця використовує `ON DELETE CASCADE` для автоматичного видалення зелених карток при видаленні співробітника
- Таблиця використовує `ON UPDATE CASCADE` для автоматичного оновлення `employee_id` при зміні ID співробітника
- Foreign Key constraint забезпечує цілісність даних - неможливо додати зелену картку для неіснуючого співробітника
- Всі індекси створюються з `IF NOT EXISTS` для безпечного повторного виконання скрипту
- Поле `created_at` автоматично заповнюється поточною датою та часом при створенні запису

