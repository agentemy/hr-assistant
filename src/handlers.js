// src/handlers.js
import { state, toggleListValue, stageOrder, setTheme, clearSession } from './state.js';
import { createVacancy, updateVacancy, deleteVacancy } from './api.js';
import { fetchOneCandidate } from './services/candidates.api.js';
import { showToast, openModal, closeModal, text, escapeHtml, syncTheme } from './utils.js';
import { go } from './router.js';


// ====================== ФИЛЬТРЫ ======================

export function getAllVacancies() {
  const local = JSON.parse(localStorage.getItem('hrassistant.vacancies') || '[]');
  const base = state.data?.vacancies || [];

  const map = new Map();

  [...base, ...local].forEach(vacancy => {
    map.set(Number(vacancy.id), vacancy);
  });

  return [...map.values()];
}

function findVacancyById(id) {
  return getAllVacancies().find(v => Number(v.id) === Number(id));
}

export function getFilteredVacancies() {
  let vacancies = getAllVacancies();
  const q = text(state.search);

  vacancies = vacancies.filter(item => {
    const searchText = `${item.title} ${item.company} ${item.city} ${(item.skills || []).join(' ')}`;
    return !q || text(searchText).includes(q);
  });

  if (state.vacancyFilter.sort === 'Отклики') {
    vacancies.sort((a, b) => (b.responses || 0) - (a.responses || 0));
  }

  if (state.vacancyFilter.sort === 'Просмотры') {
    vacancies.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  if (state.vacancyFilter.sort === 'Новые') {
    vacancies.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  return vacancies.filter(item => {
    const matchesCity = state.vacancyFilter.city === 'Все' || item.city === state.vacancyFilter.city;
    const matchesFormat = state.vacancyFilter.format === 'Все' || item.format === state.vacancyFilter.format;
    const matchesExperience = state.vacancyFilter.experience === 'Все' || item.experience === state.vacancyFilter.experience;

    return matchesCity && matchesFormat && matchesExperience;
  });
}

export function getFilteredCandidates() {
  let candidates = state.data?.candidates || [];
  const q = text(state.search);

  // кандидаты из воронки
  const pipeline = JSON.parse(localStorage.getItem('hrassistant.pipeline') || 'null')
    || state.data?.pipeline
    || [];

  const pipelineNames = pipeline.map(item =>
    String(item.candidate || '').toLowerCase().trim()
  );

  // скрываем кандидатов уже находящихся в воронке
  candidates = candidates.filter(candidate => {
    const name = String(candidate.name || '').toLowerCase().trim();
    return !pipelineNames.includes(name);
  });

  // поиск и фильтры
  candidates = candidates.filter(item => {
    const searchText = `${item.name} ${item.role} ${item.city} ${(item.skills || []).join(' ')}`;

    const matchesSearch =
      !q || text(searchText).includes(q);

    const matchesCity =
      state.candidateFilter.city === 'Все'
      || item.city === state.candidateFilter.city;

    const matchesStatus =
      state.candidateFilter.status === 'Все'
      || item.status === state.candidateFilter.status;

    return matchesSearch && matchesCity && matchesStatus;
  });

  // сортировка
  if (state.candidateFilter.sort === 'Совпадение') {
    candidates.sort((a, b) => (b.match || 0) - (a.match || 0));
  }

  if (state.candidateFilter.sort === 'Опыт') {
    candidates.sort((a, b) =>
      String(b.experience || '').localeCompare(String(a.experience || ''))
    );
  }

  return candidates;
}

// ====================== МОДАЛКИ ======================

export function showAuthModal() {
  openModal(`
    <div class="auth">
      <h2>Вход в HR Assistant</h2>
      <p class="muted">Выберите роль для демонстрационного входа в систему.</p>

      <div class="grid grid--3">
        <button class="role-card" type="button" data-role="candidate">
          <strong>Кандидат</strong>
          <span>Отклики, резюме и сохраненные вакансии</span>
        </button>

        <button class="role-card" type="button" data-role="employer">
          <strong>Работодатель</strong>
          <span>Вакансии, отклики и подбор команды</span>
        </button>

        <button class="role-card" type="button" data-role="recruiter">
          <strong>Рекрутер</strong>
          <span>Воронка отбора, кандидаты и аналитика</span>
        </button>
      </div>
    </div>
  `);
}

export function showCreateVacancyModal() {
  openModal(renderVacancyForm({
    id: '',
    title: '',
    company: '',
    city: '',
    format: 'Офис',
    employment: 'Полная занятость',
    experience: '1-3 года',
    salary: '',
    category: '',
    priority: 'Средний',
    skills: [],
    description: ''
  }, 'create-vacancy'));
}

function renderVacancyForm(vacancy, formType = 'edit-vacancy') {
  const isEdit = formType === 'edit-vacancy';

  return `
    <form class="form" data-form="${formType}" data-id="${escapeHtml(vacancy.id || '')}">
      <h2>${isEdit ? 'Редактировать вакансию' : 'Создать вакансию'}</h2>

      <label class="field">
        <span>Название вакансии</span>
        <input name="title" required placeholder="Frontend-разработчик" value="${escapeHtml(vacancy.title)}">
      </label>

      <label class="field">
        <span>Компания</span>
        <input name="company" required placeholder="Nova HR Tech" value="${escapeHtml(vacancy.company)}">
      </label>

      <label class="field">
        <span>Город</span>
        <input name="city" required placeholder="Москва" value="${escapeHtml(vacancy.city)}">
      </label>

      <label class="field">
        <span>Формат</span>
        <select name="format">
          ${['Офис', 'Гибрид', 'Удаленно'].map(item => `
            <option value="${item}" ${item === vacancy.format ? 'selected' : ''}>${item}</option>
          `).join('')}
        </select>
      </label>

      <label class="field">
        <span>Занятость</span>
        <select name="employment">
          ${['Полная занятость', 'Частичная занятость', 'Проектная работа'].map(item => `
            <option value="${item}" ${item === vacancy.employment ? 'selected' : ''}>${item}</option>
          `).join('')}
        </select>
      </label>

      <label class="field">
        <span>Опыт</span>
        <select name="experience">
          ${['Без опыта', '1-3 года', '3-6 лет', '6+ лет'].map(item => `
            <option value="${item}" ${item === vacancy.experience ? 'selected' : ''}>${item}</option>
          `).join('')}
        </select>
      </label>

      <label class="field">
        <span>Зарплата</span>
        <input name="salary" required placeholder="120 000 - 180 000 ₽" value="${escapeHtml(vacancy.salary)}">
      </label>

      <label class="field">
        <span>Категория</span>
        <input name="category" required placeholder="IT" value="${escapeHtml(vacancy.category || '')}">
      </label>

      <label class="field">
        <span>Приоритет</span>
        <select name="priority">
          ${['Низкий', 'Средний', 'Высокий'].map(item => `
            <option value="${item}" ${item === vacancy.priority ? 'selected' : ''}>${item}</option>
          `).join('')}
        </select>
      </label>

      <label class="field">
        <span>Навыки через запятую</span>
        <input name="skills" placeholder="HTML, CSS, JavaScript" value="${escapeHtml((vacancy.skills || []).join(', '))}">
      </label>

      <label class="field">
        <span>Описание</span>
        <textarea name="description" required placeholder="Описание вакансии">${escapeHtml(vacancy.description || '')}</textarea>
      </label>

      <div class="row">
        <button class="button button--primary" type="submit">
          ${isEdit ? 'Сохранить' : 'Создать'}
        </button>
        <button class="button button--ghost" type="button" data-close-modal>Отмена</button>
      </div>
    </form>
  `;
}

function renderVacancyDetails(vacancy) {
  return `
    <div class="card">
      <div class="card__body">
        <h2>${escapeHtml(vacancy.title)}</h2>
        <p class="muted">${escapeHtml(vacancy.company)} — ${escapeHtml(vacancy.city)}</p>

        <div class="row">
          <span class="badge">${escapeHtml(vacancy.format)}</span>
          <span class="badge">${escapeHtml(vacancy.employment)}</span>
          <span class="badge">${escapeHtml(vacancy.experience)}</span>
          <span class="badge badge--accent">${escapeHtml(vacancy.salary)}</span>
          <span class="badge">${escapeHtml(vacancy.status || 'Активна')}</span>
        </div>

        <p class="card__text">${escapeHtml(vacancy.description || '')}</p>

        <h3>Навыки</h3>
        <div class="row">
          ${(vacancy.skills || []).map(skill => `<span class="badge">${escapeHtml(skill)}</span>`).join('') || '<span class="badge">Не указаны</span>'}
        </div>

        <h3>Требования</h3>
        <ul>
          ${(vacancy.requirements || []).map(item => `<li>${escapeHtml(item)}</li>`).join('') || '<li>Не указаны</li>'}
        </ul>

        <h3>Условия</h3>
        <ul>
          ${(vacancy.conditions || []).map(item => `<li>${escapeHtml(item)}</li>`).join('') || '<li>Не указаны</li>'}
        </ul>

        <div class="row">
          <button class="button button--primary" data-edit-vacancy="${vacancy.id}">Редактировать</button>
          <button class="button button--danger" data-delete-vacancy="${vacancy.id}">Удалить</button>
          <button class="button button--ghost" data-close-modal>Закрыть</button>
        </div>
      </div>
    </div>
  `;
}

// ====================== СОБЫТИЯ ======================

export async function handleDocumentClick(e) {
  const createButton = e.target.closest('[data-open-create]');
  if (createButton) {
    showCreateVacancyModal();
    return;
  }

  const authButton = e.target.closest('#authButton');
  if (authButton) {
    showAuthModal();
    return;
  }

  const roleButton = e.target.closest('[data-role]');
  if (roleButton) {
    const role = roleButton.dataset.role;
    const roleNames = {
      candidate: 'Кандидат',
      employer: 'Работодатель',
      recruiter: 'Рекрутер'
    };

    state.session = {
      role,
      name: roleNames[role] || 'Пользователь'
    };

    localStorage.setItem('hrassistant.session', JSON.stringify(state.session));
    closeModal();
    showToast(`Выполнен вход: ${state.session.name}`);

    const auth = document.querySelector('#authButton');
    if (auth) auth.textContent = state.session.name;

    return;
  }

  const closeButton = e.target.closest('[data-close-modal]');
  if (closeButton) {
    closeModal();
    return;
  }

  const saveButton = e.target.closest('[data-save-vacancy]');
  if (saveButton) {
    const id = Number(saveButton.dataset.saveVacancy);

    state.savedVacancies = toggleListValue('hrassistant.savedVacancies', id);

    showToast(
      state.savedVacancies.includes(id)
        ? 'Вакансия сохранена'
        : 'Вакансия удалена из сохраненных'
    );

    window.dispatchEvent(new Event('hashchange'));
    return;
  }

  const openButton = e.target.closest('[data-open-job]');
  if (openButton) {
    const vacancy = findVacancyById(openButton.dataset.openJob);

    if (!vacancy) {
      showToast('Вакансия не найдена');
      return;
    }

    openModal(renderVacancyDetails(vacancy));
    return;
  }

  const editButton = e.target.closest('[data-edit-vacancy]');
  if (editButton) {
    const vacancy = findVacancyById(editButton.dataset.editVacancy);

    if (!vacancy) {
      showToast('Вакансия не найдена');
      return;
    }

    openModal(renderVacancyForm(vacancy, 'edit-vacancy'));
    return;
  }

  const deleteButton = e.target.closest('[data-delete-vacancy]');
  if (deleteButton) {
    const id = Number(deleteButton.dataset.deleteVacancy);

    if (!confirm('Удалить вакансию?')) return;

    await deleteVacancy(id);

    state.data.vacancies = (state.data.vacancies || []).filter(v => Number(v.id) !== id);
    state.savedVacancies = state.savedVacancies.filter(item => Number(item) !== id);

    localStorage.setItem('hrassistant.savedVacancies', JSON.stringify(state.savedVacancies));

    closeModal();
    showToast('Вакансия удалена');

    window.dispatchEvent(new Event('hashchange'));
    return;
  }

    const removePipelineButton = e.target.closest('[data-remove-pipeline]');
  if (removePipelineButton) {
    const id = Number(removePipelineButton.dataset.removePipeline);

    if (!confirm('Снять кандидата с воронки?')) return;

    const pipeline = JSON.parse(localStorage.getItem('hrassistant.pipeline') || 'null')
      || state.data?.pipeline
      || [];

    const updatedPipeline = pipeline.filter(item => Number(item.id) !== id);

    localStorage.setItem('hrassistant.pipeline', JSON.stringify(updatedPipeline));
    state.data.pipeline = updatedPipeline;

    showToast('Кандидат снят с воронки');

    window.dispatchEvent(new Event('hashchange'));
    return;
  }

    const moveButton = e.target.closest('[data-move-pipeline]');
  if (moveButton) {
    const id = Number(moveButton.dataset.movePipeline);
    const direction = moveButton.dataset.direction;

    const pipeline = JSON.parse(localStorage.getItem('hrassistant.pipeline') || 'null')
      || state.data?.pipeline
      || [];

    const item = pipeline.find(candidate => Number(candidate.id) === id);

    if (!item) {
      showToast('Кандидат в воронке не найден');
      return;
    }

    const currentIndex = stageOrder.indexOf(item.stage);
    const nextIndex = direction === 'next'
      ? currentIndex + 1
      : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= stageOrder.length) {
      return;
    }

    item.stage = stageOrder[nextIndex];

    localStorage.setItem('hrassistant.pipeline', JSON.stringify(pipeline));
    state.data.pipeline = pipeline;

    showToast(`Кандидат перемещен: ${item.stage}`);

    window.dispatchEvent(new Event('hashchange'));
    return;
  }

    const openAuthButton = e.target.closest('[data-open-auth]');
  if (openAuthButton) {
    showAuthModal();
    return;
  }

  const logoutButton = e.target.closest('[data-logout]');
  if (logoutButton) {
    clearSession();

    const auth = document.querySelector('#authButton');
    if (auth) auth.textContent = 'Войти';

    showToast('Вы вышли из аккаунта');
    window.dispatchEvent(new Event('hashchange'));
    return;
  }

  const settingsThemeButton = e.target.closest('[data-settings-theme]');
  if (settingsThemeButton) {
    const theme = settingsThemeButton.dataset.settingsTheme;

    setTheme(theme);
    syncTheme();

    showToast(theme === 'dark' ? 'Включена темная тема' : 'Включена светлая тема');
    window.dispatchEvent(new Event('hashchange'));
    return;
  }

    const inviteButton = e.target.closest('[data-invite]');
  if (inviteButton) {
    const id = Number(inviteButton.dataset.invite);

    const candidate = (state.data?.candidates || [])
      .find(item => Number(item.id) === id);

    if (!candidate) {
      showToast('Кандидат не найден');
      return;
    }

    const pipeline = JSON.parse(localStorage.getItem('hrassistant.pipeline') || 'null')
      || state.data?.pipeline
      || [];

    const alreadyExists = pipeline.some(item => Number(item.candidateId) === id);

    if (alreadyExists) {
      showToast('Кандидат уже есть в воронке');
      go('selection');
      return;
    }

    const vacancy = getAllVacancies()[0];

    const pipelineItem = {
      id: Date.now(),
      candidateId: candidate.id,
      candidate: candidate.name,
      vacancy: vacancy?.title || 'Вакансия не выбрана',
      stage: 'Новые',
      score: candidate.match || 0,
      nextStep: 'Провести первичный скрининг'
    };

    pipeline.unshift(pipelineItem);

    localStorage.setItem('hrassistant.pipeline', JSON.stringify(pipeline));
    state.data.pipeline = pipeline;

    showToast('Кандидат добавлен в воронку');
    go('selection');
    window.dispatchEvent(new Event('hashchange'));
    return;
  }

    const openEventButton = e.target.closest('[data-open-event]');
  if (openEventButton) {
    const id = Number(openEventButton.dataset.openEvent);

    const event = (state.data?.events || [])
      .find(item => Number(item.id) === id);

    if (!event) {
      showToast('Событие не найдено');
      return;
    }

    openModal(`
      <div class="card">
        <div class="card__body">
          <h2>${escapeHtml(event.title)}</h2>
          <p class="muted">${escapeHtml(event.type)}</p>

          <div class="row">
            <span class="badge">${escapeHtml(event.date)}</span>
            <span class="badge">${escapeHtml(event.time)}</span>
            <span class="badge badge--accent">${escapeHtml(event.type)}</span>
          </div>

          <p class="card__text">
            Событие запланировано в календаре HR-системы.
          </p>

          <div class="row">
            <button class="button button--ghost" data-close-modal>Закрыть</button>
          </div>
        </div>
      </div>
    `);

    return;
  }

    const addCandidateButton = e.target.closest('[data-add-candidate]');

  if (addCandidateButton) {
    showToast('Загрузка кандидата...');

    const candidate = await fetchOneCandidate();

    if (!candidate) {
      showToast('Не удалось загрузить кандидата');
      return;
    }

    state.data.candidates.unshift(candidate);

    showToast('Кандидат добавлен');

    window.dispatchEvent(new Event('hashchange'));
    return;
  }

  const createEventButton = e.target.closest('[data-open-create-event]');
  if (createEventButton) {
    showCreateEventModal();
    return;
  }

  const goButton = e.target.closest('[data-go]');
  if (goButton) {
    go(goButton.dataset.go);
  }
}

export async function handleSubmit(e) {
  const form = e.target.closest('form');
  if (!form) return;

  if (form.dataset.form === 'create-vacancy') {
    e.preventDefault();

    const formData = new FormData(form);
    const vacancy = getVacancyFromForm(formData);

    const created = await createVacancy(vacancy);

    state.data.vacancies.unshift(created);

    closeModal();
    showToast('Вакансия создана');

    go('vacancies');
    window.dispatchEvent(new Event('hashchange'));
    return;
  }


    if (form.dataset.form === 'create-event') {
    e.preventDefault();

    const formData = new FormData(form);

    const event = {
      id: Date.now(),
      title: formData.get('title'),
      date: formData.get('date'),
      time: formData.get('time'),
      type: formData.get('type')
    };

    state.data.events.unshift(event);
    localStorage.setItem('hrassistant.events', JSON.stringify(state.data.events));

    closeModal();
    showToast('Событие запланировано');

    window.dispatchEvent(new Event('hashchange'));
    return;
  }

  if (form.dataset.form === 'edit-vacancy') {
    e.preventDefault();

    const id = Number(form.dataset.id);
    const formData = new FormData(form);
    const updates = getVacancyFromForm(formData);

    const updated = await updateVacancy(id, updates);

    const index = state.data.vacancies.findIndex(v => Number(v.id) === id);

    if (index !== -1) {
      state.data.vacancies[index] = {
        ...state.data.vacancies[index],
        ...updates,
        id
      };
    }

    closeModal();

    showToast(
      updated
        ? 'Вакансия обновлена'
        : 'Изменения сохранены'
    );

    window.dispatchEvent(new Event('hashchange'));
  }
}

function getVacancyFromForm(formData) {
  return {
    title: formData.get('title'),
    company: formData.get('company'),
    city: formData.get('city'),
    format: formData.get('format'),
    employment: formData.get('employment'),
    experience: formData.get('experience'),
    salary: formData.get('salary'),
    category: formData.get('category'),
    priority: formData.get('priority'),
    description: formData.get('description'),
    skills: String(formData.get('skills') || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  };
}

export function handleRoleSelection() {
  // Роли обрабатываются в handleDocumentClick через data-role.
}

function showCreateEventModal() {
  openModal(`
    <form class="form" data-form="create-event">
      <h2>Запланировать событие</h2>

      <label class="field">
        <span>Название события</span>
        <input name="title" required placeholder="Интервью с кандидатом">
      </label>

      <label class="field">
        <span>Дата</span>
        <input name="date" type="date" required>
      </label>

      <label class="field">
        <span>Время</span>
        <input name="time" type="time" required>
      </label>

      <label class="field">
        <span>Тип</span>
        <select name="type">
          <option>Собеседование</option>
          <option>Интервью</option>
          <option>Скрининг</option>
          <option>Встреча</option>
          <option>Другое</option>
        </select>
      </label>

      <div class="row">
        <button class="button button--primary" type="submit">Создать</button>
        <button class="button button--ghost" type="button" data-close-modal>Отмена</button>
      </div>
    </form>
  `);
}