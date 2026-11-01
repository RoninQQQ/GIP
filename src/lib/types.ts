export type Category = 
  | 'all'
  | 'gpu'
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler'
  | 'monitor'
  | 'laptop'
  | 'desktop'
  | 'peripherals'
  | 'network_sound'
  | 'phone';

export type Listing = {
  id: string;
  title: string;
  category: Category;
  price: {
    try: number;
    usd: number;
  };
  location: string;
  condition: string;
  date: string;
  cover: string;
  images: string[];
  description: string;
  specs?: Record<string, string | undefined>;
  seller: {
    name: string;
    rating: number;
    dealsCount: number;
    memberSince: string;
    verified?: boolean;
  };
};

export type SortOption = 'default' | 'price_asc' | 'price_desc';

export type FilterState = {
  category: Category;
  search: string;
  condition: string;
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
  onlyFavorites?: boolean;
  onlyMyListings?: boolean;
  sortBy?: SortOption;
};

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  province?: string;
  district?: string;
  rating: number;
  dealsCount: number;
  memberSince: string;
  verified: boolean;
  isTestAccount?: boolean;
  favorites: string[]; // favori ilan ID'leri
}

export interface Order {
  id: string;
  date: string;
  items: Listing[];
  total: {
    try: number;
    usd: number;
  };
  address: string;
  status: 'escrow_held' | 'completed';
}
