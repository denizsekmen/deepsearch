import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet} from 'react-native';

export default function Container({
  children,
  edges = ['top'],
  extraStyles = {},
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.container, extraStyles]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
});
