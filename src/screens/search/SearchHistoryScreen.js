import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Typography from '../../components/Typography';
import { toWidth, toHeight } from '../../theme/helpers';
import { useLanguage } from '../../context/LanguageContext';
import { getHistory, clearHistory, removeHistoryItem } from '../../services/searchHistoryService';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';
import SvgAsset from '../../components/SvgAsset';


export default function SearchHistoryScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = () => {
    const historyData = getHistory();
    setHistory(historyData);
  };

  const handleSearchAgain = (item) => {
    navigation.navigate('SearchResults', {
      type: item.type,
      query: item.query,
    });
  };

  const handleClearHistory = () => {
    Alert.alert(
      t('clearHistory'),
      t('clearHistoryConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: () => {
            clearHistory();
            loadHistory();
          },
        },
      ]
    );
  };

  const handleRemoveItem = (id) => {
    removeHistoryItem(id);
    loadHistory();
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
      {/* Instagram-style Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <SvgAsset name="angle_left" color={INSTAGRAM_COLORS.textPrimary} style={styles.backIcon} />
        </TouchableOpacity>
        <Typography size={18} color={INSTAGRAM_COLORS.textPrimary} weight="700" style={styles.title}>
          {t('recent')}
        </Typography>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Typography size={14} color={INSTAGRAM_COLORS.textLink} weight="600">
              {t('clear')}
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography size={16} color={INSTAGRAM_COLORS.textSecondary} weight="400">
              {t('noRecentSearches')}
            </Typography>
            <Typography size={14} color={INSTAGRAM_COLORS.textTertiary} style={styles.emptyText}>
              {t('recentSearchesDescription')}
            </Typography>
          </View>
        ) : (
          history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => handleSearchAgain(item)}
              activeOpacity={0.7}
            >
              {/* Instagram-style circular avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                    {item.query.charAt(0).toUpperCase()}
                  </Typography>
                </View>
              </View>

              {/* Content */}
              <View style={styles.historyItemContent}>
                <View style={styles.historyItemHeader}>
                  <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.historyQuery}>
                    {item.query}
                  </Typography>
                  <View style={styles.typeBadge}>
                    <Typography size={10} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                      {t(`searchType${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                    </Typography>
                  </View>
                </View>
                {item.resultCount > 0 && (
                  <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                    {item.resultCount}{t('results')} · {formatDate(item.timestamp)}
                  </Typography>
                )}
              </View>

              {/* X button - Instagram style */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(item.id);
                }}
                activeOpacity={0.7}
              >
                <SvgAsset name="close" color={INSTAGRAM_COLORS.textSecondary} style={styles.removeIcon} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
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
  title: {
    flex: 1,
    // Left aligned
  },
  clearButton: {
    padding: toWidth(8),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: toHeight(8),
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: toHeight(4),
    gap: toWidth(8),
  },
  historyQuery: {
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: toWidth(6),
    paddingVertical: toHeight(2),
  },
  removeButton: {
    padding: toWidth(8),
    marginLeft: toWidth(8),
  },
  removeIcon: {
    width: toWidth(18),
    height: toHeight(18),
  },
});

