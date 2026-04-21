CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."cancellation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."menu_category" AS ENUM('breakfast', 'lunch', 'dinner', 'drinks', 'desserts', 'snacks');--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('email_change', 'forgot_password');--> statement-breakpoint
CREATE TYPE "public"."price_unit" AS ENUM('per_person', 'per_hour', 'per_session', 'flat');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('available', 'occupied', 'maintenance');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"short_description" varchar(255),
	"price" numeric(10, 2) NOT NULL,
	"price_unit" "price_unit" DEFAULT 'per_person' NOT NULL,
	"duration" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "activities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "booking_addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"addon_type" varchar(50) NOT NULL,
	"addon_id" integer NOT NULL,
	"addon_name" varchar(100) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_id" varchar(20) NOT NULL,
	"guest_name" varchar(100) NOT NULL,
	"guest_email" varchar(255) NOT NULL,
	"guest_phone" varchar(30),
	"guest_country" varchar(100),
	"room_type_id" integer NOT NULL,
	"assigned_room_id" integer,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"num_guests" integer DEFAULT 1 NOT NULL,
	"num_rooms" integer DEFAULT 1 NOT NULL,
	"room_total" numeric(10, 2) NOT NULL,
	"addons_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"special_requests" text,
	"admin_notes" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_id_unique" UNIQUE("reference_id")
);
--> statement-breakpoint
CREATE TABLE "cancellation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" "cancellation_status" DEFAULT 'pending' NOT NULL,
	"admin_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"alt" varchar(255),
	"caption" varchar(255),
	"type" "media_type" DEFAULT 'image' NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"category" "menu_category" NOT NULL,
	"is_vegetarian" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"type" "otp_type" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"date" date NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"price_override" numeric(10, 2),
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"short_description" varchar(255),
	"base_price" numeric(10, 2) NOT NULL,
	"max_guests" integer DEFAULT 2 NOT NULL,
	"bed_type" varchar(50),
	"size" varchar(50),
	"amenities" json DEFAULT '[]'::json,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "room_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_number" varchar(20) NOT NULL,
	"room_type_id" integer NOT NULL,
	"floor" integer,
	"status" "room_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_room_number_unique" UNIQUE("room_number")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"short_description" varchar(255),
	"price" numeric(10, 2) NOT NULL,
	"price_unit" "price_unit" DEFAULT 'per_session' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"group" varchar(50) DEFAULT 'general' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_name" varchar(100) NOT NULL,
	"guest_country" varchar(100),
	"rating" integer DEFAULT 5 NOT NULL,
	"content" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"stay_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"short_description" varchar(255),
	"price" numeric(10, 2) NOT NULL,
	"price_unit" "price_unit" DEFAULT 'per_person' NOT NULL,
	"duration" varchar(50),
	"includes" json DEFAULT '[]'::json,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tours_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_room_id_rooms_id_fk" FOREIGN KEY ("assigned_room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_availability" ADD CONSTRAINT "room_availability_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;