ALTER TABLE "testimonials" ADD COLUMN "booking_id" integer;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "review_status" varchar(20) DEFAULT 'approved' NOT NULL;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "review_token" varchar(64);
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "review_token_expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "review_submitted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "testimonials" ALTER COLUMN "content" SET DEFAULT '';
--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "test_booking_id_unique" ON "testimonials" USING btree ("booking_id");
--> statement-breakpoint
CREATE INDEX "test_status_idx" ON "testimonials" USING btree ("review_status");
--> statement-breakpoint
CREATE INDEX "test_featured_idx" ON "testimonials" USING btree ("is_featured");
--> statement-breakpoint
CREATE INDEX "test_review_token_idx" ON "testimonials" USING btree ("review_token");
