// Khi build production (Docker): VITE_API_URL="" → Url = "" → http-common dùng /api (nginx proxy)
// Khi dev local: VITE_API_URL chưa set → dùng localhost:3030
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3030';

export const Url = apiUrl === '' ? '' : (apiUrl.endsWith('/') ? apiUrl : apiUrl + '/');