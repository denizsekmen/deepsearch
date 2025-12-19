import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { toWidth, toHeight } from '../../theme/helpers';
import { COLOR } from '../../theme';
import SvgAsset from '../SvgAsset';
import { INSTAGRAM_COLORS } from '../../theme/instagramColors';

const { width, height } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check_circle',
          iconColor: '#FFFFFF',
          gradientColors: ['#4CAF50', '#66BB6A'],
          backgroundColor: 'rgba(76, 175, 80, 0.15)',
          glowColor: '#4CAF50',
        };
      case 'error':
        return {
          icon: 'cross',
          iconColor: '#FFFFFF',
          gradientColors: ['#F44336', '#EF5350'],
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
          glowColor: '#F44336',
        };
      case 'warning':
        return {
          icon: 'lock',
          iconColor: '#FFFFFF',
          gradientColors: ['#1DB954', '#1ed760'],
          backgroundColor: 'rgba(29, 185, 84, 0.15)',
          glowColor: '#1DB954',
        };
      default:
        return {
          icon: 'bulb',
          iconColor: '#FFFFFF',
          gradientColors: ['#2196F3', '#42A5F5'],
          backgroundColor: 'rgba(33, 150, 243, 0.15)',
          glowColor: '#2196F3',
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
        />
        
        <Animated.View
          style={[
            styles.alertContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <View style={styles.alertContent}>
            {/* Background - Instagram style */}
            <View style={styles.backgroundContainer} />

            {/* Icon - Instagram style */}
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <SvgAsset
                  name={typeConfig.icon}
                  color={INSTAGRAM_COLORS.textPrimary}
                  style={styles.icon}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={[styles.buttonContainer, { flexDirection: showCancel ? 'column' : 'row' }]}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  showCancel && styles.confirmButtonWithCancel,
                ]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <View style={styles.confirmButtonContainer}>
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </View>
              </TouchableOpacity>
              
              {showCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: width * 0.88,
    maxWidth: 420,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: INSTAGRAM_COLORS.background,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 24,
  },
  alertContent: {
    padding: toWidth(28),
    alignItems: 'center',
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: toHeight(20),
  },
  iconContainer: {
    width: toWidth(80),
    height: toWidth(80),
    borderRadius: toWidth(40),
    backgroundColor: INSTAGRAM_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: INSTAGRAM_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: toWidth(40),
    height: toWidth(40),
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: INSTAGRAM_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: toHeight(12),
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: INSTAGRAM_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: toHeight(28),
    paddingHorizontal: toWidth(8),
  },
  buttonContainer: {
    width: '100%',
    gap: toWidth(12),
  },
  cancelButton: {
    width: '100%',
    paddingVertical: toHeight(16),
    paddingHorizontal: toWidth(20),
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: INSTAGRAM_COLORS.textTertiary,
  },
  confirmButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: INSTAGRAM_COLORS.buttonPrimary,
  },
  confirmButtonWithCancel: {
    width: '100%',
  },
  confirmButtonContainer: {
    paddingVertical: toHeight(22),
    paddingHorizontal: toWidth(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: INSTAGRAM_COLORS.textPrimary,
    letterSpacing: 1,
  },
});

export default CustomAlert;
