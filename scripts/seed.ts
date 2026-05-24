import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../db/schema";
import {
  settings,
  tours,
  activities,
  services,
  menuItems,
  businesses,
  media,
  testimonials,
} from "../db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  // ─── Settings ──────────────────────────────────────────────────────────────

  await db
    .insert(settings)
    .values([
      { key: "hero_image_url",        value: "", group: "general" },
      { key: "about_image_url",       value: "", group: "general" },
      { key: "dining_image_url",      value: "", group: "general" },
      { key: "social_instagram_url",  value: "", group: "social"  },
      { key: "social_facebook_url",   value: "", group: "social"  },
      { key: "social_tiktok_url",     value: "", group: "social"  },
    ])
    .onConflictDoNothing();
  console.log("Settings seeded.");

  // ─── Tours ─────────────────────────────────────────────────────────────────

  await db
    .insert(tours)
    .values([
      {
        name: "Baarah Beach Trail",
        slug: "beach-trail",
        shortDescription: "A quiet walk along the island's undisturbed shoreline",
        description:
          "Baarah's coastline is fringed with calm, clear water and is rarely crowded. This self-guided walk takes you through fishing villages and past the island's most scenic stretches of beach.",
        price: "0",
        priceUnit: "per_person",
        duration: "2 hours",
        includes: ["Map", "Local guide option"],
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Lagoon Snorkelling",
        slug: "lagoon-snorkelling",
        shortDescription: "Explore the turquoise lagoon and its reef life",
        description:
          "Baarah's lagoon is home to a healthy reef teeming with colourful fish, turtles, and occasional reef sharks. Equipment and a local guide are provided.",
        price: "25",
        priceUnit: "per_person",
        duration: "3 hours",
        includes: ["Snorkel gear", "Guide", "Refreshments"],
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Island Farm Visit",
        slug: "island-farm-visit",
        shortDescription: "See the agriculture Baarah is famous for throughout the Maldives",
        description:
          "HA. Baarah is unique among Maldivian islands for its rich farming tradition. This guided visit takes you through working farms producing watermelons, papayas, and tropical vegetables.",
        price: "15",
        priceUnit: "per_person",
        duration: "1.5 hours",
        includes: ["Guide", "Fresh produce tasting"],
        isActive: true,
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();
  console.log("Tours seeded.");

  // ─── Activities ────────────────────────────────────────────────────────────

  await db
    .insert(activities)
    .values([
      {
        name: "Baarah Cup Football",
        slug: "baarah-cup-football",
        shortDescription: "The island's annual football tournament — the biggest event of the year",
        description:
          "Every year Baarah comes alive with the Baarah Cup, drawing teams and spectators from across the atoll. An unmissable slice of local culture.",
        price: "0",
        priceUnit: "flat",
        duration: "Weekend",
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Island Farmers Market",
        slug: "farmers-market",
        shortDescription: "Fresh produce, street food, and island crafts every Friday morning",
        description:
          "Baarah's weekly market brings together farmers, fishermen, and local artisans in the heart of the island. The best place to buy fresh tropical fruit and try traditional Maldivian snacks.",
        price: "0",
        priceUnit: "flat",
        duration: "Every Friday, 7am–noon",
        isActive: true,
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();
  console.log("Activities seeded.");

  // ─── Services ──────────────────────────────────────────────────────────────

  await db
    .insert(services)
    .values([
      {
        name: "Island Buggy Hire",
        slug: "buggy-hire",
        shortDescription: "Explore every corner of Baarah at your own pace",
        description:
          "Hire a buggy and roam the island freely — from the harbour to the beach and everywhere in between.",
        price: "30",
        priceUnit: "per_session",
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Airport Transfer",
        slug: "airport-transfer",
        shortDescription: "Speedboat transfers between Hanimaadhoo (HAQ) and Baarah",
        description:
          "Regular speedboat service connecting Baarah to Hanimaadhoo International Airport. Bookable for groups and individuals.",
        price: "15",
        priceUnit: "per_person",
        isActive: true,
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();
  console.log("Services seeded.");

  // ─── Menu Items ────────────────────────────────────────────────────────────

  await db
    .insert(menuItems)
    .values([
      {
        name: "Mas Riha",
        description:
          "Rich tuna curry with coconut milk and island spices, served with roshi bread",
        price: "12",
        category: "lunch",
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 1,
      },
      {
        name: "Garudhiya",
        description:
          "Traditional Maldivian clear fish broth served with rice, lime, and chilli",
        price: "8",
        category: "lunch",
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 2,
      },
      {
        name: "Bis Keemiya",
        description:
          "Flaky pastry filled with tuna, egg, and cabbage — a local favourite",
        price: "4",
        category: "snacks",
        isVegetarian: false,
        isAvailable: true,
        sortOrder: 3,
      },
      {
        name: "Fresh Watermelon Juice",
        description: "Pressed daily from Baarah-grown watermelons",
        price: "5",
        category: "drinks",
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 4,
      },
      {
        name: "Roshi & Coconut Curry",
        description:
          "Soft flatbread with a gentle coconut and vegetable curry — perfect for breakfast",
        price: "9",
        category: "breakfast",
        isVegetarian: true,
        isAvailable: true,
        sortOrder: 5,
      },
    ])
    .onConflictDoNothing();
  console.log("Menu items seeded.");

  // ─── Businesses ────────────────────────────────────────────────────────────

  await db
    .insert(businesses)
    .values([
      {
        name: "Baarah View Guesthouse",
        slug: "baarah-view-guesthouse",
        businessType: "guesthouse",
        shortDescription:
          "A family-run guesthouse with ocean views and genuine island hospitality",
        description:
          "Baarah View is the island's most-loved place to stay. Owned and run by a local family, it offers clean, comfortable rooms with views of the lagoon, home-cooked meals, and a warmth that no resort can replicate.",
        contactEmail: "stay@baarahview.mv",
        contactPhone: "+960 650 0101",
        isFeatured: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "The Island Kitchen",
        slug: "island-kitchen",
        businessType: "restaurant",
        shortDescription: "Home-cooked Maldivian food in the heart of the island",
        description:
          "The Island Kitchen is where locals eat. The menu changes daily based on what's fresh from the lagoon and the farms, with a focus on traditional Maldivian dishes done properly.",
        contactEmail: "hello@islandkitchen.mv",
        contactPhone: "+960 650 0202",
        isFeatured: true,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Baarah Boats",
        slug: "baarah-boats",
        businessType: "transport",
        shortDescription: "Reliable speedboat transfers and guided ocean excursions",
        description:
          "Baarah Boats handles all your water transport needs — airport transfers from Hanimaadhoo, inter-island trips, and guided snorkelling and fishing excursions run by experienced local captains.",
        contactEmail: "info@baarahboats.mv",
        contactPhone: "+960 650 0303",
        isFeatured: true,
        isActive: true,
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();
  console.log("Businesses seeded.");

  // ─── Gallery Media ─────────────────────────────────────────────────────────

  await db
    .insert(media)
    .values([
      {
        entityType: "gallery",
        entityId: 1,
        type: "image",
        url: "/images/hero.png",
        alt: "Baarah lagoon at sunrise",
        sortOrder: 1,
      },
      {
        entityType: "gallery",
        entityId: 1,
        type: "image",
        url: "/images/hero.png",
        alt: "Island farmland",
        sortOrder: 2,
      },
      {
        entityType: "gallery",
        entityId: 1,
        type: "image",
        url: "/images/hero.png",
        alt: "Fishing boats at the harbour",
        sortOrder: 3,
      },
      {
        entityType: "gallery",
        entityId: 1,
        type: "image",
        url: "/images/hero.png",
        alt: "Traditional Maldivian meal",
        sortOrder: 4,
      },
    ])
    .onConflictDoNothing();
  console.log("Gallery media seeded.");

  // ─── Testimonials ──────────────────────────────────────────────────────────

  await db
    .insert(testimonials)
    .values([
      {
        guestName: "Rania Al-Hamdan",
        guestCountry: "UAE",
        rating: 5,
        content:
          "Baarah is unlike anything else in the Maldives. No resorts, no crowds — just the island exactly as it is. We stayed for four days and left wishing we could stay four weeks.",
        reviewStatus: "approved",
        isPublished: true,
        isFeatured: true,
      },
      {
        guestName: "Oliver Marsh",
        guestCountry: "United Kingdom",
        rating: 5,
        content:
          "Completely authentic island life. The people are wonderful, the food is extraordinary (try the garudhiya), and the lagoon is a world-class snorkelling spot that almost nobody knows about yet.",
        reviewStatus: "approved",
        isPublished: true,
        isFeatured: false,
      },
    ])
    .onConflictDoNothing();
  console.log("Testimonials seeded.");

  console.log("\nSeed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
