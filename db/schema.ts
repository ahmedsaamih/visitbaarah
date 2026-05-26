import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  timestamp,
  date,
  pgEnum,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const roomStatusEnum = pgEnum("room_status", [
  "available",
  "occupied",
  "maintenance",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "rejected",
  "cancelled",
]);

export const menuCategoryEnum = pgEnum("menu_category", [
  "breakfast",
  "lunch",
  "dinner",
  "drinks",
  "desserts",
  "snacks",
]);

export const priceUnitEnum = pgEnum("price_unit", [
  "per_person",
  "per_hour",
  "per_session",
  "flat",
]);

export const cancellationStatusEnum = pgEnum("cancellation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const otpTypeEnum = pgEnum("otp_type", ["email_change", "forgot_password"]);

export const businessTypeEnum = pgEnum("business_type", [
  "guesthouse",
  "restaurant",
  "cafe",
  "transport",
  "tour_guide",
  "dive_shop",
  "grocery",
  "spa",
  "other",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", ["new", "replied", "closed"]);

// ─── Room Types ──────────────────────────────────────────

export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => businesses.id, { onDelete: "set null" }),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 255 }),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer("max_guests").notNull().default(2),
  bedType: varchar("bed_type", { length: 50 }),
  size: varchar("size", { length: 50 }),
  amenities: json("amenities").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("rt_slug_idx").on(table.slug),
  index("rt_active_idx").on(table.isActive),
  index("rt_business_idx").on(table.businessId),
]);

// ─── Rooms ───────────────────────────────────────────────

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => businesses.id, { onDelete: "set null" }),
  roomNumber: varchar("room_number", { length: 20 }).notNull().unique(),
  roomTypeId: integer("room_type_id")
    .notNull()
    .references(() => roomTypes.id, { onDelete: "cascade" }),
  floor: integer("floor"),
  status: roomStatusEnum("status").notNull().default("available"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Room Availability ──────────────────────────────────

export const roomAvailability = pgTable("room_availability", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  isBlocked: boolean("is_blocked").notNull().default(false),
  priceOverride: decimal("price_override", { precision: 10, scale: 2 }),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Activities ──────────────────────────────────────────

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: priceUnitEnum("price_unit").notNull().default("per_person"),
  duration: varchar("duration", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("act_active_idx").on(table.isActive),
  index("act_slug_idx").on(table.slug),
]);

// ─── Tours ───────────────────────────────────────────────

export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: priceUnitEnum("price_unit").notNull().default("per_person"),
  duration: varchar("duration", { length: 50 }),
  includes: json("includes").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Menu Items ──────────────────────────────────────────

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: menuCategoryEnum("category").notNull(),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Services ────────────────────────────────────────────

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceUnit: priceUnitEnum("price_unit").notNull().default("per_session"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Businesses ──────────────────────────────────────────

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  businessType: businessTypeEnum("business_type").notNull().default("other"),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 255 }),
  coverPhotoUrl: text("cover_photo_url"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 30 }),
  address: text("address"),
  connectLinks: json("connect_links").$type<{ type: string; value: string }[]>().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("biz_slug_idx").on(table.slug),
  index("biz_type_idx").on(table.businessType),
  index("biz_active_idx").on(table.isActive),
]);

// ─── Business Inquiries ──────────────────────────────────

export const businessInquiries = pgTable("business_inquiries", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  message: text("message").notNull(),
  preferredDate: date("preferred_date"),
  status: inquiryStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("inq_business_idx").on(table.businessId),
  index("inq_status_idx").on(table.status),
]);

// ─── Media ───────────────────────────────────────────────

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  alt: varchar("alt", { length: 255 }),
  caption: varchar("caption", { length: 255 }),
  type: mediaTypeEnum("type").notNull().default("image"),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // kept for backward compat/general queries
  entityId: integer("entity_id").notNull(), // kept for backward compat
  
  // Specific IDs for robust relations & cascades
  roomTypeId: integer("room_type_id").references(() => roomTypes.id, { onDelete: "cascade" }),
  activityId: integer("activity_id").references(() => activities.id, { onDelete: "cascade" }),
  tourId: integer("tour_id").references(() => tours.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),

  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("media_entity_idx").on(table.entityType, table.entityId),
  index("media_room_type_idx").on(table.roomTypeId),
  index("media_activity_idx").on(table.activityId),
]);

