import { MMKV } from 'react-native-mmkv';
import * as RNLocalize from 'react-native-localize';

// Import translation files
import tr from '../../i18n/locales/tr.json';
import en from '../../i18n/locales/en.json';
import de from '../../i18n/locales/de.json';
import fr from '../../i18n/locales/fr.json';
import it from '../../i18n/locales/it.json';
import es from '../../i18n/locales/es.json';
import pt from '../../i18n/locales/pt.json';
import ru from '../../i18n/locales/ru.json';
import vi from '../../i18n/locales/vi.json';
import km from '../../i18n/locales/km.json';

// MMKV storage'ı güvenli şekilde initialize et
let storage;
try {
  storage = new MMKV();
} catch (error) {
  console.error('MMKV initialization error in LanguageService:', error);
  storage = null;
}

// Dil çevirileri
const translations = {
  tr,
  en,
  de,
  fr,
  it,
  es,
  pt,
  ru,
  vi,
  km,
};

// Debug: Check if translations are loaded
console.log('=== Translations Loaded ===');
console.log('Available languages:', Object.keys(translations));
Object.keys(translations).forEach(lang => {
  const keyCount = Object.keys(translations[lang]).length;
  console.log(`${lang}: ${keyCount} keys`);
});
console.log('===========================');

class LanguageService {
  constructor() {
    this.currentLanguage = this.getCurrentLanguage();
  }

  getCurrentLanguage() {
    try {
      console.log('=== Getting Current Language ===');
      
      // Storage null ise telefon dilini tespit et veya İngilizce döndür
      if (!storage) {
        console.warn('❌ Storage not available, detecting device language...');
        const deviceLanguage = this.detectDeviceLanguage();
        return deviceLanguage;
      }

      // Her zaman telefon dilini kontrol et
      console.log('📱 Detecting device language...');
      const deviceLanguage = this.detectDeviceLanguage();
      
      const savedLanguage = storage.getString('selectedLanguage');

      // Eğer kullanıcı manuel olarak dil seçmişse onu kullan
      // Ama ilk açılışta telefon dilini kullan
      if (savedLanguage) {
        console.log('✅ User has selected language:', savedLanguage);
        console.log('   (Using saved preference)');
        return savedLanguage;
      }

      // İlk açılış: Telefon dilini tespit et ve kullan
      console.log('🆕 First time user - using device language:', deviceLanguage);
      
      // Tespit edilen dili kaydet (böylece bir sonraki açılışta bu kullanılır)
      storage.set('selectedLanguage', deviceLanguage);
      console.log('💾 Saved device language to storage:', deviceLanguage);

      return deviceLanguage;
    } catch (error) {
      console.error('❌ Language load error:', error);
      // Hata durumunda İngilizce döndür
      return 'en';
    }
  }

  detectDeviceLanguage() {
    try {
      console.log('📱 Detecting device language...');
      
      // Telefonun dilini al
      const locales = RNLocalize.getLocales();
      console.log('   Device locales:', locales?.map(l => `${l.languageCode}-${l.countryCode || ''}`).join(', '));

      if (locales && locales.length > 0) {
        // İlk locale'in dil kodunu al
        const deviceLanguageCode = locales[0].languageCode.toLowerCase(); // 'tr', 'en', 'de', vb.
        console.log('   Primary device language:', deviceLanguageCode);

        // Desteklenen diller
        const supportedLanguages = ['tr', 'en', 'de', 'fr', 'it', 'es', 'pt', 'ru', 'vi', 'km'];

        // Eğer telefon dili destekleniyorsa onu kullan
        if (supportedLanguages.includes(deviceLanguageCode)) {
          console.log('✅ Device language is supported:', deviceLanguageCode);
          return deviceLanguageCode;
        } else {
          console.log('⚠️  Device language not supported:', deviceLanguageCode);
          console.log('   Supported languages:', supportedLanguages.join(', '));
        }
      }

      // Desteklenmeyen dil ise varsayılan İngilizce
      console.log('➡️  Defaulting to English (device language not supported)');
      return 'en';
    } catch (error) {
      console.error('❌ Device language detection error:', error);
      // Hata durumunda İngilizce döndür
      return 'en';
    }
  }

  /**
   * Get device country code (e.g., 'TR', 'US', 'DE')
   * @returns {string} Country code or 'TR' as default
   */
  getDeviceCountryCode() {
    try {
      const locales = RNLocalize.getLocales();
      
      if (locales && locales.length > 0 && locales[0].countryCode) {
        const countryCode = locales[0].countryCode.toUpperCase();
        console.log('🌍 Device country code:', countryCode);
        return countryCode;
      }

      // Fallback to Turkey if country code not available
      console.log('⚠️  Country code not available, defaulting to TR');
      return 'TR';
    } catch (error) {
      console.error('❌ Country code detection error:', error);
      return 'TR';
    }
  }

  setLanguage(language) {
    try {
      console.log('=== Changing Language ===');
      console.log('From:', this.currentLanguage);
      console.log('To:', language);
      
      // Önce currentLanguage'i güncelle
      this.currentLanguage = language;
      
      if (!storage) {
        console.warn('❌ Storage not available, cannot save language');
        return;
      }
      
      // Storage'a kaydet (kullanıcı tercihi olarak)
      storage.set('selectedLanguage', language);
      console.log('✅ Language preference saved to storage!');
      console.log('   Next app launch will use:', language);
    } catch (error) {
      console.error('❌ Language save error:', error);
      // Hata durumunda bile current language'i güncelle
      this.currentLanguage = language;
    }
  }

  getTranslation(key) {
    try {
      // Her zaman instance'ın currentLanguage'ini kullan
      const currentLang = this.currentLanguage;
      
      const translation = translations[currentLang];

      if (!translation) {
        console.warn(`Translation not found for language: ${currentLang}, falling back to English`);
        // Fallback to English
        return translations['en']?.[key] || key;
      }

      const value = translation[key];
      
      // Eğer değer yoksa veya boş string ise, İngilizce'ye fallback yap
      if (!value || value.trim() === '') {
        const englishValue = translations['en']?.[key];
        if (englishValue && englishValue.trim() !== '') {
          return englishValue;
        }
        console.warn(`Translation key not found: ${key} for language: ${currentLang}`);
        return key;
      }

      return value;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  }

  getAvailableLanguages() {
    return [
      { code: 'tr', name: 'Türkçe' },
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'it', name: 'Italiano' },
      { code: 'es', name: 'Español' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' },
      { code: 'vi', name: 'Tiếng Việt' },
      { code: 'km', name: 'ភាសាខ្មែរ' }
    ];
  }

  // Helper method for easy access
  t(key) {
    return this.getTranslation(key);
  }

  // Debug method to check if all languages are loaded
  checkLanguages() {
    console.log('=== Language Check ===');
    console.log('Current Language:', this.currentLanguage);
    console.log('Available Languages:', Object.keys(translations));
    
    Object.keys(translations).forEach(lang => {
      const keys = Object.keys(translations[lang]);
      console.log(`${lang}: ${keys.length} keys loaded`);
      
      // Check for empty values
      const emptyKeys = keys.filter(k => !translations[lang][k] || translations[lang][k].trim() === '');
      if (emptyKeys.length > 0) {
        console.warn(`${lang} has ${emptyKeys.length} empty translations`);
      }
    });
    console.log('===================');
  }
}

export default new LanguageService();
