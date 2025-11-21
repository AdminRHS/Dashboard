# 🟡 Yellow Card Dashboard

Веб-додаток для відстеження жовтих карток співробітників компанії. Система дозволяє менеджерам видавати жовті картки за порушення, відстежувати статистику та керувати командою.

## 🚀 Живий сайт

- **GitHub Pages**: [https://adminrhs.github.io/Dashboard/](https://adminrhs.github.io/Dashboard/)
- **Vercel API**: [https://dashboard-eight-beta-59.vercel.app/api/update-data](https://dashboard-eight-beta-59.vercel.app/api/update-data)

## ✨ Функції

- 📊 **Статистика порушень** - відстеження жовтих карток по співробітниках
- 📅 **Календар порушень** - візуалізація порушень по датах
- 🏆 **Рейтинг команди** - топ співробітників та статистика
- 🌙 **Темна тема** - підтримка світлої та темної теми
- 💾 **Локальне збереження** - OPFS для офлайн роботи
- 🔄 **Синхронізація** - автоматичне оновлення з GitHub

## 🏗️ Архітектура

```
Frontend (GitHub Pages) → Vercel API → GitHub Actions → GitHub Repository
```

### Компоненти:
- **Frontend**: Статичний HTML/JS/CSS сайт
- **API Layer**: Vercel serverless functions
- **Data Storage**: GitHub repository (data.json)
- **Automation**: GitHub Actions workflows
- **Hosting**: GitHub Pages

## 📁 Структура проекту

```
Dashboard/
├── index.html                 # Основний файл додатку
├── data.json                  # База даних співробітників
├── vercel.json               # Конфігурація Vercel
├── api/
│   └── update-data.js        # API endpoint для оновлення даних
├── .github/
│   └── workflows/
│       ├── update-data-dispatch.yml  # Workflow для оновлення data.json
│       └── sync-data-json.yml        # Workflow для синхронізації
├── logo_hor_light.png        # Логотип (світла тема)
├── logo_hor_dark.png         # Логотип (темна тема)
├── Logo.svg                  # Основний логотип
├── Logo_dark.svg            # Логотип для темної теми
└── discord_2.png            # Discord іконка
```

## 🛠️ Технології

### Frontend
- **HTML5** - структура
- **CSS3** - стилізація
- **JavaScript (ES6+)** - логіка
- **Tailwind CSS** - CSS фреймворк
- **Lucide Icons** - іконки

### Backend
- **Vercel Functions** - serverless API
- **Node.js** - runtime
- **GitHub API** - інтеграція з GitHub

### DevOps
- **GitHub Actions** - автоматизація
- **GitHub Pages** - хостинг
- **Vercel** - API hosting

## 📊 Структура даних

### Employee Object
```json
{
  "name": "Ім'я Прізвище",
  "role": "посада",
  "dept": "відділ",
  "email": "email@example.com",
  "discordId": "username#1234",
  "violations": [
    {
      "date": "2025-01-15",
      "type": "Documentation|Workflow|Communication",
      "comment": "опис порушення"
    }
  ],
  "joinDate": "2025-01-01"
}
```

### Типи порушень:
- **Documentation** - проблеми з документацією
- **Workflow** - порушення робочих процесів
- **Communication** - проблеми з комунікацією

## 🚀 Швидкий старт

### 1. Клонування репозиторію
```bash
git clone https://github.com/AdminRHS/Dashboard.git
cd Dashboard
```

### 2. Встановлення залежностей
```bash
npm install
```

### 3. Локальний запуск (Vite)
```bash
npm run dev
# Відкрити http://localhost:5173
```

### 4. Збірка для продакшену
```bash
npm run build
# Для перевірки
npm run preview
```

## 📚 Документація

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Повна документація проекту
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Архітектура системи
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API документація
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Гайд по деплою
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Вирішення проблем

## 🔧 Налаштування

### Environment Variables (Vercel)
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=AdminRHS
GITHUB_REPO=Dashboard
```

### GitHub Token
- **Тип**: Personal Access Token (classic)
- **Права**: `repo` (повний доступ до репозиторіїв)
- **Зберігання**: Vercel Environment Variables

## 🔄 Workflow

### Видача жовтої картки
1. Користувач натискає "Give Yellow Card"
2. Заповнює форму (співробітник, тип порушення, коментар)
3. JavaScript збирає дані
4. Відправляє POST запит на Vercel API
5. Vercel API валідує дані
6. Запускає GitHub Actions workflow
7. Workflow оновлює data.json
8. GitHub Pages автоматично оновлюється

### Завантаження даних
1. GitHub Pages (data.json?v=timestamp) - основний джерело
2. OPFS (локальне збереження) - fallback

## 🚨 Troubleshooting

### Поширені проблеми:
- **API не працює** - перевірити URL та токен
- **Дані не оновлюються** - жорстке оновлення (Ctrl+Shift+R)
- **GitHub Actions не запускається** - перевірити права токена
- **Локальні дані не синхронізуються** - очистити OPFS

Дивіться [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) для детальних рішень.

## 📈 Моніторинг

### Vercel Logs
- **Functions** → **update-data** → **Logs**
- Показує всі запити до API

### GitHub Actions Logs
- **Actions** → **Update data.json via API**
- Показує виконання workflow

### Browser Console
- JavaScript помилки
- API запити (Network tab)

## 🔐 Безпека

- **GitHub Token** - зберігається в Vercel Environment Variables
- **HTTPS** - всі з'єднання зашифровані
- **Input Validation** - JSON schema validation
- **Rate Limiting** - Vercel + GitHub limits

## 🤝 Внесок

1. Fork проекту
2. Створити feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Відкрити Pull Request

## 📝 Ліцензія

Цей проект розповсюджується під ліцензією MIT. Дивіться `LICENSE` для деталей.

## 👨‍💻 Автор

**Matviy Zasyadko**
- GitHub: [@MatviyZasyadko](https://github.com/MatviyZasyadko)

## 🙏 Подяки

- [Vercel](https://vercel.com/) - за безкоштовний хостинг API
- [GitHub](https://github.com/) - за Pages та Actions
- [Tailwind CSS](https://tailwindcss.com/) - за CSS фреймворк
- [Lucide](https://lucide.dev/) - за іконки

---

**Версія**: 1.0.0  
**Останнє оновлення**: 2025-01-15