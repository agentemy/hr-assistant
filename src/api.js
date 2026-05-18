// src/api.js
import { CONFIG } from './config.js';

export async function getHealth() {
  return {
    ok: false,
    mode: CONFIG.MODE,
    message: 'Локальный статический режим'
  };
}

export async function getRecruitingData() {
  const res = await fetch(CONFIG.DATA_URL, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Не удалось загрузить recruiting.json');
  }

  const data = await res.json();

  const localVacancies = JSON.parse(localStorage.getItem('hrassistant.vacancies') || '[]');
  const savedPipeline = JSON.parse(localStorage.getItem('hrassistant.pipeline') || 'null');

  return {
    ...data,
    vacancies: [...localVacancies, ...(data.vacancies || [])],
    pipeline: savedPipeline || data.pipeline || []
  };
}

export async function createVacancy(vacancyData) {
  const vacancy = {
    ...vacancyData,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    views: 0,
    responses: 0,
    status: 'Активна',
    priority: vacancyData.priority || 'Средний'
  };

  const local = JSON.parse(localStorage.getItem('hrassistant.vacancies') || '[]');
  local.unshift(vacancy);
  localStorage.setItem('hrassistant.vacancies', JSON.stringify(local));

  return vacancy;
}

export async function updateVacancy(id, updates) {
  const local = JSON.parse(localStorage.getItem('hrassistant.vacancies') || '[]');
  const index = local.findIndex(v => Number(v.id) === Number(id));

  if (index !== -1) {
    local[index] = {
      ...local[index],
      ...updates,
      id: Number(id),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('hrassistant.vacancies', JSON.stringify(local));
    return local[index];
  }

  return null;
}

export async function deleteVacancy(id) {
  const local = JSON.parse(localStorage.getItem('hrassistant.vacancies') || '[]');
  const filtered = local.filter(v => Number(v.id) !== Number(id));
  localStorage.setItem('hrassistant.vacancies', JSON.stringify(filtered));

  return true;
}

export async function savePipeline(pipeline) {
  localStorage.setItem('hrassistant.pipeline', JSON.stringify(pipeline));
}

export async function getPipeline() {
  const saved = localStorage.getItem('hrassistant.pipeline');
  return saved ? JSON.parse(saved) : null;
}