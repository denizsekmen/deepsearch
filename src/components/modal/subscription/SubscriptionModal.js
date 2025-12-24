import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import React, { useState, useEffect, useMemo, useRef } from "react";
// PRO_FEATURES is now defined locally in this file
import { toHeight, toWidth } from "../../../theme/helpers";
import SvgAsset from "../../../components/SvgAsset";
import Typography from "../../../components/Typography";
import LoadingModal from "../../../components/LoadingModal";
import { useIAPContext } from "../../../context/IAPContext";
import WebViewModal from "../../../components/modal/WebViewModal";
import LinearGradient from "react-native-linear-gradient";
import { useLanguage } from "../../../context/LanguageContext";
import useCustomAlert from "../../../hooks/useCustomAlert";
import CustomAlert from "../../../components/modal/CustomAlert";
import { INSTAGRAM_COLORS } from "../../../theme/instagramColors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SubscriptionModal({ isOpen, setIsOpen, defaultPackage = null }) {
  const { t } = useLanguage();
  const { alertConfig, showSuccess, hideAlert } = useCustomAlert();
  const [selectedPackage, setSelectedPackage] = useState(defaultPackage || "weekly");
  const { products, subscribe, restorePurchase } = useIAPContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState();
  const [webViewSource, setWebViewSource] = useState(null);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

  // Premium features
  const PRO_FEATURES_LIST = [
    { feature: t("unlimitedAccess") },
    { feature: t("unlimitedAnalysis") },
    { feature: t("batchOperations") },
    { feature: t("noAds") },
  ];

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const featureAnimations = useRef(
    PRO_FEATURES_LIST.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-30),
    }))
  ).current;

  // Pulse animation for premium badge
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  // Auto-trigger weekly purchase when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always select weekly plan
      setSelectedPackage("weekly");
      
      // Auto-trigger purchase for weekly plan
      // Small delay to ensure UI is ready and products are loaded
      const timer = setTimeout(() => {
        const packageIdentifier = products?.subscription?.weekly?.product?.identifier;
        if (packageIdentifier) {
          setIsProcessing(true);
          subscribe(packageIdentifier, onSuccessfulPurchase, onPurchaseError);
        } else {
          console.warn("Weekly package identifier not available yet");
          setIsProcessing(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, products]);

  // Main entrance animation
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered feature animations
      featureAnimations.forEach((anim, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, 200 + index * 100);
      });
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      featureAnimations.forEach((anim) => {
        anim.opacity.setValue(0);
        anim.translateX.setValue(-30);
      });
    }
  }, [isOpen]);

  const onSubmit = async () => {
    setIsProcessing(true);
    const packageIdentifier =
      selectedPackage == "weekly"
        ? products?.subscription?.weekly?.product?.identifier
        : products?.subscription?.annual?.product?.identifier;

    if (packageIdentifier) {
      await subscribe(packageIdentifier, onSuccessfulPurchase, onPurchaseError);
    } else {
      console.error("Package identifier is not available");
      setIsProcessing(false);
    }
  };

  const onRestore = async () => {
    setIsProcessing(true);
    try {
      await restorePurchase();
    } catch (error) {
      console.log(error);
    }
    setIsProcessing(false);
    setIsOpen(false);
  };

  const onSuccessfulPurchase = async () => {
    setIsProcessing(false);
    setIsOpen(false);
    showSuccess(t("welcomeToPremium"), t("premiumWelcomeMessage"));
  };

  const onPurchaseError = (err) => {
    setIsProcessing(false);
    // Kullanıcı cancel ettiyse modal'ı kapatma, açık kalsın
    // Sadece gerçek hatalarda kapat (userCancelled false ise veya hata varsa)
    if (err && err.userCancelled) {
      // Kullanıcı cancel etti, modal açık kalsın
      console.log("Purchase cancelled by user");
      return;
    }
    // Gerçek bir hata var veya err undefined/null, modal'ı kapat
    setIsOpen(false);
    console.error(err);
  };

  const navigateBack = () => {
    setIsOpen(false);
  };

  const getValueFromSubscription = (type, key) => {
    return products?.subscription?.[type]?.product?.[key];
  };

  const monthlyDiscountPercent = useMemo(() => {
    if (products?.subscription?.weekly) {
      const weeklyPrice = getValueFromSubscription("weekly", "price");
      const yearlyPrice = getValueFromSubscription("annual", "price");
      const yearlyPerWeek = yearlyPrice / 52;

      if (weeklyPrice && yearlyPrice) {
        const discount = Math.round((1 - yearlyPerWeek / weeklyPrice) * 100);
        return discount;
      }
    }
    return 0;
  }, [products]);

  useEffect(() => {
    setDiscount(monthlyDiscountPercent);
  }, [monthlyDiscountPercent]);

  const BOTTOM_ITEMS = [
    {
      title: t("terms"),
      onPress: () => {
        setWebViewSource(
          "https://bernsoftware.com/ai-crosshair-generator-terms-of-use/"
        ),
          setIsWebViewVisible(!isWebViewVisible);
      },
    },
    {
      title: t("privacyPolicy"),
      onPress: () => {
        setWebViewSource(
          "https://bernsoftware.com/ai-crosshair-generator-privacy-policy/"
        ),
          setIsWebViewVisible(!isWebViewVisible);
      },
    },
    {
      title: t("restore"),
      onPress: onRestore,
    },
  ];

  return (
    <>
      <Modal
        visible={isOpen && !isProcessing}
        style={{ flex: 1 }}
        transparent={false}
        animationType="none"
        statusBarTranslucent={true}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Hero Section */}
            <View style={styles.heroContainer}>
              {/* Close Button */}
              <Animated.View
                style={[
                  styles.closeButtonContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={navigateBack}
                  activeOpacity={0.8}
                >
                  <SvgAsset
                    color="white"
                    name="close"
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Background Gradient - Instagram style */}
              <LinearGradient
                colors={[INSTAGRAM_COLORS.background, INSTAGRAM_COLORS.surface, INSTAGRAM_COLORS.surfaceElevated]}
                locations={[0, 0.5, 1]}
                style={styles.heroGradient}
              />

              {/* Premium Badge */}
              <Animated.View
                style={[
                  styles.premiumBadge,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View style={styles.badgeContainer}>
                  <Typography color={INSTAGRAM_COLORS.textPrimary} size={12} weight="700">
                    {t("premium").toUpperCase()}
                  </Typography>
                </View>
              </Animated.View>

              {/* Hero Text */}
              <Animated.View
                style={[
                  styles.heroTextContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Typography
                  color={INSTAGRAM_COLORS.textPrimary}
                  size={28}
                  weight="700"
                  style={styles.heroTitle}
                >
                  {t("unlockPremium")}
                </Typography>
                <Typography
                  color={INSTAGRAM_COLORS.textSecondary}
                  size={16}
                  weight="400"
                  style={styles.heroSubtitle}
                >
                  {t("unlockPremiumSubtitle")}
                </Typography>
              </Animated.View>
            </View>

            {/* Content Section */}
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Pricing Section */}
              <View style={styles.pricingSection}>
                <Typography
                  color={INSTAGRAM_COLORS.textPrimary}
                  size={20}
                  weight="700"
                  style={styles.pricingTitle}
                >
                  {t("chooseYourPlan")}
                </Typography>

                {/* Weekly Plan */}
                <TouchableOpacity
                  onPress={() => setSelectedPackage("weekly")}
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      styles.planContainer,
                      selectedPackage === "weekly" && styles.selectedPlan,
                    ]}
                  >
                    <View style={styles.planContent}>
                      <View style={styles.planInfo}>
                        <Typography size={18} weight="600" color={INSTAGRAM_COLORS.textPrimary}>
                          {t("weeklyAccess")}
                        </Typography>
                        <Typography size={14} weight="500" color={INSTAGRAM_COLORS.textSecondary}>
                          {getValueFromSubscription("weekly", "priceString")}
                          {t("perWeek")}
                        </Typography>
                      </View>
                      <View
                        style={[
                          styles.radioButton,
                          selectedPackage === "weekly" &&
                            styles.radioButtonSelected,
                        ]}
                      >
                        {selectedPackage === "weekly" && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Annual Plan */}
                <TouchableOpacity
                  onPress={() => setSelectedPackage("annual")}
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      styles.planContainer,
                      styles.annualPlan,
                      selectedPackage === "annual" && styles.selectedPlan,
                    ]}
                  >
                    {discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Typography size={12} weight="700" color="white">
                          {t("savePercent").replace("{discount}", discount)}
                        </Typography>
                      </View>
                    )}

                    <View style={styles.planContent}>
                      <View style={styles.planInfo}>
                        <Typography size={18} weight="600" color={INSTAGRAM_COLORS.textPrimary}>
                          {t("annualPlan")}
                        </Typography>
                        <Typography size={14} weight="500" color={INSTAGRAM_COLORS.textSecondary}>
                          {getValueFromSubscription("annual", "priceString")}
                          {t("perYear")}
                        </Typography>
                        <Typography size={12} weight="500" color={INSTAGRAM_COLORS.textLink}>
                          {t("bestValue")}
                        </Typography>
                      </View>
                      <View
                        style={[
                          styles.radioButton,
                          selectedPackage === "annual" &&
                            styles.radioButtonSelected,
                        ]}
                      >
                        {selectedPackage === "annual" && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Continue Button - Instagram style */}
              <TouchableOpacity
                onPress={onSubmit}
                style={styles.continueButton}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContainer}>
                  <Typography color={INSTAGRAM_COLORS.textPrimary} size={16} weight="600">
                    {t("getPremium")}
                  </Typography>
                  <SvgAsset
                    name="angle_right"
                    color={INSTAGRAM_COLORS.textPrimary}
                    style={styles.buttonIcon}
                  />
                </View>
              </TouchableOpacity>

              {/* Features Section */}
              <View style={styles.featuresSection}>
                <Typography
                  color={INSTAGRAM_COLORS.textPrimary}
                  size={20}
                  weight="600"
                  style={styles.sectionTitle}
                >
                  {t("unlockPremium")}
                </Typography>

                <View style={styles.featuresList}>
                  {PRO_FEATURES_LIST.map((feature, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.featureItem,
                        {
                          opacity: featureAnimations[index].opacity,
                          transform: [
                            { translateX: featureAnimations[index].translateX },
                          ],
                        },
                      ]}
                    >
                      <View style={styles.featureIconContainer}>
                        <SvgAsset
                          name="check"
                          color={INSTAGRAM_COLORS.textLink}
                          style={styles.featureIcon}
                        />
                      </View>
                      <Typography color={INSTAGRAM_COLORS.textPrimary} size={15} weight="400">
                        {feature.feature}
                      </Typography>
                    </Animated.View>
                  ))}
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footerContainer}>
                <Typography
                  color={INSTAGRAM_COLORS.textTertiary}
                  size={12}
                  weight="500"
                  style={styles.footerText}
                >
                  {t("cancelAnytime")}
                </Typography>

                <View style={styles.footerLinks}>
                  {BOTTOM_ITEMS.map((item, index) => (
                    <View style={styles.footerLinkContainer} key={index}>
                      <TouchableOpacity onPress={item.onPress}>
                        <Typography size={12} color={INSTAGRAM_COLORS.textLink} weight="500">
                          {item.title}
                        </Typography>
                      </TouchableOpacity>
                      {index !== BOTTOM_ITEMS.length - 1 && (
                        <Text style={styles.footerSeparator}>•</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>

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
      </Modal>

      {isProcessing && <LoadingModal />}
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
  },
  sparklesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  sparkle: {
    position: "absolute",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    position: "relative",
    height: screenHeight * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? toHeight(60) : toHeight(40),
    right: toWidth(20),
    zIndex: 10,
  },
  closeButton: {
    width: toWidth(44),
    height: toWidth(44),
    borderRadius: toWidth(22),
    marginTop: toHeight(15),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: toWidth(24),

    height: toWidth(24),
  },
  heroGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
  },
  premiumBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? toHeight(80) : toHeight(60),
    left: toWidth(20),
    borderRadius: toWidth(20),
    overflow: "hidden",
  },
  badgeContainer: {
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(8),
    borderRadius: toWidth(20),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  heroTextContainer: {
    alignItems: "center",
    paddingHorizontal: toWidth(20),
    marginBottom: toHeight(30),
  },
  heroTitle: {
    lineHeight: 38,
    marginBottom: toHeight(8),
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: "center",
  },
  heroSubtitle: {
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "center",
  },
  dreamIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: toWidth(20),
  },
  dreamIcon: {
    width: toWidth(60),
    height: toWidth(60),
    borderRadius: toWidth(30),
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: INSTAGRAM_COLORS.background,
    borderTopLeftRadius: toWidth(24),
    borderTopRightRadius: toWidth(24),
    marginTop: -toHeight(100),
    paddingTop: toHeight(32),
    paddingHorizontal: toWidth(20),
  },
  featuresSection: {
    marginBottom: toHeight(40),
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: toHeight(20),
  },
  featuresList: {
    gap: toHeight(16),
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(12),
    padding: toWidth(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  featureIconContainer: {
    width: toWidth(32),
    height: toWidth(32),
    borderRadius: toWidth(16),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: toWidth(12),
  },
  featureIcon: {
    width: toWidth(18),
    height: toWidth(18),
  },
  pricingSection: {
    marginBottom: toHeight(32),
  },
  pricingTitle: {
    textAlign: "center",
    marginBottom: toHeight(24),
  },
  planContainer: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(16),
    padding: toWidth(20),
    marginBottom: toHeight(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    position: "relative",
  },
  selectedPlan: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderColor: INSTAGRAM_COLORS.textLink,
    borderWidth: 2,
  },
  annualPlan: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  discountBadge: {
    position: "absolute",
    top: -toHeight(8),
    right: toWidth(20),
    backgroundColor: INSTAGRAM_COLORS.error,
    borderRadius: toWidth(12),
    paddingHorizontal: toWidth(12),
    paddingVertical: toHeight(4),
    zIndex: 1,
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
  },
  radioButton: {
    width: toWidth(24),
    height: toWidth(24),
    borderRadius: toWidth(12),
    borderWidth: 2,
    borderColor: INSTAGRAM_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: INSTAGRAM_COLORS.textLink,
    backgroundColor: INSTAGRAM_COLORS.textLink,
  },
  radioButtonInner: {
    width: toWidth(10),
    height: toWidth(10),
    borderRadius: toWidth(5),
    backgroundColor: INSTAGRAM_COLORS.textPrimary,
  },
  continueButton: {
    marginBottom: toHeight(24),
    borderRadius: toWidth(8),
    overflow: "hidden",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: toHeight(16),
    paddingHorizontal: toWidth(32),
    gap: toWidth(8),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    borderRadius: toWidth(8),
  },
  buttonIcon: {
    width: toWidth(20),
    height: toWidth(20),
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: toHeight(40),
  },
  footerText: {
    textAlign: "center",
    marginBottom: toHeight(16),
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: toWidth(8),
  },
  footerLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: toWidth(8),
  },
  footerSeparator: {
    color: INSTAGRAM_COLORS.textTertiary,
    fontSize: 12,
  },
});
