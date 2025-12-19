import {StyleSheet, ImageBackground, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {defaultGradient4} from '../../../theme';

export default function BackgroundTheme({
  children,
  gradientStyle = defaultGradient4,
}) {
  return (
    <View
      style={{
        flex: 1,
      }}>
      <ImageBackground
        source={require('../../../static/bg-2.png')}
        style={styles.image}
        resizeMode="cover">
        <LinearGradient {...gradientStyle} style={styles.gradient} />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
