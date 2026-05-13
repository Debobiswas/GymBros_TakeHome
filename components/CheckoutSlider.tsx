/**
 * Swipe-to-confirm checkout button.
 * The accent-gradient thumb slides from left to right.
 * When dragged past 70%, it snaps to "Done!" and calls onConfirm.
 *
 * MOTION: "Checkout should slide from left to right" (Figma MOTION section).
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';

interface CheckoutSliderProps {
  onConfirm?: () => void;
}

const THUMB_SIZE = 44;

export function CheckoutSlider({ onConfirm }: CheckoutSliderProps) {
  const { width } = useWindowDimensions();
  const TRACK_WIDTH = Math.min(width - 40, 350);   // 20px padding each side
  const MAX_DRAG = TRACK_WIDTH - THUMB_SIZE - 8;    // 4px padding each side

  const translateX = useSharedValue(0);
  const [done, setDone]     = useState(false);
  const [dragging, setDragging] = useState(false);

  const confirm = useCallback(() => {
    setDone(true);
    onConfirm?.();
  }, [onConfirm]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      runOnJS(setDragging)(true);
    })
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
      runOnJS(setDragging)(false);
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
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [0, MAX_DRAG],
          [0, 20],
          Extrapolation.CLAMP,
        ),
      },
    ],
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
    <View style={[styles.track, { width: TRACK_WIDTH }]}>
      {/* Background label */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.Text style={[styles.checkoutLabel, labelOpacity]}>
          Checkout
        </Animated.Text>
        <Animated.Text style={[styles.doneLabel, doneOpacity]}>
          Done! ✓
        </Animated.Text>
      </View>

      {/* Draggable thumb */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumbContainer, thumbStyle]}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.thumb}
          >
            <Text style={styles.thumbArrow}>›</Text>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE,
    backgroundColor: '#1e2531',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    justifyContent: 'center',
    // Neumorphic inset
    shadowColor: '#11161e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: 'center',
  },
  thumbContainer: {
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: RADIUS.md,
    // Match Figma's white→black 60% OVERLAY stroke — hairline white at 35% alpha
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  thumbArrow: {
    fontSize: 22,
    color: COLORS.white,
    fontFamily: FONT.bold,
    lineHeight: 26,
  },
  checkoutLabel: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    lineHeight: THUMB_SIZE,
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.textLo,
    letterSpacing: -0.08,
  },
  doneLabel: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    lineHeight: THUMB_SIZE,
    fontFamily: FONT.semibold,
    fontSize: 15,
    color: COLORS.accentA,
    letterSpacing: -0.08,
  },
});
