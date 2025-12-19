import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { toWidth, toHeight } from '../../theme/helpers';
import { setIsOnboarded } from '../../services/user';
import { useAppContext } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Typography from '../../components/Typography';
import SvgAsset from '../../components/SvgAsset';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';

const { width, height } = Dimensions.get('window');

const Walkthrough = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setUser } = useAppContext();
  const { t } = useLanguage();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: 1,
      title: t('onboardingTitle1'),
      subtitle: t('onboardingSubtitle1'),
      description: t('onboardingDescription1'),
      icon: 'search',
      gradient: ['#1a1a1a', '#2a2a2a', '#1a1a1a'],
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    {
      id: 2,
      title: t('onboardingTitle2'),
      subtitle: t('onboardingSubtitle2'),
      description: t('onboardingDescription2'),
      icon: 'bulb',
      gradient: ['#1a1a1a', '#2a2a2a', '#1a1a1a'],
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    {
      id: 3,
      title: t('onboardingTitle3'),
      subtitle: t('onboardingSubtitle3'),
      description: t('onboardingDescription3'),
      icon: 'check',
      gradient: ['#1a1a1a', '#2a2a2a', '#1a1a1a'],
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  ];

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: true 
      });
      setCurrentIndex(nextIndex);
    } else {
      // Onboarding tamamlandı
      await setIsOnboarded(true);
      setUser({ isOnboarded: true });
    }
  };

  const handleSkip = async () => {
    await setIsOnboarded(true);
    setUser({ isOnboarded: true });
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const renderSlide = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slideContainer, { width }]}>
        <Animated.View
          style={[
            styles.slideContent,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          {/* DeepSearch AI Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={[styles.illustrationBg, { backgroundColor: item.backgroundColor }]}>
              {/* Icon */}
              <LinearGradient
                colors={item.gradient}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <SvgAsset name={item.icon} color="#FFFFFF" style={styles.icon} />
              </LinearGradient>
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Typography size={28} color={INSTAGRAM_COLORS.textPrimary} weight="700" style={styles.title}>
              {item.title}
            </Typography>
            
            <Typography size={16} color={INSTAGRAM_COLORS.textSecondary} weight="600" style={styles.subtitle}>
              {item.subtitle}
            </Typography>

            <Typography size={15} color={INSTAGRAM_COLORS.textSecondary} weight="400" style={styles.description}>
              {item.description}
            </Typography>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <LinearGradient
        colors={['#000000', '#121212', '#000000']}
        style={styles.gradient}
      >
        {/* Skip Button */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipButtonTop}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Typography size={14} color={INSTAGRAM_COLORS.textSecondary} weight="600">
              {t('skip')}
            </Typography>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          bounces={false}
          decelerationRate="fast"
        />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* Next/Get Started Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <View style={styles.nextButtonInner}>
              <Typography size={16} color={INSTAGRAM_COLORS.textPrimary} weight="600">
                {currentIndex === slides.length - 1 ? t('onboardingButton3') : t('next')}
              </Typography>
              <SvgAsset name="angle_right" color={INSTAGRAM_COLORS.textPrimary} style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  skipButtonTop: {
    position: 'absolute',
    top: toHeight(20),
    right: toWidth(24),
    zIndex: 10,
    paddingHorizontal: toWidth(16),
    paddingVertical: toHeight(8),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderRadius: toWidth(20),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: toWidth(30),
  },
  slideContent: {
    width: '100%',
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: toHeight(50),
    alignItems: 'center',
  },
  illustrationBg: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconGradient: {
    width: toWidth(100),
    height: toWidth(100),
    borderRadius: toWidth(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    width: toWidth(60),
    height: toWidth(60),
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: toWidth(10),
  },
  title: {
    textAlign: 'center',
    marginBottom: toHeight(12),
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: toHeight(20),
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: toWidth(5),
  },
  footer: {
    paddingHorizontal: toWidth(30),
    paddingBottom: toHeight(40),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: toHeight(30),
  },
  progressDot: {
    width: toWidth(8),
    height: toWidth(8),
    borderRadius: toWidth(4),
    backgroundColor: INSTAGRAM_COLORS.border,
    marginHorizontal: toWidth(5),
  },
  activeDot: {
    backgroundColor: INSTAGRAM_COLORS.textPrimary,
    width: toWidth(24),
  },
  nextButton: {
    borderRadius: toWidth(8),
    overflow: 'hidden',
  },
  nextButtonInner: {
    backgroundColor: INSTAGRAM_COLORS.surface,
    paddingVertical: toHeight(16),
    paddingHorizontal: toWidth(32),
    borderRadius: toWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: toWidth(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  arrowIcon: {
    width: toWidth(20),
    height: toWidth(20),
  },
});

export default Walkthrough;
