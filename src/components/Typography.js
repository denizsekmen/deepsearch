import { Text } from "react-native";
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { adjustFont } from "../theme/helpers";
import { COLOR } from "../theme";

export default function Typography({
  children,
  style = {},
  weight,
  size = 16,
  ellipsizeMode,
  numberOfLines,
  color = COLOR.main,
  center,
  family = "Inter",
  lineHeight,
  onPress,
}) {
  const fontFamily = useMemo(() => {
    switch (weight || style.fontWeight) {
      case "900":
        return `${family}-Black`;
      case "800":
        return `${family}-ExtraBold`;
      case "700":
        return `${family}-Bold`;
      case "600":
        return `${family}-SemiBold`;
      case "500":
        return `${family}-Medium`;
      case "400":
        return `${family}-Regular`;
      case "300":
        return `${family}-Light`;
      case "200":
        return `${family}-ExtraLight`;
      case "100":
        return `${family}-Thin`;
      default:
        return `${family}-Regular`;
    }
  }, [weight, family]);

  const extraStyle = useMemo(() => {
    const extra = {};
    if (size) {
      extra.fontSize = adjustFont(size);
    }
    if (color) {
      extra.color = color;
    } else if (
      (Array.isArray(style) && !style.some((s) => s.color)) ||
      (!Array.isArray(style) && !style.color)
    ) {
      extra.color = COLOR.dark2;
    }

    if (lineHeight) {
      extra.lineHeight = lineHeight;
    }

    if (center) {
      extra.textAlign = "center";
    }
    return extra;
  }, [size, color, center, style]);

  if (onPress) {
    return (
      <Text
        onPress={onPress}
        style={[style, { fontFamily }, extraStyle]}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
      >
        {children}
      </Text>
    );
  } else {
    return (
      <Text
        style={[style, { fontFamily }, extraStyle]}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
      >
        {children}
      </Text>
    );
  }
}

Typography.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
  children: PropTypes.any,
  weight: PropTypes.oneOf([
    "900",
    "800",
    "700",
    "600",
    "500",
    "400",
    "300",
    "200",
    "100",
  ]),
  family: PropTypes.oneOf([
    "OpenSans",
    "Pacifico",
    "Inter",
    "Sora",
    "Poppins",
    "SourceCodePro",
    "SfProDisplay",
    "ProximaNova",
    "RedHatDisplay",
  ]),
  ellipsizeMode: PropTypes.oneOf(["head", "middle", "tail", "clip"]),
  numberOfLines: PropTypes.number,
};
