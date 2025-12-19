import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Typography from '../../components/Typography';
import { toWidth, toHeight } from '../../theme/helpers';
import { useLanguage } from '../../context/LanguageContext';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';
import SvgAsset from '../../components/SvgAsset';

// Mock trending searches - later can be fetched from server
const MOCK_TRENDING = [
  { query: 'Elon Musk', type: 'name', count: 12500 },
  { query: 'Bill Gates', type: 'name', count: 9800 },
  { query: 'Mark Zuckerberg', type: 'name', count: 8500 },
  { query: 'Jeff Bezos', type: 'name', count: 7200 },
  { query: 'Tim Cook', type: 'name', count: 6500 },
  { query: 'Sundar Pichai', type: 'name', count: 5400 },
  { query: 'Warren Buffett', type: 'name', count: 4800 },
  { query: 'Oprah Winfrey', type: 'name', count: 4200 },
  { query: 'Taylor Swift', type: 'name', count: 3800 },
  { query: 'Cristiano Ronaldo', type: 'name', count: 3500 },
  { query: 'Lionel Messi', type: 'name', count: 3200 },
  { query: 'Barack Obama', type: 'name', count: 3000 },
];

export default function TrendingScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [trending] = useState(MOCK_TRENDING);

  const handleSearch = (item) => {
    navigation.navigate('SearchResults', {
      type: item.type,
      query: item.query,
    });
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
          {t('popular')}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {trending.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trendingItem}
            onPress={() => handleSearch(item)}
            activeOpacity={0.7}
          >
            <View style={styles.trendingItemLeft}>
              <View style={styles.rankBadge}>
                <Typography size={12} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                  #{index + 1}
                </Typography>
              </View>
              <View style={styles.trendingItemContent}>
                <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="600" style={styles.trendingQuery}>
                  {item.query}
                </Typography>
                <Typography size={12} color={INSTAGRAM_COLORS.textSecondary} weight="400">
                  {t(`searchType${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)} · {item.count.toLocaleString()}{t('searchesCount')}
                </Typography>
              </View>
            </View>
            <SvgAsset name="angle_right" color={INSTAGRAM_COLORS.textSecondary} style={styles.chevron} />
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Typography size={11} color={INSTAGRAM_COLORS.textTertiary} weight="400" style={styles.footerText}>
            {t('updatedWeekly')}
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
  title: {
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
    paddingTop: toHeight(8),
    paddingBottom: toHeight(90), // Tab bar height (70) + safe area (20)
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  trendingItemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  rankBadge: {
    width: toWidth(32),
    height: toWidth(32),
    borderRadius: toWidth(16),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: toWidth(12),
  },
  trendingItemContent: {
    flex: 1,
  },
  trendingQuery: {
    marginBottom: toHeight(4),
  },
  chevron: {
    width: toWidth(20),
    height: toHeight(20),
    marginLeft: toWidth(8),
  },
  footer: {
    marginTop: toHeight(24),
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(16),
  },
  footerText: {
    textAlign: 'center',
  },
});

