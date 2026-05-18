import { getHealth, getRecruitingData } from './api.js';
import { getRoute } from './router.js';
import { state, setTheme } from './state.js';
import { $, $$, showToast, syncTheme } from './utils.js';
import * as renderModule from './render.js';
import * as handlers from './handlers.js';

// ====================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ======================
const view = $('#view');
const navigation = $('#navigation');
const sidebar = $('#sidebar');
const menuButton = $('#menuButton');
const globalSearch = $('#globalSearch');
const authButton = $('#authButton');
const themeToggle = $('#themeToggle');

// ====================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======================

function syncAuthButton() {
  authButton.textContent = state.session ? state.session.name : 'Войти';
}

function setActiveNav() {
  $$('a', navigation).forEach(link => {
    link.classList.toggle('is-active', link.dataset.route === state.route);
  });
}

// ====================== ОСНОВНАЯ ФУНКЦИЯ РЕНДЕРА ======================

function render() {
  state.route = getRoute();
  setActiveNav();

  if (!state.data) {
    view.innerHTML = '<div class="empty-state"><p>Загрузка данных...</p></div>';
    return;
  }

  let html = '';

  switch (state.route) {
    case 'home':
      html = renderModule.renderHome();
      break;
    case 'vacancies':
      html = renderModule.renderVacancies();
      break;
    case 'candidates':
      html = renderModule.renderCandidates();
      break;
    case 'selection':
      html = renderModule.renderSelection();
      break;
    case 'calendar':
      html = renderModule.renderCalendar ? renderModule.renderCalendar() : '<p>Календарь в разработке</p>';
      break;;
    case 'companies':
      html = renderModule.renderCompanies ? renderModule.renderCompanies() : '<p>Компании в разработке</p>';
      break;
    case 'settings':
      html = renderModule.renderSettings ? renderModule.renderSettings() : '<p>Настройки в разработке</p>';
      break;
    default:
      html = renderModule.renderHome();
  }

  view.innerHTML = html;
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================

async function init() {
  // Темы и авторизация
  setTheme(state.theme);
  syncTheme();
  syncAuthButton();

  // Проверка API
  const health = await getHealth();
  console.log('HR Assistant:', health.ok ? 'API подключен' : 'Статический режим');

  // Загрузка данных
  try {
    state.data = await getRecruitingData();
     
    const savedEvents = JSON.parse(localStorage.getItem('hrassistant.events') || 'null');
    if (savedEvents) {
      state.data.events = savedEvents;
    }

  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    showToast('Не удалось загрузить данные');
  }

  // Первый рендер
  render();

  // ====================== ОБРАБОТЧИКИ СОБЫТИЙ ======================
  window.addEventListener('hashchange', render);

  document.addEventListener('click', handlers.handleDocumentClick);
  document.addEventListener('submit', handlers.handleSubmit);
  
  // Поиск
  globalSearch.addEventListener('input', (e) => {
    state.search = e.target.value;
    render();
  });

  // Фильтры
  document.addEventListener('change', (e) => {
    if (e.target.dataset.filter) {
      state.vacancyFilter[e.target.dataset.filter] = e.target.value;
      render();
    }
    if (e.target.dataset.candidateFilter) {
      state.candidateFilter[e.target.dataset.candidateFilter] = e.target.value;
      render();
    }
  });

  // Выбор роли в модалке
  document.addEventListener('click', (e) => {
    if (e.target.closest('.role-card')) {
      handlers.handleRoleSelection(e);
    }
  });

  // Мобильное меню
  menuButton.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
  });

  navigation.addEventListener('click', () => {
    sidebar.classList.remove('is-open');
  });

  // Переключение темы
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(state.theme);
    syncTheme();
  });

  console.log('✅ HR Assistant успешно инициализирован');
}

// Запуск приложения
init();