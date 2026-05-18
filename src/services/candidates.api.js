const API_URL = 'https://randomuser.me/api/?results=1&nat=ru';

const ROLES = [
  'Frontend-разработчик',
  'Backend-разработчик',
  'UI/UX-дизайнер',
  'HR-менеджер',
  'Project Manager',
  'QA-инженер',
  'DevOps-инженер',
  'Аналитик данных'
];

const SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'CSS',
  'TypeScript',
  'Figma',
  'Git',
  'SQL',
  'Подбор персонала',
  'Коммуникация'
];

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Екатеринбург',
  'Новосибирск',
  'Краснодар',
  'Нижний Новгород',
  'Самара'
];

const NOTES = [
  'Кандидат доступен для интервью',
  'Прошел первичный HR-скрининг',
  'Имеет релевантный опыт',
  'Рекомендуется к техническому интервью',
  'Высокий уровень soft skills'
];

const STATUSES = [
  'Активен',
  'В поиске',
  'Рассматривает предложения'
];

export async function fetchOneCandidate() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Ошибка загрузки кандидата');
    }

    const data = await response.json();
    const user = data.results[0];

    return {
      id: Date.now(),

      name: getRussianName(),

      role: randomItem(ROLES),

      city: randomItem(CITIES),

      status: randomItem(STATUSES),

      experience: getExperience(),

      salary: getSalary(),

      match: Math.floor(Math.random() * 25) + 75,

      note: randomItem(NOTES),

      skills: shuffle(SKILLS).slice(0, 4),

      email: user.email,

      phone: normalizePhone(user.phone)
    };

  } catch (error) {
    console.error(error);
    return null;
  }
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getSalary() {
  const from = 120 + Math.floor(Math.random() * 120);
  const to = from + 40;

  return `${from} 000 — ${to} 000 ₽`;
}

function getExperience() {
  const years = Math.floor(Math.random() * 6) + 1;

  if (years === 1) return '1 год';
  if (years < 5) return `${years} года`;

  return `${years} лет`;
}

function normalizePhone(phone) {
  return phone.replace('+7', '8');
}

const FIRST_NAMES = [
  'Александр',
  'Дмитрий',
  'Максим',
  'Андрей',
  'Иван',
  'Сергей',
  'Никита',
  'Алексей',
  'Мария',
  'Анна',
  'Екатерина',
  'Ольга',
  'Дарья',
  'Алина',
  'София',
  'Полина'
];

const LAST_NAMES = [
  'Иванов',
  'Петров',
  'Смирнов',
  'Кузнецов',
  'Попов',
  'Васильев',
  'Соколов',
  'Морозов',
  'Новиков',
  'Федоров',
  'Волкова',
  'Михайлова',
  'Козлова',
  'Лебедева',
  'Павлова',
  'Семенова'
];

function getRussianName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}