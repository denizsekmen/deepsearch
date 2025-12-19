import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Typography from '../../components/Typography';
import { toWidth, toHeight } from '../../theme/helpers';
import { useIAPContext } from '../../context/IAPContext';
import { useLanguage } from '../../context/LanguageContext';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';
import SvgAsset from '../../components/SvgAsset';
import { getHistory } from '../../services/searchHistoryService';

// Mock popular searches - later can be fetched from server
const POPULAR_SEARCHES = [
  { query: 'Elon Musk', type: 'name' },
  { query: 'Bill Gates', type: 'name' },
  { query: 'Mark Zuckerberg', type: 'name' },
  { query: 'Jeff Bezos', type: 'name' },
  { query: 'Tim Cook', type: 'name' },
  { query: 'Sundar Pichai', type: 'name' },
  { query: 'Warren Buffett', type: 'name' },
  { query: 'Oprah Winfrey', type: 'name' },
];

export default function SearchHomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const { isPremium, showSubscriptionModal } = useIAPContext();
  const [searchType, setSearchType] = useState('name');
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [extraDetails, setExtraDetails] = useState('');
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const searchInputRef = useRef(null);
  const extraDetailsInputRef = useRef(null);

  // Generate SEARCH_TYPES dynamically using translations
  const SEARCH_TYPES = [
    { key: 'name', label: t('searchTypeName') },
    { key: 'phone', label: t('searchTypePhone') },
    { key: 'email', label: t('searchTypeEmail') },
    { key: 'username', label: t('searchTypeUsername') },
  ];

  // Generate SEARCH_TYPE_LABELS dynamically using translations
  const SEARCH_TYPE_LABELS = {
    name: t('searchTypeName'),
    phone: t('searchTypePhone'),
    email: t('searchTypeEmail'),
    username: t('searchTypeUsername'),
  };

  // Handle initial search type from route params
  useEffect(() => {
    if (route.params?.initialSearchType) {
      const type = route.params.initialSearchType;
      if (['name', 'phone', 'email', 'username'].includes(type)) {
        setSearchType(type);
        // Focus on input after a short delay
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 300);
      }
    }
  }, [route.params?.initialSearchType]);

  // Reset extra details when query is cleared
  useEffect(() => {
    if (!query.trim()) {
      setExtraDetails('');
      setShowExtraDetails(false);
    }
  }, [query]);

  const handleSearch = () => {
    if (!query.trim()) {
      return;
    }

    navigation.navigate('SearchResults', {
      type: searchType,
      query: query.trim(),
      extraDetails: extraDetails.trim(),
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadRecentSearches();
    }, [])
  );

  const loadRecentSearches = () => {
    const history = getHistory();
    setRecentSearches(history.slice(0, 5)); // Show only first 5
  };

  const handleQuickSearch = (quickQuery, quickType) => {
    navigation.navigate('SearchResults', {
      type: quickType,
      query: quickQuery,
    });
  };

  const validateInput = () => {
    if (!query.trim()) return false;

    switch (searchType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(query.trim());
      case 'phone':
        const phoneDigits = query.replace(/\D/g, '');
        return phoneDigits.length >= 7;
      case 'username':
        return query.trim().length >= 2;
      case 'name':
        return query.trim().length >= 2;
      default:
        return true;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins}${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours}${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays}${t('daysAgo')}`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Instagram-style Header */}
        <View style={styles.header}>
          <Typography size={18} color={INSTAGRAM_COLORS.textPrimary} weight="700" style={styles.headerTitle}>
            {t('searchHome')}
          </Typography>
        </View>

        {/* Search Bar - Instagram style */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <SvgAsset name="search" color={INSTAGRAM_COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={INSTAGRAM_COLORS.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={
                searchType === 'email' ? 'email-address' :
                searchType === 'phone' ? 'phone-pad' :
                'default'
              }
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                <Typography size={14} color={INSTAGRAM_COLORS.textLink} weight="600">
                  {t('cancel')}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Type Selector - Instagram style tabs */}
        <View style={styles.typeSelectorContainer}>
          <View style={styles.typeSelectorContent}>
            {SEARCH_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeButton,
                  searchType === type.key && styles.typeButtonActive,
                ]}
                onPress={() => setSearchType(type.key)}
                activeOpacity={0.7}
              >
                <View style={styles.typeButtonContent}>
                  <Typography
                    size={13}
                    color={searchType === type.key ? INSTAGRAM_COLORS.textPrimary : INSTAGRAM_COLORS.textSecondary}
                    weight={searchType === type.key ? "600" : "400"}
                  >
                    {type.label}
                  </Typography>
                  {searchType === type.key && <View style={styles.activeIndicator} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {query.length === 0 ? (
            <>
              {/* Popular Searches Section - Top */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                    {t('popular')}
                  </Typography>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Trending')}
                    activeOpacity={0.7}
                  >
                    <Typography size={12} color={INSTAGRAM_COLORS.textLink} weight="600">
                      {t('seeAll')}
                    </Typography>
                  </TouchableOpacity>
                </View>
                {POPULAR_SEARCHES.slice(0, 5).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.popularSearchItem}
                    onPress={() => handleQuickSearch(item.query, item.type)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.popularSearchRank}>
                      <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                        #{index + 1}
                      </Typography>
                    </View>
                    <View style={styles.popularSearchContent}>
                      <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="400">
                        {item.query}
                      </Typography>
                      <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                        {SEARCH_TYPE_LABELS[item.type]}
                      </Typography>
                    </View>
                    <SvgAsset name="angle_right" color={INSTAGRAM_COLORS.textSecondary} style={styles.chevron} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recent Searches Section */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                      {t('recent')}
                    </Typography>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SearchHistory')}
                      activeOpacity={0.7}
                    >
                      <Typography size={12} color={INSTAGRAM_COLORS.textLink} weight="600">
                        {t('seeAll')}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recentSearchItem}
                      onPress={() => handleQuickSearch(item.query, item.type)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recentSearchAvatar}>
                        <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                          {item.query.charAt(0).toUpperCase()}
                        </Typography>
                      </View>
                      <View style={styles.recentSearchContent}>
                        <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="400">
                          {item.query}
                        </Typography>
                        <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                          {SEARCH_TYPE_LABELS[item.type]} · {formatDate(item.timestamp)}
                        </Typography>
                      </View>
                      <SvgAsset name="angle_right" color={INSTAGRAM_COLORS.textSecondary} style={styles.chevron} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Info Section */}
              <View style={styles.infoSection}>
                <Typography size={11} color={INSTAGRAM_COLORS.textTertiary} weight="400" style={styles.infoText}>
                  {t('publicInfoOnly')}
                </Typography>
              </View>
            </>
          ) : (
            <View style={styles.searchReadyContainer}>
              <TouchableOpacity
                style={[styles.searchButton, !validateInput() && styles.searchButtonDisabled]}
                onPress={handleSearch}
                disabled={!validateInput()}
                activeOpacity={0.7}
              >
                <View style={[styles.searchButtonInner, !validateInput() && styles.searchButtonDisabledInner]}>
                  <Typography size={15} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                    {t('searchButton')} {SEARCH_TYPES.find(type => type.key === searchType)?.label}
                  </Typography>
                </View>
              </TouchableOpacity>

              {/* Give Extra Details Button */}
              <TouchableOpacity
                style={styles.extraDetailsButton}
                onPress={() => {
                  setShowExtraDetails(!showExtraDetails);
                  if (!showExtraDetails) {
                    setTimeout(() => {
                      extraDetailsInputRef.current?.focus();
                    }, 300);
                  }
                }}
                activeOpacity={0.7}
              >
                <Typography size={14} color={INSTAGRAM_COLORS.textLink} weight="500">
                  {showExtraDetails ? '−' : '+'} {t('giveExtraDetails')}
                </Typography>
              </TouchableOpacity>

              {/* Extra Details Hint */}
              <View style={styles.extraDetailsHintContainer}>
                <Typography size={12} color={INSTAGRAM_COLORS.textTertiary} weight="400" style={styles.extraDetailsHint}>
                  {t('extraDetailsHint')}
                </Typography>
              </View>

              {/* Extra Details TextInput - Animated */}
              {showExtraDetails && (
                <View style={styles.extraDetailsContainer}>
                  <TextInput
                    ref={extraDetailsInputRef}
                    style={styles.extraDetailsInput}
                    placeholder={t('extraDetailsPlaceholder')}
                    placeholderTextColor={INSTAGRAM_COLORS.textTertiary}
                    value={extraDetails}
                    onChangeText={setExtraDetails}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                    autoCorrect={true}
                  />
                </View>
              )}
            </View>
          )}

          {/* Premium Badge - Instagram style */}
          {!isPremium && (
            <View style={styles.premiumBadge}>
              <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400" style={styles.premiumText}>
                {t('upgradeForUnlimited')}
              </Typography>
              <TouchableOpacity
                style={styles.premiumLink}
                onPress={() => showSubscriptionModal("annual")}
                activeOpacity={0.7}
              >
                <Typography size={12} color={INSTAGRAM_COLORS.textLink} weight="600">
                  {t('upgradeToPremium')}
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(8),
    paddingBottom: toHeight(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  headerTitle: {
    // Left aligned
  },
  searchBarContainer: {
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(6),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(10),
    paddingHorizontal: toWidth(12),
    paddingVertical: toHeight(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  searchIcon: {
    width: toWidth(18),
    height: toHeight(18),
    marginRight: toWidth(8),
  },
  searchInput: {
    flex: 1,
    color: INSTAGRAM_COLORS.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  clearButton: {
    paddingLeft: toWidth(8),
  },
  typeSelectorContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  typeSelectorContent: {
    flexDirection: 'row',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  typeButton: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: toHeight(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButtonActive: {
    // Active state handled by text color
  },
  typeButtonContent: {
    position: 'relative',
    paddingVertical: toHeight(8),
    paddingBottom: toHeight(10),
    alignItems: 'center',
    width: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: toHeight(6),
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: INSTAGRAM_COLORS.textPrimary,
  },
  scrollContent: {
    paddingTop: toHeight(4),
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
  },
  section: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(8),
    paddingBottom: toHeight(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: toHeight(12),
  },
  sectionTitle: {
    marginBottom: toHeight(12),
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: toHeight(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  recentSearchAvatar: {
    width: toWidth(36),
    height: toWidth(36),
    borderRadius: toWidth(18),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: toWidth(12),
  },
  recentSearchContent: {
    flex: 1,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: toHeight(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  popularSearchRank: {
    width: toWidth(28),
    height: toWidth(28),
    borderRadius: toWidth(14),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: toWidth(12),
  },
  popularSearchContent: {
    flex: 1,
  },
  chevron: {
    width: toWidth(20),
    height: toHeight(20),
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  quickActionIcon: {
    width: toWidth(40),
    height: toWidth(40),
    borderRadius: toWidth(20),
    backgroundColor: INSTAGRAM_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: toWidth(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  quickActionIconSvg: {
    width: toWidth(20),
    height: toHeight(20),
  },
  quickActionContent: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(8),
  },
  infoText: {
    textAlign: 'center',
  },
  searchReadyContainer: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
  },
  searchButton: {
    borderRadius: toWidth(8),
    overflow: 'hidden',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonInner: {
    backgroundColor: INSTAGRAM_COLORS.buttonPrimary,
    paddingVertical: toHeight(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabledInner: {
    backgroundColor: INSTAGRAM_COLORS.buttonDisabled,
  },
  premiumBadge: {
    marginHorizontal: toWidth(16),
    marginTop: toHeight(16),
    padding: toWidth(12),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: 'center',
  },
  premiumText: {
    marginBottom: toHeight(6),
    textAlign: 'center',
  },
  premiumLink: {
    paddingVertical: toHeight(4),
  },
  extraDetailsButton: {
    marginTop: toHeight(12),
    paddingVertical: toHeight(8),
    alignItems: 'center',
  },
  extraDetailsHintContainer: {
    paddingHorizontal: toWidth(16),
    marginTop: toHeight(4),
    marginBottom: toHeight(4),
  },
  extraDetailsHint: {
    textAlign: 'center',
    lineHeight: 16,
  },
  extraDetailsContainer: {
    marginTop: toHeight(12),
    paddingHorizontal: toWidth(16),
  },
  extraDetailsInput: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(10),
    paddingHorizontal: toWidth(12),
    paddingVertical: toHeight(12),
    color: INSTAGRAM_COLORS.textPrimary,
    fontSize: 14,
    minHeight: toHeight(100),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    textAlignVertical: 'top',
  },
});

