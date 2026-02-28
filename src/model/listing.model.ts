import { Document, model, Schema, Types } from "mongoose";

export interface Location {
  area: string;
  university: string;
  address?: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface Pricing {
  monthlyPrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export type RoomTypes =
  | "1-in-a-room"
  | "2-in-a-room"
  | "3-in-a-room"
  | "4-in-a-room"
  | "More-than-4"
  | "Exclusive";

export interface Contact {
  phone: string;
  email?: string;
  website?: string;
}

// Listing Interface
export interface ListingDocument extends Document {
  title: string;
  description: string;
  listingType: "hostel" | "private";
  images: string[];
  amenities: string[];
  location: Location;
  pricing: Pricing;
  roomTypes: RoomTypes[];
  availabilityStatus: "available" | "inactive";
  contact: Contact;
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

// Location Schema
const locationSchema = new Schema<Location>(
  {
    area: { type: String, required: true, minlength: 2 },
    university: { type: String, required: true, minlength: 10 },
    address: { type: String, minlength: 5 },

    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val: number[]) {
            return val.length === 2;
          },
          message: "Coordinates must be [lng, lat]",
        },
      },
    },
  },
  { _id: false },
);

// Pricing schema
const pricingSchema = new Schema<Pricing>(
  {
    monthlyPrice: {
      type: Number,
      min: 0,
    },
    priceRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
  },
  { _id: false },
);

// Contact schema
const contactSchema = new Schema<Contact>(
  {
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
        "Invalid website URL",
      ],
    },
  },
  { _id: false },
);

// Listing schema
const listingSchema = new Schema<ListingDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      maxLength: 500,
    },
    listingType: { type: String, enum: ["hostel", "private"], required: true },
    images: {
      type: [String],
      // validate: {
      //   validator: function (val: string[]) {
      //     return val.length > 0;
      //   },
      //   message: "At least one image is required",
      // },
    },
    amenities: {
      type: [String],
      default: [],
    },
    location: { type: locationSchema, required: true },
    pricing: { type: pricingSchema, required: true },
    roomTypes: {
      type: [String],
      enum: [
        "1-in-a-room",
        "2-in-a-room",
        "3-in-a-room",
        "4-in-a-room",
        "More-than-4",
        "Exclusive",
      ],
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "inactive"],
      default: "available",
    },
    contact: { type: contactSchema, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

listingSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

// Indexes
listingSchema.index({ "location.coordinates": "2dsphere" });
listingSchema.index({ listingType: 1, availabilityStatus: 1 });
listingSchema.index({
  title: "text",
  "location.university": "text",
  "location.area": "text",
});
listingSchema.index({
  listingType: 1,
  availabilityStatus: 1,
  pricing: 1,
  _id: 1,
});

const Listing = model<ListingDocument>("Listing", listingSchema);

export default Listing;