// ─── Bookings ────────────────────────────────────────────

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  referenceId: varchar("reference_id", { length: 20 }).notNull().unique(),
  guestName: varchar("guest_name", { length: 100 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 30 }),
  guestCountry: varchar("guest_country", { length: 100 }),
  roomTypeId: integer("room_type_id")
    .references(() => roomTypes.id, { onDelete: "set null" }), // Keep booking history but remove type link
  assignedRoomId: integer("assigned_room_id").references(() => rooms.id, { onDelete: "set null" }),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "set null" }),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  numGuests: integer("num_guests").notNull().default(1),
  numRooms: integer("num_rooms").notNull().default(1),
  roomTotal: decimal("room_total", { precision: 10, scale: 2 }).notNull(),
  addonsTotal: decimal("addons_total", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  specialRequests: text("special_requests"),
  adminNotes: text("admin_notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Booking Add-ons ─────────────────────────────────────

export const bookingAddons = pgTable("booking_addons", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  addonType: varchar("addon_type", { length: 50 }).notNull(),
  addonId: integer("addon_id").notNull(),
  addonName: varchar("addon_name", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  date: date("date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Cancellation Requests ──────────────────────────────

export const cancellationRequests = pgTable("cancellation_requests", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  reason: text("reason").notNull(),
  status: cancellationStatusEnum("status").notNull().default("pending"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// ─── Testimonials ────────────────────────────────────────

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  guestName: varchar("guest_name", { length: 100 }).notNull(),
  guestCountry: varchar("guest_country", { length: 100 }),
  rating: integer("rating").notNull().default(5),
  content: text("content").notNull().default(""),
  reviewStatus: varchar("review_status", { length: 20 }).notNull().default("approved"), // pending | submitted | approved | rejected
  isFeatured: boolean("is_featured").notNull().default(false),
  reviewToken: varchar("review_token", { length: 64 }),
  reviewTokenExpiresAt: timestamp("review_token_expires_at"),
  reviewSubmittedAt: timestamp("review_submitted_at"),
  isPublished: boolean("is_published").notNull().default(false),
  stayDate: date("stay_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("test_published_idx").on(table.isPublished),
  index("test_status_idx").on(table.reviewStatus),
  index("test_featured_idx").on(table.isFeatured),
  index("test_review_token_idx").on(table.reviewToken),
  uniqueIndex("test_booking_id_unique").on(table.bookingId),
]);

// ─── Settings ────────────────────────────────────────────

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  group: varchar("group", { length: 50 }).notNull().default("general"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("settings_key_idx").on(table.key),
]);

// ─── OTPs ───────────────────────────────────────────────

export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: otpTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────

export const roomTypesRelations = relations(roomTypes, ({ one, many }) => ({
  business: one(businesses, {
    fields: [roomTypes.businessId],
    references: [businesses.id],
  }),
  rooms: many(rooms),
  bookings: many(bookings),
  media: many(media, {
    relationName: "roomTypeMedia",
  }),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  media: many(media, {
    relationName: "activityMedia",
  }),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  media: many(media, {
    relationName: "tourMedia",
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  media: many(media, {
    relationName: "serviceMedia",
  }),
}));

export const businessesRelations = relations(businesses, ({ many }) => ({
  media: many(media, { relationName: "businessMedia" }),
  inquiries: many(businessInquiries),
  bookings: many(bookings),
  roomTypes: many(roomTypes),
  rooms: many(rooms),
}));

export const businessInquiriesRelations = relations(businessInquiries, ({ one }) => ({
  business: one(businesses, {
    fields: [businessInquiries.businessId],
    references: [businesses.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  roomType: one(roomTypes, {
    fields: [media.roomTypeId],
    references: [roomTypes.id],
    relationName: "roomTypeMedia",
  }),
  activity: one(activities, {
    fields: [media.activityId],
    references: [activities.id],
    relationName: "activityMedia",
  }),
  tour: one(tours, {
    fields: [media.tourId],
    references: [tours.id],
    relationName: "tourMedia",
  }),
  service: one(services, {
    fields: [media.serviceId],
    references: [services.id],
    relationName: "serviceMedia",
  }),
  business: one(businesses, {
    fields: [media.businessId],
    references: [businesses.id],
    relationName: "businessMedia",
  }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  business: one(businesses, {
    fields: [rooms.businessId],
    references: [businesses.id],
  }),
  roomType: one(roomTypes, {
    fields: [rooms.roomTypeId],
    references: [roomTypes.id],
  }),
  availability: many(roomAvailability),
}));

export const roomAvailabilityRelations = relations(
  roomAvailability,
  ({ one }) => ({
    room: one(rooms, {
      fields: [roomAvailability.roomId],
      references: [rooms.id],
    }),
  })
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  roomType: one(roomTypes, {
    fields: [bookings.roomTypeId],
    references: [roomTypes.id],
  }),
  assignedRoom: one(rooms, {
    fields: [bookings.assignedRoomId],
    references: [rooms.id],
  }),
  business: one(businesses, {
    fields: [bookings.businessId],
    references: [businesses.id],
  }),
  addons: many(bookingAddons),
  cancellationRequests: many(cancellationRequests),
  testimonials: many(testimonials),
}));

export const bookingAddonsRelations = relations(bookingAddons, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingAddons.bookingId],
    references: [bookings.id],
  }),
}));

export const cancellationRequestsRelations = relations(
  cancellationRequests,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [cancellationRequests.bookingId],
      references: [bookings.id],
    }),
  })
);

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  booking: one(bookings, {
    fields: [testimonials.bookingId],
    references: [bookings.id],
  }),
}));
