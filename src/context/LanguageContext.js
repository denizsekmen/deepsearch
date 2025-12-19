import React, { createContext, useContext, useState, useEffect } from 'react';
import LanguageService from '../services/languageService';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(LanguageService.getCurrentLanguage());
  const [, forceUpdate] = useState(0);

  const changeLanguage = (languageCode) => {
    console.log('=== LanguageContext: Changing language ===');
    console.log('From:', currentLanguage);
    console.log('To:', languageCode);
    
    try {
      // Storage'a kaydet
      LanguageService.setLanguage(languageCode);
      
      // State'i güncelle
      setCurrentLanguage(languageCode);
      
      // Komponentleri yeniden render et
      forceUpdate(prev => prev + 1);
      
      console.log('Language changed successfully!');
    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  const t = (key) => {
    // Her zaman güncel dili kullan
    return LanguageService.getTranslation(key);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

