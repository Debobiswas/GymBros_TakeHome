/**
 * Shopping Cart Screen
 *
 * Layout mirrors Figma node 1:210 (list) / 1:236 (header & row rhythm):
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
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CheckoutSlider } from '../components/CheckoutSlider';
import { InsetDepthOverlays } from '../components/InsetDepthOverlays';
import { MinusIcon, PlusIcon } from '../components/icons';
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import { INITIAL_CART } from '../constants/products';
import type { CartItem } from '../types';

/** Coupon row @ 390pt — Apply control width ≈ 3× the “Apply” label width (Figma 1:210). */
const COUPON_ROW_HEIGHT_PT = 44;
const APPLY_BTN_WIDTH_PT = 120;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const scale = winW / 390;
  const couponH = COUPON_ROW_HEIGHT_PT * scale;
  const applyW = APPLY_BTN_WIDTH_PT * scale;
  const couponInputRadii = {
    borderTopLeftRadius:    RADIUS.md,
    borderBottomLeftRadius: RADIUS.md,
    borderTopRightRadius:    0,
    borderBottomRightRadius: 0,
  } as const;
  /** Full pill on Apply; overlaps input by `RADIUS.md` so the left curve sits flush on the field. */
  const applyBtnRadii = {
    borderTopLeftRadius:     RADIUS.md,
    borderBottomLeftRadius:  RADIUS.md,
    borderTopRightRadius:    RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  } as const;
  const applyOverlap = RADIUS.md * scale;
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
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* ── Header — Figma ~1:236: tight under status / notch ─────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <View style={styles.backBtnShell}>
            <View style={styles.backBtnClip}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
            <View
              style={[styles.backBtnHairline, { borderRadius: RADIUS.md }]}
              pointerEvents="none"
            />
            <Text style={styles.backChevron}>‹</Text>
          </View>
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
          <View
            style={[
              styles.couponInput,
              couponInputRadii,
              {
                height: couponH,
                paddingLeft: 12 * scale,
                paddingRight: (12 + RADIUS.md) * scale,
              },
            ]}
          >
            <InsetDepthOverlays style={couponInputRadii} />
            <TextInput
              value={coupon}
              onChangeText={setCoupon}
              style={[styles.couponText, { fontSize: 13 * scale, zIndex: 1 }]}
              placeholderTextColor={COLORS.textLo}
              placeholder="Coupon code"
            />
          </View>
          <GestureDetector gesture={applyTap}>
            <Animated.View style={[applyStyle, { zIndex: 1 }]}>
              <View
                style={[
                  styles.applyBtnShell,
                  applyBtnRadii,
                  { height: couponH, width: applyW, marginLeft: -applyOverlap },
                ]}
              >
                <View style={[styles.applyBtnClip, applyBtnRadii]}>
                  <LinearGradient
                    colors={GRADIENTS.accent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>
                <TouchableOpacity
                  style={styles.applyBtnHit}
                  activeOpacity={1}
                  onPress={() => {
                    setDisc(coupon.toLowerCase() === 'bike30');
                    if (coupon.toLowerCase() !== 'bike30') {
                      Alert.alert('Invalid coupon', 'Try "Bike30"');
                    }
                  }}
                >
                  <Text style={[styles.applyLabel, { fontSize: 13 * scale }]}>Apply</Text>
                </TouchableOpacity>
                <View
                  style={[styles.applyBtnHairline, applyBtnRadii]}
                  pointerEvents="none"
                />
              </View>
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
      <View style={[styles.checkoutContainer, { paddingBottom: 12 + insets.bottom }]}>
        <CheckoutSlider
          onConfirm={() => Alert.alert('Order placed!', 'Thank you for your purchase.')}
        />
      </View>
    </View>
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
          colors={[...GRADIENTS.cartThumb]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
        <MinusIcon size={12} color={COLORS.white} strokeWidth={1.4} />
      </TouchableOpacity>

      <Text style={qtyStyles.qty}>{qty}</Text>

      {/* Plus */}
      <TouchableOpacity onPress={onPlus} activeOpacity={0.85}>
        <View style={qtyStyles.plusShell}>
          <View style={qtyStyles.plusClip}>
            <LinearGradient
              colors={GRADIENTS.accent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          <View style={qtyStyles.plusIconLayer}>
            <PlusIcon size={12} color={COLORS.white} strokeWidth={1.4} />
          </View>
        </View>
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
    paddingTop: 2,
    paddingBottom: 8,
    gap: 16,
  },
  backBtnShell: {
    position:       'relative',
    width:          44,
    height:         44,
    borderRadius:   RADIUS.md,
    shadowColor:    '#10141c',
    shadowOffset:   { width: 0, height: 20 },
    shadowOpacity:  0.6,
    shadowRadius:   30,
    elevation:      10,
    overflow:       'visible',
  },
  backBtnClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.md,
    overflow:     'hidden',
  },
  backBtnHairline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  backChevron: {
    position:       'absolute',
    left:           0,
    right:          0,
    top:            0,
    bottom:         0,
    textAlign:      'center',
    textAlignVertical: 'center',
    fontSize:       26,
    color:          COLORS.white,
    lineHeight:     44,
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    alignItems: 'stretch',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  couponInput: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.insetWell,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  couponText: {
    fontFamily: FONT.regular,
    color: COLORS.textLo,
    letterSpacing: -0.08,
  },
  applyBtnShell: {
    position:       'relative',
    shadowColor:    '#10141c',
    shadowOffset:   { width: 0, height: 20 },
    shadowOpacity:  0.6,
    shadowRadius:   30,
    elevation:      8,
    overflow:       'visible',
  },
  applyBtnClip: {
    ...StyleSheet.absoluteFillObject,
    overflow:     'hidden',
  },
  applyBtnHit: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems:     'center',
  },
  applyBtnHairline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  applyLabel: {
    fontFamily: FONT.bold,
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
    paddingHorizontal: 20,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
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
    width: 104,
    height: 104,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  imageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 104,
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
    backgroundColor: COLORS.sheetTop,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusShell: {
    position:       'relative',
    width:          24,
    height:         24,
    borderRadius:   5,
    shadowColor:    '#10141c',
    shadowOffset:   { width: 0, height: 12 },
    shadowOpacity:  0.55,
    shadowRadius:   14,
    elevation:      8,
    overflow:       'visible',
  },
  plusClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
    overflow:     'hidden',
  },
  plusIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    0.5,
    borderColor:    'rgba(255,255,255,0.3)',
    borderRadius:   5,
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
