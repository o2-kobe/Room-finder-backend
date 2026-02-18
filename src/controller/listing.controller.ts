import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createListing,
  deleteListing,
  getListingById,
  updateListing,
} from "../service/listing.service";

export const CreateListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user._id;
    const listingData = req.body;

    const listing = await createListing(listingData, userId);

    return {
      status: 201,
      data: listing,
    };
  },
  "CreateListingHandler",
);

export const FindOneListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const listingId = req.params.id as string;

    const listing = await getListingById(listingId);

    return listing;
  },
  "FindOneListingHandler",
);

export const DeleteListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user._id;
    const listingId = req.params.id as string;

    await deleteListing(listingId, userId);

    return {
      status: 204,
      data: null,
    };
  },
  "DeleteListingHandler",
);

export const UpdateListingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const listingId = req.params.id as string;
    const update = req.body;
    const userId = res.locals.user._id;

    const updatedListing = await updateListing(listingId, userId, update);

    return updatedListing;
  },
  "UpdateListingHandler",
);
