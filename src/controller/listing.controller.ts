import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
  getListingsByOwner,
  getMapListings,
  markListingAsAvailable,
  markListingAsInactive,
  updateListing,
  updateListingPrice,
} from "../service/listing.service";
import { ListingQuery } from "../schema/listing.schema";
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";

export const createListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;

    const listingData = req.body;

    // Get uploaded files
    const files = req.files as Express.Multer.File[];

    const imageUrls = files?.map((file) => `/uploads/${file.filename}`);

    const listing = await createListing(
      {
        ...listingData,
        images: imageUrls,
      },
      userId,
    );

    return {
      status: 201,
      data: listing,
    };
  },
  "CreateListingHandler",
);

export const getListingsHandler = async (
  req: Request<any, any, any, Partial<ListingQuery>>,
  res: Response,
) => {
  try {
    const query = req.query as ListingQuery;

    const { cursor, limit, ...filters } = query;

    const { listings, nextCursor } = await getListings(filters, cursor, limit);

    res.status(200).json({
      status: "success",
      results: listings.length,
      data: listings,
      nextCursor,
    });
  } catch (error: any) {
    logger.error(`GetListingsHandler error: ${error} `);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const getMapsListingsHandler = async (
  req: Request<any, any, any, Partial<ListingQuery>>,
  res: Response,
) => {
  try {
    const query = req.query as ListingQuery;

    const { ...filters } = query;

    const listings = await getMapListings(filters);

    res.status(200).json({
      status: "success",
      results: listings.length,
      data: listings,
    });
  } catch (error: any) {
    logger.error(`GetMapListingsHandler error: ${error} `);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Get Listings By Owner
export const getListingsOfPropertyOwnerHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;

    const listings = await getListingsByOwner(userId);

    return listings;
  },
  "GetListingsOfPropertyOwnerHandler",
);

// Find one listing
export const findOneListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const listingId = req.params.id as string;

    const listing = await getListingById(listingId);

    return listing;
  },
  "FindOneListingHandler",
);

export const deleteListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;
    const listingId = req.params.id as string;

    await deleteListing(listingId, userId);

    return {
      status: 204,
    };
  },
  "DeleteListingHandler",
);

export const updateListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const listingId = req.params.id as string;
    const update = req.body;
    const userId = res.locals.user.sub;

    const updatedListing = await updateListing(listingId, userId, update);

    return updatedListing;
  },
  "UpdateListingHandler",
);

export const markListingAsAvailableHandler = TryCatch(
  async (req: Request, res: Response) => {
    const listingId = req.params.id as string;
    const userId = res.locals.user.sub;

    const availableListing = await markListingAsAvailable(listingId, userId);

    return availableListing;
  },
  "MarkListingAsAvailableHandler",
);

export const markListingAsInactiveHandler = TryCatch(
  async (req: Request, res: Response) => {
    const listingId = req.params.id as string;
    const userId = res.locals.user.sub;

    const inactiveListing = await markListingAsInactive(listingId, userId);

    return inactiveListing;
  },
  "MarkListingAsInactiveHandler",
);

export const updateListingPriceHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;
    const listingId = req.params.id as string;
    const { newPrice } = req.body;

    const updatedListing = await updateListingPrice(
      newPrice,
      listingId,
      userId,
    );

    return updatedListing;
  },
  "UpdateListingPriceHandler",
);
