const routes = new Set([
  'home',
  'selection',
  'vacancies',
  'candidates',
  'calendar',
  'companies',
  'settings'
]);

export function getRoute() {
  const route = window.location.hash.replace('#/', '').split('?')[0] || 'home';
  return routes.has(route) ? route : 'home';
}

export function go(route) {
  window.location.hash = `#/${route}`;
}
