import type { CollectionId } from "./catalog-types";

/**
 * Occasions are views over the collections, not tags on products: the POS has
 * no notion of "Diwali", so each occasion names the shelves that suit it.
 */
export const OCCASIONS: { id: string; title: string; blurb: string; icon: string; collections: CollectionId[] }[] = [
  {
    id: "diwali",
    title: "Diwali & festive",
    blurb: "Hampers, sweets, dry fruits and candles.",
    icon: "diya-lamp",
    collections: ["hampers", "sweets", "snacks", "home"],
  },
  {
    id: "employees",
    title: "Employee gifting",
    blurb: "Thank-yous, milestones, work anniversaries.",
    icon: "trophy",
    collections: ["hampers", "beverages", "home", "fragrance", "accessories"],
  },
  {
    id: "clients",
    title: "Clients & partners",
    blurb: "Premium picks that don't look like every other hamper.",
    icon: "handshake",
    collections: ["hampers", "fragrance", "home", "apparel"],
  },
  {
    id: "onboarding",
    title: "Onboarding kits",
    blurb: "Totes, mugs, tees and snacks for day one.",
    icon: "briefcase",
    collections: ["accessories", "apparel", "home", "snacks"],
  },
  {
    id: "events",
    title: "Events & offsites",
    blurb: "Merch, snack packs and giveaways at volume.",
    icon: "party-popper",
    collections: ["apparel", "accessories", "snacks", "sweets"],
  },
  {
    id: "pantry",
    title: "Office pantry",
    blurb: "Healthy snacks, teas and coffee.",
    icon: "teacup-without-handle",
    collections: ["snacks", "beverages", "sweets"],
  },
];

export const getOccasion = (id: string) => OCCASIONS.find((o) => o.id === id);
