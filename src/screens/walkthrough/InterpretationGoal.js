import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, GRADIENT } from '../../theme';
import { toWidth, toHeight } from '../../theme/helpers';
import { useLanguage } from '../../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const InterpretationGoal = ({ navigation }) => {
  const { t } = useLanguage();
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={GRADIENT.background.colors}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../static/onboarding.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('interpretationGoalTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('interpretationGoalSubtitle')}
            </Text>
            <Text style={styles.description}>
              {t('interpretationGoalDescription')}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate('Walkthrough')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENT.primary.colors}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t('continueButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('Tabs')}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.dark,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: toWidth(20),
    paddingVertical: toHeight(40),
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLOR.white,
    textAlign: 'center',
    marginBottom: toHeight(15),
  },
  subtitle: {
    fontSize: 18,
    color: COLOR.white075,
    textAlign: 'center',
    marginBottom: toHeight(20),
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: COLOR.white075,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: toWidth(10),
  },
  buttonContainer: {
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    height: toHeight(50),
    borderRadius: toWidth(25),
    marginBottom: toHeight(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: toWidth(25),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR.white,
  },
  skipButton: {
    paddingVertical: toHeight(10),
    paddingHorizontal: toWidth(20),
  },
  skipText: {
    fontSize: 16,
    color: COLOR.white075,
    textAlign: 'center',
  },
});

export default InterpretationGoal;




