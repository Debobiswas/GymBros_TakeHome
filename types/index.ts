export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  /** height hint for the masonry column */
  cardHeight: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ApiSpec {
  id: string;
  name: string;
  data: Record<string, string | number | boolean> | null;
}

export type TabKey = 'description' | 'specification';

export type CategoryKey = 'All' | 'Electric' | 'Road' | 'Mountain' | 'Accessory';
