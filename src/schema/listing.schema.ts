import { z } from "zod";

// Sub Schemas

const coordinatesSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2, "Coordinates must be [lng, lat]"),
});

const locationSchema = z.object({
  area: z.string().min(2),
  university: z.string().min(10),
  address: z.string().min(5).optional(),
  coordinates: coordinatesSchema,
});

const pricingSchema = z.object({
  monthlyPrice: z.number().positive().optional(),
  priceRange: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    .optional(),
});

const contactSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

const baseListingBody = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(10).max(200),
  listingType: z.enum(["hostel", "private"]),
  images: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(),
  location: locationSchema,
  pricing: pricingSchema,
  roomTypes: z
    .enum([
      "1-in-a-room",
      "2-in-a-room",
      "3-in-a-room",
      "4-in-a-room",
      "More-than-4",
      "Exclusive",
    ])
    .optional(),
  availabilityStatus: z.enum(["available", "occupied"]).default("available"),
  contact: contactSchema,
});

// Main Create Schema
const listingBody = baseListingBody.superRefine((data, ctx) => {
  // Type-based pricing

  if (data.listingType === "private") {
    if (!data.pricing.monthlyPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Private rentals must have monthlyPrice",
        path: ["pricing", "monthlyPrice"],
      });
    }

    if (data.pricing.priceRange) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Private rentals cannot have priceRange",
        path: ["pricing", "priceRange"],
      });
    }
  }

  if (data.listingType === "hostel") {
    if (!data.pricing.priceRange) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hostels must have priceRange",
        path: ["pricing", "priceRange"],
      });
    }

    if (data.pricing.monthlyPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hostels cannot have monthlyPrice",
        path: ["pricing", "monthlyPrice"],
      });
    }

    if (
      data.pricing.priceRange &&
      data.pricing.priceRange.min > data.pricing.priceRange.max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum price cannot be greater than maximum price",
        path: ["pricing", "priceRange"],
      });
    }
  }

  //  Coordinates validation
  const [lng, lat] = data.location.coordinates.coordinates;

  if (lat < -90 || lat > 90) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid latitude value",
      path: ["location", "coordinates"],
    });
  }

  if (lng < -180 || lng > 180) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid longitude value",
      path: ["location", "coordinates"],
    });
  }
});

export const createListingSchema = z.object({
  body: listingBody,
});

export const listingParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

export const listingQuerySchema = z.object({
  query: z
    .object({
      listingType: z.enum(["hostel", "private"]).optional(),
      availabilityStatus: z.enum(["available", "inactive"]).optional(),
      price: z.coerce.number().optional(),
      search: z.string().trim().min(1).optional(),
      cursor: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid cursor format")
        .optional(), //ensure it is a mongodb id
      limit: z.coerce.number().min(10).max(30).default(15),
    })
    .loose(),
});

export type ListingQuery = z.infer<typeof listingQuerySchema>["query"];

export type CreateListingInput = z.infer<typeof listingBody>;

const updateListingBody = baseListingBody.partial();

// Update listing schema
export const updateListingSchema = z.object({
  body: updateListingBody,
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

export type UpdateListingInput = z.infer<typeof updateListingBody>;
