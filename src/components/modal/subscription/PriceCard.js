import {View, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {useAppContext} from '../../../context/AppContext';
import Typography from '../../Typography';
import {toHeight, toWidth} from '../../../theme/helpers';
import {COLOR} from '../../../theme';

const PriceCard = ({
  title,
  price,
  priceString,
  period,
  activePackage,
  setActivePackage,
  identifier,
  monthlyDiscountPercent,
}) => {
  const {references} = useAppContext();

  const calculateMonthlyPriceString = (priceString, type) => {
    if (priceString === undefined) return;
    const symbol = priceString[0];
    const divider = type === 'monthly' ? 4 : 1;
    const toFixed = (price / divider).toFixed(2);
    const fixedPrice = toFixed.endsWith('.00') ? toFixed.slice(0, -3) : toFixed;
    return `${symbol}${fixedPrice}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.priceButton,
        {
          borderColor:
            activePackage === identifier ? COLOR.primary : COLOR.textDark2,
        },
      ]}
      onPress={() => setActivePackage(identifier)}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={[
            styles.checkContent,
            {
              borderColor:
                activePackage === identifier ? COLOR.primary : COLOR.textDark2,
            },
          ]}>
          <View
            style={[
              styles.fillCheck,
              {
                backgroundColor:
                  activePackage === identifier ? COLOR.primary : 'transparent',
              },
            ]}
          />
        </View>
        <View style={styles.priceContainer}>
          <Typography
            size={14}
            color={activePackage === identifier ? COLOR.primary : COLOR.white}
            weight="600"
            numberOfLines={1}>
            {title}
          </Typography>
          <Typography
            size={12}
            color={COLOR.textDark4}
            weight="600"
            numberOfLines={1}>
            {references?.isAppInReview
              ? priceString
              : calculateMonthlyPriceString(
                  priceString,
                  identifier.split('.')[1],
                )}
            /{references?.isAppInReview ? {period} : 'week'}
          </Typography>
        </View>
      </View>

      {identifier === 'musicai.monthly.ios.id' && (
        <View style={styles.discountContainer}>
          <Typography
            size={10}
            color={COLOR.text}
            weight="700"
            numberOfLines={1}>
            {`Save ${monthlyDiscountPercent}% `}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default PriceCard;

const styles = StyleSheet.create({
  priceButton: {
    paddingHorizontal: toWidth(17),
    paddingVertical: toHeight(12),
    backgroundColor: 'transparent',
    borderRadius: toWidth(10),
    borderWidth: toWidth(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkContent: {
    width: toWidth(24),
    height: toWidth(24),
    padding: toWidth(4),
    borderRadius: toWidth(999),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: toWidth(2),
    borderColor: COLOR.textDark2,
  },
  fillCheck: {
    width: '100%',
    height: '100%',
    borderRadius: toWidth(999),
    backgroundColor: COLOR.primary,
  },
  priceContainer: {
    marginLeft: toWidth(14),
    gap: toWidth(4),
  },
  discountContainer: {
    backgroundColor: 'red',
    paddingHorizontal: toWidth(10),
    paddingVertical: toHeight(6),
    borderRadius: toWidth(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.green2,
  },
});
