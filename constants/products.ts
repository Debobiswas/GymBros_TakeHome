import type { Product, CartItem } from '../types';
import { IMAGES } from './images';

export const PRODUCTS: Product[] = [
  // Left column items (indices 0, 2, 4)
  {
    id: '1',
    name: 'PEUGEOT - LR01',
    category: 'Road Bike',
    price: 1999.99,
    image: IMAGES.roadBike,
    cardHeight: 235,
  },
  // Right column items (indices 1, 3, 5)
  {
    id: '2',
    name: 'SMITH - Trade',
    category: 'Road Helmet',
    price: 120,
    image: IMAGES.helmet,
    cardHeight: 219,
  },
  {
    id: '3',
    name: 'SMITH - Trade',
    category: 'Road Helmet',
    price: 120,
    image: IMAGES.helmet,
    cardHeight: 233,
  },
  {
    id: '4',
    name: 'PILOT - Chromoly',
    category: 'Mountain Bike',
    price: 1999.99,
    image: IMAGES.mountainBike,
    cardHeight: 255,
  },
  {
    id: '5',
    name: 'PILOT - Chromoly',
    category: 'Mountain Bike',
    price: 1999.99,
    image: IMAGES.mountainBike,
    cardHeight: 245,
  },
  {
    id: '6',
    name: 'SMITH - Trade',
    category: 'Road Helmet',
    price: 120,
    image: IMAGES.helmet,
    cardHeight: 223,
  },
];

/** Products split into left/right columns for the masonry grid */
export const LEFT_PRODUCTS  = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[4]];
export const RIGHT_PRODUCTS = [PRODUCTS[1], PRODUCTS[3], PRODUCTS[5]];

export const INITIAL_CART: CartItem[] = [
  { ...PRODUCTS[0], quantity: 1, image: IMAGES.cartRoadBike },
  {
    id: '7',
    name: 'PILOT - CHROMOLY 520',
    category: 'Mountain Bike',
    price: 3999.99,
    image: IMAGES.cartMountainBike,
    cardHeight: 0,
    quantity: 1,
  },
  { ...PRODUCTS[1], quantity: 1, image: IMAGES.helmet },
];

export const CATEGORIES = ['All', 'Electric', 'Road', 'Mountain', 'Accessory'] as const;
