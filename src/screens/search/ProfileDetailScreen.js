import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Typography from '../../components/Typography';
import { toWidth, toHeight } from '../../theme/helpers';
import { useLanguage } from '../../context/LanguageContext';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';
import SvgAsset from '../../components/SvgAsset';

export default function ProfileDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { result, query, type } = route.params || {};

  if (!result) {
    navigation.goBack();
    return null;
  }

  const handleOpenUrl = async (url) => {
    if (url) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (err) {
        console.error('Error opening URL:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Instagram-style Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <SvgAsset name="angle_left" color={INSTAGRAM_COLORS.textPrimary} style={styles.backIcon} />
        </TouchableOpacity>
        <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.headerTitle}>
          {result.title}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instagram-style Profile Header */}
        <View style={styles.profileHeader}>
          {/* Large Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Typography size={32} color={INSTAGRAM_COLORS.textPrimary} weight="700">
                {result.title.charAt(0).toUpperCase()}
              </Typography>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileHeaderRow}>
              <Typography size={18} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.profileName}>
                {result.title}
              </Typography>
              {result.metadata?.verified && (
                  <View style={styles.verifiedBadge}>
                    <SvgAsset name="check" color={INSTAGRAM_COLORS.verified} style={styles.verifiedIcon} />
                  </View>
              )}
            </View>
            <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400" style={styles.sourceName}>
              {result.sourceName}
            </Typography>
            {result.subtitle && (
              <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="400" style={styles.bio}>
                {result.subtitle}
              </Typography>
            )}
          </View>
        </View>

        {/* Highlights - Instagram style */}
        {result.highlights && result.highlights.length > 0 && (
          <View style={styles.section}>
            <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.sectionTitle}>
              {t('information')}
            </Typography>
            {result.highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <Typography size={13} color={INSTAGRAM_COLORS.textPrimary} weight="400">
                  {highlight}
                </Typography>
              </View>
            ))}
          </View>
        )}

        {/* Action Button - Instagram style */}
        {result.url && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenUrl(result.url)}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonInner}>
                <Typography size={14} color={INSTAGRAM_COLORS.textLink} weight="600">
                  {t('openOn')}{result.sourceName}
                </Typography>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Disclaimer - Instagram style */}
        <View style={styles.disclaimer}>
          <Typography size={11} color={INSTAGRAM_COLORS.textTertiary} weight="400" style={styles.disclaimerText}>
            {t('publicInfoOnly')}
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(12),
    paddingBottom: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  backButton: {
    padding: toWidth(8),
  },
  backIcon: {
    width: toWidth(24),
    height: toHeight(24),
  },
  headerTitle: {
    flex: 1,
    // Left aligned
  },
  headerSpacer: {
    width: toWidth(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(20),
    paddingBottom: toHeight(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  avatarContainer: {
    marginRight: toWidth(16),
  },
  avatar: {
    width: toWidth(86),
    height: toWidth(86),
    borderRadius: toWidth(43),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: toHeight(4),
  },
  profileName: {
    marginRight: toWidth(6),
  },
  verifiedBadge: {
    width: toWidth(18),
    height: toWidth(18),
    borderRadius: toWidth(9),
    backgroundColor: INSTAGRAM_COLORS.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    width: toWidth(12),
    height: toHeight(12),
  },
  sourceName: {
    marginBottom: toHeight(8),
  },
  bio: {
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  sectionTitle: {
    marginBottom: toHeight(12),
  },
  highlightItem: {
    marginBottom: toHeight(8),
  },
  actions: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(16),
  },
  actionButton: {
    borderRadius: toWidth(8),
    overflow: 'hidden',
  },
  actionButtonInner: {
    paddingVertical: toHeight(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  disclaimer: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(16),
  },
  disclaimerText: {
    textAlign: 'center',
    lineHeight: 16,
  },
});

