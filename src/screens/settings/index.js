import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useMemo, useState, useEffect, useRef } from "react";
import * as StoreReview from "react-native-store-review";
import { useIAPContext } from "../../context/IAPContext";
import { toWidth, toHeight } from "../../theme/helpers";
import SvgAsset from "../../components/SvgAsset";
import Typography from "../../components/Typography";
import WebViewModal from "../../components/modal/WebViewModal";
import LoadingModal from "../../components/LoadingModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MMKV } from "react-native-mmkv";
import LanguagePicker from "../../components/LanguagePicker";
import { useLanguage } from "../../context/LanguageContext";
import useCustomAlert from "../../hooks/useCustomAlert";
import CustomAlert from "../../components/modal/CustomAlert";
import { INSTAGRAM_COLORS } from "../../theme/instagramColors";

const Settings = () => {
  const { restorePurchase, showSubscriptionModal, isPremium } = useIAPContext();
  const { t } = useLanguage();
  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } =
    useCustomAlert();
  const [webViewSource, setWebViewSource] = useState(null);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTried, setUserTried] = useState(0);

  const storage = new MMKV();

  // Settings sayfasında premium modal'ı otomatik gösterme
  // useEffect(() => {
  //   if (!isPremium) {
  //     showSubscriptionModal();
  //   }
  // }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const totalTried = async () => {
      try {
        if (!mounted) return;
        
        // Timeout ekle - eğer 1 saniyeden uzun sürerse iptal et
        timeoutId = setTimeout(() => {
          if (mounted) {
            setLoading(false);
            setUserTried(0);
          }
        }, 1000);

        // Get combined translation count from both text and audio
        const textCount = await AsyncStorage.getItem("textTranslationsCount");
        const audioCount = await AsyncStorage.getItem("audioTranslationsCount");
        const totalCount =
          parseInt(textCount || "0", 10) + parseInt(audioCount || "0", 10);

        if (mounted) {
          clearTimeout(timeoutId);
          setUserTried(totalCount);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setUserTried(0);
        }
      }
    };

    // AsyncStorage işlemini başlat
    totalTried();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const termsAndConditionsUrl =
    "https://deepsearchai.app/terms";
  const privacyPolicyUrl =
    "https://deepsearchai.app/privacy";

  const MENU_ITEMS = useMemo(
    () => [
      {
        id: 0,
        name: t("language"),
        icon: "languageIcon",
        iconColor: "#1DB954",
        backgroundColor: "rgba(29, 185, 84, 0.15)",
        gradientColors: [
          "rgba(29, 185, 84, 0.2)",
          "rgba(29, 185, 84, 0.05)",
        ],
        description: t("language"),
        isChevronVisible: false,
        isCustomComponent: true,
        component: null, // LanguagePicker'ı render içinde göster
      },
      {
        id: 1,
        name: t("rateUs"),
        icon: "likeIcon",
        iconColor: "#FF6B6B",
        backgroundColor: "rgba(255, 107, 107, 0.15)",
        gradientColors: [
          "rgba(255, 107, 107, 0.2)",
          "rgba(255, 107, 107, 0.05)",
        ],
        description: t("shareExperience"),
        isChevronVisible: true,
        onPress: () => onPressMenuItem(StoreReview.requestReview),
      },
      {
        id: 3,
        name: t("restorePurchases"),
        icon: "ticketIcon",
        iconColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.15)",
        gradientColors: ["rgba(76, 175, 80, 0.2)", "rgba(76, 175, 80, 0.05)"],
        description: t("recoverPremium"),
        isChevronVisible: true,
        onPress: () => onPressMenuItem(restorePurchase),
      },
      {
        id: 5,
        name: t("termsOfUse"),
        icon: "shieldIcon",
        iconColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.15)",
        gradientColors: ["rgba(33, 150, 243, 0.2)", "rgba(33, 150, 243, 0.05)"],
        description: t("readTerms"),
        isChevronVisible: true,
        onPress: () =>
          onPressMenuItem(() => {
            setWebViewSource(termsAndConditionsUrl);
            setIsWebViewVisible(true);
          }),
      },
      {
        id: 4,
        name: t("privacyPolicy"),
        icon: "document2Icon",
        iconColor: "#9C27B0",
        backgroundColor: "rgba(156, 39, 176, 0.15)",
        gradientColors: ["rgba(156, 39, 176, 0.2)", "rgba(156, 39, 176, 0.05)"],
        description: t("readPrivacy"),
        isChevronVisible: true,
        onPress: () =>
          onPressMenuItem(() => {
            setWebViewSource(privacyPolicyUrl);
            setIsWebViewVisible(true);
          }),
      },
      {
        id: 6,
        name: t("contactUs"),
        icon: "email",
        iconColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.15)",
        gradientColors: ["rgba(255, 152, 0, 0.2)", "rgba(255, 152, 0, 0.05)"],
        description: t("contactUsDescription"),
        isChevronVisible: true,
        onPress: () =>
          onPressMenuItem(() => {
            setWebViewSource("http://bernsoftware.com/contact/");
            setIsWebViewVisible(true);
          }),
      },
    ],
    [t]
  );

  const onPressMenuItem = (func) => {
    if (func) func();
  };

  const handleMenuItemPress = (item) => {
    item.onPress();
  };

  // Loading state'i kaldır - sayfa hemen yüklensin
  // if (loading) {
  //   return <LoadingModal />;
  // }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <SafeAreaView edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: toHeight(190) }}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Instagram-style Header */}
          <View style={styles.header}>
            <Typography
              size={18}
              color={INSTAGRAM_COLORS.textPrimary}
              weight="700"
              style={styles.headerTitle}
            >
              {t("settings")}
            </Typography>
          </View>

          {/* Instagram-style Premium Section */}
          {!isPremium && (
            <View style={styles.premiumSection}>
              <TouchableOpacity
                onPress={showSubscriptionModal}
                activeOpacity={0.7}
                style={styles.premiumCard}
              >
                <View style={styles.premiumCardInner}>
                  <View style={styles.premiumContent}>
                    <View style={styles.premiumTextContainer}>
                      <Typography weight="700" size={16} color={INSTAGRAM_COLORS.textPrimary}>
                        {t("upgradeToPremium")}
                      </Typography>
                      <Typography
                        weight="400"
                        size={13}
                        color={INSTAGRAM_COLORS.textSecondary}
                        style={styles.premiumSubtext}
                      >
                        {t('unlimitedSearchesDescription')}
                      </Typography>
                    </View>
                    <SvgAsset
                      name="chevron_right"
                      color={INSTAGRAM_COLORS.textSecondary}
                      style={styles.premiumArrow}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Instagram-style Premium Status */}
          {isPremium && (
            <View style={styles.premiumStatusSection}>
              <View style={styles.premiumStatusCard}>
                <View style={styles.premiumStatusContent}>
                  <View style={styles.premiumStatusIcon}>
                    <Typography size={20} weight="700" color={INSTAGRAM_COLORS.premium}>
                      ✓
                    </Typography>
                  </View>
                  <View style={styles.premiumStatusTextContainer}>
                    <Typography weight="700" size={15} color={INSTAGRAM_COLORS.textPrimary}>
                      {t("premiumActive")}
                    </Typography>
                    <Typography
                      weight="400"
                      size={12}
                      color={INSTAGRAM_COLORS.textSecondary}
                    >
                      {t('unlimitedAccess')}
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Instagram-style Menu Section */}
          <View style={styles.menuSection}>
            {MENU_ITEMS.map((item, index) => (
              <View key={item.id}>
                {item.isCustomComponent && item.id === 0 ? (
                  <View style={styles.customComponentContainer}>
                    <LanguagePicker />
                  </View>
                ) : !item.isCustomComponent ? (
                  <TouchableOpacity
                    onPress={() => handleMenuItemPress(item)}
                    style={styles.settingsItemContainer}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingsItemContent}>
                      <View style={styles.settingsItemLeft}>
                        <View style={styles.iconContainer}>
                          <SvgAsset
                            name={item.icon}
                            style={styles.itemIcon}
                            color={INSTAGRAM_COLORS.textPrimary}
                          />
                        </View>
                        <View style={styles.itemTextContainer}>
                          <Typography size={14} color={INSTAGRAM_COLORS.textPrimary} weight="400">
                            {item.name}
                          </Typography>
                        </View>
                      </View>

                      {item.isChevronVisible && (
                        <SvgAsset
                          color={INSTAGRAM_COLORS.textSecondary}
                          name="angle_right"
                          style={styles.chevronIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ) : null}
                {index < MENU_ITEMS.length - 1 && !item.isCustomComponent && (
                  <View style={styles.itemDivider} />
                )}
              </View>
            ))}
          </View>

          {/* Instagram-style Footer */}
          <View style={styles.footer}>
            <Typography
              size={11}
              color={INSTAGRAM_COLORS.textTertiary}
              weight="400"
              style={styles.footerText}
            >
              {t("appVersion")}
            </Typography>
          </View>
        </ScrollView>
      </SafeAreaView>

      {isWebViewVisible && (
        <WebViewModal
          close={() => setIsWebViewVisible(false)}
          source={webViewSource}
        />
      )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  scrollView: {
    width: "100%",
    height: "100%",
  },
  header: {
    paddingTop: toHeight(12),
    paddingBottom: toHeight(12),
    paddingHorizontal: toWidth(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INSTAGRAM_COLORS.border,
  },
  headerTitle: {
    textAlign: "center",
  },
  headerContent: {},
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: toHeight(8),
  },
  headerTitle: {
    lineHeight: 48,
    letterSpacing: -1,
  },
  headerAccent: {
    width: toWidth(6),
    height: toHeight(40),
    backgroundColor: "#1DB954",
    borderRadius: toWidth(3),
    marginLeft: toWidth(12),
  },
  headerSubtitle: {
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  premiumSection: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(8),
  },
  premiumCard: {
    borderRadius: toWidth(8),
    overflow: "hidden",
  },
  premiumCardInner: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    padding: toWidth(16),
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumSubtext: {
    marginTop: toHeight(4),
  },
  premiumArrow: {
    width: toWidth(20),
    height: toHeight(20),
  },
  freeTrialContainer: {
    alignItems: "center",
    marginTop: toHeight(16),
  },
  freeTrialBadge: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    paddingHorizontal: toWidth(20),
    paddingVertical: toHeight(12),
    borderRadius: toWidth(25),
    borderWidth: 1.5,
    borderColor: "rgba(241, 245, 249, 0.15)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  freeTrialDot: {
    width: toWidth(8),
    height: toWidth(8),
    borderRadius: toWidth(4),
    backgroundColor: "#FF6B6B",
    marginRight: toWidth(8),
  },
  premiumStatusSection: {
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(16),
    paddingBottom: toHeight(8),
  },
  premiumStatusCard: {
    borderRadius: toWidth(8),
    overflow: "hidden",
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  premiumStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: toWidth(16),
  },
  premiumStatusIcon: {
    width: toWidth(40),
    height: toWidth(40),
    borderRadius: toWidth(20),
    backgroundColor: INSTAGRAM_COLORS.premium + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: toWidth(12),
  },
  premiumStatusTextContainer: {
    flex: 1,
  },
  menuSection: {
    marginTop: toHeight(8),
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  menuItemWrapper: {
    // Wrapper for individual animations
  },
  settingsItemContainer: {
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  settingsItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: toHeight(12),
    paddingHorizontal: toWidth(16),
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: toWidth(32),
    height: toWidth(32),
    justifyContent: "center",
    alignItems: "center",
    marginRight: toWidth(12),
  },
  itemIcon: {
    width: toWidth(20),
    height: toWidth(20),
  },
  itemTextContainer: {
    flex: 1,
  },
  chevronIcon: {
    width: toWidth(20),
    height: toHeight(20),
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: INSTAGRAM_COLORS.border,
    marginLeft: toWidth(44),
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: toWidth(16),
    paddingTop: toHeight(24),
    paddingBottom: toHeight(24),
  },
  footerText: {
    textAlign: "center",
  },
  customComponentContainer: {
    paddingVertical: toHeight(16),
    paddingHorizontal: toWidth(16),
  },
});

export default Settings;
