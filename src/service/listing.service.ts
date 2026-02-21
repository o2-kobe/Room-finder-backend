import mongoose from "mongoose";
import Listing from "../model/listing.model";
import User from "../model/user.model";
import {
  CreateListingInput,
  UpdateListingInput,
} from "../schema/listing.schema";
import { Errors } from "../utils/factoryErrors";
import { buildFilterQuery, ListingFilters } from "../utils/filters";

// Create a single listing
export async function createListing(
  input: CreateListingInput,
  createdBy: string,
) {
  // Find the user
  const user = await User.findById(createdBy).lean();

  if (!user) throw Errors.forbidden("You cannot create a listing.");

  if (user.role === "student")
    throw Errors.forbidden("Only property owners can create a listing");

  // Create and return listing
  return await Listing.create({ createdBy: user._id, ...input });
}

// Paginated listings
export async function getListings(
  filters: ListingFilters,
  cursor?: string,
  limit: number = 15,
) {
  const query: any = buildFilterQuery(filters);
  limit = Math.min(limit, 30);

  if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
    throw Errors.badRequest("Invalid cursor");
  }

  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const listings = await Listing.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  let nextCursor: string | null = null;

  if (listings.length > limit) {
    const nextListing = listings[limit - 1];
    nextCursor = nextListing._id.toString();
    listings.splice(limit);
  }

  return { listings, nextCursor };
}

// Fetch Map listings
export async function getMapListings(filters: ListingFilters) {
  const query = buildFilterQuery(filters);

  const listings = await Listing.find(query).select({
    title: 1,
    listingType: 1,
    pricing: 1,
    availabilityStatus: 1,
    location: 1,
  });

  return listings;
}

// Get One listing
export async function getListingById(listingId: string) {
  const listing = await Listing.findById(listingId);

  if (!listing) throw Errors.notFound("No listing found");

  return listing;
}

// Delete listing
export async function deleteListing(listingId: string, createdBy: string) {
  const deletedListing = await Listing.findOneAndDelete({
    _id: listingId,
    createdBy,
  });

  if (!deletedListing) throw Errors.badRequest("Failed to delete listing");
}

// Update Listing Availability
export async function markListingAsAvailable(
  listingId: string,
  createdBy: string,
) {
  const listing = await Listing.findOne({ _id: listingId, createdBy });

  if (!listing) throw Errors.notFound("Listing does not exist");

  const result = await Listing.findByIdAndUpdate(
    listingId,
    { availabilityStatus: "available" },
    { returnDocument: "after" },
  );

  if (!result) throw Errors.badRequest("Failed to update listing");

  return result;
}

export async function markListingAsInactive(
  listingId: string,
  createdBy: string,
) {
  const listing = await Listing.findOne({ _id: listingId, createdBy });

  if (!listing) throw Errors.notFound("Listing does not exist");

  const result = await Listing.findByIdAndUpdate(
    listingId,
    { availabilityStatus: "inactive" },
    { returnDocument: "after" },
  );

  if (!result) throw Errors.badRequest("Failed to update listing");

  return result;
}

// UpdateListing
export async function updateListing(
  listingId: string,
  createdBy: string,
  update: UpdateListingInput,
) {
  const listing = await Listing.findOne({ _id: listingId, createdBy });

  if (!listing) throw Errors.notFound("Listing does not exist");

  if (update.listingType)
    throw Errors.conflict("You cannot change listing type");

  const result = await Listing.findByIdAndUpdate(listingId, update, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!result)
    throw Errors.badRequest("Failed to update listing's availability");

  return result;
}

export async function getListingsByOwner(createdBy: string) {
  return await Listing.find({ createdBy });
}
