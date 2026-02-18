import { QueryFilter } from "mongoose";
import Listing, { ListingDocument, RoomType } from "../model/listing.model";

export interface ListingFilters {
  listingType?: "hostel" | "private";
  availabilityStatus?: "available" | "occupied";
  price?: number;
  search?: string;
}

export function buildFilterQuery(
  filters: ListingFilters,
): QueryFilter<ListingDocument> {
  const conditions: QueryFilter<ListingDocument>[] = [];

  // 1️⃣ Listing Type
  if (filters.listingType) {
    conditions.push({
      listingType: filters.listingType,
    });
  }

  // 2️⃣ Availability
  if (filters.availabilityStatus) {
    conditions.push({
      availabilityStatus: filters.availabilityStatus,
    });
  }

  // 3️⃣ Price Filtering (max budget logic)
  if (filters.price) {
    conditions.push({
      $or: [
        // Private rentals → monthly price
        {
          listingType: "private",
          "pricing.monthlyPrice": { $lte: filters.price },
        },

        // Hostels → price range max
        {
          listingType: "hostel",
          "pricing.priceRange.max": { $lte: filters.price },
        },
      ],
    });
  }

  // 4️⃣ Search (title + university + area)
  if (filters.search) {
    conditions.push({
      $text: { $search: filters.search },
    });
  }

  // Final query
  return conditions.length ? { $and: conditions } : {};
}
