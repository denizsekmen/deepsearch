import Svg from 'react-native-svg';
import icons from '../static/icons';

export default function SvgAsset({name, style, color}) {
  if (!icons[name]) return null;
  const {width, height, viewBox, Path} = icons[name];
  return (
    <Svg
      style={style}
      width={style?.width || width}
      height={style?.height || height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path color={color} />
    </Svg>
  );
}
