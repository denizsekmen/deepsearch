import {StyleSheet, Dimensions} from 'react-native';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {COLOR} from '../../theme';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('screen');

const BottomSheet = forwardRef(({children}, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const MAX_TRANSLATE_Y = -SCREEN_HEIGHT;

  const scrollTo = useCallback(destination => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, {damping: 50});
  }, []);

  const isActive = useCallback(() => {
    return active.value;
  }, []);

  useImperativeHandle(ref, () => ({scrollTo, isActive}), [scrollTo, isActive]);

  useEffect(() => {
    scrollTo(-SCREEN_HEIGHT);
  }, []);

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, MAX_TRANSLATE_Y],
      [25, 5],
      Extrapolate.CLAMP,
    );
    return {
      borderRadius,
      transform: [{translateY: translateY.value}],
    };
  });
  return (
    <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
      {children}
    </Animated.View>
  );
});

export default BottomSheet;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    zIndex: 100,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLOR.greenDark7,
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
});
