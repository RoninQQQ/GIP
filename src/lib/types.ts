export type Category = 
  | 'all'
  | 'gpu'
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'laptop'
  | 'monitor'
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
  };
};

export type FilterState = {
  category: Category;
  search: string;
  condition: string;
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
};
