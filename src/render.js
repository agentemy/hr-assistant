// src/render.js
import { escapeHtml, icon, emptyState, pageHeader, metric, text, uniq } from './utils.js';
import { state, stageOrder } from './state.js';
import { getAllVacancies, getFilteredVacancies, getFilteredCandidates } from './handlers.js';

// ====================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======================

function optionList(items, selected) {
  return items.map(item => `
    <option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>
      ${escapeHtml(item)}
    </option>
  `).join('');
}

// ====================== КАРТОЧКИ ======================

export function renderVacancyCard(job) {
  const isSaved = state.savedVacancies.includes(Number(job.id));

  return `
    <article class="vacancy-card">
      <div class="vacancy-card__top">
        <div>
          <h2 class="vacancy-card__title">${escapeHtml(job.title)}</h2>
          <p class="vacancy-card__company">${escapeHtml(job.company)} — ${escapeHtml(job.city)}</p>
        </div>
        <span class="badge ${job.priority === 'Высокий' ? 'badge--accent' : ''}">
          ${escapeHtml(job.priority || 'Обычный')}
        </span>
      </div>

      <div class="vacancy-card__meta">
        <span class="badge">${escapeHtml(job.format)}</span>
        <span class="badge">${escapeHtml(job.employment)}</span>
        <span class="badge">${escapeHtml(job.experience)}</span>
        <span class="badge badge--accent">${escapeHtml(job.salary)}</span>
      </div>

      <p class="vacancy-card__description">${escapeHtml(job.description)}</p>

      <div class="vacancy-card__skills">
        ${(job.skills || []).map(skill => `
          <span class="badge">${escapeHtml(skill)}</span>
        `).join('')}
      </div>

      <div class="vacancy-card__bottom">
        <div class="row">
          <span class="badge">${job.views || 0} просмотров</span>
          <span class="badge">${job.responses || 0} откликов</span>
          <span class="badge">${escapeHtml(job.status || 'Активна')}</span>
        </div>
        <div class="row">
          <button class="button button--small button--ghost" data-save-vacancy="${job.id}">
            ${isSaved ? 'Сохранено' : 'Сохранить'}
          </button>
          <button class="button button--small button--ghost" data-edit-vacancy="${job.id}">
            Редактировать
          </button>
          <button class="button button--small button--danger" data-delete-vacancy="${job.id}">
            Удалить
          </button>
          <button class="button button--small button--primary" data-open-job="${job.id}">
            Открыть
          </button>
        </div>
      </div>
    </article>
  `;
}

export function renderCandidateCard(candidate) {
  const initials = candidate.name
    .split(' ')
    .map(part => part[0])
    .join('');

  return `
    <article class="candidate-card">
      <div class="candidate-card__top">
        <span class="avatar">${escapeHtml(initials)}</span>
        <div>
          <h3>${escapeHtml(candidate.name)}</h3>
          <p>${escapeHtml(candidate.role)} — ${escapeHtml(candidate.city)}</p>
        </div>
      </div>

      <div class="row">
        <span class="badge">${escapeHtml(candidate.experience)}</span>
        <span class="badge">${escapeHtml(candidate.salary)}</span>
        <span class="badge badge--accent">${escapeHtml(candidate.status)}</span>
      </div>

      <p class="card__text">${escapeHtml(candidate.note || '')}</p>

      <div class="row">
        ${(candidate.skills || [])
          .map(skill => `<span class="badge">${escapeHtml(skill)}</span>`)
          .join('')}
      <div class="row">
        <button class="button button--small button--primary" data-invite="${candidate.id}">
          Пригласить в воронку
        </button>
      </div>
    </article>
  `;
}

