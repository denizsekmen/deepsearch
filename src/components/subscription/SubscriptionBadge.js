import {TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {useIAPContext} from '../../context/IAPContext';
import {COLOR, GRADIENT, SHADOW} from '../../theme';
import {byWidth, toHeight, toWidth} from '../../theme/helpers';

import Typography from '../Typography';
import SvgAsset from '../SvgAsset';
import LinearGradient from 'react-native-linear-gradient';

export default function SubscriptionBadge() {
  const {isPremium, showSubscriptionModal} = useIAPContext();

  const onPressBadge = () => {
    if (isPremium) return;
    showSubscriptionModal();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={onPressBadge}>
        <LinearGradient {...GRADIENT.featuresBlue}>
          <SvgAsset
            name="sparkles"
            color={COLOR.white}
            style={{
              width: toWidth(16),
              height: toWidth(16),
              marginRight: toWidth(6),
            }}
          />
          <Typography
            weight={isPremium ? '600' : '500'}
            color={COLOR.white}
            center>
            {isPremium ? 'Premium' : 'Normal'}
          </Typography>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: toHeight(8),
    paddingHorizontal: toWidth(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: toWidth(64),
    backgroundColor: COLOR.primary,
  },
});
