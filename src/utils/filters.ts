import { QueryFilter } from "mongoose";
import { ListingDocument, RoomTypes } from "../model/listing.model";

export interface ListingFilters {
  listingType?: "hostel" | "private";
  availabilityStatus?: "available" | "inactive";
  price?: number;
  search?: string;
}

export function buildFilterQuery(
  filters: ListingFilters,
): QueryFilter<ListingDocument> {
  const conditions: QueryFilter<ListingDocument>[] = [];

  //  Listing Type
  if (filters.listingType) {
    conditions.push({
      listingType: filters.listingType,
    });
  }

  // Availability
  if (filters.availabilityStatus) {
    conditions.push({
      availabilityStatus: filters.availabilityStatus,
    });
  }

  // Price Filtering (max budget logic)
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

  // Search (title + university + area)
  if (filters.search) {
    conditions.push({
      $text: { $search: filters.search?.toLowerCase().trim() },
    });
  }

  // Final query
  return conditions.length ? { $and: conditions } : {};
}