export function renderPipelineCard(item) {
  const index = stageOrder.indexOf(item.stage);
  const isHired = item.stage === 'Нанят';

  return `
    <article class="funnel-card ${isHired ? 'funnel-card--hired' : ''}">
      <h4>${escapeHtml(item.candidate)}</h4>
      <p>${escapeHtml(item.vacancy)}</p>
      <span class="badge ${isHired ? 'badge--success' : 'badge--accent'}">
        ${item.stage}
      </span>
      <p class="muted">${escapeHtml(item.nextStep || 'Следующий шаг не указан')}</p>

      <div class="row">
        ${isHired ? '' : `
          <button class="button button--small button--ghost"
                  data-move-pipeline="${item.id}"
                  data-direction="back"
                  ${index === 0 ? 'disabled' : ''}>← Назад</button>

          <button class="button button--small button--primary"
                  data-move-pipeline="${item.id}"
                  data-direction="next">Дальше →</button>
        `}

        <button class="button button--small button--danger"
                data-remove-pipeline="${item.id}">
          Снять
        </button>
      </div>
    </article>
  `;
}

export function renderHome() {
  return `
    <section class="hero hero--landing">
      <div class="hero__content">
        <h1 class="hero__title">
          Подбор,<br>
          кандидаты и<br>
          воронка найма в<br>
          одном<br>
          интерфейсе.
        </h1>

        <p class="hero__description">
          HR Assistant помогает создать вакансию, найти релевантных кандидатов,
          провести их по этапам отбора и увидеть базовую аналитику рекрутинга.
        </p>

        <div class="row">
          <button class="button button--primary button--large"
                  data-open-create>
            Создать вакансию
          </button>

          <button class="button button--ghost button--large"
                  data-go="selection">
            Открыть отбор
          </button>

          <button class="button button--ghost button--large"
                  data-go="candidates">
            Кандидаты
          </button>
        </div>
      </div>
    </section>
  `;
}

export function renderVacancies() {
  const vacancies = getFilteredVacancies();
  const all = getAllVacancies();

  const cities = ['Все', ...uniq(all.map(v => v.city))];
  const formats = ['Все', ...uniq(all.map(v => v.format))];
  const experiences = ['Все', ...uniq(all.map(v => v.experience))];
  const categories = ['Все', ...uniq(all.map(v => v.category))];

  return `
    ${pageHeader('Вакансии', 'Управление вакансиями', 
      'Создавайте, редактируйте и отслеживайте вакансии', 
      '<button class="button button--primary" data-open-create>Создать вакансию</button>')}

    <section class="card">
      <div class="card__body filters">
        <label class="field"><span>Поиск</span><input id="vacancySearch" value="${escapeHtml(state.search)}" placeholder="Название, компания, навык"></label>
        <label class="field"><span>Город</span><select data-filter="city">${optionList(cities, state.vacancyFilter.city)}</select></label>
        <label class="field"><span>Формат</span><select data-filter="format">${optionList(formats, state.vacancyFilter.format)}</select></label>
        <label class="field"><span>Опыт</span><select data-filter="experience">${optionList(experiences, state.vacancyFilter.experience)}</select></label>
        <label class="field"><span>Сортировка</span><select data-filter="sort">${optionList(['Новые', 'Отклики', 'Просмотры'], state.vacancyFilter.sort)}</select></label>
      </div>
    </section>

    <section class="grid grid--2">
      ${vacancies.length 
        ? vacancies.map(renderVacancyCard).join('') 
        : emptyState('Вакансии не найдены', 'Создайте новую вакансию или измените фильтры')}
    </section>
  `;
}

export function renderCandidates() {
  const candidates = getFilteredCandidates();
  const all = state.data?.candidates || [];

  const cities = ['Все', ...uniq(all.map(c => c.city))];
  const statuses = ['Все', ...uniq(all.map(c => c.status))];

  return `
    ${pageHeader('Кандидаты', 'База кандидатов', 
      'Просмотр и поиск кандидатов', 
      `
<div class="row">
  <button class="button button--primary" data-add-candidate>
    Добавить кандидата
  </button>

  <button class="button button--ghost" data-go="selection">
    Открыть воронку
  </button>
</div>
`)}

    <section class="card">
      <div class="card__body filters">
        <label class="field"><span>Поиск</span><input id="candidateSearch" value="${escapeHtml(state.search)}" placeholder="Имя, роль, навык"></label>
        <label class="field"><span>Город</span><select data-candidate-filter="city">${optionList(cities, state.candidateFilter.city)}</select></label>
        <label class="field"><span>Статус</span><select data-candidate-filter="status">${optionList(statuses, state.candidateFilter.status)}</select></label>
        <label class="field"><span>Сортировка</span><select data-candidate-filter="sort">${optionList(['Совпадение', 'Опыт'], state.candidateFilter.sort)}</select></label>
        <div class="field"><span>Действие</span><button class="button button--ghost" data-clear-candidate-filters>Сбросить</button></div>
      </div>
    </section>

    <section class="grid grid--2">
      ${candidates.length 
        ? candidates.map(renderCandidateCard).join('') 
        : emptyState('Кандидаты не найдены', 'Попробуйте изменить фильтры')}
    </section>
  `;
}

