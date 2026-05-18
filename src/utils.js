// src/utils.js

/**
 * Универсальные вспомогательные функции
 */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const icon = (name) => `./src/assets/icons/${name}.svg`;

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function text(value) {
  return String(value || '').toLowerCase().trim();
}

export function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

/**
 * Показывает уведомление (toast)
 */
export function showToast(message, duration = 2600) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Пустое состояние
 */
export function emptyState(title, description) {
  return `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

/**
 * Открытие модального окна
 */
export function openModal(html) {
  const modal = $('#modal');
  const modalContent = $('#modalContent');

  modalContent.innerHTML = html;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

/**
 * Закрытие модального окна
 */
export function closeModal() {
  const modal = $('#modal');
  const modalContent = $('#modalContent');

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    modalContent.innerHTML = '';
  }, 300);
}

export function syncTheme() {
  const label = document.querySelector('#themeLabel');
  if (!label) return;

  label.textContent = document.documentElement.dataset.theme === 'dark'
    ? ''
    : '';
}
/**
 * Создаёт HTML для заголовка страницы
 */
export function pageHeader(eyebrow, title, subtitle, action = '') {
  return `
    <div class="page__header">
      <div>
        <p class="page__eyebrow">${escapeHtml(eyebrow)}</p>
        <h1 class="page__title">${escapeHtml(title)}</h1>
        <p class="page__subtitle">${escapeHtml(subtitle)}</p>
      </div>
      <div class="row">${action}</div>
    </div>
  `;
}

/**
 * Создаёт метрику (используется на главной и в аналитике)
 */
export function metric(label, value, hint, iconName = 'filter') {
  return `
    <article class="metric-card">
      <div class="metric-card__top">
        <span>${escapeHtml(label)}</span>
        <span class="metric-card__icon"><img src="${icon(iconName)}" alt=""></span>
      </div>
      <div>
        <div class="metric-card__value">${escapeHtml(value)}</div>
        <div class="metric-card__hint">${escapeHtml(hint)}</div>
      </div>
    </article>
  `;
}

export default {
  $,
  $$,
  icon,
  escapeHtml,
  text,
  uniq,
  showToast,
  emptyState,
  openModal,
  closeModal,
  pageHeader,
  metric,
  syncTheme
};