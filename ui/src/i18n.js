import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';
import fr from './locales/fr/common.json';

i18n
  .use(LanguageDetector)            // detect browser language
  .use(initReactI18next)            // pass i18n down to react-i18next
  .init({
    resources: {
      en: { common: en },
      fr: { common: fr },
    },
    fallbackLng: 'en',              // if detection fails, use English
    ns: ['common'],                 // namespaces (you can add more)
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring','cookie','localStorage','navigator'],
      caches: ['cookie']
    }
  });

export default i18n;
