/**
 * Swipe-to-confirm checkout control (Figma Cart 1:229 “Checkout Slide”).
 *
 * Track: Rectangle 28 (1:230) — 174×44 @390, `RADIUS.md`, inset fill.
 * Thumb: gradient + chevron; no stroke — slightly larger than the track (46 vs 44 @ baseline).
 */
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS,
  CHECKOUT_THUMB_CHEVRON_PT,
  CHECKOUT_THUMB_GRADIENT_ANGLE_DEG,
  CHECKOUT_THUMB_SIZE_PT,
  CHECKOUT_TRACK_HEIGHT_PT,
  CHECKOUT_TRACK_WIDTH_PT,
  FONT,
  GRADIENTS,
  RADIUS,
} from '../constants/theme';
import { ChevronForwardIcon } from './icons/ChevronForwardIcon';
import { InsetDepthOverlays } from './InsetDepthOverlays';

interface CheckoutSliderProps {
  onConfirm?: () => void;
}

const DESIGN_BASELINE = 390;
/** Horizontal inset from track edges for “Checkout” / “Done!” labels (2× 14pt @ baseline). */
const LABEL_SIDE_MARGIN_PT = 28;

/** CSS-style linear-gradient angle (0° = up, clockwise) → `expo-linear-gradient` start/end in unit space. */
function cssLinearGradientToUnitPoints(angleDeg: number) {
  const a = ((90 - angleDeg) * Math.PI) / 180;
  return {
    start: { x: 0.5 - 0.5 * Math.cos(a), y: 0.5 + 0.5 * Math.sin(a) } as const,
    end:   { x: 0.5 + 0.5 * Math.cos(a), y: 0.5 - 0.5 * Math.sin(a) } as const,
  };
}

export function CheckoutSlider({ onConfirm }: CheckoutSliderProps) {
  const { width } = useWindowDimensions();
  const scale = width / DESIGN_BASELINE;
  const TRACK_WIDTH = Math.min(CHECKOUT_TRACK_WIDTH_PT * scale, width - 40);
  const scaledTrackH = CHECKOUT_TRACK_HEIGHT_PT * scale;
  const scaledThumb = CHECKOUT_THUMB_SIZE_PT * scale;
  const scaledChevron = CHECKOUT_THUMB_CHEVRON_PT * scale;
  const slotH = scaledThumb;
  const trackTop = (scaledThumb - scaledTrackH) / 2;
  const r = RADIUS.md * scale;

  const MAX_DRAG = TRACK_WIDTH - scaledThumb;

  const translateX = useSharedValue(0);

  const gradEnds = useMemo(
    () => cssLinearGradientToUnitPoints(CHECKOUT_THUMB_GRADIENT_ANGLE_DEG),
    [],
  );

  const confirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      'worklet';
      translateX.value = Math.max(0, Math.min(e.translationX, MAX_DRAG));
    })
    .onEnd(() => {
      'worklet';
      if (translateX.value >= MAX_DRAG * 0.7) {
        translateX.value = withSpring(MAX_DRAG, { damping: 18, stiffness: 120 }, () => {
          runOnJS(confirm)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 120 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, MAX_DRAG * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const doneOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [MAX_DRAG * 0.5, MAX_DRAG],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={[styles.slideFrame, { width: TRACK_WIDTH, height: slotH }]}>
      <View
        style={[
          styles.track,
          {
            top:            trackTop,
            height:         scaledTrackH,
            width:          TRACK_WIDTH,
            borderRadius:   r,
          },
        ]}
      >
        <InsetDepthOverlays style={{ borderRadius: r }} />
        <View style={styles.trackLabelArea} pointerEvents="none">
          <Animated.Text
            style={[
              styles.trackLabelBase,
              styles.checkoutLabel,
              {
                lineHeight:   scaledTrackH,
                paddingRight: LABEL_SIDE_MARGIN_PT * scale,
              },
              labelOpacity,
            ]}
          >
            Checkout
          </Animated.Text>
          <Animated.Text
            style={[
              styles.trackLabelBase,
              styles.doneLabel,
              {
                lineHeight:   scaledTrackH,
                paddingLeft:  LABEL_SIDE_MARGIN_PT * scale,
              },
              doneOpacity,
            ]}
          >
            Done!
          </Animated.Text>
        </View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.thumbOuter,
            {
              width:          scaledThumb,
              height:         scaledThumb,
              top:            0,
              left:           0,
              borderRadius:   r,
            },
            thumbStyle,
          ]}
        >
          <LinearGradient
            colors={[...GRADIENTS.accent]}
            locations={[0.017011, 1]}
            start={gradEnds.start}
            end={gradEnds.end}
            style={[StyleSheet.absoluteFill, { borderRadius: r }]}
          />
          <View style={styles.thumbIconCenter} pointerEvents="none">
            <ChevronForwardIcon
              size={scaledChevron}
              strokeWidth={Math.max(2, 2.5 * scale)}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  slideFrame: {
    position:   'relative',
    alignSelf:    'center',
  },
  track: {
    position:        'absolute',
    left:            0,
    backgroundColor: COLORS.insetWell,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    overflow:        'hidden',
    justifyContent:  'center',
  },
  trackLabelArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  trackLabelBase: {
    position:          'absolute',
    top:               0,
    bottom:            0,
    left:              0,
    right:             0,
    fontFamily:        FONT.medium,
    fontSize:          15,
    color:             COLORS.textLo,
    letterSpacing:     -0.08,
    textAlignVertical: 'center',
  },
  checkoutLabel: {
    textAlign: 'right',
  },
  doneLabel: {
    textAlign: 'left',
  },
  thumbOuter: {
    position:        'absolute',
    overflow:        'hidden',
    justifyContent:  'center',
    alignItems:      'center',
    shadowColor:     '#10141c',
    shadowOffset:    { width: 0, height: 10 },
    shadowOpacity:   0.45,
    shadowRadius:    16,
    elevation:       8,
  },
  thumbIconCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems:     'center',
  },
});
