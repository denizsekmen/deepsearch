import {StyleSheet, ImageBackground, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {defaultGradient} from '../theme';
import {byHeight} from '../theme/helpers';

export default function BackgroundTheme({
  children,
  gradientStyle = defaultGradient,
  img,
}) {
  return (
    <View style={{flex: 1}}>
      <ImageBackground source={img} style={styles.image} resizeMode="cover">
        <LinearGradient {...gradientStyle} style={styles.gradient} />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    flex: 1,
    height: byHeight(100),
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
