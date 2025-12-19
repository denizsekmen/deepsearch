import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {toWidth} from '../../../theme/helpers';
import Typography from '../../Typography';
import SvgAsset from '../../SvgAsset';
import {COLOR, GRADIENT} from '../../../theme';
import LinearGradient from 'react-native-linear-gradient';

const FeaturesCard = ({item}) => {
  return (
    <LinearGradient
      {...GRADIENT.featuresBlue}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7B9EFF',
        marginRight: toWidth(16),
        paddingHorizontal: toWidth(20),
        borderRadius: toWidth(20),
      }}>
      <SvgAsset name={item.icon} style={styles.icon} color={COLOR.white} />
      <Typography
        size={20}
        color={COLOR.white}
        weight="600"
        family="Sora"
        numberOfLines={2}>
        {item?.label?.split(' ').join('\n')}
      </Typography>
    </LinearGradient>
  );
};

export default FeaturesCard;

const styles = StyleSheet.create({
  icon: {
    width: toWidth(32),
    height: toWidth(32),
    marginRight: toWidth(10),
    flexShrink: 0,
  },
});
