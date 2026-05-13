/**
 * Shopping Cart Screen
 *
 * Layout mirrors Figma node 1:210:
 *   • Cart items list with +/- quantity controls
 *   • Free-shipping banner
 *   • Coupon input + animated "Apply" button
 *   • Price breakdown (subtotal / delivery / discount)
 *   • Total line
 *   • Checkout slide-to-confirm button
 *
 * MOTION:
 *   • "Apply" button: scale 0.93 on press (withSpring)
 *   • Checkout slider: pan gesture, thumb slides L→R to confirm
 *     (see CheckoutSlider component)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CheckoutSlider } from '../components/CheckoutSlider';
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import { INITIAL_CART } from '../constants/products';
import { IMAGES } from '../constants/images';
import type { CartItem } from '../types';

export default function CartScreen() {
  const [items, setItems]     = useState<CartItem[]>(INITIAL_CART);
  const [coupon, setCoupon]   = useState('Bike30');
  const [discApplied, setDisc] = useState(true);

  // Apply button animation
  const applyScale = useSharedValue(1);
  const applyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: applyScale.value }],
  }));
  const applyTap = Gesture.Tap()
    .onBegin(() => { 'worklet'; applyScale.value = withSpring(0.93, { damping: 14, stiffness: 200 }); })
    .onFinalize(() => { 'worklet'; applyScale.value = withSpring(1, { damping: 14, stiffness: 200 }); });

  function changeQty(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((it) => it.id === id ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it)
        .filter((it) => it.quantity > 0),
    );
  }

  const subtotal  = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const delivery  = 0;
  const discount  = discApplied ? subtotal * 0.3 : 0;
  const total     = subtotal - discount + delivery;

  function formatPrice(n: number) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backBtn}
          >
            <Text style={styles.backChevron}>‹</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Shopping Cart</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cart items ────────────────────────────────────────────────────── */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.id}>
              <CartRow item={item} onChangeQty={changeQty} />
              {index < items.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        {/* ── Free shipping banner ─────────────────────────────────────────── */}
        <Text style={styles.freeShipping}>Your cart qualifies for free shipping</Text>

        {/* ── Coupon input ──────────────────────────────────────────────────── */}
        <View style={styles.couponRow}>
          <View style={styles.couponInput}>
            <TextInput
              value={coupon}
              onChangeText={setCoupon}
              style={styles.couponText}
              placeholderTextColor={COLORS.textLo}
              placeholder="Coupon code"
            />
          </View>
          <GestureDetector gesture={applyTap}>
            <Animated.View style={applyStyle}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.applyBtn}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setDisc(coupon.toLowerCase() === 'bike30');
                    if (coupon.toLowerCase() !== 'bike30') {
                      Alert.alert('Invalid coupon', 'Try "Bike30"');
                    }
                  }}
                >
                  <Text style={styles.applyLabel}>Apply</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* ── Price breakdown ───────────────────────────────────────────────── */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownLabels}>
            <Text style={styles.breakdownKey}>Subtotal:</Text>
            <Text style={styles.breakdownKey}>Delivery Fee:</Text>
            <Text style={styles.breakdownKey}>Discount:</Text>
          </View>
          <View style={styles.breakdownValues}>
            <Text style={styles.breakdownVal}>{formatPrice(subtotal)}</Text>
            <Text style={styles.breakdownVal}>{delivery === 0 ? '$0' : formatPrice(delivery)}</Text>
            <Text style={styles.breakdownVal}>{discApplied ? '30%' : '0%'}</Text>
          </View>
        </View>

        {/* ── Total ─────────────────────────────────────────────────────────── */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </ScrollView>

      {/* ── Checkout slider (fixed bottom) ─────────────────────────────────── */}
      <View style={styles.checkoutContainer}>
        <CheckoutSlider
          onConfirm={() => Alert.alert('Order placed!', 'Thank you for your purchase.')}
        />
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

// ── Cart Row sub-component ────────────────────────────────────────────────────
interface CartRowProps {
  item: CartItem;
  onChangeQty: (id: string, delta: number) => void;
}

function CartRow({ item, onChangeQty }: CartRowProps) {
  return (
    <View style={rowStyles.row}>
      {/* Product thumbnail */}
      <View style={rowStyles.imageBox}>
        <LinearGradient
          colors={['#363e51', '#4c5770']}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.85, y: 0.9 }}
          style={rowStyles.imageGradient}
        >
          <Image
            source={{ uri: item.image }}
            style={rowStyles.productImage}
            resizeMode="contain"
          />
        </LinearGradient>
      </View>

      {/* Info + controls */}
      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={1}>{item.name}</Text>
        <View style={rowStyles.priceRow}>
          <Text style={rowStyles.price}>
            {item.price < 1000
              ? `$ ${item.price}`
              : `$ ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Text>
          <QtyControl
            qty={item.quantity}
            onMinus={() => onChangeQty(item.id, -1)}
            onPlus={() => onChangeQty(item.id, +1)}
          />
        </View>
      </View>
    </View>
  );
}

interface QtyControlProps {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}

function QtyControl({ qty, onMinus, onPlus }: QtyControlProps) {
  return (
    <View style={qtyStyles.container}>
      {/* Minus */}
      <TouchableOpacity style={qtyStyles.minusBtn} onPress={onMinus} activeOpacity={0.8}>
        <Image source={{ uri: IMAGES.minusIcon }} style={qtyStyles.btnIcon} resizeMode="contain" />
      </TouchableOpacity>

      <Text style={qtyStyles.qty}>{qty}</Text>

      {/* Plus */}
      <TouchableOpacity onPress={onPlus} activeOpacity={0.85}>
        <LinearGradient
          colors={GRADIENTS.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={qtyStyles.plusBtn}
        >
          <Image source={{ uri: IMAGES.plusIcon }} style={qtyStyles.btnIcon} resizeMode="contain" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Figma stroke: 1pt white→black @ 60% OVERLAY — hairline white at ~35% alpha
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  backChevron: {
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 28,
    marginTop: -2,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.white,
    letterSpacing: -0.3,
  },

  itemsList: {
    paddingHorizontal: 0,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20,
  },

  freeShipping: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textLo,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginVertical: 14,
  },

  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#1a1f29',
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    paddingHorizontal: 12,
    // Neumorphic inset
    shadowColor: '#11161e',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 3,
  },
  couponText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textLo,
    letterSpacing: -0.08,
  },
  applyBtn: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Match Figma's overlay gradient stroke (white→black @ 60%) — hairline white
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 8,
  },
  applyLabel: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: -0.08,
  },

  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  breakdownLabels: { gap: 8 },
  breakdownValues: { gap: 8, alignItems: 'flex-end' },
  breakdownKey: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.textHi,
    letterSpacing: -0.3,
  },
  breakdownVal: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: COLORS.textLo,
    letterSpacing: -0.3,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  totalLabel: {
    fontFamily: FONT.medium,
    fontSize: 17,
    color: COLORS.textHi,
    letterSpacing: -0.3,
  },
  totalValue: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#38b8ea',
    letterSpacing: -0.3,
  },

  checkoutContainer: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: COLORS.white,
    alignSelf: 'center',
    marginTop: 12,
    opacity: 0.25,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  imageBox: {
    width: 100,
    height: 90,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  imageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
  },
  productImage: {
    width: 80,
    height: 70,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    height: 77,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: COLORS.textHi,
    letterSpacing: -0.3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.priceBlue,
    letterSpacing: -0.3,
  },
});

const qtyStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1e2531',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    // Neumorphic inset shadow
    shadowColor: '#11161e',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  minusBtn: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#353f54',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtn: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnIcon: {
    width: 14,
    height: 14,
    tintColor: COLORS.white,
  },
  qty: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    color: COLORS.textLo,
    letterSpacing: -0.3,
    minWidth: 12,
    textAlign: 'center',
  },
});
