import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toWidth, toHeight } from '../theme/helpers';
import { useLanguage } from '../context/LanguageContext';
import LanguageService from '../services/languageService';
import { INSTAGRAM_COLORS } from '../theme/instagramColors';
import Typography from './Typography';
import SvgAsset from './SvgAsset';

const LanguagePicker = ({ onLanguageChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages = LanguageService.getAvailableLanguages();
  
  // Debug
  console.log('LanguagePicker - languages:', languages);
  console.log('LanguagePicker - languages length:', languages?.length);

  const handleLanguageSelect = (languageCode) => {
    console.log('=== Language Selection ===');
    console.log('Selected language:', languageCode);
    console.log('Current language:', currentLanguage);
    
    // Dil değişikliğini yap
    changeLanguage(languageCode);
    
    // Callback varsa çağır
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
    
    // Modal'ı kapat
    setTimeout(() => {
      setIsVisible(false);
    }, 100);
    
    console.log('Language change completed');
  };

  const openModal = () => {
    console.log('Opening language modal');
    setIsVisible(true);
  };

  const closeModal = () => {
    console.log('Closing language modal');
    setIsVisible(false);
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === currentLanguage);
    return currentLang ? currentLang.name : 'Türkçe';
  };

  return (
    <>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <View style={styles.pickerContent}>
          <View style={styles.textContainer}>
            <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="400">
              {t('language')}
            </Typography>
            <Typography size={14} color={INSTAGRAM_COLORS.textSecondary} weight="400" style={styles.valueText}>
              {getCurrentLanguageName()}
            </Typography>
          </View>
          <SvgAsset name="angle_right" color={INSTAGRAM_COLORS.textSecondary} style={styles.chevron} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent} edges={['bottom']}>
              {/* Header - Instagram style */}
              <View style={styles.modalHeader}>
                <Typography size={18} color={INSTAGRAM_COLORS.textPrimary} weight="700" style={styles.modalTitle}>
                  {t('language')}
                </Typography>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                  activeOpacity={0.7}
                >
                  <SvgAsset name="close" color={INSTAGRAM_COLORS.textPrimary} style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              {/* Language Options - Instagram style */}
              {languages && languages.length > 0 ? (
                <ScrollView 
                  style={styles.languageListScroll}
                  contentContainerStyle={styles.languageList}
                  showsVerticalScrollIndicator={false}
                >
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.languageOption,
                        currentLanguage === language.code && styles.selectedLanguageOption
                      ]}
                      onPress={() => handleLanguageSelect(language.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.languageContent}>
                        <Typography 
                          size={14} 
                          color={INSTAGRAM_COLORS.textPrimary} 
                          weight={currentLanguage === language.code ? "600" : "400"}
                        >
                          {language.name}
                        </Typography>
                      </View>
                      {currentLanguage === language.code && (
                        <SvgAsset name="check" color={INSTAGRAM_COLORS.textLink} style={styles.checkmark} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <Typography size={14} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                    No languages available
                  </Typography>
                </View>
              )}
            </SafeAreaView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    marginHorizontal: toWidth(16),
    marginVertical: toHeight(8),
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(16),
  },
  textContainer: {
    flex: 1,
    gap: toHeight(4),
  },
  valueText: {
    marginTop: toHeight(2),
  },
  chevron: {
    width: toWidth(20),
    height: toHeight(20),
  },
  emptyContainer: {
    padding: toWidth(20),
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: INSTAGRAM_COLORS.background,
    borderTopLeftRadius: toWidth(20),
    borderTopRightRadius: toWidth(20),
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalContent: {
    flex: 1,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  modalTitle: {
    flex: 1,
  },
  closeButton: {
    padding: toWidth(8),
  },
  closeIcon: {
    width: toWidth(24),
    height: toHeight(24),
  },
  languageListScroll: {
    flex: 1,
    minHeight: 200,
  },
  languageList: {
    paddingTop: toHeight(8),
    paddingBottom: toHeight(40),
    flexGrow: 1,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  selectedLanguageOption: {
    backgroundColor: INSTAGRAM_COLORS.surface,
  },
  languageContent: {
    flex: 1,
  },
  checkmark: {
    width: toWidth(20),
    height: toHeight(20),
  },
});

export default LanguagePicker;