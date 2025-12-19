import {View, StyleSheet, I18nManager} from 'react-native';
import React from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {adjustFont, byHeight, byWidth} from '../../theme/helpers';
import {COLOR} from '../../theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const BUTTON_WIDTH = byWidth(90);
const BUTTON_HEIGHT = byHeight(6.5);
const BUTTON_PADDING = 10;
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - BUTTON_PADDING * 2;

const H_WAVE_RANGE = SWIPEABLE_DIMENSIONS + 2 * BUTTON_PADDING;
const H_SWIPE_RANGE = BUTTON_WIDTH - BUTTON_PADDING * 2 - SWIPEABLE_DIMENSIONS;
const index = ({columnTypes, personality, setPersonality}) => {
  const isRTL = I18nManager.isRTL;
  const X = useSharedValue(
    (personality.find(p => p.type === columnTypes.left).value / 100) *
      H_SWIPE_RANGE,
  );

  const animatedGesturedHandler = useAnimatedGestureHandler({
    onStart: (e, context) => {
      context.startX = X.value;
    },
    onActive: (e, context) => {
      let newXValue;
      // RTL modunda sola kaydırma işlemi sırasında değeri artırmak için hesaplama yöntemini değiştir
      newXValue = isRTL
        ? context.startX - e.translationX
        : e.translationX + context.startX;
      // Değerin sınırlar içinde kalmasını sağla
      X.value = Math.max(0, Math.min(newXValue, H_SWIPE_RANGE));
    },
    onEnd: () => {
      X.value = withSpring(X.value);

      // RTL modunda son değeri hesapla, sola kaydırma artırır
      const newValue = isRTL
        ? 100 - (X.value / H_SWIPE_RANGE) * 100
        : (X.value / H_SWIPE_RANGE) * 100;

      runOnJS(updatePersonality)(
        isRTL
          ? [
              {type: columnTypes.right, value: Math.floor(newValue)},
              {type: columnTypes.left, value: 100 - Math.floor(newValue)},
            ]
          : [
              {type: columnTypes.left, value: Math.floor(newValue)},
              {type: columnTypes.right, value: 100 - Math.floor(newValue)},
            ],
        setPersonality,
      );
    },
  });

  const interpolateXInput = [0, H_SWIPE_RANGE];
  const animatedStyle = {
    swipeable: useAnimatedStyle(() => {
      return {
        transform: [{translateX: isRTL ? -X.value : X.value}],
        backgroundColor: interpolateColor(
          X.value,
          [0, BUTTON_WIDTH - SWIPEABLE_DIMENSIONS - BUTTON_PADDING],
          ['#06d6a0', '#fff'],
        ),
      };
    }),
    swipeText: useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          X.value,
          interpolateXInput,
          [0.8, 0],
          Extrapolation.CLAMP,
        ),
        transform: [
          {
            translateX: interpolate(X.value, interpolateXInput, [
              0,
              BUTTON_WIDTH / 2 - SWIPEABLE_DIMENSIONS,
              Extrapolate.CLAMP,
            ]),
          },
        ],
      };
    }),
    colorWave: useAnimatedStyle(() => {
      return {
        width: H_WAVE_RANGE + X.value,
        opacity: interpolate(X.value, interpolateXInput, [0, 1]),
      };
    }),
  };
  return (
    <View style={styles.container}>
      <View style={styles.swipeContainer}>
        <AnimatedLinearGradient
          colors={['#06d6a0', '#1b9aaa']}
          start={{x: 0.0, y: 0.5}}
          end={{x: 1.0, y: 0.5}}
          style={[
            styles.colorWave,
            animatedStyle.colorWave,
          ]}></AnimatedLinearGradient>
        <PanGestureHandler onGestureEvent={animatedGesturedHandler}>
          <Animated.View
            style={[styles.swipeable, animatedStyle.swipeable]}></Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const updatePersonality = (datas, setPersonality) => {
  setPersonality(prevPersonality => {
    const prev = prevPersonality.map(p => {
      if (p.type === datas[0].type) {
        return {...p, value: datas[0].value};
      }
      if (p.type === datas[1].type) {
        return {...p, value: datas[1].value};
      }
      return p;
    });
    return prev;
  });
};

export default index;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeContainer: {
    height: BUTTON_HEIGHT,
    width: BUTTON_WIDTH,
    padding: BUTTON_PADDING,
    backgroundColor: COLOR.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BUTTON_HEIGHT,
  },
  colorWave: {
    position: 'absolute',
    left: 0,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT,
  },
  swipeable: {
    width: SWIPEABLE_DIMENSIONS,
    height: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS,
    backgroundColor: '#f0f',
    position: 'absolute',
    left: BUTTON_PADDING,
    zIndex: 3,
  },
  swipeText: {
    alignSelf: 'center',
    fontSize: adjustFont(17),
    fontWeight: 'bold',
    color: '#1b9aaa',
    zIndex: 2,
  },
});
