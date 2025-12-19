import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Crosshair Preview Component
 * Supports both CS2 and Valorant crosshairs
 */
const CrosshairPreview = ({
  // Common props
  color = '#00FF00',
  thickness = 2,
  outlineThickness = 1,
  size = 10,
  gap = 5,
  style = 'static',
  outlineColor = '#000000',
  
  // Valorant specific props
  showCenterDot = false,
  centerDotSize = 2,
  centerDotOpacity = 1,
  showOuterLines = false,
  outerLineLength = 10,
  outerLineThickness = 2,
  outerLineOffset = 15,
  outerLineOpacity = 0.35,
  innerLineOpacity = 1,
  globalOpacity = 1,
  outlineOpacity = 0.5,
}) => {
  const renderCrosshairLine = (isHorizontal, isOuter = false) => {
    const lineLength = Math.max(isOuter ? outerLineLength : size, 1);
    const lineThickness = Math.max(isOuter ? outerLineThickness : thickness, 1);
    const lineGap = Math.max(isOuter ? outerLineOffset : gap, 0);
    
    const lineStyle = isHorizontal ? {
      width: lineLength,
      height: lineThickness,
      marginLeft: lineGap / 2,
      marginRight: lineGap / 2,
    } : {
      width: lineThickness,
      height: lineLength,
      marginTop: lineGap / 2,
      marginBottom: lineGap / 2,
    };

    let outlineTransform = null;
    if (outlineThickness > 0 && !isOuter) {
      const safeLength = Math.max(lineLength, 1);
      const safeThickness = Math.max(lineThickness, 1);
      
      const scaleX = isHorizontal 
        ? 1 + (outlineThickness * 2) / safeLength
        : 1 + (outlineThickness * 2) / safeThickness;
      
      const scaleY = isHorizontal
        ? 1 + (outlineThickness * 2) / safeThickness
        : 1 + (outlineThickness * 2) / safeLength;

      if (isFinite(scaleX) && isFinite(scaleY) && scaleX > 0 && scaleY > 0) {
        outlineTransform = [
          { scaleX: Math.max(scaleX, 1) },
          { scaleY: Math.max(scaleY, 1) },
        ];
      }
    }

    return (
      <View style={styles.lineContainer}>
        {/* Outline */}
        {outlineThickness > 0 && !isOuter && outlineTransform && (
          <View
            style={[
              lineStyle,
              {
                backgroundColor: outlineColor,
                position: 'absolute',
                opacity: outlineOpacity,
                transform: outlineTransform,
              },
            ]}
          />
        )}
        {/* Main line */}
        <View style={[lineStyle, { backgroundColor: color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.crosshairContainer, { opacity: globalOpacity }]}>
        {/* Center dot */}
        {showCenterDot && centerDotSize > 0 && (
          <View
            style={[
              styles.centerDot,
              {
                width: Math.max(centerDotSize * 3, 1),
                height: Math.max(centerDotSize * 3, 1),
                backgroundColor: color,
                borderWidth: Math.max(outlineThickness, 0),
                borderColor: outlineColor,
                opacity: centerDotOpacity,
              },
            ]}
          />
        )}

        {/* Inner Lines - Vertical */}
        <View style={[styles.verticalContainer, { opacity: innerLineOpacity }]}>
          {renderCrosshairLine(false, false)}
          {gap > 0 && <View style={{ height: Math.max(gap, 0) }} />}
          {renderCrosshairLine(false, false)}
        </View>

        {/* Inner Lines - Horizontal */}
        <View style={[styles.horizontalContainer, { opacity: innerLineOpacity }]}>
          {renderCrosshairLine(true, false)}
          {gap > 0 && <View style={{ width: Math.max(gap, 0) }} />}
          {renderCrosshairLine(true, false)}
        </View>

        {/* Outer Lines - Vertical */}
        {showOuterLines && (
          <View style={[styles.verticalContainer, { opacity: outerLineOpacity }]}>
            {renderCrosshairLine(false, true)}
            {outerLineOffset > 0 && <View style={{ height: Math.max(outerLineOffset, 0) }} />}
            {renderCrosshairLine(false, true)}
          </View>
        )}

        {/* Outer Lines - Horizontal */}
        {showOuterLines && (
          <View style={[styles.horizontalContainer, { opacity: outerLineOpacity }]}>
            {renderCrosshairLine(true, true)}
            {outerLineOffset > 0 && <View style={{ width: Math.max(outerLineOffset, 0) }} />}
            {renderCrosshairLine(true, true)}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
  },
  crosshairContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  verticalContainer: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    position: 'absolute',
    borderRadius: 100,
    zIndex: 10,
  },
});

export default CrosshairPreview;
