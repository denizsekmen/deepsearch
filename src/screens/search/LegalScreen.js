import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Typography from '../../components/Typography';
import { toWidth, toHeight } from '../../theme/helpers';
import { useLanguage } from '../../context/LanguageContext';
import WebViewModal from '../../components/modal/WebViewModal';

const PRIVACY_POLICY_URL = 'https://deepsearchai.app/privacy';
const TERMS_URL = 'https://deepsearchai.app/terms';

export default function LegalScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [webViewSource, setWebViewSource] = useState(null);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

  const handleOpenPrivacy = () => {
    setWebViewSource(PRIVACY_POLICY_URL);
    setIsWebViewVisible(true);
  };

  const handleOpenTerms = () => {
    setWebViewSource(TERMS_URL);
    setIsWebViewVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Typography size={16} color="#667eea" weight="600">
            ← Back
          </Typography>
        </TouchableOpacity>
        <Typography size={24} color="#f1f5f9" weight="900" style={styles.title}>
          Legal
        </Typography>
        <Typography size={14} color="rgba(241, 245, 249, 0.6)" weight="400" style={styles.subtitle}>
          Privacy Policy and Terms of Service
        </Typography>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Typography size={16} color="#f1f5f9" weight="700" style={styles.sectionTitle}>
            Privacy & Terms
          </Typography>
          <Typography size={14} color="rgba(241, 245, 249, 0.7)" weight="400" style={styles.sectionText}>
            Please review our Privacy Policy and Terms of Service to understand how we handle your data and use our services.
          </Typography>
        </View>

        <TouchableOpacity
          style={styles.legalButton}
          onPress={handleOpenPrivacy}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#1DB954', '#1ed760']}
            style={styles.legalButtonGradient}
          >
            <Typography size={16} color="#FFFFFF" weight="700">
              Privacy Policy
            </Typography>
            <Typography size={12} color="rgba(255, 255, 255, 0.8)" weight="400" style={styles.buttonSubtext}>
              View our privacy policy
            </Typography>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legalButton}
          onPress={handleOpenTerms}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.legalButtonGradient}
          >
            <Typography size={16} color="#FFFFFF" weight="700">
              Terms of Service
            </Typography>
            <Typography size={12} color="rgba(255, 255, 255, 0.8)" weight="400" style={styles.buttonSubtext}>
              View our terms of service
            </Typography>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Typography size={12} color="rgba(241, 245, 249, 0.5)" weight="400" style={styles.disclaimerText}>
            DeepSearch AI only displays publicly available information. We do not access private data or violate privacy laws.
          </Typography>
        </View>
      </ScrollView>

      {isWebViewVisible && (
        <WebViewModal
          close={() => setIsWebViewVisible(false)}
          source={webViewSource}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: toWidth(24),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(12),
  },
  backButton: {
    marginBottom: toHeight(8),
  },
  title: {
    marginBottom: toHeight(4),
  },
  subtitle: {
    marginTop: toHeight(4),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: toWidth(24),
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
  },
  section: {
    marginBottom: toHeight(24),
    backgroundColor: '#1a1a1a',
    borderRadius: toWidth(12),
    padding: toWidth(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    marginBottom: toHeight(12),
  },
  sectionText: {
    lineHeight: 20,
  },
  legalButton: {
    borderRadius: toWidth(12),
    overflow: 'hidden',
    marginBottom: toHeight(16),
  },
  legalButtonGradient: {
    padding: toWidth(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSubtext: {
    marginTop: toHeight(4),
  },
  disclaimer: {
    marginTop: toHeight(24),
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: toWidth(12),
    padding: toWidth(16),
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  disclaimerText: {
    lineHeight: 18,
    textAlign: 'center',
  },
});

