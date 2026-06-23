import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ar from './locales/ar.json';

// Lightweight, fully client-side i18n. No network / auto-translate widgets.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
});

// Keep <html lang/dir> in sync with the active language. This is the single
// source of truth the CSS font-swap ([lang="ar"]) and RTL layout rely on.
function applyHtmlLangDir(lng) {
  const html = document.documentElement;
  html.setAttribute('lang', lng);
  html.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
}

applyHtmlLangDir(i18n.language);
i18n.on('languageChanged', applyHtmlLangDir);

export default i18n;
