import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS } from '../constants/theme';

interface AnimatedButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
  gradient?: boolean;
  disabled?: boolean;
}

export function AnimatedButton({
  onPress,
  style,
  children,
  gradient = false,
  disabled = false,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(0.93, { damping: 14, stiffness: 200 });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    })
    .onEnd(() => {
      'worklet';
      if (onPress) runOnJS(onPress)();
    })
    .enabled(!disabled);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (gradient) {
    return (
      <GestureDetector gesture={tap}>
        <Animated.View style={[animStyle, style]}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientFill, style]}
          >
            {children}
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[animStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Standalone pressable gradient button
interface GradientPressableProps {
  onPress: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function GradientPressable({ onPress, style, children }: GradientPressableProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(0.93, { damping: 14, stiffness: 200 });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    })
    .onEnd(() => {
      'worklet';
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={GRADIENTS.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientFill, style]}
        >
          {children}
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  gradientFill: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    overflow: 'hidden',
  },
});
