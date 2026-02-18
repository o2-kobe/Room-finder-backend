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

// Main Create Schema

export const listingBody = z
  .object({
    title: z.string().min(10).max(100),
    description: z.string().min(10).max(200),

    listingType: z.enum(["hostel", "private"]),

    images: z.array(z.string().url()).optional(),

    amenities: z.array(z.string()).optional(),

    location: locationSchema,

    pricing: pricingSchema,

    roomType: z
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
  })
  .superRefine((data, ctx) => {
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

export type CreateListingInput = z.infer<typeof listingBody>;

const updateListingBody = listingBody.partial();

export type UpdateListingInput = z.infer<typeof updateListingBody>;
