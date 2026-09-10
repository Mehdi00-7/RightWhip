export type Listing = {
  id: number;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  colour: string | null;
  engine_size: number | null;
  description: string | null;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  seller_id: number;
  status: string;
  created_at: string;
  images: ListingImage[];
};
export type ListingImage = {
  id: number;
  listing_id: number;
  url: string;
  position: number;
};

export type Seller = {
  id: number;
  name: string;
  email: string;
};

// The single-listing endpoint (GET /listings/:id) additionally returns the
// seller's contact details; the list endpoints do not.
export type ListingDetail = Listing & { seller: Seller };

export type PriceComparison = {
  sample_size: number;
  median_price: number | null;
  p25_price: number | null;
  p75_price: number | null;
  difference_from_median: number | null;
  summary: string | null;
};

export type SavedSearch = {
  id: number;
  name: string | null;
  filters: Record<string, string | number>;
  created_at: string;
};