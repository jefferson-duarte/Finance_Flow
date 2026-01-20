import { createContext, useState, useContext } from 'react';
import { translations } from './i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Tenta pegar do localStorage ou usa 'pt' como padrão
  const [language, setLanguage] = useState(localStorage.getItem('app_lang') || 'pt');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang); // Salva a preferência
  };

  // Esta é a função mágica: t('menu_dashboard') retorna o texto correto
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personalizado para facilitar o uso
export const useLanguage = () => useContext(LanguageContext);