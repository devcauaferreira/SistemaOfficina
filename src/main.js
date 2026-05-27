import './style.css';
import { applyStoredCompanyTheme } from './lib/company.js';
import { initRouter } from './router.js';

window.addEventListener('DOMContentLoaded', () => {
  applyStoredCompanyTheme();
  initRouter();
});
