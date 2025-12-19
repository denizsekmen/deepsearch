import {PixelRatio, Dimensions} from 'react-native';

export const defaultDimensions = {
  width: 390,
  height: 844,
};

export const WIDTH = Dimensions.get('window').width;

export const HEIGHT = Dimensions.get('window').height;

export const byHeight = percent => HEIGHT * (percent / 100);
export const byWidth = percent => WIDTH * (percent / 100);

export const toWidth = x => {
  return PixelRatio.roundToNearestPixel((x * WIDTH) / defaultDimensions.width);
};

export const toHeight = y => {
  return PixelRatio.roundToNearestPixel(
    (y * HEIGHT) / defaultDimensions.height,
  );
};

export const scaleMin = (x1, min, scale) =>
  x1 * scale > min ? x1 * scale : min;
export const scaleFont = (x, scale) => scaleMin(x, 8, scale);
export const adjustFont = x => scaleFont(x, WIDTH / defaultDimensions.width);
