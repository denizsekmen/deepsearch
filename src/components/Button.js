import {TouchableOpacity} from 'react-native';
import React, {useMemo} from 'react';

export default function Button({
  style = {},
  children,
  disabled,
  onPress = () => {},
  onLayout = () => {},
}) {
  const buttonStyle = useMemo(() => {
    if (disabled) return {...style, opacity: 0.5};
    return style;
  }, [style, disabled]);

  return (
    <TouchableOpacity
      onLayout={onLayout}
      disabled={disabled}
      onPress={() => (disabled ? () => {} : onPress())}
      style={buttonStyle}>
      {children}
    </TouchableOpacity>
  );
}
