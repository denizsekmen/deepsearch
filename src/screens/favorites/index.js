import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toWidth, toHeight } from "../../theme/helpers";
import { useLanguage } from "../../context/LanguageContext";
import Typography from "../../components/Typography";
import SvgAsset from "../../components/SvgAsset";
import useCustomAlert from "../../hooks/useCustomAlert";
import CustomAlert from "../../components/modal/CustomAlert";
import { useIAPContext } from "../../context/IAPContext";
import { INSTAGRAM_COLORS } from "../../theme/instagramColors";
import { getHistory, removeHistoryItem } from "../../services/searchHistoryService";

const FavoritesScreen = () => {
  const { t } = useLanguage();
  const { isPremium } = useIAPContext();
  const navigation = useNavigation();
  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } =
    useCustomAlert();
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSearches, setFilteredSearches] = useState([]);

  // Sayfa her görüntülendiğinde aramaları yenile
  useFocusEffect(
    React.useCallback(() => {
      loadSavedSearches();
    }, [])
  );

  // Search query değiştiğinde filtrele
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = savedSearches.filter((search) => {
        const searchString = `${search.query} ${search.type}`.toLowerCase();
        return searchString.includes(query);
      });
      setFilteredSearches(filtered);
    } else {
      setFilteredSearches(savedSearches);
    }
  }, [searchQuery, savedSearches]);

  const loadSavedSearches = () => {
    try {
      const history = getHistory();
      // En yeni aramalar en üstte
      const sortedSearches = history.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setSavedSearches(sortedSearches);
      setFilteredSearches(sortedSearches);
    } catch (error) {
      console.error("Load searches error:", error);
      setSavedSearches([]);
      setFilteredSearches([]);
    }
  };

  const handleDeleteSearch = (searchId) => {
    try {
      removeHistoryItem(searchId);
      loadSavedSearches();
    } catch (error) {
      console.error("Delete search error:", error);
      showError(t('error'), t('failedToDeleteSearch'));
    }
  };

  const handleOpenSearch = (search) => {
    navigation.navigate("SearchResults", {
      type: search.type,
      query: search.query,
    });
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

  const renderSearchCard = (search, index) => {
    return (
      <TouchableOpacity
        key={search.id}
        style={styles.searchCard}
        onPress={() => handleOpenSearch(search)}
        activeOpacity={0.7}
      >
        <View style={styles.searchCardContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                {search.query.charAt(0).toUpperCase()}
              </Typography>
            </View>
          </View>

          <View style={styles.searchInfo}>
            <View style={styles.searchHeaderRow}>
              <Typography
                size={14}
                color={INSTAGRAM_COLORS.textPrimary}
                weight="600"
                numberOfLines={1}
                style={styles.searchQuery}
              >
                {search.query}
              </Typography>
              <View style={styles.typeBadge}>
                <Typography size={10} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                  {t(`searchType${search.type.charAt(0).toUpperCase() + search.type.slice(1)}`)}
                </Typography>
              </View>
            </View>
            <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
              {formatDate(search.timestamp)}
            </Typography>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteSearch(search.id);
            }}
            activeOpacity={0.7}
          >
            <SvgAsset name="close" color={INSTAGRAM_COLORS.textSecondary} style={styles.removeIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Typography
        size={16}
        color={INSTAGRAM_COLORS.textSecondary}
        weight="400"
        style={styles.emptyTitle}
      >
        {t('noSavedSearches')}
      </Typography>
      <Typography
        size={14}
        color={INSTAGRAM_COLORS.textTertiary}
        weight="400"
        style={styles.emptyDescription}
      >
        {t('recentSearchesDescription')}
      </Typography>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("SearchHome")}
        activeOpacity={0.7}
      >
        <View style={styles.emptyButtonInner}>
          <Typography size={14} color={INSTAGRAM_COLORS.textLink} weight="600">
            {t('startSearching')}
          </Typography>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Instagram-style Header */}
      <View style={styles.header}>
        <Typography
          size={18}
          color={INSTAGRAM_COLORS.textPrimary}
          weight="700"
          style={styles.headerTitle}
        >
          {t('favorites')}
        </Typography>
      </View>

      {/* Search Bar */}
      {savedSearches.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <SvgAsset
              name="search"
              color={INSTAGRAM_COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={INSTAGRAM_COLORS.textTertiary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Typography size={14} color={INSTAGRAM_COLORS.textLink} weight="600">
                  {t('cancel')}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSearches.length === 0 ? (
          searchQuery.trim() ? (
            <View style={styles.noResultsContainer}>
              <Typography
                size={14}
                color={INSTAGRAM_COLORS.textSecondary}
                weight="400"
              >
                {t('noResults')}
              </Typography>
            </View>
          ) : (
            renderEmptyState()
          )
        ) : (
          <View style={styles.searchesList}>
            {filteredSearches.map((search, index) =>
              renderSearchCard(search, index)
            )}
          </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  header: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(12),
    paddingBottom: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  headerTitle: {
    // Left aligned
  },
  searchContainer: {
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(10),
    paddingHorizontal: toWidth(12),
    paddingVertical: toHeight(10),
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: toHeight(8),
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
  },
  searchesList: {
    // List container
  },
  searchCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  searchCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(12),
  },
  avatarContainer: {
    marginRight: toWidth(12),
  },
  avatar: {
    width: toWidth(44),
    height: toWidth(44),
    borderRadius: toWidth(22),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInfo: {
    flex: 1,
  },
  searchHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: toHeight(4),
    gap: toWidth(8),
  },
  searchQuery: {
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: toWidth(6),
    paddingVertical: toHeight(2),
  },
  deleteButton: {
    padding: toWidth(8),
    marginLeft: toWidth(8),
  },
  removeIcon: {
    width: toWidth(18),
    height: toHeight(18),
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: toHeight(40),
    paddingHorizontal: toWidth(32),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: toHeight(60),
    paddingHorizontal: toWidth(32),
  },
  emptyTitle: {
    marginBottom: toHeight(8),
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    marginBottom: toHeight(24),
  },
  emptyButton: {
    borderRadius: toWidth(8),
    overflow: "hidden",
  },
  emptyButtonInner: {
    paddingVertical: toHeight(12),
    paddingHorizontal: toWidth(24),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
});

export default FavoritesScreen;
