import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import {
  testimonials,
  media,
  businessInquiries,
  businesses,
  menuItems,
  services,
  activities,
  tours,
} from "../db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  // Testimonials
  await db.delete(testimonials);
  console.log("Testimonials cleared.");

  // Gallery media only (entityType = 'gallery')
  await db.delete(media).where(eq(media.entityType, "gallery"));
  console.log("Gallery media cleared.");

  // Business inquiries (FK → businesses, must go first)
  await db.delete(businessInquiries);
  console.log("Business inquiries cleared.");

  // Businesses
  await db.delete(businesses);
  console.log("Businesses cleared.");

  // Menu items
  await db.delete(menuItems);
  console.log("Menu items cleared.");

  // Services
  await db.delete(services);
  console.log("Services cleared.");

  // Activities
  await db.delete(activities);
  console.log("Activities cleared.");

  // Tours
  await db.delete(tours);
  console.log("Tours cleared.");

  console.log("\nUnseed complete. Settings, bookings, rooms, and admin credentials are untouched.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
