import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import Typography from '../../components/Typography';
import { toWidth, toHeight } from '../../theme/helpers';
import { useIAPContext } from '../../context/IAPContext';
import { useLanguage } from '../../context/LanguageContext';
import peopleSearchProvider from '../../services/peopleSearchProvider';
import { limitResultsForFreeTier, canPerformFreeSearch, recordSearch } from '../../services/freeUsageService';
import { addToHistory } from '../../services/searchHistoryService';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/modal/CustomAlert';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';
import SvgAsset from '../../components/SvgAsset';

export default function SearchResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { isPremium, showSubscriptionModal } = useIAPContext();
  const { alertConfig, showConfirm, hideAlert } = useCustomAlert();

  const { type, query, extraDetails } = route.params || {};
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query || !type) {
      navigation.goBack();
      return;
    }

    performSearch();
  }, []);

  const performSearch = async () => {
    try {
      setLoading(true);

      // Check free tier limits
      if (!isPremium && !canPerformFreeSearch()) {
        showConfirm(
          t('dailyLimitReached'),
          t('dailyLimitMessage'),
          () => {
            showSubscriptionModal();
          },
          {
            confirmText: t('upgradeToPremium'),
            cancelText: t('cancel'),
            type: 'warning',
          }
        );
        setLoading(false);
        return;
      }

      // Record search attempt
      if (!isPremium) {
        const allowed = recordSearch();
        if (!allowed) {
          showConfirm(
            t('dailyLimitReached'),
            t('dailyLimitMessage'),
            () => {
              showSubscriptionModal();
            },
            {
              confirmText: t('upgradeToPremium'),
              cancelText: t('cancel'),
              type: 'warning',
            }
          );
          setLoading(false);
          return;
        }
      }

      // Perform search
      let searchResults = [];
      const details = extraDetails || '';
      switch (type) {
        case 'name':
          searchResults = await peopleSearchProvider.searchByName(query, details);
          break;
        case 'phone':
          searchResults = await peopleSearchProvider.searchByPhone(query, details);
          break;
        case 'email':
          searchResults = await peopleSearchProvider.searchByEmail(query, details);
          break;
        case 'username':
          searchResults = await peopleSearchProvider.searchByUsername(query, details);
          break;
        default:
          throw new Error('Invalid search type');
      }

      // Limit results for free tier
      const limitedResults = limitResultsForFreeTier(searchResults, isPremium);
      setResults(limitedResults);

      // Add to history
      addToHistory(type, query, limitedResults.length);
    } catch (err) {
      console.error('Search error:', err);
      
      // Don't show errors to user - always return empty results
      // AI service will handle errors and provide responses
      // User will see "No results" message which is fine
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result) => {
    navigation.navigate('ProfileDetail', { result, query, type });
  };

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

  const renderResultCard = (result, index) => {
    const isLocked = !isPremium && index >= 2; // First 2 are free

    return (
      <TouchableOpacity
        key={index}
        style={styles.resultCard}
        onPress={() => !isLocked && handleViewDetails(result)}
        activeOpacity={0.7}
        disabled={isLocked}
      >
        {isLocked && (
          <BlurView style={styles.blurOverlay} blurType="dark" blurAmount={10}>
            <View style={styles.lockOverlay}>
              <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="700">
                {t('premiumRequired')}
              </Typography>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={showSubscriptionModal}
                activeOpacity={0.7}
              >
                <View style={styles.unlockButtonInner}>
                  <Typography size={13} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                    {t('unlock')}
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}

        {/* Instagram-style profile header */}
        <View style={styles.cardHeader}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                {result.title.charAt(0).toUpperCase()}
              </Typography>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileHeaderRow}>
                <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.profileName}>
                  {result.title}
                </Typography>
                {result.metadata?.verified && (
                  <View style={styles.verifiedBadge}>
                    <SvgAsset name="check" color={INSTAGRAM_COLORS.verified} style={styles.verifiedIcon} />
                  </View>
                )}
              </View>
              <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                {result.sourceName}
              </Typography>
            </View>
          </View>
          <SvgAsset name="angle_right" color={INSTAGRAM_COLORS.textSecondary} style={styles.chevron} />
        </View>

        {/* Content */}
        {result.subtitle && (
          <Typography size={13} color={INSTAGRAM_COLORS.textPrimary} weight="400" style={styles.cardSubtitle}>
            {result.subtitle}
          </Typography>
        )}

        {result.highlights && result.highlights.length > 0 && (
          <View style={styles.highlights}>
            {result.highlights.slice(0, 2).map((highlight, idx) => (
              <View key={idx} style={styles.highlightItem}>
                <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                  {highlight}
                </Typography>
              </View>
            ))}
          </View>
        )}

        {/* Actions - Instagram style */}
        <View style={styles.cardActions}>
          {result.url && !isLocked && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleOpenUrl(result.url);
              }}
              activeOpacity={0.7}
            >
              <Typography size={13} color={INSTAGRAM_COLORS.textLink} weight="600">
                {t('openLink')}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={INSTAGRAM_COLORS.textLink} />
          <Typography size={14} color={INSTAGRAM_COLORS.textSecondary} weight="400" style={styles.loadingText}>
            {t('searching')}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerContent}>
          <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.headerTitle}>
            {query}
          </Typography>
          <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
            {t(`searchType${type.charAt(0).toUpperCase() + type.slice(1)}`)} · {results.length}{t('results')}
          </Typography>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography size={16} color={INSTAGRAM_COLORS.textSecondary} weight="400">
              {t('noResults')}
            </Typography>
            <Typography size={14} color={INSTAGRAM_COLORS.textTertiary} style={styles.emptyText}>
              {t('tryDifferentQuery')}
            </Typography>
          </View>
        ) : (
          <>
            {results.map((result, index) => renderResultCard(result, index))}
            {!isPremium && results.length >= 2 && (
              <View style={styles.upgradePrompt}>
                <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.upgradeTitle}>
                  {t('unlockAllResults')}
                </Typography>
                <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} style={styles.upgradeText}>
                  {t('upgradeToSeeAllSources')}
                </Typography>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={showSubscriptionModal}
                  activeOpacity={0.7}
                >
                  <View style={styles.upgradeButtonInner}>
                    <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                      {t('upgrade')}
                    </Typography>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: toHeight(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(12),
    paddingBottom: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  backButton: {
    padding: toWidth(8),
    marginRight: toWidth(8),
  },
  backIcon: {
    width: toWidth(24),
    height: toHeight(24),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: toHeight(2),
    // Left aligned
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: toHeight(8),
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
  },
  resultCard: {
    backgroundColor: INSTAGRAM_COLORS.background,
    paddingVertical: toHeight(12),
    paddingHorizontal: toWidth(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
    position: 'relative',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  lockOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: toWidth(20),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  unlockButton: {
    marginTop: toHeight(12),
  },
  unlockButtonInner: {
    paddingVertical: toHeight(10),
    paddingHorizontal: toWidth(20),
    backgroundColor: INSTAGRAM_COLORS.buttonPrimary,
    borderRadius: toWidth(8),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: toHeight(8),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: toWidth(44),
    height: toWidth(44),
    borderRadius: toWidth(22),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: toWidth(12),
  },
  profileInfo: {
    flex: 1,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: toHeight(2),
  },
  profileName: {
    marginRight: toWidth(6),
  },
  verifiedBadge: {
    width: toWidth(16),
    height: toWidth(16),
    borderRadius: toWidth(8),
    backgroundColor: INSTAGRAM_COLORS.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    width: toWidth(10),
    height: toHeight(10),
  },
  chevron: {
    width: toWidth(20),
    height: toHeight(20),
  },
  cardSubtitle: {
    marginBottom: toHeight(8),
    lineHeight: 18,
  },
  highlights: {
    marginBottom: toHeight(8),
  },
  highlightItem: {
    marginBottom: toHeight(4),
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: toHeight(8),
  },
  actionButton: {
    paddingVertical: toHeight(8),
    paddingHorizontal: toWidth(12),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: toHeight(60),
    paddingHorizontal: toWidth(32),
  },
  emptyText: {
    marginTop: toHeight(8),
    textAlign: 'center',
  },
  upgradePrompt: {
    marginHorizontal: toWidth(16),
    marginTop: toHeight(16),
    padding: toWidth(16),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
  },
  upgradeTitle: {
    marginBottom: toHeight(4),
  },
  upgradeText: {
    marginBottom: toHeight(12),
    textAlign: 'center',
  },
  upgradeButton: {
    borderRadius: toWidth(8),
    overflow: 'hidden',
    width: '100%',
  },
  upgradeButtonInner: {
    paddingVertical: toHeight(12),
    paddingHorizontal: toWidth(24),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    borderRadius: toWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

