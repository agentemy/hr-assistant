# HR Assistant

Курсовой проект сайта для HR-рекрутинга с упором на отбор персонала, вакансии, кандидатов, воронку найма и небольшую аналитику рекрутинга.

## Используемые технологии

- HTML5
- CSS3
- JavaScript ES6+
- Node.js
- npm
- Express API
- JSON

## Цвета проекта

- Акцентный: `#1C37BD`
- Фон: `#DADADA`
- Текст: `#000416`

## Структура проекта

```text
/
├── index.html
├── 404.html
├── CNAME
├── package.json
├── server.js
├── ecosystem.config.cjs
└── src
    ├── index.js
    ├── api.js
    ├── router.js
    ├── state.js
    ├── data
    │   └── recruiting.json
    ├── assets
    │   └── icons
    ├── styles
    │   ├── base.css
    │   ├── variables.css
    │   ├── reset.css
    │   └── utilities.css
    └── blocks
        ├── layout
        ├── sidebar
        ├── topbar
        ├── button
        ├── card
        ├── hero
        ├── auth
        ├── form
        ├── vacancy
        ├── candidate
        ├── funnel
        ├── analytics
        ├── modal
        ├── theme-toggle
        ├── table
        └── empty-state
```

## Что реализовано

- Главная страница HR-системы
- Авторизация с выбором типа профиля
- Типы профиля: кандидат, работодатель, рекрутер
- Создание вакансии
- Каталог вакансий
- Фильтрация и сортировка вакансий
- База кандидатов
- Фильтрация кандидатов
- Воронка отбора персонала
- Перемещение кандидатов по этапам
- Небольшая HR-аналитика
- Компании
- Сообщения
- Календарь
- Светлая и темная темы
- Работа через API на Node.js
- Статический режим для GitHub Pages через JSON

## Локальный запуск

```bash
npm install
npm start
```

Сайт откроется на:

```text
http://127.0.0.1:8030
```

Проверка API:

```bash
curl http://127.0.0.1:8030/api/health
```

## Размещение в /var/www/hrassistant.ru

Загрузите архив в папку:

```bash
/var/www/hrassistant.ru
```

Распакуйте:

```bash
cd /var/www/hrassistant.ru
unzip -o hrassistant_reorganized.zip
```

Установите зависимости:

```bash
npm install
```

Запустите через PM2 на порту 8030:

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

После команды `pm2 startup` терминал покажет отдельную команду с `sudo`. Ее нужно скопировать и выполнить.

Проверка:

```bash
curl http://127.0.0.1:8030/api/health
```

## Nginx для hrassistant.ru

Создайте конфиг:

```bash
sudo nano /etc/nginx/sites-available/hrassistant.ru
```

Вставьте:

```nginx
server {
    listen 80;
    server_name hrassistant.ru www.hrassistant.ru;

    root /var/www/hrassistant.ru;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8030;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Активируйте сайт:

```bash
sudo ln -s /etc/nginx/sites-available/hrassistant.ru /etc/nginx/sites-enabled/hrassistant.ru
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS через Certbot

Установите Certbot:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

Получите сертификат:

```bash
sudo certbot --nginx -d hrassistant.ru -d www.hrassistant.ru
```

Если `www.hrassistant.ru` не настроен в DNS, используйте только основной домен:

```bash
sudo certbot --nginx -d hrassistant.ru
```

Проверка автообновления:

```bash
sudo certbot renew --dry-run
```

## GitHub Pages

Проект может работать как статический сайт. Для GitHub Pages достаточно залить в репозиторий:

- `index.html`
- `404.html`
- `CNAME`
- папку `src`

На GitHub Pages Node.js API не запускается, поэтому сайт автоматически берет данные из:

```text
/src/data/recruiting.json
```

Если хотите открыть проект на домене `hrassistant.ru` через GitHub Pages, домен должен быть направлен на GitHub Pages. Если домен направлен на VPS, тогда `hrassistant.ru` будет открываться с сервера, а GitHub Pages лучше оставить на техническом адресе репозитория.

## Свободный порт

В проекте используется порт `8030`, потому что порты `8000`, `8001`, `8010`, `8020` уже заняты.

### Темная тема

Темная тема вынесена в `src/styles/dark-theme.css`. В ней все SVG-иконки, тексты и обводки кнопок переводятся в белый цвет, чтобы интерфейс был читаемым на темном фоне.
