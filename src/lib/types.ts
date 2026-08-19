export type RoastLevel = "light" | "medium" | "dark";

export interface Product {
  id: string;
  sku: string;
  name: string;
  origin: string;
  roast: RoastLevel;
  /** Position on the 0–100 roast dial */
  roastDeg: number;
  process: string;
  elevation: string;
  price: number;
  rating: number;
  description: string;
  image: string;
}

export type RoastFilter = RoastLevel | "all";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating-desc";

export interface Filters {
  roast: RoastFilter;
  priceMin: number;
  priceMax: number;
  sort: SortKey;
}

export const PRICE_FLOOR = 14;
export const PRICE_CEIL = 26;

export const DEFAULT_FILTERS: Filters = {
  roast: "all",
  priceMin: PRICE_FLOOR,
  priceMax: PRICE_CEIL,
  sort: "featured",
};

export const ROAST_LABEL: Record<RoastLevel, string> = {
  light: "Light roast",
  medium: "Medium roast",
  dark: "Dark roast",
};
