/**
 * Figma Items 1:67 — product card chrome (Dev Mode hex, uppercase).
 * Rectangle 166: left column. Rectangle 167: right column (glass @ 60% on the fill).
 */
export const FIGMA_PRODUCT_CARD = {
  r166: {
    fill0: '#353F54',
    fill1: '#222834',
    fillOpacity: 1,
  },
  r167: {
    fill0: '#363E51',
    fill1: '#191E26',
    fillOpacity: 0.6,
  },
  /** Card / hero drop shadow */
  shadowHex: '#10141C',
} as const;

/**
 * Hero “Top Card” shape (Figma 1:140) — frosted / diffusion: native uses `BlurView` + gradient tint;
 * web falls back to a single semi-opaque vector fill (`fillOpacityFlat`).
 */
export const FIGMA_HERO = {
  /** `expo-blur` strength (tune with `overlayFillOpacity`). */
  blurIntensity: 62,
  /** R166 gradient on top of blur — lower = more diffusion visible; higher = more solid. */
  overlayFillOpacity: 0.18,
  /** Right end of hero fill gradient — <1 lets cyan/accent bleed through more on the right. */
  gradientEndStopOpacity: 0.55,
  /** Web (no masked blur): single-path fill alpha. */
  fillOpacityFlat: 0.78,
  /**
   * Frosted hero tint — same family as R166 card chrome but lifted so the glass reads closer
   * to product cards on the Discover grid (opaque R166 can look heavy over blur).
   */
  tint: {
    fill0: '#3F4C62',
    fill1: '#343B4D',
  } as const,
} as const;

export const COLORS = {
  bg:          '#242C3B',
  /** Recessed controls on `bg` (cart promo field, checkout track) — slightly darker plane. */
  insetWell:   '#1D2330',
  cardMid:     '#2B3445',
  cardDeep:    '#1C2130',
  cardItem:    '#28303F',
  sheetTop:    FIGMA_PRODUCT_CARD.r166.fill0,
  sheetBot:    FIGMA_PRODUCT_CARD.r166.fill1,
  accentA:     '#34C8E8',
  accentB:     '#4E4AF2',
  priceBlue:   '#3D9CEA',
  textHi:      'rgba(255,255,255,0.87)',
  textLo:      'rgba(255,255,255,0.6)',
  white:       '#FFFFFF',
  separator:   'rgba(255,255,255,0.08)',
  btnMinus:    FIGMA_PRODUCT_CARD.r166.fill0,
  /** Detail screen buy bar — light top edge vs darker sheet gradient */
  detailBuyBarTopBorder: 'rgba(255,255,255,0.22)',
};

export const GRADIENTS = {
  accent:    ['#34C8E8', '#4E4AF2'] as const,
  sheet:     [FIGMA_PRODUCT_CARD.r166.fill0, FIGMA_PRODUCT_CARD.r166.fill1] as const,
  /** Detail description area — same top tone as R166; ramps darker toward buy bar */
  detailSheet: ['#353F54', '#22283A', '#12171F'] as const,
  /** Cart / list row chrome — Figma “card item” pair */
  cardItem:  ['#363E51', '#4C5770'] as const,
  /** Cart line-item thumbnail — muted blue-gray tile; TL darker → BR lighter (soft inset, no stroke). */
  cartThumb: ['#343d50', '#4a556b'] as const,
  heroBg:    ['#1A2235', '#2B3A52'] as const,
};

/** Simulated inner shadow for `COLORS.insetWell` surfaces (RN has no CSS `box-shadow: inset`). */
export const INSET_DEPTH = {
  top0:    'rgba(17, 22, 30, 0.55)',
  top1:    'rgba(17, 22, 30, 0)',
  bottom0: 'rgba(43, 53, 69, 0)',
  bottom1: 'rgba(10, 14, 20, 0.48)',
} as const;

/** Bottom tab bar sheet fill — Figma 1:181 (Rectangle 11): ~154.9deg, same stops as R166 fill. */
export const TAB_BAR_GRADIENT = {
  angleDeg:  154.9024271914411,
  color0:    FIGMA_PRODUCT_CARD.r166.fill0,
  color1:    FIGMA_PRODUCT_CARD.r166.fill1,
  stopMid:   0.58468,
} as const;

/** Figma Tab Bar frame (1:146) — full height in design pt @ 390-wide baseline. */
export const TAB_BAR_FRAME_HEIGHT_PT = 103.5;

/** Cart “Checkout” swipe track — Figma Rectangle 28 (1:230), pt @ 390-wide baseline; scales with `width / 390`. */
export const CHECKOUT_TRACK_WIDTH_PT = 174;
/** Same frame — track height (pt @ baseline). */
export const CHECKOUT_TRACK_HEIGHT_PT = 44;
/** Figma Rectangle 29 (1:233) — thumb; slightly taller than track so it sits proud of the pill. */
export const CHECKOUT_THUMB_SIZE_PT = 46;
/** Figma `chevron.forward` (1:234) inside Group 22 — pt @ baseline. */
export const CHECKOUT_THUMB_CHEVRON_PT = 28;
/** Figma Dev linear-gradient angle for Rectangle 29 (deg, CSS convention: 0° = up, clockwise). */
export const CHECKOUT_THUMB_GRADIENT_ANGLE_DEG = 152.72166427200062;

export const FONT = {
  regular:   'Poppins_400Regular',
  medium:    'Poppins_500Medium',
  semibold:  'Poppins_600SemiBold',
  bold:      'Poppins_700Bold',
};

export const RADIUS = {
  sm:   8,
  md:   10,
  lg:   20,
  xl:   30,
  xxl:  50,
};
