# 🌍 Localization (i18n) Yapısı

CrosshairPro uygulaması için çoklu dil desteği yapılandırması.

## 📁 Klasör Yapısı

```
i18n/
└── locales/
    ├── tr.json    # Türkçe çeviriler
    ├── en.json    # İngilizce çeviriler
    ├── de.json    # Almanca çeviriler (opsiyonel)
    ├── fr.json    # Fransızca çeviriler (opsiyonel)
    ├── it.json    # İtalyanca çeviriler (opsiyonel)
    └── es.json    # İspanyolca çeviriler (opsiyonel)
```

## 🚀 Kullanım

### Yeni Çeviri Anahtarı Eklemek

1. **JSON dosyasına ekleyin:**
```json
{
  "myNewKey": "Çeviri metni"
}
```

2. **Kodda kullanın:**
```javascript
import { useLanguage } from '../context/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  
  return (
    <Text>{t('myNewKey')}</Text>
  );
};
```

### Yeni Dil Eklemek

1. **Yeni JSON dosyası oluşturun:**
   - `i18n/locales/de.json` (örnek: Almanca için)

2. **`languageService.js` dosyasını güncelleyin:**
```javascript
// Import ekleyin
import de from '../../i18n/locales/de.json';

// translations objesine ekleyin
const translations = {
  tr,
  en,
  de, // Yeni dil
};

// getAvailableLanguages metodunda aktif edin
getAvailableLanguages() {
  return [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' }, // Yeni dil
  ];
}
```

## 📝 JSON Dosya Formatı

Tüm çeviri dosyaları aynı key yapısına sahip olmalıdır:

```json
{
  "keyName": "Translation text",
  "anotherKey": "Another translation",
  "nestedKey": "You can use {variable} for dynamic content"
}
```

### Key Naming Conventions

- **camelCase** kullanın: `crosshairDesigner`, `saveDesign`
- **Anlamlı isimler** verin: `buttonSave` yerine `save`
- **Gruplama** için prefix kullanın: 
  - `onboarding*`: `onboardingTitle1`, `onboardingSubtitle1`
  - `settings*`: `settingsLanguage`, `settingsClearData`
  - `error*`: `errorOccurred`, `errorSaving`

## 🔄 Dinamik İçerik

Değişken içeren çeviriler için:

```json
{
  "savePercent": "%{discount} Tasarruf"
}
```

Kullanım:
```javascript
const message = t('savePercent').replace('{discount}', discount);
```

## ✅ Best Practices

1. **Tutarlılık**: Tüm dil dosyalarında aynı keyleri tutun
2. **Alfabetik sıralama**: JSON dosyalarını düzenli tutun
3. **Yorum satırı kullanmayın**: JSON formatı yorum satırlarını desteklemez
4. **Test edin**: Her yeni çeviri eklendiğinde tüm dillerde test edin
5. **Boşluklar**: Gereksiz boşlukları temizleyin

## 🌐 Desteklenen Diller

- 🇹🇷 Türkçe (tr) - Aktif
- 🇬🇧 İngilizce (en) - Aktif
- 🇩🇪 Almanca (de) - İleride eklenebilir
- 🇫🇷 Fransızca (fr) - İleride eklenebilir
- 🇮🇹 İtalyanca (it) - İleride eklenebilir
- 🇪🇸 İspanyolca (es) - İleride eklenebilir

## 🛠️ Geliştirme Notları

- Varsayılan dil: Türkçe (`tr`)
- Fallback dil: İngilizce (`en`)
- Dil algılama: Cihazın sistem dilini otomatik algılar
- Depolama: MMKV kullanarak kullanıcının seçimini saklar

## 📱 Context API Kullanımı

```javascript
import { useLanguage } from '../context/LanguageContext';

const MyScreen = () => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  
  // Çeviri al
  const title = t('crosshairDesigner');
  
  // Dil değiştir
  const changeLanguage = () => {
    setLanguage('en');
  };
  
  return (
    <View>
      <Text>{title}</Text>
      <Button onPress={changeLanguage} title="Change to English" />
    </View>
  );
};
```

## 🚨 Önemli Notlar

- JSON dosyalarında **trailing comma** kullanmayın
- Tüm değerler **string** olmalı
- Özel karakterler için **escape** kullanın: `\"`, `\'`, `\\`
- Çok satırlı metinler için `\n` kullanın

## 📊 Çeviri Durumu

| Dil | Durum | Tamamlanma |
|-----|-------|------------|
| 🇹🇷 TR | ✅ Aktif | 100% |
| 🇬🇧 EN | ✅ Aktif | 100% |
| 🇩🇪 DE | ⏸️ Beklemede | 0% |
| 🇫🇷 FR | ⏸️ Beklemede | 0% |
| 🇮🇹 IT | ⏸️ Beklemede | 0% |
| 🇪🇸 ES | ⏸️ Beklemede | 0% |

