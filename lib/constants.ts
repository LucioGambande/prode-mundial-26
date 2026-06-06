export const BRACKET_LOCK_DATE = new Date("2026-06-11T00:00:00-03:00");

export const GROUPS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

export const THIRD_PLACE_COUNT = 8;

export const SEED_USERS = [
  { name: "Ernesto", email: "ernloza@gmail.com", initials: "EL", is_admin: true },
  { name: "Santi", email: "santi@prode-mundial.local", initials: "SA", is_admin: false },
  { name: "Diego", email: "diego@prode-mundial.local", initials: "DI", is_admin: false },
  { name: "Tute", email: "tute@prode-mundial.local", initials: "TU", is_admin: false },
  { name: "Martín", email: "martin@prode-mundial.local", initials: "MA", is_admin: false },
  { name: "Dani", email: "dani@prode-mundial.local", initials: "DA", is_admin: false },
  { name: "Gasti", email: "gasti@prode-mundial.local", initials: "GA", is_admin: false },
  { name: "Ale", email: "ale@prode-mundial.local", initials: "AL", is_admin: false },
] as const;
