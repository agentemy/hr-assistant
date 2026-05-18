export const roles = [
  {
    id: 'candidate',
    title: 'Кандидат',
    description: 'Отклики, резюме, приглашения и сохраненные вакансии.'
  },
  {
    id: 'employer',
    title: 'Работодатель',
    description: 'Создание вакансий, работа с откликами и командой.'
  },
  {
    id: 'recruiter',
    title: 'Рекрутер',
    description: 'Воронка отбора, кандидаты, заметки и аналитика найма.'
  }
];

export const stageOrder = ['Новые', 'Скрининг', 'Интервью', 'Тестовое', 'Оффер', 'Нанят'];

export const state = {
  data: null,
  route: 'home',
  search: '',
  vacancyFilter: {
    city: 'Все',
    format: 'Все',
    experience: 'Все',
    category: 'Все',
    sort: 'Новые'
  },
  candidateFilter: {
    city: 'Все',
    status: 'Все',
    sort: 'Совпадение'
  },
  session: JSON.parse(localStorage.getItem('hrassistant.session') || 'null'),
  theme: localStorage.getItem('hrassistant.theme') || 'light',
  savedCandidates: JSON.parse(localStorage.getItem('hrassistant.savedCandidates') || '[]'),
  savedVacancies: JSON.parse(localStorage.getItem('hrassistant.savedVacancies') || '[]')
};

export function setSession(session) {
  state.session = session;
  localStorage.setItem('hrassistant.session', JSON.stringify(session));
}

export function clearSession() {
  state.session = null;
  localStorage.removeItem('hrassistant.session');
}

export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('hrassistant.theme', theme);
  document.documentElement.dataset.theme = theme;
}

export function toggleListValue(key, value) {
  const list = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  if (list.has(value)) list.delete(value);
  else list.add(value);
  const result = [...list];
  localStorage.setItem(key, JSON.stringify(result));
  return result;
}
