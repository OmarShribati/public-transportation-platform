import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../public/en.json';
import ar from '../public/ar.json';

const savedLang =  'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

document.documentElement.dir =  'ltr';
// document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

export default i18n;