export function renderSelection() {
  const pipeline = JSON.parse(localStorage.getItem('hrassistant.pipeline') || 'null') 
                || state.data?.pipeline || [];

  return `
    ${pageHeader('Отбор персонала', 'Воронка найма', 
      'Перемещайте кандидатов между этапами', 
      '<button class="button button--primary" data-go="candidates">Найти кандидатов</button>')}

    <section class="funnel">
      ${stageOrder.map(stage => {
        const items = pipeline.filter(item => item.stage === stage);
        return `
          <div class="funnel__column">
            <div class="funnel__head">
              <strong>${escapeHtml(stage)}</strong>
              <span class="badge">${items.length}</span>
            </div>
            ${items.map(renderPipelineCard).join('') || '<div class="empty-state"><p>Пока пусто</p></div>'}
          </div>
        `;
      }).join('')}
    </section>
  `;
}

export function renderCalendar() {
  const events = state.data?.events || [];

  return `
    ${pageHeader(
      'Календарь',
      'План собеседований',
      'Расписание встреч, интервью и HR-событий',
      '<button class="button button--primary" data-open-create-event>Запланировать событие</button>'
    )}

    <section class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Время</th>
            <th>Событие</th>
            <th>Тип</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td>${formatDate(event.date)}</td>
              <td>${escapeHtml(event.time)}</td>
              <td>${escapeHtml(event.title)}</td>
              <td><span class="badge badge--accent">${escapeHtml(event.type)}</span></td>
              <td>
                <button class="button button--small button--ghost" data-open-event="${event.id}">
                  Открыть
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function formatDate(date) {
  const [year, month, day] = String(date).split('-');
  return `${day}.${month}.${year}`;
}

export function renderCompanies() {
  const companies = state.data?.companies || [];

  return `
    ${pageHeader(
      'Компании',
      'Компании и заказчики подбора',
      'Карточки компаний нужны для работодателей, рекрутеров и привязки вакансий к заказчику.'
    )}

    <section class="grid grid--3">
      ${companies.map(company => `
        <article class="card company-card">
          <div class="card__body company-card__body">
            <h2>${escapeHtml(company.name)}</h2>

            <p class="card__text company-card__description">
              ${escapeHtml(company.description)}
            </p>

            <div class="company-card__location">
              <span>⌖</span>
              <span>${escapeHtml(company.city)}</span>
            </div>
          </div>
        </article>
      `).join('')}
    </section>
  `;
}

export function renderSettings() {
  const session = state.session;

  return `
    ${pageHeader(
      'Настройки',
      'Профиль и внешний вид',
      'Управление аккаунтом и темой сайта'
    )}

    <section class="grid grid--2">
      <article class="card">
        <div class="card__body">
          <h2>Аккаунт</h2>
          <p class="muted">
            ${session 
              ? `Вы вошли как: ${escapeHtml(session.name)}`
              : 'Вы не вошли в аккаунт'}
          </p>

          <div class="row">
            ${session 
              ? '<button class="button button--danger" data-logout>Выйти</button>'
              : '<button class="button button--primary" data-open-auth>Войти</button>'}
          </div>
        </div>
      </article>

      <article class="card">
        <div class="card__body">
          <h2>Тема сайта</h2>
          <p class="muted">
            Текущая тема: ${state.theme === 'dark' ? 'темная' : 'светлая'}
          </p>

          <div class="row">
            <button class="button button--primary" data-settings-theme="light">
              Светлая тема
            </button>
            <button class="button button--ghost" data-settings-theme="dark">
              Темная тема
            </button>
          </div>
        </div>
      </article>
    </section>
  `;
}