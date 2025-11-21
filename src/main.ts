import './styles/app.css';
import './components/layout';
import './lib/language-state';
import './lib/i18n-keys';
import './lib/i18n';
import './lib/theme';
import './lib/ui';
import './lib/calendar';
import './lib/leaderboard';
import './lib/tables';
import './lib/modals';
import './lib/perf-metrics';
import './lib/frontend-api';
import './lib/actions';
import './lib/render-stats';

window.API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://dashboard-eight-beta-59.vercel.app/api',
  getEmployees: `${import.meta.env.VITE_API_BASE_URL ?? 'https://dashboard-eight-beta-59.vercel.app/api'}/get-employees`,
  addViolation: `${import.meta.env.VITE_API_BASE_URL ?? 'https://dashboard-eight-beta-59.vercel.app/api'}/add-violation`,
  updateData: `${import.meta.env.VITE_API_BASE_URL ?? 'https://dashboard-eight-beta-59.vercel.app/api'}/update-data`
};


